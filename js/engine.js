class AetheriaEngine {
    constructor() {
        this.app = new PIXI.Application({
            resizeTo: window,
            backgroundColor: 0x050508,
            antialias: false,
            resolution: window.devicePixelRatio || 1
        });
        document.getElementById('game-view').appendChild(this.app.view);
        PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

        this.layers = {
            world: new PIXI.Container(),
            entities: new PIXI.Container(),
            vfx: new PIXI.Container(),
            lighting: new PIXI.Container()
        };
        Object.values(this.layers).forEach(l => this.app.stage.addChild(l));

        this.allEntities = [];
        this.init();
    }

    async init() {
        this.controls = new ControlsManager();
        this.inventory = new InventorySystem();
        this.world = new WorldManager(this);
        
        this.player = new Player(this, "NEXUS PRIME");
        this.spawnEntity(this.player);
        this.player.updateAppearance(this.inventory.equipment);

        // Lighting
        this.darkness = new PIXI.Graphics();
        this.darkness.beginFill(0x0a0a20, 0.4).drawRect(-10000, -10000, 20000, 20000).endFill();
        this.layers.lighting.addChild(this.darkness);
        this.layers.lighting.blendMode = PIXI.BLEND_MODES.MULTIPLY;

        this.app.ticker.add((delta) => this.update(delta));
    }

    spawnEntity(entity) {
        this.allEntities.push(entity);
        this.layers.entities.addChild(entity.container);
    }

    removeEntity(entity) {
        const idx = this.allEntities.indexOf(entity);
        if(idx > -1) this.allEntities.splice(idx, 1);
        this.layers.entities.removeChild(entity.container);
    }

    spawnParticles(x, y, color) {
        for(let i=0; i<10; i++) {
            const p = new PIXI.Graphics();
            p.beginFill(color).drawCircle(0, 0, 3).endFill();
            p.position.set(x, y);
            const vx = (Math.random()-0.5)*10;
            const vy = (Math.random()-0.5)*10;
            this.layers.vfx.addChild(p);
            
            let life = 30;
            const anim = () => {
                p.x += vx; p.y += vy;
                p.alpha -= 0.05;
                life--;
                if(life > 0) requestAnimationFrame(anim);
                else this.layers.vfx.removeChild(p);
            };
            anim();
        }
    }

    update(delta) {
        this.allEntities.forEach(e => e.update(this.controls, delta));

        // Camera Smooth Follow
        const lerp = 0.1;
        const targetX = -this.player.container.x + window.innerWidth / 2;
        const targetY = -this.player.container.y + window.innerHeight / 2;
        this.app.stage.pivot.x += (-targetX - this.app.stage.pivot.x) * lerp;
        this.app.stage.pivot.y += (-targetY - this.app.stage.pivot.y) * lerp;

        // Sorting
        this.layers.entities.children.sort((a, b) => a.y - b.y);

        // Biome detection
        const biome = this.world.getCurrentBiome(this.player.container.x, this.player.container.y);
        document.getElementById('biome-label').innerText = biome.name;
    }
}

window.engine = new AetheriaEngine();