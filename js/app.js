// ===== QUEST BOARD APP - MAIN ENTRY POINT =====

class QuestBoard {
  constructor() {
    this.quests = [];
    this.xp = 0;
    this.level = 1;
    this.currentCategory = 'all';
    this.editingId = null;
    this.inventory = {};
    this.achievements = {};
    this.streak = 0;
    this.lastStreakDate = null;
    this.stats = {
      totalCompleted: 0,
      dailyCompleted: 0,
      weeklyCompleted: 0,
      sideCompleted: 0,
      mainCompleted: 0,
      hardCompleted: 0,
      totalItems: 0,
      dailyMax: 0,
      maxLevel: 1,
      maxStreak: 0
    };
    this.settings = {
      avatar: '🧙‍♂️',
      name: 'Adventurer',
      theme: 'fantasy',
      decorations: [],
      companion: 'cat',
      aiEnabled: false,
      aiProvider: 'pollinations',
      aiApiKey: ''
    };
    this.init();
  }

  init() {
    Storage.load(this);
    Storage.checkAutoReset(this);
    Events.setupDayNightCycle();
    Events.setupEventListeners(this);
    Settings.applyTheme(this);
    Settings.renderDecorations(this);
    Seasons.init(this);
    this.render();
    Storage.startAutoResetTimer(this);
    Events.startIdleTimer();
  }

  render() {
    Progression.renderStats(this);
    QuestManager.renderQuests(this);
    Inventory.renderInventory(this);
    Inventory.renderAchievements(this);
    Progression.renderStreak(this);
    Progression.renderBuffs(this);
    Settings.renderSettings(this);
    Settings.renderDecorations(this);
    Seasons.renderSeasonalBanner();
    this.renderCalendar();
  }

  renderCalendar() {
    const list = document.getElementById('calendarList');
    if (!list) return;

    const upcoming = this.quests
      .filter(q => q.dueDate && !q.completed)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    if (upcoming.length === 0) {
      list.innerHTML = '<div class="calendar-empty">No deadlines set</div>';
      return;
    }

    list.innerHTML = upcoming.map(q => {
      const due = new Date(q.dueDate);
      const now = new Date();
      now.setHours(0,0,0,0);
      due.setHours(0,0,0,0);
      const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
      const urgent = daysLeft <= 1;
      return `<div class="calendar-item ${urgent ? 'urgent' : ''}">
        <span class="calendar-dot ${urgent ? 'urgent' : ''}"></span>
        <span class="calendar-title">${esc(q.title)}</span>
        <span class="calendar-days">${daysLeft <= 0 ? 'Today' : daysLeft + 'd'}</span>
      </div>`;
    }).join('');
  }

  resetDailyQuests() {
    QuestManager.resetDailyQuests(this);
  }

  resetWeeklyQuests() {
    QuestManager.resetWeeklyQuests(this);
  }

  checkStreakReset() {
    Progression.checkStreakReset(this);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.questBoard = new QuestBoard();
});

window.addEventListener('resize', () => {
  const c = document.getElementById('confettiCanvas');
  if (c) {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  }
});
