const GameState = {
    money: 100,
    lvl: 1,
    inventory: [
        { id: 'og_kush', name: 'OG Kush', count: 5, price: 10, growTime: 5000, color: 0x44ff44, harvestValue: 50 }
    ],
    plots: [
        { id: 0, status: 'empty', plantId: null, startTime: 0, progress: 0 },
        { id: 1, status: 'empty', plantId: null, startTime: 0, progress: 0 },
        { id: 2, status: 'empty', plantId: null, startTime: 0, progress: 0 },
        { id: 3, status: 'empty', plantId: null, startTime: 0, progress: 0 },
        { id: 4, status: 'empty', plantId: null, startTime: 0, progress: 0 },
        { id: 5, status: 'empty', plantId: null, startTime: 0, progress: 0 }
    ],
    shop: [
        { id: 'og_kush', name: 'OG Kush Seed', price: 10, growTime: 5000, harvestValue: 50, color: 0x44ff44 },
        { id: 'purple_haze', name: 'Purple Haze Seed', price: 50, growTime: 12000, harvestValue: 200, color: 0x8844ff },
        { id: 'lemon_drop', name: 'Lemon Drop Seed', price: 200, growTime: 30000, harvestValue: 1000, color: 0xffff44 }
    ],
    selectedSeed: 'og_kush'
};

function updateMoney(amount) {
    GameState.money += amount;
    document.getElementById('money-display').innerText = `$${Math.floor(GameState.money)}`;
}

function saveGame() {
    localStorage.setItem('green_tycoon_save', JSON.stringify(GameState));
}

function loadGame() {
    const saved = localStorage.getItem('green_tycoon_save');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(GameState, data);
    }
}