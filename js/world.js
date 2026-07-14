
class WorldManager {
    constructor(engine) {
        this.engine = engine;
        this.tileSize = 64;
        this.gridSize = 100; // 100x100 tiles
        this.chunks = new PIXI.Container();
        this.engine.layers.world.addChild(this.chunks);
        
        this.biomes = {
            CENTER: { name: 'Nexus Hub', color: 0x33333d, texture: 'stone', props: ['pillar', 'crystal'] },
            NORTH: { name: 'Frozen Reach', color: 0xe3f2fd, texture: 'grass', props: ['rock'] },
            SOUTH: { name: 'Void Abyss', color: 0x1a0a2a, texture: 'void', props: ['crystal'] },
            EAST: { name: 'Emerald Wilds', color: 0x1b5e20, texture: 'grass', props: ['tree', 'bush'] },
            WEST: { name: 'Iron Peaks', color: 0x3e2723, texture: 'dirt', props: ['rock'] }
        };

        this.init();
    }

    init() {
        this.generateTerrain();
        this.generateLogicalStructures();
    }

    generateTerrain() {
        const bg = new PIXI.TilingSprite(
            AssetGenerator.textures.grass,
            this.gridSize * this.tileSize,
            this.gridSize * this.tileSize
        );
        bg.anchor.set(0.5);
        bg.alpha = 0.5;
        this.chunks.addChild(bg);

        // Biome Zones
        const zones = new PIXI.Graphics();
        
        // Central Plaza
        this.drawBiomeZone(zones, 0, 0, 1200, this.biomes.CENTER);
        // North
        this.drawBiomeZone(zones, 0, -3000, 2000, this.biomes.NORTH);
        // South
        this.drawBiomeZone(zones, 0, 3000, 2000, this.biomes.SOUTH);
        
        zones.filters = [new PIXI.BlurFilter(100)];
        this.chunks.addChild(zones);
    }

    drawBiomeZone(g, x, y, radius, biome) {
        g.beginFill(biome.color, 0.4);
        g.drawCircle(x, y, radius);
        g.endFill();

        // Add props logic
        for(let i=0; i<40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * radius;
            const px = x + Math.cos(angle) * dist;
            const py = y + Math.sin(angle) * dist;
            
            const propType = biome.props[Math.floor(Math.random() * biome.props.length)];
            this.addProp(px, py, propType);
        }
    }

    generateLogicalStructures() {
        // Roads connecting hub to biomes
        const roads = new PIXI.Graphics();
        roads.lineStyle(120, 0x2d2d33, 0.8);
        
        // Main Crossroad
        roads.moveTo(0, -3000); roads.lineTo(0, 3000);
        roads.moveTo(-3000, 0); roads.lineTo(3000, 0);
        
        this.chunks.addChild(roads);
    }

    addProp(x, y, type) {
        let sprite;
        switch(type) {
            case 'tree': sprite = new PIXI.Sprite(AssetGenerator.textures.tree); break;
            case 'crystal': sprite = new PIXI.Sprite(AssetGenerator.textures.crystal); break;
            case 'rock': sprite = new PIXI.Sprite(AssetGenerator.textures.rock); break;
            case 'bush': sprite = new PIXI.Sprite(AssetGenerator.textures.bush); break;
            default: return;
        }

        sprite.anchor.set(0.5, 1);
        sprite.position.set(x, y);
        sprite.scale.set(1.5 + Math.random());
        
        // Shadow
        const shadow = new PIXI.Graphics();
        shadow.beginFill(0x000000, 0.2);
        shadow.drawEllipse(0, 0, 15, 6);
        shadow.position.set(x, y);
        
        this.engine.layers.world.addChild(shadow);
        this.engine.layers.entities.addChild(sprite);

        if(type === 'crystal') {
            this.engine.addLight(x, y - 20, 0x00e5ff, 0.6);
        }
    }

    getCurrentBiome(x, y) {
        const dist = Math.hypot(x, y);
        if (dist < 1000) return this.biomes.CENTER;
        if (y < -1500) return this.biomes.NORTH;
        if (y > 1500) return this.biomes.SOUTH;
        if (x > 1500) return this.biomes.EAST;
        if (x < -1500) return this.biomes.WEST;
        return { name: 'The Wildlands' };
    }
}
