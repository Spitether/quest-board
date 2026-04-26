// ===== UI MODALS & PANELS =====

const UI = {
  openAddModal(qb) {
    qb.editingId = null;
    document.getElementById('modalTitle').textContent = 'Post New Quest';
    document.getElementById('questId').value = '';
    document.getElementById('questTitle').value = '';
    document.getElementById('questCategory').value = 'daily';
    document.getElementById('questDifficulty').value = 'easy';
    document.getElementById('questDueDate').value = '';
    document.getElementById('questDescription').value = '';
    document.getElementById('questModal').classList.add('active');
    this.updateXPPreview();
    document.getElementById('questTitle').focus();
  },

  openEditModal(qb, q) {
    qb.editingId = q.id;
    document.getElementById('modalTitle').textContent = 'Edit Quest';
    document.getElementById('questId').value = q.id;
    document.getElementById('questTitle').value = q.title;
    document.getElementById('questCategory').value = q.category;
    document.getElementById('questDifficulty').value = q.difficulty || 'easy';
    document.getElementById('questDueDate').value = q.dueDate || '';
    document.getElementById('questDescription').value = q.description || '';
    document.getElementById('questModal').classList.add('active');
    this.updateXPPreview();
    document.getElementById('questTitle').focus();
  },

  closeModal(qb) {
    document.getElementById('questModal').classList.remove('active');
    qb.editingId = null;
  },

  updateXPPreview() {
    const cat = document.getElementById('questCategory').value;
    const diff = document.getElementById('questDifficulty').value;
    const xp = Math.floor(XP_REWARDS[cat] * (DIFFICULTY_MULTIPLIERS[diff] || 1));
    const p = document.getElementById('xpPreview');
    if (p) p.innerHTML = `<span class="reward-icon">🏆</span> Reward: ${xp} XP`;
  },

  handleForm(qb, e) {
    e.preventDefault();
    const title = document.getElementById('questTitle').value.trim();
    const category = document.getElementById('questCategory').value;
    const difficulty = document.getElementById('questDifficulty').value;
    const dueDate = document.getElementById('questDueDate').value;
    const description = document.getElementById('questDescription').value.trim();

    if (!title) return;

    if (qb.editingId) {
      QuestManager.editQuest(qb, qb.editingId, title, category, difficulty, description, dueDate);
    } else {
      QuestManager.addQuest(qb, title, category, difficulty, description, dueDate);
    }

    this.closeModal(qb);
  },

  openPanel(qb) {
    document.getElementById('panelOverlay').classList.add('active');
    Inventory.renderInventory(qb);
    Inventory.renderAchievements(qb);
  },

  closePanel() {
    document.getElementById('panelOverlay').classList.remove('active');
  },

  switchPanel(tab) {
    document.querySelectorAll('#panelOverlay .panel-tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('#panelOverlay .panel-content').forEach(x => x.classList.add('hidden'));
    const tabEl = document.querySelector(`#panelOverlay .panel-tab[data-panel="${tab}"]`);
    const contentEl = document.getElementById(`${tab}Panel`);
    if (tabEl) tabEl.classList.add('active');
    if (contentEl) contentEl.classList.remove('hidden');
  },

  openSettings(qb) {
    document.getElementById('settingsOverlay').classList.add('active');
    Settings.renderSettings(qb);
  },

  closeSettings() {
    document.getElementById('settingsOverlay').classList.remove('active');
  },

  switchSettings(tab) {
    document.querySelectorAll('#settingsOverlay .panel-tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('#settingsOverlay .panel-content').forEach(x => x.classList.add('hidden'));
    const tabEl = document.querySelector(`#settingsOverlay .panel-tab[data-settings="${tab}"]`);
    const contentEl = document.getElementById(`${tab}Panel`);
    if (tabEl) tabEl.classList.add('active');
    if (contentEl) contentEl.classList.remove('hidden');
  },

  openParty(qb) {
    document.getElementById('partyOverlay').classList.add('active');
    Party.renderParty(qb);
    Party.renderLeaderboard(qb);
    Party.renderPartyQuests(qb);
  },

  closeParty() {
    document.getElementById('partyOverlay').classList.remove('active');
  },

  switchParty(tab) {
    document.querySelectorAll('#partyOverlay .panel-tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('#partyOverlay .panel-content').forEach(x => x.classList.add('hidden'));
    const tabEl = document.querySelector(`#partyOverlay .panel-tab[data-party="${tab}"]`);
    const contentEl = document.getElementById(`${tab}Panel`);
    if (tabEl) tabEl.classList.add('active');
    if (contentEl) contentEl.classList.remove('hidden');
  },

  openSuggestions(qb) {
    document.getElementById('suggestionsOverlay').classList.add('active');
    Suggestions.renderAll(qb);
  },

  closeSuggestions() {
    document.getElementById('suggestionsOverlay').classList.remove('active');
  }
};
