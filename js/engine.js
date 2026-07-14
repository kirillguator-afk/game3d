class AetheriaEngine {
    constructor() {
        this.app = new PIXI.Application({
            resizeTo: window,
            backgroundColor: 0x0a0a0f,
            antialias: false,
            autoDensity: true,
            resolution: window.devicePixelRatio || 1
        });
        document.getElementById('game-view').appendChild(this.app.view);
        
        // Layers
        this.layers = {
            background: new PIXI.Container(),
            world: new PIXI.Container(),
            entities: new PIXI.Container(),
            weather: new PIXI.Container(),
            lighting: new PIXI.Container()
        };

        Object.values(this.layers).forEach(l => this.app.stage.addChild(l));
        
        // Day/Night Cycle State
        this.time = 0; 
        this.dayDuration = 10000; 
        
        this.setupLighting();
        this.init();
    }

    setupLighting() {
        this.darkness = new PIXI.Graphics();
        this.darkness.beginFill(0x05051a);
        this.darkness.drawRect(-10000, -10000, 20000, 20000);
        this.darkness.endFill();
        this.darkness.alpha = 0;
        
        this.layers.lighting.addChild(this.darkness);
        this.layers.lighting.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    }

    addLight(x, y, color, intensity) {
        const light = new PIXI.Graphics();
        light.beginFill(color, 0.4);
        light.drawCircle(0, 0, 150 * intensity);
        light.endFill();
        light.filters = [new PIXI.BlurFilter(50)];
        light.position.set(x, y);
        light.blendMode = PIXI.BLEND_MODES.ADD;
        this.layers.entities.addChild(light); // Lights live in entity world
        return light;
    }

    spawnEntity(entity) {
        this.layers.entities.addChild(entity.container);
        if(!this.allEntities) this.allEntities = [];
        this.allEntities.push(entity);
    }

    init() {
        this.controls = new ControlsManager();
        this.world = new WorldManager(this);
        
        this.player = new Player(this, "NEXUS_PRIME");
        this.spawnEntity(this.player);

        // Добавляем ключевых NPC
        const king = new Npc(this, "King Aetherion", 0, -150, 0xffd700);
        this.spawnEntity(king);

        this.app.ticker.add((delta) => this.update(delta));
    }

    update(delta) {
        this.time += delta;
        
        // Update All Entities
        if(this.allEntities) {
            this.allEntities.forEach(e => {
                if(e instanceof Player) e.update(this.controls, delta);
                else e.update(delta);
            });
        }

        // Day/Night Logic
        const cycle = (Math.sin(this.time * 0.001) + 1) / 2;
        this.darkness.alpha = cycle * 0.8;
        
        // Camera System
        const targetX = -this.player.container.x + window.innerWidth / 2;
        const targetY = -this.player.container.y + window.innerHeight / 2;
        
        const ease = 0.08;
        this.app.stage.pivot.x += (-targetX - this.app.stage.pivot.x) * ease;
        this.app.stage.pivot.y += (-targetY - this.app.stage.pivot.y) * ease;

        // Y-Sorting (Performance optimized)
        this.layers.entities.children.sort((a, b) => a.y - b.y);

        // Update HUD
        const loc = this.world.regions.find(r => Math.hypot(r.x - this.player.container.x, r.y - this.player.container.y) < r.radius);
        if(loc) document.getElementById('location-name').innerText = loc.name;
    }
}

const engine = new AetheriaEngine();