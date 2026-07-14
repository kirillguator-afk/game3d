class BaseEntity {
    constructor(engine) {
        this.engine = engine;
        this.container = new PIXI.Container();
        this.health = 100;
        this.maxHealth = 100;
        this.isDead = false;
    }
    update(delta) {}
    die() {
        this.isDead = true;
        this.container.alpha = 0;
        this.engine.removeEntity(this);
    }
}

class Player extends BaseEntity {
    constructor(engine, name) {
        super(engine);
        this.speed = 5;
        this.mana = 100;
        this.cooldowns = { Q: 0, E: 0, R: 0, SPACE: 0 };
        
        // Composite layers
        this.layers = {
            shadow: new PIXI.Graphics(),
            body: new PIXI.Graphics(),
            clothing: new PIXI.Graphics(),
            head: new PIXI.Graphics(),
            weapon: new PIXI.Graphics()
        };

        Object.values(this.layers).forEach(l => this.container.addChild(l));
        this.drawBase();
        
        this.label = new PIXI.Text(name, {
            fontFamily: 'Press Start 2P',
            fontSize: 10,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 3
        });
        this.label.anchor.set(0.5);
        this.label.y = -80;
        this.container.addChild(this.label);
    }

    drawBase() {
        const { shadow, body } = this.layers;
        shadow.beginFill(0x000000, 0.3).drawEllipse(0, 5, 20, 8).endFill();
        body.beginFill(0xffdbac).drawRect(-12, -50, 24, 50).endFill();
    }

    updateAppearance(equip) {
        const { head, clothing, weapon } = this.layers;
        head.clear(); clothing.clear(); weapon.clear();

        if(equip.head) {
            head.beginFill(equip.head.color).drawRect(-15, -60, 30, 15).endFill();
        }
        if(equip.body) {
            clothing.beginFill(equip.body.color).drawRect(-14, -45, 28, 35).endFill();
        }
        if(equip.weapon) {
            weapon.beginFill(equip.weapon.color).drawRect(15, -40, 6, 40).endFill();
        }
    }

    update(controls, delta) {
        let vx = 0, vy = 0;
        if (controls.keys['KeyW']) vy = -1;
        if (controls.keys['KeyS']) vy = 1;
        if (controls.keys['KeyA']) vx = -1;
        if (controls.keys['KeyD']) vx = 1;

        if (vx !== 0 || vy !== 0) {
            const move = this.speed * delta;
            this.container.x += vx * move;
            this.container.y += vy * move;
            this.container.skew.x = vx * 0.05;
        }

        // Skills logic
        this.handleSkills(controls, delta);
        this.updateHUD();
    }

    handleSkills(controls, delta) {
        const skills = ['KeyQ', 'KeyE', 'KeyR', 'Space'];
        skills.forEach(key => {
            const skillName = key.replace('Key', '').toUpperCase();
            if(controls.keys[key] && this.cooldowns[skillName] <= 0) {
                this.useSkill(skillName);
            }
            if(this.cooldowns[skillName] > 0) this.cooldowns[skillName] -= delta;
        });
    }

    useSkill(name) {
        console.log(`Using ${name}`);
        this.cooldowns[name] = 60; // 1s cooldown default
        // Particle effect
        this.engine.spawnParticles(this.container.x, this.container.y - 20, 0x6366f1);
    }

    updateHUD() {
        document.getElementById('hp-bar').style.width = `${(this.health/this.maxHealth)*100}%`;
        document.getElementById('mp-bar').style.width = `${(this.mana/100)*100}%`;
        
        // Cooldowns UI
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
        g.beginFill(0x4ade80, 0.8).drawCircle(0, 0, 20).endFill();
        this.container.addChild(g);
    }
}
</nexus_js>

<nexus_file path="js/world.js">
class WorldManager {
    constructor(engine) {
        this.engine = engine;
        this.mapData = {
            size: 15000,
            biomes: [
                { name: 'Royal Capital', x: 0, y: 0, radius: 2000, color: 0x2d2d33, particle: 0xffffff },
                { name: 'Ethereal Gardens', x: 4000, y: -3000, radius: 3000, color: 0x4a148c, particle: 0xe91e63 },
                { name: 'Frozen Peaks', x: -5000, y: -5000, radius: 4000, color: 0x01579b, particle: 0xb3e5fc },
                { name: 'Ash Lands', x: 0, y: 6000, radius: 3500, color: 0x212121, particle: 0xff5722 }
            ]
        };
        this.init();
    }

    init() {
        const bg = new PIXI.Graphics();
        bg.beginFill(0x0a0a0f).drawRect(-8000, -8000, 16000, 16000).endFill();
        this.engine.layers.world.addChild(bg);

        this.mapData.biomes.forEach(biome => {
            const zone = new PIXI.Graphics();
            zone.beginFill(biome.color, 0.3).drawCircle(biome.x, biome.y, biome.radius).endFill();
            zone.filters = [new PIXI.BlurFilter(150)];
            this.engine.layers.world.addChild(zone);

            // Procedural decorations
            this.generateDecor(biome);
        });
    }

    generateDecor(biome) {
        const count = 100;
        for(let i=0; i<count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * biome.radius;
            const px = biome.x + Math.cos(angle) * dist;
            const py = biome.y + Math.sin(angle) * dist;
            
            const decor = new PIXI.Graphics();
            decor.beginFill(biome.color, 0.5).drawRect(0, 0, 16, 16).endFill();
            decor.position.set(px, py);
            this.engine.layers.world.addChild(decor);
        }
    }

    getCurrentBiome(x, y) {
        return this.mapData.biomes.find(b => Math.hypot(b.x - x, b.y - y) < b.radius) || { name: 'The Wilds' };
    }
}