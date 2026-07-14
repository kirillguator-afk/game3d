
class BaseEntity {
    constructor(engine) {
        this.engine = engine;
        this.container = new PIXI.Container();
        this.health = 100;
        this.maxHealth = 100;
        this.isDead = false;
        this.animTimer = Math.random() * 10;
    }
    
    update(delta) {
        this.animTimer += 0.1 * delta;
        // Natural bobbing animation
        const scaleY = 1 + Math.sin(this.animTimer) * 0.05;
        const scaleX = 1 - Math.sin(this.animTimer) * 0.02;
        this.container.scale.set(scaleX, scaleY);
    }

    die() {
        this.isDead = true;
        this.container.alpha = 0;
        this.engine.removeEntity(this);
    }
}

class Player extends BaseEntity {
    constructor(engine, name) {
        super(engine);
        this.speed = 6;
        this.mana = 100;
        this.cooldowns = { Q: 0, E: 0, R: 0, SPACE: 0 };
        
        this.visuals = new PIXI.Container();
        this.container.addChild(this.visuals);

        this.layers = {
            shadow: new PIXI.Graphics(),
            body: new PIXI.Graphics(),
            head: new PIXI.Graphics(),
            weapon: new PIXI.Graphics()
        };

        Object.values(this.layers).forEach(l => this.visuals.addChild(l));
        this.drawBase();
        
        this.label = new PIXI.Text(name, {
            fontFamily: 'Press Start 2P',
            fontSize: 9,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 3
        });
        this.label.anchor.set(0.5);
        this.label.y = -70;
        this.container.addChild(this.label);
    }

    drawBase() {
        const { shadow, body } = this.layers;
        shadow.beginFill(0x000000, 0.3).drawEllipse(0, 0, 18, 6).endFill();
        
        // Pixel-art character body
        body.beginFill(0x424242);
        body.drawRect(-10, -40, 20, 35);
        body.beginFill(0xffdbac); // Skin
        body.drawRect(-8, -52, 16, 14);
    }

    updateAppearance(equip) {
        const { head, body, weapon } = this.layers;
        head.clear(); weapon.clear();

        if(equip.head) {
            head.beginFill(equip.head.color).drawRect(-12, -55, 24, 8).endFill();
        }
        if(equip.weapon) {
            weapon.beginFill(equip.weapon.color).drawRect(12, -45, 4, 45).endFill();
            weapon.beginFill(0xffffff, 0.5).drawRect(12, -45, 2, 10).endFill();
        }
    }

    update(controls, delta) {
        super.update(delta);
        
        let vx = 0, vy = 0;
        if (controls.keys['KeyW']) vy = -1;
        if (controls.keys['KeyS']) vy = 1;
        if (controls.keys['KeyA']) vx = -1;
        if (controls.keys['KeyD']) vx = 1;

        if (vx !== 0 || vy !== 0) {
            // Normalize
            const len = Math.sqrt(vx*vx + vy*vy);
            vx /= len; vy /= len;

            const move = this.speed * delta;
            this.container.x += vx * move;
            this.container.y += vy * move;
            
            // Lean effect
            this.visuals.skew.x = vx * 0.1;
            this.visuals.scale.x = vx > 0 ? 1 : (vx < 0 ? -1 : this.visuals.scale.x);
        } else {
            this.visuals.skew.x *= 0.8;
        }

        this.handleSkills(controls, delta);
        this.updateHUD();
    }

    handleSkills(controls, delta) {
        const skills = { 'KeyQ': 'Q', 'KeyE': 'E', 'KeyR': 'R', 'Space': 'SPACE' };
        for(let key in skills) {
            const name = skills[key];
            if(controls.keys[key] && this.cooldowns[name] <= 0) {
                this.useSkill(name);
            }
            if(this.cooldowns[name] > 0) this.cooldowns[name] -= delta;
        }
    }

    useSkill(name) {
        this.cooldowns[name] = 60;
        this.engine.spawnParticles(this.container.x, this.container.y - 30, 0x6366f1, 15);
        
        // Screen shake
        this.engine.shake(5);
    }

    updateHUD() {
        const hp = document.getElementById('hp-bar');
        const mp = document.getElementById('mp-bar');
        if(hp) hp.style.width = `${(this.health/this.maxHealth)*100}%`;
        if(mp) mp.style.width = `${(this.mana/100)*100}%`;
        
        for(let skill in this.cooldowns) {
            const el = document.querySelector(`[data-skill="${skill}"] .cooldown`);
            if(el) {
                const perc = (this.cooldowns[skill] / 60) * 100;
                el.style.height = `${Math.max(0, perc)}%`;
            }
        }
    }
}

class Mob extends BaseEntity {
    constructor(engine, x, y, type = 'slime') {
        super(engine);
        this.container.position.set(x, y);
        const g = new PIXI.Graphics();
        g.beginFill(0x4ade80, 0.8).drawEllipse(0, 0, 20, 15).endFill();
        g.beginFill(0xffffff, 0.5).drawCircle(-5, -5, 3).endFill();
        this.container.addChild(g);
    }
}
