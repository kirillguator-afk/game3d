class BaseEntity {
    constructor(engine) {
        this.engine = engine;
        this.container = new PIXI.Container();
    }
}

class Prop extends BaseEntity {
    constructor(engine, type, x, y) {
        super(engine);
        this.container.position.set(x, y);
        const g = new PIXI.Graphics();
        
        if (type === 'pillar') {
            // Shadow
            g.beginFill(0x000000, 0.4);
            g.drawEllipse(0, 0, 20, 8);
            // Pillar
            g.beginFill(0x555566);
            g.drawRect(-12, -60, 24, 60);
            g.beginFill(0x333344);
            g.drawRect(-14, -65, 28, 10);
            // Torch glow
            g.beginFill(0xffaa44);
            g.drawCircle(0, -65, 4);
        } else if (type === 'altar') {
            g.beginFill(0x000000, 0.4);
            g.drawEllipse(0, 0, 45, 15);
            g.beginFill(0x222233);
            g.drawRect(-40, -20, 80, 25);
            g.beginFill(0x4477ff, 0.6);
            g.drawRect(-35, -22, 70, 4);
        }
        g.endFill();
        this.container.addChild(g);
    }
}

class Npc extends BaseEntity {
    constructor(engine, name, x, y) {
        super(engine);
        this.container.position.set(x, y);
        
        const body = new PIXI.Graphics();
        body.beginFill(0x000000, 0.3); body.drawEllipse(0, 0, 15, 6);
        body.beginFill(0x884422); body.drawRect(-10, -35, 20, 35);
        body.beginFill(0xffccaa); body.drawRect(-7, -45, 14, 12);
        body.endFill();

        this.mark = new PIXI.Text("!", {
            fontFamily: 'Press Start 2P',
            fontSize: 14,
            fill: 0xffff00,
            stroke: 0x000000,
            strokeThickness: 3
        });
        this.mark.anchor.set(0.5);
        this.mark.y = -70;

        const label = new PIXI.Text(name, { fontFamily: 'Inter', fontSize: 11, fill: 0xffffff, fontWeight: 'bold' });
        label.anchor.set(0.5);
        label.y = -55;

        this.container.addChild(body, this.mark, label);
    }

    update() {
        this.mark.y = -70 + Math.sin(Date.now() * 0.005) * 5;
    }
}

class Player extends BaseEntity {
    constructor(engine, name, color) {
        super(engine);
        this.speed = 4;
        
        const g = new PIXI.Graphics();
        g.beginFill(0x000000, 0.3); g.drawEllipse(0, 0, 15, 6);
        g.beginFill(color); g.drawRect(-10, -35, 20, 35);
        g.endFill();

        this.label = new PIXI.Text(name, { fontFamily: 'Inter', fontSize: 11, fill: 0x00ffcc, fontWeight: 'bold' });
        this.label.anchor.set(0.5);
        this.label.y = -50;

        this.container.addChild(g, this.label);
    }

    update(controls, delta) {
        let vx = 0, vy = 0;
        if (controls.keys['KeyW'] || controls.keys['ArrowUp']) vy = -1;
        if (controls.keys['KeyS'] || controls.keys['ArrowDown']) vy = 1;
        if (controls.keys['KeyA'] || controls.keys['ArrowLeft']) vx = -1;
        if (controls.keys['KeyD'] || controls.keys['ArrowRight']) vx = 1;

        if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

        this.container.x += vx * this.speed * delta;
        this.container.y += vy * this.speed * delta;
    }
}