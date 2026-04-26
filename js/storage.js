// ===== STORAGE & PERSISTENCE =====

const Storage = {
  load(qb) {
    const sq = localStorage.getItem('qb_quests');
    const sx = localStorage.getItem('qb_xp');
    const sl = localStorage.getItem('qb_level');
    const si = localStorage.getItem('qb_inventory');
    const sa = localStorage.getItem('qb_achievements');
    const ss = localStorage.getItem('qb_streak');
    const ls = localStorage.getItem('qb_lastStreakDate');
    const st = localStorage.getItem('qb_stats');
    const se = localStorage.getItem('qb_settings');

    if (sq) {
      qb.quests = JSON.parse(sq);
      qb.quests.forEach(q => { if (!q.difficulty) q.difficulty = 'easy'; });
    }
    if (sx) qb.xp = parseInt(sx, 10);
    if (sl) qb.level = parseInt(sl, 10);
    if (si) qb.inventory = JSON.parse(si);
    if (sa) qb.achievements = JSON.parse(sa);
    if (ss) qb.streak = parseInt(ss, 10);
    if (ls) qb.lastStreakDate = ls;
    if (st) qb.stats = JSON.parse(st);
    if (se) qb.settings = JSON.parse(se);
  },

  save(qb) {
    localStorage.setItem('qb_quests', JSON.stringify(qb.quests));
    localStorage.setItem('qb_xp', qb.xp.toString());
    localStorage.setItem('qb_level', qb.level.toString());
    localStorage.setItem('qb_inventory', JSON.stringify(qb.inventory));
    localStorage.setItem('qb_achievements', JSON.stringify(qb.achievements));
    localStorage.setItem('qb_streak', qb.streak.toString());
    localStorage.setItem('qb_lastStreakDate', qb.lastStreakDate || '');
    localStorage.setItem('qb_stats', JSON.stringify(qb.stats));
    localStorage.setItem('qb_settings', JSON.stringify(qb.settings));
  },

  checkAutoReset(qb) {
    const now = new Date();
    const ldr = localStorage.getItem('qb_lastDailyReset');
    const lwr = localStorage.getItem('qb_lastWeeklyReset');
    const tm = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (!ldr || parseInt(ldr, 10) < tm) {
      qb.resetDailyQuests();
      qb.checkStreakReset();
      localStorage.setItem('qb_lastDailyReset', now.getTime().toString());
    }

    const dow = now.getDay();
    const dsm = dow === 0 ? 6 : dow - 1;
    const mm = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dsm).getTime();

    if (!lwr || parseInt(lwr, 10) < mm) {
      qb.resetWeeklyQuests();
      localStorage.setItem('qb_lastWeeklyReset', now.getTime().toString());
    }
  },

  startAutoResetTimer(qb) {
    setInterval(() => this.checkAutoReset(qb), 60000);
  }
};
