
class AssetGenerator {
    static async init(renderer) {
        this.textures = {};
        this.renderer = renderer;

        // Generate various textures
        this.textures.grass = this.createTileTexture(32, [0x1a2e1a, 0x1d331d, 0x223a22], 'grass');
        this.textures.stone = this.createTileTexture(32, [0x33333d, 0x3a3a45, 0x2d2d35], 'stone');
        this.textures.dirt = this.createTileTexture(32, [0x2d1b10, 0x362214, 0x26160d], 'dirt');
        this.textures.void = this.createTileTexture(32, [0x0f0514, 0x160821, 0x0a030d], 'void');
        
        this.textures.tree = this.createTreeTexture();
        this.textures.crystal = this.createCrystalTexture();
        this.textures.rock = this.createRockTexture();
        this.textures.bush = this.createBushTexture();
    }

    static createTileTexture(size, colors, type) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Base
        ctx.fillStyle = `#${colors[0].toString(16).padStart(6, '0')}`;
        ctx.fillRect(0, 0, size, size);

        // Noise/Detail
        for(let i=0; i<16; i++) {
            ctx.fillStyle = `#${colors[Math.floor(Math.random()*colors.length)].toString(16).padStart(6, '0')}`;
            const px = Math.floor(Math.random()*size);
            const py = Math.floor(Math.random()*size);
            ctx.fillRect(px, py, 2, 2);
        }

        // Borders for tiling feel
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.strokeRect(0, 0, size, size);

        return PIXI.Texture.from(canvas);
    }

    static createTreeTexture() {
        const g = new PIXI.Graphics();
        // Trunk
        g.beginFill(0x3e2723);
        g.drawRect(-4, 0, 8, 12);
        // Foliage
        g.beginFill(0x2e7d32);
        g.drawPolygon([-20, 0, 20, 0, 0, -30]);
        g.beginFill(0x388e3c);
        g.drawPolygon([-15, -15, 15, -15, 0, -45]);
        return this.renderer.generateTexture(g);
    }

    static createCrystalTexture() {
        const g = new PIXI.Graphics();
        g.beginFill(0x00e5ff, 0.8);
        g.drawPolygon([0, -20, 10, 0, 0, 10, -10, 0]);
        g.beginFill(0xffffff, 0.4);
        g.drawPolygon([0, -15, 5, 0, 0, 5, -5, 0]);
        return this.renderer.generateTexture(g);
    }

    static createRockTexture() {
        const g = new PIXI.Graphics();
        g.beginFill(0x616161);
        g.drawRoundedRect(-10, -8, 20, 16, 4);
        g.beginFill(0x9e9e9e);
        g.drawRect(-6, -4, 4, 4);
        return this.renderer.generateTexture(g);
    }

    static createBushTexture() {
        const g = new PIXI.Graphics();
        g.beginFill(0x1b5e20);
        g.drawCircle(0, 0, 12);
        g.drawCircle(8, 4, 10);
        g.drawCircle(-8, 4, 10);
        return this.renderer.generateTexture(g);
    }
}
