
class BaseEntity {
    constructor(engine) {
        this.engine = engine;
        this.container = new PIXI.Container();
        this.health = 100;
        this.maxHealth = 100;
        this.isDead = false;
        this.animTimer = Math.random() * 10;
        this.isInteractable = false;
    }
    
    update(delta) {
        this.animTimer += 0.1 * delta;
        const scaleY = 1 + Math.sin(this.animTimer) * 0.03;
        this.container.scale.set(1, scaleY);
    }

    die() {
        this.isDead = true;
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

        this.label = new PIXI.Text(name, { fontFamily: 'Press Start 2P', fontSize: 8, fill: 0xffffff });
        this.label.anchor.set(0.5);
        this.label.y = -65;
        this.container.addChild(this.label);
    }

    drawBase() {
        this.layers.shadow.beginFill(0x000000, 0.3).drawEllipse(0, 0, 18, 6);
        this.layers.body.beginFill(0x6366f1).drawRect(-10, -40, 20, 35);
        this.layers.body.beginFill(0xffdbac).drawRect(-8, -52, 16, 14);
    }

    updateAppearance(equip) {
        const { head, weapon } = this.layers;
        head.clear(); weapon.clear();
        if(equip.head) head.beginFill(equip.head.color).drawRect(-12, -55, 24, 8);
        if(equip.weapon) weapon.beginFill(equip.weapon.color).drawRect(12, -45, 4, 45);
    }

    update(controls, delta) {
        super.update(delta);
        let vx = 0, vy = 0;
        if (controls.keys['KeyW']) vy = -1;
        if (controls.keys['KeyS']) vy = 1;
        if (controls.keys['KeyA']) vx = -1;
        if (controls.keys['KeyD']) vx = 1;

        if (vx !== 0 || vy !== 0) {
            const len = Math.sqrt(vx*vx + vy*vy);
            const move = this.speed * delta;
            this.container.x += (vx/len) * move;
            this.container.y += (vy/len) * move;
            this.visuals.scale.x = vx > 0 ? 1 : (vx < 0 ? -1 : this.visuals.scale.x);
        }

        if(controls.keys['KeyF']) this.engine.tryInteract();
        
        this.handleSkills(controls, delta);
        this.updateHUD();
    }

    handleSkills(controls, delta) {
        const skills = { 'KeyQ': 'Q', 'KeyE': 'E', 'KeyR': 'R', 'Space': 'SPACE' };
        for(let key in skills) {
            const name = skills[key];
            if(controls.keys[key] && this.cooldowns[name] <= 0) {
                this.cooldowns[name] = 60;
                this.engine.spawnParticles(this.container.x, this.container.y - 20, 0x6366f1);
                this.engine.shake(4);
            }
            if(this.cooldowns[name] > 0) this.cooldowns[name] -= delta;
        }
    }

    updateHUD() {
        document.getElementById('hp-bar').style.width = `${(this.health/this.maxHealth)*100}%`;
        document.getElementById('mp-bar').style.width = `${(this.mana/100)*100}%`;
        for(let skill in this.cooldowns) {
            const el = document.querySelector(`[data-skill="${skill}"] .cooldown`);
            if(el) el.style.height = `${Math.max(0, (this.cooldowns[skill]/60)*100)}%`;
        }
    }
}

class NPC extends BaseEntity {
    constructor(engine, x, y, config) {
        super(engine);
        this.container.position.set(x, y);
        this.config = config;
        this.isInteractable = true;
        
        const g = new PIXI.Graphics();
        g.beginFill(0x000000, 0.3).drawEllipse(0, 0, 16, 5);
        g.beginFill(config.color || 0x455a64).drawRect(-9, -35, 18, 32);
        g.beginFill(0xffdbac).drawRect(-7, -45, 14, 12);
        this.container.addChild(g);

        const nameTag = new PIXI.Text(config.name, { fontFamily: 'Press Start 2P', fontSize: 6, fill: 0xaaaaaa });
        nameTag.anchor.set(0.5);
        nameTag.y = -55;
        this.container.addChild(nameTag);
    }

    interact() {
        const overlay = document.getElementById('dialogue-overlay');
        const text = document.getElementById('npc-text');
        const name = document.getElementById('npc-name');
        const options = document.getElementById('dialogue-options');
        const portrait = document.getElementById('npc-portrait');

        name.innerText = this.config.name;
        text.innerText = this.config.dialogue[0];
        portrait.innerText = this.config.icon || '👤';
        
        options.innerHTML = '';
        const btn = document.createElement('button');
        btn.className = "px-4 py-2 bg-indigo-700 text-white font-pixel text-[10px] hover:bg-indigo-600";
        btn.innerText = "[ CLOSE ]";
        btn.onclick = () => overlay.classList.add('hidden');
        options.appendChild(btn);

        overlay.classList.remove('hidden');
    }
}

class Mob extends BaseEntity {
    constructor(engine, x, y, type = 'slime') {
        super(engine);
        this.container.position.set(x, y);
        const g = new PIXI.Graphics();
        g.beginFill(0x4ade80, 0.7).drawEllipse(0, 0, 20, 15);
        this.container.addChild(g);
    }
}
