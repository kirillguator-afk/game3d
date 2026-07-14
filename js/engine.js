
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
        this.nearestInteractable = null;
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
        light.beginFill(color, 0.15 * intensity).drawCircle(0, 0, 120 * intensity);
        light.filters = [new PIXI.BlurFilter(30)];
        light.position.set(x, y);
        this.layers.world.addChild(light);
    }

    spawnParticles(x, y, color) {
        for(let i=0; i<8; i++) {
            const p = new PIXI.Graphics().beginFill(color).drawRect(0,0,3,3).endFill();
            p.position.set(x, y);
            this.layers.vfx.addChild(p);
            const vx = (Math.random()-0.5)*10, vy = (Math.random()-0.5)*10;
            let life = 30;
            const anim = () => {
                p.x += vx; p.y += vy; p.alpha -= 0.04;
                if(--life > 0) requestAnimationFrame(anim);
                else this.layers.vfx.removeChild(p);
            };
            anim();
        }
    }

    shake(power) { this.shakeAmount = power; }

    tryInteract() {
        if(this.nearestInteractable) {
            this.nearestInteractable.interact();
        }
    }

    update(delta) {
        this.allEntities.forEach(e => e.update(this.controls, delta));

        // Camera
        const lerp = 0.1;
        this.app.stage.pivot.x += (-this.player.container.x + window.innerWidth/2 - this.app.stage.pivot.x) * lerp;
        this.app.stage.pivot.y += (-this.player.container.y + window.innerHeight/2 - this.app.stage.pivot.y) * lerp;

        if(this.shakeAmount > 0) {
            this.app.stage.position.set((Math.random()-0.5)*this.shakeAmount, (Math.random()-0.5)*this.shakeAmount);
            this.shakeAmount *= 0.9;
        }

        this.layers.entities.children.sort((a, b) => a.y - b.y);

        // Interaction Check
        this.checkInteractions();

        // Biome UI
        const biome = this.world.getCurrentBiome(this.player.container.x, this.player.container.y);
        document.getElementById('biome-label').innerText = biome.name;
    }

    checkInteractions() {
        let nearest = null;
        let minDist = 80;

        this.allEntities.forEach(e => {
            if(e === this.player || !e.isInteractable) return;
            const d = Math.hypot(e.container.x - this.player.container.x, e.container.y - this.player.container.y);
            if(d < minDist) {
                minDist = d;
                nearest = e;
            }
        });

        const prompt = document.getElementById('interaction-prompt');
        const text = document.getElementById('interaction-text');
        
        if(nearest) {
            this.nearestInteractable = nearest;
            prompt.classList.remove('hidden');
            text.innerText = `TALK TO ${nearest.config.name.toUpperCase()}`;
        } else {
            this.nearestInteractable = null;
            prompt.classList.add('hidden');
        }
    }
}

window.engine = new AetheriaEngine();
