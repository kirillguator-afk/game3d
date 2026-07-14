class BaseEntity {
    constructor(engine, name, color) {
        this.engine = engine;
        this.container = new PIXI.Container();
        
        // Sprite Body (Procedural Pixel Art)
        this.sprite = new PIXI.Graphics();
        this.sprite.beginFill(color);
        this.sprite.drawRect(-12, -24, 24, 24); // Head
        this.sprite.beginFill(0x333333);
        this.sprite.drawRect(-14, 0, 28, 12); // Body
        this.sprite.endFill();
        
        // Name Label
        this.label = new PIXI.Text(name, {
            fontFamily: 'Inter',
            fontSize: 12,
            fill: 0xffffff,
            fontWeight: 'bold',
            align: 'center'
        });
        this.label.anchor.set(0.5);
        this.label.position.y = -45;
        
        this.container.addChild(this.sprite);
        this.container.addChild(this.label);
    }
}

class Player extends BaseEntity {
    constructor(engine, name, color) {
        super(engine, name, color);
        this.speed = 4;
        this.velocity = { x: 0, y: 0 };
    }

    update(controls, delta) {
        this.velocity.x = 0;
        this.velocity.y = 0;

        if (controls.keys['ArrowUp'] || controls.keys['KeyW']) this.velocity.y = -1;
        if (controls.keys['ArrowDown'] || controls.keys['KeyS']) this.velocity.y = 1;
        if (controls.keys['ArrowLeft'] || controls.keys['KeyA']) this.velocity.x = -1;
        if (controls.keys['ArrowRight'] || controls.keys['KeyD']) this.velocity.x = 1;

        // Normalization
        if (this.velocity.x !== 0 && this.velocity.y !== 0) {
            this.velocity.x *= 0.707;
            this.velocity.y *= 0.707;
        }

        this.container.x += this.velocity.x * this.speed * delta;
        this.container.y += this.velocity.y * this.speed * delta;
        
        // Basic animation tilt
        if (this.velocity.x !== 0) {
            this.sprite.skew.x = Math.sin(Date.now() * 0.01) * 0.1;
        } else {
            this.sprite.skew.x = 0;
        }
    }
}

class RemotePlayer extends BaseEntity {
    constructor(engine, name, color) {
        super(engine, name, color);
        this.target = { x: Math.random() * 400, y: Math.random() * 400 };
        this.label.style.fill = 0xaaaaaa;
    }

    update(delta) {
        // Simple AI wandering to simulate other players
        const dx = this.target.x - this.container.x;
        const dy = this.target.y - this.container.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < 5) {
            this.target = { 
                x: this.container.x + (Math.random() * 200 - 100), 
                y: this.container.y + (Math.random() * 200 - 100) 
            };
        } else {
            this.container.x += (dx / dist) * 1 * delta;
            this.container.y += (dy / dist) * 1 * delta;
        }
    }
}