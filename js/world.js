class WorldManager {
    constructor(engine) {
        this.engine = engine;
        this.init();
    }

    init() {
        const g = new PIXI.Graphics();
        
        // Grass Base
        g.beginFill(0x1a261a);
        g.drawRect(-5000, -5000, 10000, 10000);
        
        // Roads
        g.beginFill(0x2d2d33);
        g.drawRect(-60, -3000, 120, 6000); // Main vertical highway
        
        // Plaza
        g.beginFill(0x33333d);
        g.drawCircle(0, 0, 300);
        
        // The South Breach (Quest Zone)
        g.beginFill(0x2a002a);
        g.drawCircle(0, 1800, 600);
        g.filters = [new PIXI.BlurFilter(50)];

        this.engine.layers.world.addChild(g);

        // Decoration: Pillars and Crystals
        for(let i=0; i<12; i++) {
            const angle = (i/12) * Math.PI * 2;
            this.addProp(Math.cos(angle)*250, Math.sin(angle)*250, 'pillar');
        }
        
        // Add mystical light in South Breach
        this.engine.addLight(0, 1800, 0xaa00ff, 3);
    }

    addProp(x, y, type) {
        const pg = new PIXI.Graphics();
        if(type === 'pillar') {
            pg.beginFill(0x444455);
            pg.drawRect(-15, -60, 30, 60);
            pg.beginFill(0x00ffff, 0.3);
            pg.drawCircle(0, -65, 10);
            this.engine.addLight(x, y - 65, 0x00ffff, 0.5);
        }
        pg.position.set(x, y);
        this.engine.layers.entities.addChild(pg);
    }
}