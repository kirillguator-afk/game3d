class BaseEntity {
    constructor(engine) {
        this.engine = engine;
        this.container = new PIXI.Container();
        this.zOrder = 0;
    }
    update(delta) {}
}

class Tree extends BaseEntity {
    constructor(engine, x, y) {
        super(engine);
        this.container.position.set(x, y);
        const g = new PIXI.Graphics();
        
        // Shadow
        g.beginFill(0x000000, 0.2);
        g.drawEllipse(0, 0, 30, 10);
        
        // Trunk
        g.beginFill(0x3d2b1f);
        g.drawRect(-8, -40, 16, 40);
        
        // Leaves
        const colors = [0x1a2e1a, 0x223d22, 0x2d5a2d];
        colors.forEach((c, i) => {
            g.beginFill(c);
            g.drawCircle(0, -40 - (i*20), 40 - (i*5));
        });
        
        g.endFill();
        this.container.addChild(g);
    }
}

class Prop extends BaseEntity {
    constructor(engine, type, x, y) {
        super(engine);
        this.container.position.set(x, y);
        const g = new PIXI.Graphics();
        
        if(type === 'ruin_pillar') {
            g.beginFill(0x44444f);
            g.drawRect(-15, -Math.random()*80 - 20, 30, 100);
            g.beginFill(0x22222a);
            g.drawRect(-18, 0, 36, 10);
        } else if(type === 'tent') {
            g.beginFill(0x882222);
            g.moveTo(-40, 0); g.lineTo(0, -60); g.lineTo(40, 0);
            g.beginFill(0xaa4444);
            g.drawRect(-30, -10, 60, 10);
        } else if(type === 'statue') {
            g.beginFill(0x9999aa);
            g.drawRect(-20, -100, 40, 100);
            g.beginFill(0xccccdd);
            g.drawCircle(0, -110, 15);
        }
        
        g.endFill();
        this.container.addChild(g);
    }
}

class Npc extends BaseEntity {
    constructor(engine, name, x, y, color = 0x884422) {
        super(engine);
        this.container.position.set(x, y);
        this.target = { x, y };
        this.speed = 1.5;
        this.behavior = 'idle';

        const body = new PIXI.Graphics();
        body.beginFill(0x000000, 0.3); body.drawEllipse(0, 5, 15, 6);
        body.beginFill(color); body.drawRect(-12, -35, 24, 35);
        body.beginFill(0xffdbac); body.drawRect(-8, -48, 16, 15);
        body.endFill();

        this.label = new PIXI.Text(name, { fontFamily: 'Inter', fontSize: 10, fill: 0xffffff });
        this.label.anchor.set(0.5);
        this.label.y = -65;

        this.container.addChild(body, this.label);
    }

    update(delta) {
        if(this.behavior === 'patrol') {
            const dist = Math.hypot(this.target.x - this.container.x, this.target.y - this.container.y);
            if(dist < 10) {
                this.target = { 
                    x: this.container.x + (Math.random()-0.5)*500, 
                    y: this.container.y + (Math.random()-0.5)*500 
                };
            } else {
                this.container.x += (this.target.x - this.container.x)/dist * this.speed;
                this.container.y += (this.target.y - this.container.y)/dist * this.speed;
            }
        }
    }
}

class Player extends BaseEntity {
    constructor(engine, name) {
        super(engine);
        this.speed = 5;
        
        const g = new PIXI.Graphics();
        // Aura
        const aura = new PIXI.Graphics();
        aura.beginFill(0x00ff88, 0.1); aura.drawCircle(0, 0, 40); aura.endFill();
        aura.filters = [new PIXI.BlurFilter(10)];
        
        g.beginFill(0x000000, 0.4); g.drawEllipse(0, 5, 18, 8);
        g.beginFill(0x3366ff); g.drawRect(-12, -40, 24, 40);
        g.beginFill(0xffdbac); g.drawRect(-9, -55, 18, 18);
        g.beginFill(0x111111); g.drawRect(-10, -58, 20, 8); // Hat
        g.endFill();

        this.label = new PIXI.Text(name, { 
            fontFamily: 'Press Start 2P', 
            fontSize: 9, 
            fill: 0x00ffcc,
            stroke: 0x000000,
            strokeThickness: 2
        });
        this.label.anchor.set(0.5);
        this.label.y = -75;

        this.container.addChild(aura, g, this.label);
    }

    update(controls, delta) {
        let vx = 0, vy = 0;
        if (controls.keys['KeyW']) vy = -1;
        if (controls.keys['KeyS']) vy = 1;
        if (controls.keys['KeyA']) vx = -1;
        if (controls.keys['KeyD']) vx = 1;

        if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

        this.container.x += vx * this.speed * delta;
        this.container.y += vy * this.speed * delta;
        
        // Tilt animation
        this.container.skew.x = vx * 0.05;
    }
}