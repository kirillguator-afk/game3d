
class WorldManager {
    constructor(engine) {
        this.engine = engine;
        this.tileSize = 64;
        this.chunks = new PIXI.Container();
        this.engine.layers.world.addChild(this.chunks);
        
        this.biomes = {
            CENTER: { name: 'Nexus Town', color: 0x37474f, texture: 'stone', props: ['house', 'shop', 'fountain'] },
            NORTH: { name: 'Frozen Reach', color: 0xe3f2fd, texture: 'snow', props: ['rock', 'crystal'] },
            SOUTH: { name: 'Void Abyss', color: 0x1a0a2a, texture: 'void', props: ['crystal'] },
            EAST: { name: 'Emerald Wilds', color: 0x1b5e20, texture: 'grass', props: ['tree', 'bush'] },
            WEST: { name: 'Iron Peaks', color: 0x3e2723, texture: 'dirt', props: ['rock', 'tent'] }
        };

        this.init();
    }

    init() {
        this.generateTerrain();
        this.populateWorld();
    }

    generateTerrain() {
        const mapSize = 8000;
        const bg = new PIXI.TilingSprite(AssetGenerator.textures.grass, mapSize, mapSize);
        bg.anchor.set(0.5);
        bg.alpha = 0.2;
        this.chunks.addChild(bg);

        // Biome Zones
        const zones = new PIXI.Graphics();
        this.drawBiomeZone(zones, 0, 0, 1500, this.biomes.CENTER);
        this.drawBiomeZone(zones, 0, -3500, 2500, this.biomes.NORTH);
        this.drawBiomeZone(zones, 0, 3500, 2500, this.biomes.SOUTH);
        this.drawBiomeZone(zones, 3500, 0, 2500, this.biomes.EAST);
        this.drawBiomeZone(zones, -3500, 0, 2500, this.biomes.WEST);
        
        zones.filters = [new PIXI.BlurFilter(150)];
        this.chunks.addChild(zones);

        // Roads
        const roads = new PIXI.Graphics();
        roads.lineStyle(160, 0x263238, 0.8);
        roads.moveTo(0, -4000); roads.lineTo(0, 4000);
        roads.moveTo(-4000, 0); roads.lineTo(4000, 0);
        this.chunks.addChild(roads);
    }

    drawBiomeZone(g, x, y, radius, biome) {
        g.beginFill(biome.color, 0.5).drawCircle(x, y, radius).endFill();
    }

    populateWorld() {
        // Town Square
        this.addProp(0, 0, 'fountain');
        this.addProp(150, -100, 'shop');
        this.addProp(-150, -100, 'house');
        this.addProp(150, 150, 'house');

        // NPCs
        this.engine.spawnEntity(new NPC(this.engine, 60, 80, {
            name: "Elder Aris", icon: "👴", color: 0x5d4037,
            dialogue: ["Welcome to Nexus Town, traveler. The world outside has changed..."]
        }));

        this.engine.spawnEntity(new NPC(this.engine, 220, -50, {
            name: "Merchant Silas", icon: "💰", color: 0xffd54f,
            dialogue: ["I've got the finest crystals from the Frozen Reach! Want to trade?"]
        }));

        // Wilderness Decoration
        for(let i=0; i<300; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 800 + Math.random() * 3000;
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;
            
            const biome = this.getCurrentBiome(x, y);
            const prop = biome.props[Math.floor(Math.random() * biome.props.length)];
            if(prop !== 'fountain' && prop !== 'shop') this.addProp(x, y, prop);
        }
    }

    addProp(x, y, type) {
        let sprite;
        switch(type) {
            case 'house': sprite = new PIXI.Sprite(AssetGenerator.textures.house); break;
            case 'shop': sprite = new PIXI.Sprite(AssetGenerator.textures.shop); break;
            case 'fountain': sprite = new PIXI.Sprite(AssetGenerator.textures.fountain); break;
            case 'tree': sprite = new PIXI.Sprite(AssetGenerator.textures.tree); break;
            case 'crystal': sprite = new PIXI.Sprite(AssetGenerator.textures.crystal); break;
            case 'rock': sprite = new PIXI.Sprite(AssetGenerator.textures.rock); break;
            case 'tent': sprite = new PIXI.Sprite(AssetGenerator.textures.tent); break;
            default: sprite = new PIXI.Sprite(AssetGenerator.textures.bush);
        }
        sprite.anchor.set(0.5, 1);
        sprite.position.set(x, y);
        this.engine.layers.entities.addChild(sprite);
        if(type === 'fountain') this.engine.addLight(x, y, 0x03a9f4, 1);
        if(type === 'crystal') this.engine.addLight(x, y - 10, 0x00e5ff, 0.5);
    }

    getCurrentBiome(x, y) {
        const dist = Math.hypot(x, y);
        if (dist < 1000) return this.biomes.CENTER;
        if (Math.abs(y) > Math.abs(x)) return y < 0 ? this.biomes.NORTH : this.biomes.SOUTH;
        return x < 0 ? this.biomes.WEST : this.biomes.EAST;
    }
}
