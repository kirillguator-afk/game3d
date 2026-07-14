class WorldManager {
    constructor(engine) {
        this.engine = engine;
        this.tileSize = 32;
        this.generateMap();
    }

    generateMap() {
        const graphics = new PIXI.Graphics();
        
        // Draw Grass Tiles
        for(let x = -50; x < 50; x++) {
            for(let y = -50; y < 50; y++) {
                const isDark = (x + y) % 2 === 0;
                graphics.beginFill(isDark ? 0x1a2a1a : 0x1d2d1d);
                graphics.drawRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                graphics.endFill();
            }
        }

        // Add some "Pixel Art" structures
        for(let i=0; i<20; i++) {
            this.drawStone(graphics, Math.random() * 2000 - 1000, Math.random() * 2000 - 1000);
        }

        this.engine.layers.world.addChild(graphics);
        
        // Parallax Stars/Dust
        const bg = new PIXI.Graphics();
        for(let i=0; i<100; i++) {
            bg.beginFill(0x333344);
            bg.drawCircle(Math.random() * 2000, Math.random() * 2000, 1 + Math.random() * 2);
        }
        this.engine.layers.background.addChild(bg);
    }

    drawStone(g, x, y) {
        g.beginFill(0x444455);
        g.drawRect(x, y, 64, 48);
        g.beginFill(0x222233);
        g.drawRect(x, y + 40, 64, 8); // Shadow
        g.endFill();
    }
}