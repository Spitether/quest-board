// ===== SEASONAL EVENTS =====

const Seasons = {
  currentSeason: null,

  detectSeason() {
    const month = new Date().getMonth(); // 0-11
    for (const [key, season] of Object.entries(SEASONS)) {
      if (season.months.includes(month)) {
        return { key, ...season };
      }
    }
    return null;
  },

  init(qb) {
    this.currentSeason = this.detectSeason();
    if (this.currentSeason) {
      this.addSeasonalDecorations();
      this.addSeasonalQuests(qb);
    }
  },

  getMultiplier() {
    return this.currentSeason ? this.currentSeason.multiplier : 1;
  },

  addSeasonalDecorations() {
    if (!this.currentSeason) return;
    const dl = document.getElementById('decorationsLayer');
    if (!dl) return;

    // Add seasonal decorations alongside user decorations
    this.currentSeason.decorations.forEach((icon, i) => {
      const el = document.createElement('div');
      el.className = 'decoration-item seasonal';
      el.textContent = icon;
      el.style.fontSize = '4rem';
      el.style.opacity = '0.5';
      el.style.animationDelay = `${-i * 0.7}s`;

      const pos = [
        { t: 15, l: 15 }, { t: 20, l: 75 },
        { t: 70, l: 20 }, { t: 75, l: 70 }
      ];
      const p = pos[i % pos.length];
      el.style.top = `${p.t}%`;
      el.style.left = `${p.l}%`;

      dl.appendChild(el);
    });
  },

  addSeasonalQuests(qb) {
    if (!this.currentSeason) return;
    const key = this.currentSeason.key;
    const seasonalQuests = SEASONAL_QUESTS[key];
    if (!seasonalQuests) return;

    // Check if seasonal quests already exist
    const existingTitles = qb.quests.filter(q => q.isSeasonal).map(q => q.title);

    seasonalQuests.forEach(sq => {
      if (!existingTitles.includes(sq.title)) {
        qb.quests.push({
          id: 'seasonal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          title: sq.title,
          category: sq.category,
          difficulty: sq.difficulty,
          description: sq.description,
          completed: false,
          completedAt: null,
          createdAt: Date.now(),
          isSeasonal: true
        });
      }
    });

    Storage.save(qb);
  },

  trySeasonalDrop(qb) {
    if (!this.currentSeason || !this.currentSeason.item) return false;

    const item = this.currentSeason.item;
    if (Math.random() <= item.dropChance) {
      qb.inventory[item.id] = (qb.inventory[item.id] || 0) + 1;
      qb.stats.totalItems = Object.values(qb.inventory).reduce((a, b) => a + b, 0);
      Effects.showItemDrop(item);
      return true;
    }
    return false;
  },

  renderSeasonalBanner() {
    const container = document.getElementById('seasonalBanner');
    if (!container) return;

    if (!this.currentSeason) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    container.innerHTML = `
      <div class="seasonal-content">
        <span class="seasonal-icon">${this.currentSeason.icon}</span>
        <span class="seasonal-name">${this.currentSeason.name}</span>
        <span class="seasonal-boost">⚡ ${Math.round((this.currentSeason.multiplier - 1) * 100)}% XP Boost Active</span>
      </div>
    `;
  },

  renderSeasonalInventory(qb) {
    const grid = document.getElementById('inventoryGrid');
    if (!grid || !this.currentSeason) return;

    // The seasonal items will naturally show in the inventory grid
    // since they're added to qb.inventory
  }
};

