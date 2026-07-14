const ItemData = {
    WEAPONS: [
        { id: 'apprentice_staff', name: 'Apprentice Staff', rarity: 'common', type: 'weapon', power: 10, color: 0x8b4513 },
        { id: 'void_reaver', name: 'Void Reaver', rarity: 'epic', type: 'weapon', power: 45, color: 0x4b0082 },
        { id: 'sunflare_wand', name: 'Sunflare Wand', rarity: 'legendary', type: 'weapon', power: 90, color: 0xffd700 }
    ],
    ARMOR: [
        { id: 'linen_robe', name: 'Linen Robe', rarity: 'common', type: 'body', defense: 5, color: 0xeeeeee },
        { id: 'shadow_cloak', name: 'Shadow Cloak', rarity: 'epic', type: 'body', defense: 25, color: 0x111111 }
    ],
    HEAD: [
        { id: 'wizard_hat', name: 'Wizard Hat', rarity: 'common', type: 'head', mana: 20, color: 0x333366 },
        { id: 'crown_of_kings', name: 'Ancient Crown', rarity: 'legendary', type: 'head', mana: 150, color: 0xffaa00 }
    ]
};

class InventorySystem {
    constructor() {
        this.items = [];
        this.equipment = {
            head: null,
            body: null,
            weapon: ItemData.WEAPONS[0]
        };
        
        // Initial items
        this.items.push(ItemData.WEAPONS[1]);
        this.items.push(ItemData.ARMOR[1]);
        this.items.push(ItemData.HEAD[1]);

        this.initUI();
    }

    initUI() {
        const toggle = document.getElementById('inventory-toggle');
        const modal = document.getElementById('inv-modal');
        const close = document.getElementById('close-inv');

        toggle.onclick = () => {
            modal.classList.remove('hidden');
            this.renderGrid();
        };
        close.onclick = () => modal.classList.add('hidden');

        window.addEventListener('keydown', (e) => {
            if(e.code === 'KeyI' || e.code === 'Tab') {
                e.preventDefault();
                modal.classList.toggle('hidden');
                if(!modal.classList.contains('hidden')) this.renderGrid();
            }
        });
    }

    renderGrid() {
        const grid = document.getElementById('inv-grid');
        grid.innerHTML = '';
        
        // Fill 48 slots
        for(let i=0; i<48; i++) {
            const item = this.items[i];
            const slot = document.createElement('div');
            slot.className = `inv-item ${item?.rarity === 'epic' ? 'rarity-epic' : ''}`;
            
            if(item) {
                slot.innerHTML = `<div class="w-10 h-10 flex items-center justify-center" style="color: ${this.getColor(item.color)}">
                    ${this.getIcon(item.type)}
                </div>`;
                slot.onclick = () => this.equipItem(item, i);
                // Simple tooltip
                slot.title = `${item.name}\n${item.rarity.toUpperCase()}`;
            }
            grid.appendChild(slot);
        }
        this.renderEquipSlots();
    }

    renderEquipSlots() {
        for(let slotKey in this.equipment) {
            const slotEl = document.querySelector(`[data-slot="${slotKey}"]`);
            const item = this.equipment[slotKey];
            if(item) {
                slotEl.innerHTML = `<div class="text-white font-bold text-[8px]">${item.name}</div>`;
                slotEl.style.borderColor = this.getColor(item.color);
            } else {
                slotEl.innerHTML = slotKey.toUpperCase();
                slotEl.style.borderColor = '';
            }
        }
    }

    equipItem(item, index) {
        const type = item.type;
        const oldEquip = this.equipment[type];
        
        this.equipment[type] = item;
        this.items.splice(index, 1);
        if(oldEquip) this.items.push(oldEquip);

        this.renderGrid();
        // Update player visuals
        if(window.engine && window.engine.player) {
            window.engine.player.updateAppearance(this.equipment);
        }
    }

    getColor(hex) { return '#' + hex.toString(16).padStart(6, '0'); }
    getIcon(type) {
        switch(type) {
            case 'weapon': return '⚔️';
            case 'head': return '🎩';
            case 'body': return '👕';
            default: return '📦';
        }
    }
}