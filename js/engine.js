class AetheriaEngine {
    constructor() {
        this.app = new PIXI.Application({
            resizeTo: window,
            backgroundColor: 0x0a0a0c,
            antialias: false,
            hello: true
        });
        document.getElementById('game-view').appendChild(this.app.view);
        
        // Settings
        PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
        
        this.layers = {
            background: new PIXI.Container(),
            world: new PIXI.Container(),
            entities: new PIXI.Container(),
            lighting: new PIXI.Container(),
            ui: new PIXI.Container()
        };

        Object.values(this.layers).forEach(layer => this.app.stage.addChild(layer));
        
        this.init();
    }

    async init() {
        console.log("Initializing Aetheria Engine...");
        
        this.world = new WorldManager(this);
        this.controls = new ControlsManager();
        
        // Create Local Player
        this.player = new Player(this, "Nexus_Prime", 0x00ff88);
        this.layers.entities.addChild(this.player.container);
        
        // Fake Players (MMO Sim)
        this.otherPlayers = [];
        for(let i=0; i<5; i++) {
            const p = new RemotePlayer(this, `Adventurer_${i}`, Math.random() * 0xffffff);
            p.container.position.set(Math.random() * 800, Math.random() * 600);
            this.layers.entities.addChild(p.container);
            this.otherPlayers.push(p);
        }

        this.app.ticker.add((delta) => this.update(delta));
    }

    update(delta) {
        this.player.update(this.controls, delta);
        
        // Sorting entities by Y for depth
        this.layers.entities.children.sort((a, b) => a.y - b.y);
        
        // Camera Follow
        const targetX = -this.player.container.x + window.innerWidth / 2;
        const targetY = -this.player.container.y + window.innerHeight / 2;
        
        this.layers.world.position.set(targetX, targetY);
        this.layers.entities.position.set(targetX, targetY);
        this.layers.background.position.set(targetX * 0.2, targetY * 0.2); // Parallax
        
        // Simulated Network Update
        this.otherPlayers.forEach(p => p.update(delta));
    }
}

const engine = new AetheriaEngine();