function initUI() {
    updateMoney(0);
    renderShop();
    renderInventory();

    document.getElementById('shop-btn').onclick = () => {
        document.getElementById('shop-modal').classList.remove('hidden');
    };

    document.getElementById('close-shop').onclick = () => {
        document.getElementById('shop-modal').classList.add('hidden');
    };
}

function renderShop() {
    const container = document.getElementById('shop-items');
    container.innerHTML = '';
    
    GameState.shop.forEach(item => {
        const card = document.createElement('div');
        card.className = 'shop-card p-4 rounded-2xl flex justify-between items-center';
        card.innerHTML = `
            <div>
                <div class="text-white font-bold">${item.name}</div>
                <div class="text-green-400 text-sm font-game">$${item.price}</div>
            </div>
            <button onclick="buySeed('${item.id}')" class="bg-green-600 px-4 py-2 rounded-xl text-white font-bold text-sm">КУПИТЬ</button>
        `;
        container.appendChild(card);
    });
}

function renderInventory() {
    const container = document.getElementById('inventory-bar');
    container.innerHTML = '';
    
    GameState.inventory.forEach(item => {
        if (item.count <= 0) return;
        const btn = document.createElement('button');
        const isActive = GameState.selectedSeed === item.id;
        btn.className = `flex-shrink-0 px-4 py-2 rounded-xl border transition-all ${isActive ? 'bg-green-600 border-green-400 scale-105' : 'bg-white/5 border-white/10'}`;
        btn.innerHTML = `
            <div class="text-[10px] text-white/60 uppercase font-bold">${item.name}</div>
            <div class="text-white font-black">x${item.count}</div>
        `;
        btn.onclick = () => {
            GameState.selectedSeed = item.id;
            renderInventory();
        };
        container.appendChild(btn);
    });
}

function buySeed(id) {
    const item = GameState.shop.find(s => s.id === id);
    if (GameState.money >= item.price) {
        updateMoney(-item.price);
        const invItem = GameState.inventory.find(i => i.id === id);
        if (invItem) {
            invItem.count++;
        } else {
            GameState.inventory.push({ ...item, count: 1 });
        }
        renderInventory();
        showNotification(`Куплено: ${item.name}`);
    } else {
        showNotification("Недостаточно денег!", "red");
    }
}

function handlePlotClick(id) {
    const plot = GameState.plots[id];
    const potUI = engine.pots[id];

    if (plot.status === 'empty') {
        const seed = GameState.inventory.find(i => i.id === GameState.selectedSeed);
        if (seed && seed.count > 0) {
            seed.count--;
            plot.status = 'growing';
            plot.plantId = seed.id;
            plot.startTime = Date.now();
            
            // Create 3D Plant
            const plantMesh = engine.createPlantMesh(seed.color);
            potUI.plantGroup.add(plantMesh);
            
            renderInventory();
            showNotification("Посажено!");
        } else {
            showNotification("Выберите семена в инвентаре", "yellow");
        }
    } else if (plot.status === 'mature') {
        const seedData = GameState.shop.find(s => s.id === plot.plantId);
        updateMoney(seedData.harvestValue);
        
        // Reset Plot
        plot.status = 'empty';
        plot.plantId = null;
        potUI.plantGroup.clear();
        
        showNotification(`Урожай собран: +$${seedData.harvestValue}`, "green");
        saveGame();
    }
}

function showNotification(text, color = "green") {
    const prompt = document.getElementById('interaction-prompt');
    const pText = document.getElementById('prompt-text');
    prompt.classList.remove('hidden');
    pText.innerText = text;
    pText.style.color = color === "red" ? "#ff4444" : (color === "yellow" ? "#ffcc00" : "#44ff44");
    
    setTimeout(() => {
        prompt.classList.add('hidden');
    }, 2000);
}

// Start
loadGame();
initUI();