
class AssetGenerator {
    static async init(renderer) {
        this.textures = {};
        this.renderer = renderer;

        // Base Terrain
        this.textures.grass = this.createTileTexture(32, [0x1a2e1a, 0x1d331d, 0x223a22], 'grass');
        this.textures.stone = this.createTileTexture(32, [0x33333d, 0x3a3a45, 0x2d2d35], 'stone');
        this.textures.dirt = this.createTileTexture(32, [0x2d1b10, 0x362214, 0x26160d], 'dirt');
        this.textures.void = this.createTileTexture(32, [0x0f0514, 0x160821, 0x0a030d], 'void');
        this.textures.snow = this.createTileTexture(32, [0xe3f2fd, 0xffffff, 0xbbdefb], 'snow');
        
        // World Objects
        this.textures.tree = this.createTreeTexture();
        this.textures.crystal = this.createCrystalTexture();
        this.textures.rock = this.createRockTexture();
        this.textures.bush = this.createBushTexture();
        
        // Structures
        this.textures.house = this.createBuildingTexture(0x5d4037, 0x3e2723);
        this.textures.tent = this.createTentTexture(0x455a64, 0x263238);
        this.textures.shop = this.createBuildingTexture(0x4527a0, 0x311b92, true);
        this.textures.fountain = this.createFountainTexture();
    }

    static createTileTexture(size, colors, type) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = `#${colors[0].toString(16).padStart(6, '0')}`;
        ctx.fillRect(0, 0, size, size);
        for(let i=0; i<16; i++) {
            ctx.fillStyle = `#${colors[Math.floor(Math.random()*colors.length)].toString(16).padStart(6, '0')}`;
            ctx.fillRect(Math.floor(Math.random()*size), Math.floor(Math.random()*size), 2, 2);
        }
        return PIXI.Texture.from(canvas);
    }

    static createBuildingTexture(colorMain, colorAccent, isShop = false) {
        const g = new PIXI.Graphics();
        // Shadow
        g.beginFill(0x000000, 0.3).drawRect(-45, -5, 90, 15).endFill();
        // Walls
        g.beginFill(colorMain).drawRect(-40, -60, 80, 60).endFill();
        // Roof
        g.beginFill(colorAccent);
        g.drawPolygon([-50, -60, 50, -60, 0, -90]);
        // Door
        g.beginFill(0x212121).drawRect(-10, -30, 20, 30).endFill();
        // Windows
        g.beginFill(0xffeb3b, 0.6).drawRect(-25, -45, 12, 12).drawRect(13, -45, 12, 12).endFill();
        
        if(isShop) {
            // Signboard
            g.beginFill(0xffd600).drawRect(-15, -75, 30, 10).endFill();
        }
        return this.renderer.generateTexture(g);
    }

    static createTentTexture(color1, color2) {
        const g = new PIXI.Graphics();
        g.beginFill(0x000000, 0.2).drawEllipse(0, 0, 35, 10);
        g.beginFill(color1).drawPolygon([-30, 0, 30, 0, 0, -40]);
        g.beginFill(color2).drawPolygon([-10, 0, 10, 0, 0, -25]);
        return this.renderer.generateTexture(g);
    }

    static createFountainTexture() {
        const g = new PIXI.Graphics();
        g.beginFill(0x9e9e9e).drawCircle(0, 0, 40);
        g.beginFill(0x757575).drawCircle(0, 0, 35);
        g.beginFill(0x03a9f4, 0.8).drawCircle(0, 0, 30);
        g.beginFill(0xffffff, 0.5).drawCircle(0, 0, 5);
        return this.renderer.generateTexture(g);
    }

    static createTreeTexture() {
        const g = new PIXI.Graphics();
        g.beginFill(0x3e2723).drawRect(-4, 0, 8, 12);
        g.beginFill(0x2e7d32).drawPolygon([-20, 0, 20, 0, 0, -30]);
        g.beginFill(0x388e3c).drawPolygon([-15, -15, 15, -15, 0, -45]);
        return this.renderer.generateTexture(g);
    }

    static createCrystalTexture() {
        const g = new PIXI.Graphics();
        g.beginFill(0x00e5ff, 0.8).drawPolygon([0, -20, 10, 0, 0, 10, -10, 0]);
        return this.renderer.generateTexture(g);
    }

    static createRockTexture() {
        const g = new PIXI.Graphics();
        g.beginFill(0x616161).drawRoundedRect(-10, -8, 20, 16, 4);
        return this.renderer.generateTexture(g);
    }

    static createBushTexture() {
        const g = new PIXI.Graphics();
        g.beginFill(0x1b5e20).drawCircle(0, 0, 12).drawCircle(8, 4, 10).drawCircle(-8, 4, 10);
        return this.renderer.generateTexture(g);
    }
}
