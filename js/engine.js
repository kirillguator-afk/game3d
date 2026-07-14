class AetheriaEngine {
    constructor() {
        this.app = new PIXI.Application({
            resizeTo: window,
            backgroundColor: 0x0a0a0f,
            antialias: false,
            resolution: window.devicePixelRatio || 1
        });
        document.getElementById('game-view').appendChild(this.app.view);
        PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

        this.layers = {
            world: new PIXI.Container(),
            entities: new PIXI.Container(),
            lighting: new PIXI.Container()
        };

        // Dark Overlay for lighting effect
        this.ambientLight = new PIXI.Graphics();
        this.ambientLight.beginFill(0x000000, 0.7);
        this.ambientLight.drawRect(-5000, -5000, 10000, 10000);
        this.ambientLight.endFill();
        
        this.layers.lighting.blendMode = PIXI.BLEND_MODES.ADD;
        this.layers.lighting.addChild(this.ambientLight); // This acts as base darkness

        Object.values(this.layers).forEach(l => this.app.stage.addChild(l));

        this.init();
    }

    addLight(x, y, color, radius) {
        const light = new PIXI.Graphics();
        const blur = new PIXI.BlurFilter(30);
        light.beginFill(color, 0.3);
        light.drawCircle(0, 0, 60 * radius);
        light.endFill();
        light.filters = [blur];
        light.position.set(x, y);
        this.layers.lighting.addChild(light);
        return light;
    }

    init() {
        this.controls = new ControlsManager();
        this.world = new WorldManager(this);
        
        this.player = new Player(this, "NEXUS_PRIME", 0x3366ff);
        this.layers.entities.addChild(this.player.container);

        this.npcs = [
            new Npc(this, "Elder Kaelen", -120, -50),
            new Npc(this, "Merchant", 100, 80)
        ];
        this.npcs.forEach(n => this.layers.entities.addChild(n.container));

        this.app.ticker.add((delta) => this.update(delta));
    }

    update(delta) {
        this.player.update(this.controls, delta);
        this.npcs.forEach(n => n.update());

        // Camera Lerp
        const lerp = 0.1;
        const targetX = -this.player.container.x + window.innerWidth / 2;
        const targetY = -this.player.container.y + window.innerHeight / 2;
        
        this.app.stage.pivot.x += (-targetX - this.app.stage.pivot.x) * lerp;
        this.app.stage.pivot.y += (-targetY - this.app.stage.pivot.y) * lerp;

        // Y-Sorting
        this.layers.entities.children.sort((a, b) => a.y - b.y);
    }
}

// Start Engine
const engine = new AetheriaEngine();