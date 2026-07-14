class AetheriaEngine {
    constructor() {
        this.app = new PIXI.Application({
            resizeTo: window,
            backgroundColor: 0x050508,
            antialias: false,
            resolution: window.devicePixelRatio || 1
        });
        document.getElementById('game-view').appendChild(this.app.view);
        
        this.layers = {
            world: new PIXI.Container(),
            entities: new PIXI.Container(),
            lighting: new PIXI.Container()
        };
        Object.values(this.layers).forEach(l => this.app.stage.addChild(l));

        this.allEntities = [];
        this.time = 0;
        this.questData = { kills: 0, target: 5 };

        this.setupLighting();
        this.init();
    }

    setupLighting() {
        this.darkness = new PIXI.Graphics();
        this.darkness.beginFill(0x0a0a2a);
        this.darkness.drawRect(-10000, -10000, 20000, 20000);
        this.darkness.endFill();
        this.layers.lighting.addChild(this.darkness);
        this.layers.lighting.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    }

    addLight(x, y, color, intensity) {
        const light = new PIXI.Graphics();
        light.beginFill(color, 0.4);
        light.drawCircle(0, 0, 150 * intensity);
        light.endFill();
        light.filters = [new PIXI.BlurFilter(40)];
        light.position.set(x, y);
        light.blendMode = PIXI.BLEND_MODES.ADD;
        this.layers.lighting.addChild(light);
        return light;
    }

    spawnEntity(entity) {
        this.allEntities.push(entity);
        this.layers.entities.addChild(entity.container);
    }

    removeEntity(entity) {
        const idx = this.allEntities.indexOf(entity);
        if(idx > -1) {
            this.allEntities.splice(idx, 1);
            this.layers.entities.removeChild(entity.container);
        }
    }

    init() {
        this.controls = new ControlsManager();
        this.world = new WorldManager(this);
        
        this.player = new Player(this, "NEXUS");
        this.spawnEntity(this.player);

        // Spawn Quest Enemies at the South Breach
        for(let i=0; i<8; i++) {
            this.spawnEntity(new Enemy(this, "Shadow Slime", (Math.random()-0.5)*500, 1500 + Math.random()*500));
        }

        this.app.ticker.add((delta) => this.update(delta));
    }

    update(delta) {
        this.time += delta;
        
        // Day/Night tint
        const nightIntensity = (Math.sin(this.time * 0.0005) + 1) / 2;
        this.darkness.alpha = 0.2 + (nightIntensity * 0.6);

        this.allEntities.forEach(e => e.update(this.controls ? this.controls : null, delta));

        // Camera
        const ease = 0.1;
        this.app.stage.pivot.x += (this.player.container.x - window.innerWidth/2 - this.app.stage.pivot.x) * ease;
        this.app.stage.pivot.y += (this.player.container.y - window.innerHeight/2 - this.app.stage.pivot.y) * ease;

        this.layers.entities.children.sort((a, b) => a.y - b.y);
    }

    updateQuestUI() {
        const prog = document.getElementById('quest-progress');
        prog.innerText = `Прогресс: ${this.questData.kills}/${this.questData.target}`;
        if(this.questData.kills >= this.questData.target) {
            prog.innerText = "КВЕСТ ВЫПОЛНЕН!";
            prog.classList.add('text-yellow-400', 'animate-bounce');
        }
    }
}

const engine = new AetheriaEngine();