class WorldManager {
    constructor(engine) {
        this.engine = engine;
        this.tileSize = 64;
        this.mapWidth = 10000;
        this.mapHeight = 10000;
        this.regions = [
            { name: "Royal Plaza", x: 0, y: 0, radius: 800, color: 0x2d2d33 },
            { name: "Whispering Woods", x: -1500, y: -1000, radius: 2000, color: 0x1a2e1a },
            { name: "Shadow Ruins", x: 1200, y: 1500, radius: 1500, color: 0x1e1e26 },
            { name: "Gold Market", x: 1800, y: -800, radius: 1000, color: 0x3d2b1f }
        ];
        this.init();
    }

    init() {
        const floor = new PIXI.Graphics();
        
        // 1. Глобальный слой почвы
        floor.beginFill(0x141a14);
        floor.drawRect(-this.mapWidth/2, -this.mapHeight/2, this.mapWidth, this.mapHeight);
        floor.endFill();

        // 2. Отрисовка регионов
        this.regions.forEach(region => {
            const gradient = new PIXI.Graphics();
            gradient.beginFill(region.color);
            gradient.drawCircle(region.x, region.y, region.radius);
            gradient.endFill();
            gradient.filters = [new PIXI.BlurFilter(100)];
            this.engine.layers.world.addChild(gradient);
            
            // Добавляем таблички регионов (визуально)
            this.addRegionLabel(region);
        });

        // 3. Дорожная сеть (Royal Highways)
        this.drawRoads(floor);
        
        this.engine.layers.world.addChild(floor);

        // 4. Процедурная генерация объектов
        this.populateKingdom();
    }

    drawRoads(g) {
        g.lineStyle(60, 0x25252b, 0.8);
        // Дорога Север-Юг
        g.moveTo(0, -3000); g.lineTo(0, 3000);
        // Дорога Запад-Восток
        g.moveTo(-3000, 0); g.lineTo(3000, 0);
        // Диагональные пути к руинам
        g.moveTo(0, 0); g.lineTo(1200, 1500);
        
        // Каменная текстура дорог
        g.lineStyle(2, 0x33333d, 0.3);
        for(let i=0; i<500; i++) {
            const rx = (Math.random()-0.5)*4000;
            const ry = (Math.random()-0.5)*4000;
            g.drawRect(rx, ry, 10, 10);
        }
    }

    addRegionLabel(region) {
        const txt = new PIXI.Text(region.name.toUpperCase(), {
            fontFamily: 'Press Start 2P',
            fontSize: 40,
            fill: 0xffffff,
            alpha: 0.1
        });
        txt.anchor.set(0.5);
        txt.position.set(region.x, region.y - region.radius + 200);
        this.engine.layers.background.addChild(txt);
    }

    populateKingdom() {
        // Заселение лесов (Whispering Woods)
        for(let i=0; i<300; i++) {
            const x = -1500 + (Math.random()-0.5)*2500;
            const y = -1000 + (Math.random()-0.5)*2000;
            this.engine.spawnEntity(new Tree(this.engine, x, y));
        }

        // Заселение руин (Shadow Ruins)
        for(let i=0; i<80; i++) {
            const x = 1200 + (Math.random()-0.5)*1200;
            const y = 1500 + (Math.random()-0.5)*1200;
            this.engine.spawnEntity(new Prop(this.engine, 'ruin_pillar', x, y));
            if(Math.random() > 0.8) this.engine.addLight(x, y, 0xaa00ff, 1.5);
        }

        // Рыночная площадь
        for(let i=0; i<15; i++) {
            const x = 1800 + (Math.random()-0.5)*600;
            const y = -800 + (Math.random()-0.5)*600;
            this.engine.spawnEntity(new Prop(this.engine, 'tent', x, y));
        }

        // Гвардия на дорогах
        for(let i=0; i<20; i++) {
            const guard = new Npc(this.engine, "Royal Guard", (Math.random()-0.5)*1000, (Math.random()-0.5)*1000, 0x3b82f6);
            guard.behavior = 'patrol';
            this.engine.spawnEntity(guard);
        }
    }
}