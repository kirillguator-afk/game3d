class BaseEntity {
    constructor(engine) {
        this.engine = engine;
        this.container = new PIXI.Container();
        this.health = 100;
        this.isDead = false;
    }
    update(delta) {}
    takeDamage(amount) {
        this.health -= amount;
        this.showDamage(amount);
        if(this.health <= 0 && !this.isDead) this.die();
    }
    showDamage(amount) {
        const text = new PIXI.Text(amount, {
            fontFamily: 'Press Start 2P',
            fontSize: 14,
            fill: 0xff4444,
            stroke: 0x000000,
            strokeThickness: 3
        });
        text.position.set(this.container.x, this.container.y - 50);
        this.engine.layers.entities.addChild(text);
        
        let life = 30;
        const anim = () => {
            text.y -= 1;
            text.alpha -= 0.03;
            life--;
            if(life > 0) requestAnimationFrame(anim);
            else this.engine.layers.entities.removeChild(text);
        };
        anim();
    }
    die() {
        this.isDead = true;
        this.container.alpha = 0.5;
        setTimeout(() => this.engine.removeEntity(this), 500);
    }
}

class Projectile extends BaseEntity {
    constructor(engine, x, y, angle, type = 'fireball') {
        super(engine);
        this.container.position.set(x, y);
        this.angle = angle;
        this.speed = 10;
        this.life = 60;
        
        const g = new PIXI.Graphics();
        if(type === 'fireball') {
            g.beginFill(0xffaa00);
            g.drawCircle(0, 0, 8);
            g.beginFill(0xff4400, 0.5);
            g.drawCircle(0, 0, 15);
            this.light = engine.addLight(x, y, 0xff6600, 0.8);
        }
        g.endFill();
        this.container.addChild(g);
    }
    update(delta) {
        this.container.x += Math.cos(this.angle) * this.speed;
        this.container.y += Math.sin(this.angle) * this.speed;
        if(this.light) this.light.position.set(this.container.x, this.container.y);
        
        this.life--;
        if(this.life <= 0) this.die();
        
        // Collision with enemies
        this.engine.allEntities.forEach(e => {
            if(e instanceof Enemy && !e.isDead) {
                const dist = Math.hypot(e.container.x - this.container.x, e.container.y - this.container.y);
                if(dist < 30) {
                    e.takeDamage(25);
                    this.die();
                }
            }
        });
    }
    die() {
        if(this.light) this.engine.layers.lighting.removeChild(this.light);
        this.engine.removeEntity(this);
    }
}

class Enemy extends BaseEntity {
    constructor(engine, name, x, y) {
        super(engine);
        this.container.position.set(x, y);
        this.health = 50;
        this.speed = 1.2;
        
        const g = new PIXI.Graphics();
        g.beginFill(0x000000, 0.4); g.drawEllipse(0, 0, 20, 8);
        g.beginFill(0x4a008a); g.drawCircle(0, -15, 20);
        g.beginFill(0xffffff); g.drawCircle(-8, -20, 4); g.drawCircle(8, -20, 4);
        g.endFill();
        
        this.label = new PIXI.Text(name, { fontFamily: 'Inter', fontSize: 9, fill: 0xff3333 });
        this.label.anchor.set(0.5);
        this.label.y = -45;
        
        this.container.addChild(g, this.label);
    }
    update(delta) {
        if(this.isDead) return;
        const player = this.engine.player;
        const dist = Math.hypot(player.container.x - this.container.x, player.container.y - this.container.y);
        
        if(dist < 300) { // Aggro range
            const angle = Math.atan2(player.container.y - this.container.y, player.container.x - this.container.x);
            this.container.x += Math.cos(angle) * this.speed;
            this.container.y += Math.sin(angle) * this.speed;
            
            if(dist < 30) player.takeDamage(0.5); // Constant touch damage
        }
    }
    die() {
        super.die();
        this.engine.questData.kills++;
        this.engine.updateQuestUI();
    }
}

class Player extends BaseEntity {
    constructor(engine, name) {
        super(engine);
        this.speed = 4;
        this.maxHealth = 100;
        this.health = 100;
        this.mana = 50;
        this.cooldowns = { q: 0, e: 0, space: 0 };
        
        const g = new PIXI.Graphics();
        g.beginFill(0x000000, 0.4); g.drawEllipse(0, 5, 18, 8);
        g.beginFill(0x4f46e5); g.drawRect(-12, -40, 24, 40);
        g.beginFill(0xffdbac); g.drawRect(-9, -55, 18, 18);
        g.endFill();

        this.container.addChild(g);
        this.lastAngle = 0;
    }

    update(controls, delta) {
        let vx = 0, vy = 0;
        if (controls.keys['KeyW']) vy = -1;
        if (controls.keys['KeyS']) vy = 1;
        if (controls.keys['KeyA']) vx = -1;
        if (controls.keys['KeyD']) vx = 1;

        if (vx !== 0 || vy !== 0) {
            this.lastAngle = Math.atan2(vy, vx);
            const moveSpeed = this.speed * delta;
            this.container.x += vx * moveSpeed;
            this.container.y += vy * moveSpeed;
        }

        // Skill Q: Fireball
        if (controls.keys['KeyQ'] && this.cooldowns.q <= 0 && this.mana >= 10) {
            this.engine.spawnEntity(new Projectile(this.engine, this.container.x, this.container.y - 20, this.lastAngle));
            this.cooldowns.q = 60; // 1 sec
            this.mana -= 10;
        }

        // Skill Space: Dash
        if (controls.keys['Space'] && this.cooldowns.space <= 0) {
            this.container.x += Math.cos(this.lastAngle) * 100;
            this.container.y += Math.sin(this.lastAngle) * 100;
            this.cooldowns.space = 120; // 2 sec
        }

        // Update UI bars and Cooldowns
        for(let k in this.cooldowns) if(this.cooldowns[k] > 0) this.cooldowns[k] -= delta;
        this.mana = Math.min(50, this.mana + 0.1);
        
        this.updateUI();
    }

    takeDamage(amount) {
        this.health -= amount;
        const vignette = document.getElementById('damage-vignette');
        vignette.style.boxShadow = `inset 0 0 100px rgba(255,0,0,0.5)`;
        setTimeout(() => vignette.style.boxShadow = `none`, 100);
        if(this.health <= 0) this.health = 100; // Mock respawn
    }

    updateUI() {
        document.getElementById('hp-bar').style.width = `${(this.health/100)*100}%`;
        document.getElementById('mp-bar').style.width = `${(this.mana/50)*100}%`;
        
        // Cooldown UI
        document.querySelector('#skill-q .cooldown-overlay').style.height = `${(this.cooldowns.q/60)*100}%`;
        document.querySelector('#skill-space .cooldown-overlay').style.height = `${(this.cooldowns.space/120)*100}%`;
    }
}