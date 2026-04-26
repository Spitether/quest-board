// ===== PROGRESSION SYSTEM =====

const Progression = {
  updateLevel(qb) {
    const newLevel = Math.floor(qb.xp / XP_PER_LEVEL) + 1;
    if (newLevel !== qb.level) {
      qb.level = newLevel;
      Storage.save(qb);
    }
  },

  updateStats(qb, q) {
    qb.stats.totalCompleted++;
    switch (q.category) {
      case 'daily': qb.stats.dailyCompleted++; break;
      case 'weekly': qb.stats.weeklyCompleted++; break;
      case 'side': qb.stats.sideCompleted++; break;
      case 'main': qb.stats.mainCompleted++; break;
    }
    if (q.difficulty === 'hard') qb.stats.hardCompleted++;

    const today = new Date().toDateString();
    const todayCount = qb.quests.filter(x => x.completed && x.completedAt && new Date(x.completedAt).toDateString() === today).length;
    if (todayCount > qb.stats.dailyMax) qb.stats.dailyMax = todayCount;

    if (qb.level > qb.stats.maxLevel) qb.stats.maxLevel = qb.level;
    qb.stats.totalItems = Object.values(qb.inventory).reduce((a, b) => a + b, 0);
  },

  updateStreak(qb) {
    const now = new Date();
    const todayStr = now.toDateString();
    const dailyQuests = qb.quests.filter(q => q.category === 'daily');
    const allDailyCompleted = dailyQuests.length > 0 && dailyQuests.every(q => q.completed);

    if (allDailyCompleted && qb.lastStreakDate !== todayStr) {
      qb.streak++;
      qb.lastStreakDate = todayStr;
      if (qb.streak > qb.stats.maxStreak) qb.stats.maxStreak = qb.streak;

      const bonus = Math.min(qb.streak * 5, 50);
      if (bonus > 0) {
        qb.xp += bonus;
        Effects.showToast(`🔥 ${qb.streak} day streak! +${bonus} bonus XP!`);
      } else {
        Effects.showToast(`🔥 ${qb.streak} day streak!`);
      }

      Progression.updateLevel(qb);
      Storage.save(qb);
    }
  },

  checkStreakReset(qb) {
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (qb.lastStreakDate && qb.lastStreakDate !== todayStr && qb.lastStreakDate !== yesterday.toDateString() && qb.streak > 0) {
      qb.streak = 0;
      Storage.save(qb);
      Effects.showToast('Streak broken! Complete all daily quests to restart.');
    }
  },

  renderStats(qb) {
    const xpBar = document.getElementById('xpBar');
    const xpText = document.getElementById('xpText');
    const levelValue = document.getElementById('levelValue');
    const sidebarLevel = document.getElementById('sidebarLevel');
    const charName = document.getElementById('characterName');
    const charAvatar = document.getElementById('characterAvatar');

    if (xpBar) xpBar.style.width = `${getXPProg(qb.xp)}%`;
    if (xpText) xpText.textContent = getXPText(qb.xp);
    if (levelValue) levelValue.textContent = qb.level;
    if (sidebarLevel) sidebarLevel.textContent = qb.level;
    if (charName) charName.textContent = qb.settings.name;
    if (charAvatar) charAvatar.textContent = qb.settings.avatar;

    const comp = document.getElementById('companionAvatar');
    if (comp) {
      const c = COMPANIONS.find(x => x.id === qb.settings.companion);
      if (c) comp.textContent = c.icon;
    }
  },

  renderStreak(qb) {
    const streakRow = document.getElementById('streakRow');
    const streakValue = document.getElementById('streakValue');

    if (streakRow && streakValue) {
      if (qb.streak > 0) {
        streakRow.style.display = 'flex';
        streakValue.textContent = qb.streak;
      } else {
        streakRow.style.display = 'none';
      }
    }
  },

  renderBuffs(qb) {
    const buffsList = document.getElementById('buffsList');
    if (!buffsList) return;

    const buffs = [];
    if (qb.streak > 0) {
      buffs.push(`<div class="buff-item">🔥 Streak Bonus: +${Math.min(qb.streak * 5, 50)} XP</div>`);
    }

    const today = new Date().toDateString();
    const todayCount = qb.quests.filter(x => x.completed && x.completedAt && new Date(x.completedAt).toDateString() === today).length;
    if (todayCount >= 3) {
      buffs.push(`<div class="buff-item">⚡ Speedster: +10% XP</div>`);
    }

    const seasonalMultiplier = Seasons.getMultiplier ? Seasons.getMultiplier() : 1;
    if (seasonalMultiplier > 1) {
      buffs.push(`<div class="buff-item">🎉 Seasonal: +${Math.round((seasonalMultiplier - 1) * 100)}% XP</div>`);
    }

    buffsList.innerHTML = buffs.length
      ? buffs.join('')
      : '<div class="buff-item empty">No active buffs</div>';
  }
};
