class WorldManager {
    constructor(engine) {
        this.engine = engine;
        this.tileSize = 32;
        this.init();
    }

    init() {
        const floor = new PIXI.Graphics();
        
        // Background Grass
        floor.beginFill(0x1a261a);
        floor.drawRect(-2000, -2000, 4000, 4000);
        floor.endFill();

        // Main Plaza
        floor.beginFill(0x2d2d33);
        floor.drawCircle(0, 0, 200);
        floor.endFill();

        // Roads
        floor.beginFill(0x2d2d33);
        floor.drawRect(-50, -1000, 100, 2000);
        floor.drawRect(-1000, -50, 2000, 100);
        floor.endFill();

        // Details (Stone bricks pattern)
        floor.lineStyle(1, 0x1a1a1f, 0.5);
        for(let i = 0; i < 5; i++) {
            floor.drawCircle(0, 0, 40 * i);
        }

        this.engine.layers.world.addChild(floor);

        // Props
        this.spawnProps();
    }

    spawnProps() {
        // Circle of Pillars
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const x = Math.cos(angle) * 180;
            const y = Math.sin(angle) * 180;
            
            const pillar = new Prop(this.engine, 'pillar', x, y);
            this.engine.layers.entities.addChild(pillar.container);
            
            // Strong Orange Lights for torches
            this.engine.addLight(x, y - 50, 0xff8822, 1.2);
        }

        // Center Altar
        const altar = new Prop(this.engine, 'altar', 0, 0);
        this.engine.layers.entities.addChild(altar.container);
        this.engine.addLight(0, -10, 0x00ffff, 1.5);
    }
}