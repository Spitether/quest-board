// ===== PARTY SYSTEM & LEADERBOARD =====

const Party = {
  currentProfileId: 'default',

  getProfiles() {
    const raw = localStorage.getItem('qb_party_profiles');
    if (raw) return JSON.parse(raw);
    return { default: this.createProfile('Adventurer', '🧙‍♂️') };
  },

  createProfile(name, avatar) {
    return {
      id: Date.now().toString(),
      name: name || 'Adventurer',
      avatar: avatar || '🧙‍♂️',
      xp: 0,
      level: 1,
      createdAt: Date.now()
    };
  },

  saveProfiles(profiles) {
    localStorage.setItem('qb_party_profiles', JSON.stringify(profiles));
  },

  getCurrentProfile() {
    const profiles = this.getProfiles();
    return profiles[this.currentProfileId] || profiles.default || this.createProfile();
  },

  switchProfile(profileId) {
    // Save current state before switching
    const qb = window.questBoard;
    if (qb) Storage.save(qb);

    this.currentProfileId = profileId;
    localStorage.setItem('qb_currentProfile', profileId);

    // Reload page to load new profile data
    window.location.reload();
  },

  addProfile(name, avatar) {
    const profiles = this.getProfiles();
    const id = 'profile_' + Date.now();
    profiles[id] = this.createProfile(name, avatar);
    this.saveProfiles(profiles);
    return id;
  },

  deleteProfile(profileId) {
    if (profileId === 'default') return false;
    const profiles = this.getProfiles();
    delete profiles[profileId];
    this.saveProfiles(profiles);
    localStorage.removeItem(`qb_quests_${profileId}`);
    localStorage.removeItem(`qb_xp_${profileId}`);
    localStorage.removeItem(`qb_level_${profileId}`);
    localStorage.removeItem(`qb_inventory_${profileId}`);
    localStorage.removeItem(`qb_achievements_${profileId}`);
    localStorage.removeItem(`qb_streak_${profileId}`);
    localStorage.removeItem(`qb_stats_${profileId}`);
    localStorage.removeItem(`qb_settings_${profileId}`);
    return true;
  },

  updateProfileXP(profileId, xp, level) {
    const profiles = this.getProfiles();
    if (profiles[profileId]) {
      profiles[profileId].xp = xp;
      profiles[profileId].level = level;
      this.saveProfiles(profiles);
    }
  },

  getGuildRank() {
    const profiles = this.getProfiles();
    const totalXP = Object.values(profiles).reduce((sum, p) => sum + (p.xp || 0), 0);

    for (let i = GUILD_RANKS.length - 1; i >= 0; i--) {
      if (totalXP >= GUILD_RANKS[i].minTotalXP) {
        return { ...GUILD_RANKS[i], totalXP, nextRank: GUILD_RANKS[i + 1] || null };
      }
    }
    return { ...GUILD_RANKS[0], totalXP, nextRank: GUILD_RANKS[1] || null };
  },

  getLeaderboard() {
    const profiles = this.getProfiles();
    return Object.values(profiles)
      .sort((a, b) => (b.xp || 0) - (a.xp || 0))
      .map((p, i) => ({ ...p, rank: i + 1 }));
  },

  // Party quests are stored separately and shared
  getPartyQuests() {
    const raw = localStorage.getItem('qb_party_quests');
    return raw ? JSON.parse(raw) : [];
  },

  savePartyQuests(quests) {
    localStorage.setItem('qb_party_quests', JSON.stringify(quests));
  },

  addPartyQuest(title, difficulty, description) {
    const quests = this.getPartyQuests();
    quests.push({
      id: 'party_' + Date.now(),
      title,
      category: 'party',
      difficulty: difficulty || 'medium',
      description: description || '',
      completed: false,
      completedAt: null,
      createdAt: Date.now()
    });
    this.savePartyQuests(quests);
  },

  togglePartyQuest(questId) {
    const quests = this.getPartyQuests();
    const q = quests.find(x => x.id === questId);
    if (!q) return;

    q.completed = !q.completed;
    q.completedAt = q.completed ? Date.now() : null;
    this.savePartyQuests(quests);

    if (q.completed) {
      // Award party bonus XP to ALL profiles
      const profiles = this.getProfiles();
      Object.keys(profiles).forEach(pid => {
        profiles[pid].xp = (profiles[pid].xp || 0) + PARTY_BONUS_XP;
        profiles[pid].level = Math.floor((profiles[pid].xp || 0) / XP_PER_LEVEL) + 1;
      });
      this.saveProfiles(profiles);
      Effects.showToast(`🎉 Party quest completed! All members +${PARTY_BONUS_XP} XP!`);
    }
  },

  renderPartyPanel(qb) {
    const container = document.getElementById('partyPanel');
    if (!container) return;

    const profiles = this.getProfiles();
    const current = this.getCurrentProfile();
    const guild = this.getGuildRank();

    container.innerHTML = `
      <div class="guild-rank-card">
        <div class="guild-icon">${guild.icon}</div>
        <div class="guild-info">
          <div class="guild-name">${guild.name} Guild</div>
          <div class="guild-xp">${guild.totalXP} / ${guild.nextRank ? guild.nextRank.minTotalXP : '∞'} Total XP</div>
          ${guild.nextRank ? `<div class="guild-progress"><div class="guild-progress-bar" style="width:${Math.min(100, (guild.totalXP - guild.minTotalXP) / (guild.nextRank.minTotalXP - guild.minTotalXP) * 100)}%"></div></div>` : '<div class="guild-max">Maximum Rank Achieved!</div>'}
        </div>
      </div>
      <div class="party-profiles">
        <h4>🎭 Party Members</h4>
        ${Object.entries(profiles).map(([id, p]) => `
          <div class="party-profile ${id === this.currentProfileId ? 'active' : ''}" data-profile="${id}">
            <div class="party-avatar">${p.avatar}</div>
            <div class="party-info">
              <div class="party-name">${esc(p.name)} ${id === this.currentProfileId ? '<span class="party-you">(You)</span>' : ''}</div>
              <div class="party-level">Level ${p.level} • ${p.xp} XP</div>
            </div>
            ${id !== this.currentProfileId ? `<button class="party-switch-btn" data-profile="${id}">Switch</button>` : ''}
          </div>
        `).join('')}
      </div>
      <div class="party-actions">
        <button class="btn-secondary" id="addProfileBtn">＋ New Adventurer</button>
      </div>
    `;

    container.querySelectorAll('.party-switch-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchProfile(btn.dataset.profile));
    });

    const addBtn = document.getElementById('addProfileBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const name = prompt('Enter adventurer name:', 'New Adventurer');
        if (name && name.trim()) {
          const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
          const newId = this.addProfile(name.trim(), avatar);
          this.switchProfile(newId);
        }
      });
    }
  },

  renderLeaderboard() {
    const container = document.getElementById('leaderboardPanel');
    if (!container) return;

    const board = this.getLeaderboard();
    const guild = this.getGuildRank();

    container.innerHTML = `
      <div class="leaderboard-header">
        <div class="leaderboard-guild">${guild.icon} ${guild.name} Guild</div>
        <div class="leaderboard-total">${guild.totalXP} Total Party XP</div>
      </div>
      <div class="leaderboard-list">
        ${board.map((p, i) => `
          <div class="leaderboard-item ${p.id === this.currentProfileId ? 'you' : ''}">
            <div class="leaderboard-rank">${i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</div>
            <div class="leaderboard-avatar">${p.avatar}</div>
            <div class="leaderboard-info">
              <div class="leaderboard-name">${esc(p.name)} ${p.id === this.currentProfileId ? '<span class="you-badge">You</span>' : ''}</div>
              <div class="leaderboard-level">Level ${p.level}</div>
            </div>
            <div class="leaderboard-xp">${p.xp} XP</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderPartyQuests() {
    const container = document.getElementById('partyQuestsPanel');
    if (!container) return;

    const quests = this.getPartyQuests();
    container.innerHTML = `
      <div class="party-quests-header">
        <h4>🤝 Party Quests</h4>
        <button class="btn-secondary" id="addPartyQuestBtn">＋ Add</button>
      </div>
      <div class="party-quests-list">
        ${quests.length === 0 ? '<div class="party-quests-empty">No party quests yet. Add one to share with the whole party!</div>' : ''}
        ${quests.map(q => {
          const xp = Math.floor(XP_REWARDS[q.category] * (DIFFICULTY_MULTIPLIERS[q.difficulty] || 1));
          return `
            <div class="party-quest-item ${q.completed ? 'completed' : ''}">
              <div class="party-quest-checkbox ${q.completed ? 'checked' : ''}" data-party-quest="${q.id}"></div>
              <div class="party-quest-info">
                <div class="party-quest-title">${esc(q.title)}</div>
                <div class="party-quest-meta">
                  <span class="difficulty-stars ${q.difficulty}">${DIFFICULTY_STARS[q.difficulty]}</span>
                  <span class="party-quest-xp">+${xp} XP + 🎉 ${PARTY_BONUS_XP} Party Bonus</span>
                </div>
                ${q.description ? `<div class="party-quest-desc">${esc(q.description)}</div>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('.party-quest-checkbox').forEach(cb => {
      cb.addEventListener('click', () => this.togglePartyQuest(cb.dataset.partyQuest));
    });

    const addBtn = document.getElementById('addPartyQuestBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const title = prompt('Party quest title:');
        if (title && title.trim()) {
          this.addPartyQuest(title.trim(), 'medium', '');
          this.renderPartyQuests();
        }
      });
    }
  },

  init() {
    const savedProfile = localStorage.getItem('qb_currentProfile');
    if (savedProfile) this.currentProfileId = savedProfile;
  }
};

