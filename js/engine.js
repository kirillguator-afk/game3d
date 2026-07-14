
class AetheriaEngine {
    constructor() {
        this.app = new PIXI.Application({
            resizeTo: window,
            backgroundColor: 0x050508,
            antialias: false,
            resolution: window.devicePixelRatio || 1
        });
        document.getElementById('game-view').appendChild(this.app.view);
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        PIXI.settings.ROUND_PIXELS = true;

        this.layers = {
            world: new PIXI.Container(),
            entities: new PIXI.Container(),
            vfx: new PIXI.Container(),
            ui: new PIXI.Container()
        };
        
        Object.values(this.layers).forEach(l => this.app.stage.addChild(l));

        this.allEntities = [];
        this.shakeAmount = 0;
        this.init();
    }

    async init() {
        await AssetGenerator.init(this.app.renderer);
        
        this.controls = new ControlsManager();
        this.inventory = new InventorySystem();
        this.world = new WorldManager(this);
        
        this.player = new Player(this, "NEXUS PRIME");
        this.spawnEntity(this.player);
        this.player.updateAppearance(this.inventory.equipment);

        // Global ambient lighting
        this.ambient = new PIXI.Graphics();
        this.ambient.beginFill(0x0a0a1a, 0.3).drawRect(-10000, -10000, 20000, 20000);
        this.layers.vfx.addChild(this.ambient);
        this.layers.vfx.blendMode = PIXI.BLEND_MODES.MULTIPLY;

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

    addLight(x, y, color, intensity) {
        const light = new PIXI.Graphics();
        light.beginFill(color, 0.2 * intensity);
        light.drawCircle(0, 0, 150 * intensity);
        light.filters = [new PIXI.BlurFilter(40)];
        light.position.set(x, y);
        this.layers.world.addChild(light);
    }

    spawnParticles(x, y, color, count = 10) {
        for(let i=0; i<count; i++) {
            const p = new PIXI.Graphics();
            p.beginFill(color).drawRect(0, 0, 4, 4).endFill();
            p.position.set(x, y);
            const vx = (Math.random()-0.5)*15;
            const vy = (Math.random()-0.5)*15;
            this.layers.vfx.addChild(p);
            
            let life = 40;
            const anim = () => {
                p.x += vx; p.y += vy;
                p.alpha -= 0.025;
                p.scale.set(p.alpha);
                life--;
                if(life > 0) requestAnimationFrame(anim);
                else this.layers.vfx.removeChild(p);
            };
            anim();
        }
    }

    shake(power) {
        this.shakeAmount = power;
    }

    update(delta) {
        this.allEntities.forEach(e => e.update(this.controls, delta));

        // Camera
        const lerp = 0.15;
        const targetX = -this.player.container.x + window.innerWidth / 2;
        const targetY = -this.player.container.y + window.innerHeight / 2;
        
        this.app.stage.pivot.x += (-targetX - this.app.stage.pivot.x) * lerp;
        this.app.stage.pivot.y += (-targetY - this.app.stage.pivot.y) * lerp;

        // Screen Shake effect
        if(this.shakeAmount > 0) {
            this.app.stage.position.set(
                (Math.random()-0.5) * this.shakeAmount,
                (Math.random()-0.5) * this.shakeAmount
            );
            this.shakeAmount *= 0.9;
        }

        // Y-Sorting
        this.layers.entities.children.sort((a, b) => a.y - b.y);

        // Biome Update UI
        const biome = this.world.getCurrentBiome(this.player.container.x, this.player.container.y);
        const label = document.getElementById('biome-label');
        if(label && label.innerText !== biome.name) {
            label.innerText = biome.name;
        }
    }
}

window.engine = new AetheriaEngine();
