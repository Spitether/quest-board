const Inventory = {
  tryDrop(qb) {
    const r = Math.random();
    let cumulativeChance = 0;
    for (const item of ITEMS) {
      cumulativeChance += item.dropChance;
      if (r <= cumulativeChance) {
        this.addItem(qb, item);
        return;
      }
    }
    Seasons.trySeasonalDrop(qb);
  },

  addItem(qb, item) {
    qb.inventory[item.id] = (qb.inventory[item.id] || 0) + 1;
    qb.stats.totalItems = Object.values(qb.inventory).reduce((a, b) => a + b, 0);
    Effects.showItemDrop(item);
  },

  checkAchievements(qb) {
    ACHIEVEMENTS.forEach(a => {
      if (!qb.achievements[a.id] && a.condition(qb.stats)) {
        qb.achievements[a.id] = { unlockedAt: Date.now(), ...a };
        Storage.save(qb);
        Effects.showToast(`🏆 ${a.name} unlocked!`, 'achievement');
      }
    });
  },

  renderInventory(qb) {
    const grid = document.getElementById('inventoryGrid');
    const items = Object.entries(qb.inventory).filter(([, count]) => count > 0);
    if (items.length === 0) {
      grid.innerHTML = '<div class="inventory-empty">Your satchel is empty.<br>Complete quests to find treasures!</div>';
      return;
    }
    grid.innerHTML = items.map(([id, count]) => {
      const item = ITEMS.find(x => x.id === id);
      return item ? `<div class="inventory-item"><div class="item-icon">${item.icon}</div><div class="item-name">${item.name}</div>${count > 1 ? `<div class="item-count">${count}</div>` : ''}</div>` : '';
    }).join('');
  },

  renderAchievements(qb) {
    const grid = document.getElementById('achievementsGrid');
    grid.innerHTML = ACHIEVEMENTS.map(a => {
      const unlocked = qb.achievements[a.id];
      return `<div class="achievement-badge ${unlocked ? 'unlocked' : ''}" title="${esc(a.description)}"><div class="badge-icon">${a.icon}</div><div class="badge-name">${esc(a.name)}</div><div class="badge-desc">${esc(a.description)}</div></div>`;
    }).join('');
  }
};

