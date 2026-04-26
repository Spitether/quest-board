// ===== EVENT LISTENERS & TIMERS =====

const Events = {
  setupEventListeners(qb) {
    document.getElementById('addQuestBtn').addEventListener('click', () => UI.openAddModal(qb));
    document.getElementById('cancelBtn').addEventListener('click', () => UI.closeModal(qb));
    document.getElementById('questForm').addEventListener('submit', e => UI.handleForm(qb, e));
    document.getElementById('questCategory').addEventListener('change', () => UI.updateXPPreview());
    document.getElementById('questDifficulty').addEventListener('change', () => UI.updateXPPreview());

    document.getElementById('questModal').addEventListener('click', e => {
      if (e.target === document.getElementById('questModal')) UI.closeModal(qb);
    });

    document.querySelectorAll('.tab-btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        qb.currentCategory = b.dataset.category;
        QuestManager.renderQuests(qb);
      });
    });

    document.getElementById('inventoryBtn').addEventListener('click', () => UI.openPanel(qb));
    document.getElementById('panelClose').addEventListener('click', () => UI.closePanel());
    document.getElementById('panelOverlay').addEventListener('click', e => {
      if (e.target === document.getElementById('panelOverlay')) UI.closePanel();
    });

    document.querySelectorAll('#panelOverlay .panel-tab').forEach(t => {
      t.addEventListener('click', () => UI.switchPanel(t.dataset.panel));
    });

    document.getElementById('settingsBtn').addEventListener('click', () => UI.openSettings(qb));
    document.getElementById('settingsClose').addEventListener('click', () => UI.closeSettings());
    document.getElementById('settingsOverlay').addEventListener('click', e => {
      if (e.target === document.getElementById('settingsOverlay')) UI.closeSettings();
    });

    document.querySelectorAll('#settingsOverlay .panel-tab').forEach(t => {
      t.addEventListener('click', () => UI.switchSettings(t.dataset.settings));
    });

    document.getElementById('partyBtn').addEventListener('click', () => UI.openParty(qb));
    document.getElementById('partyClose').addEventListener('click', () => UI.closeParty());
    document.getElementById('partyOverlay').addEventListener('click', e => {
      if (e.target === document.getElementById('partyOverlay')) UI.closeParty();
    });

    document.querySelectorAll('#partyOverlay .panel-tab').forEach(t => {
      t.addEventListener('click', () => UI.switchParty(t.dataset.party));
    });

    document.getElementById('suggestionsBtn').addEventListener('click', () => UI.openSuggestions(qb));
    document.getElementById('suggestionsClose').addEventListener('click', () => UI.closeSuggestions());
    document.getElementById('suggestionsOverlay').addEventListener('click', e => {
      if (e.target === document.getElementById('suggestionsOverlay')) UI.closeSuggestions();
    });

    document.getElementById('characterAvatar').addEventListener('click', () => Effects.charReact('wave'));
    document.getElementById('companionAvatar').addEventListener('click', () => Effects.companionReact(qb));

    document.addEventListener('click', e => {
      if (e.target.closest('.avatar-option')) {
        qb.settings.avatar = e.target.closest('.avatar-option').dataset.avatar;
        Storage.save(qb);
        Progression.renderStats(qb);
        Settings.renderSettings(qb);
      }
      if (e.target.closest('.theme-option')) {
        qb.settings.theme = e.target.closest('.theme-option').dataset.theme;
        Storage.save(qb);
        Settings.applyTheme(qb);
        Settings.renderSettings(qb);
      }
      if (e.target.closest('.decor-option')) {
        const id = e.target.closest('.decor-option').dataset.decor;
        const i = qb.settings.decorations.indexOf(id);
        if (i > -1) qb.settings.decorations.splice(i, 1);
        else if (qb.settings.decorations.length < 4) qb.settings.decorations.push(id);
        Storage.save(qb);
        Settings.renderDecorations(qb);
        Settings.renderSettings(qb);
      }
      if (e.target.closest('.companion-option')) {
        qb.settings.companion = e.target.closest('.companion-option').dataset.companion;
        Storage.save(qb);
        Progression.renderStats(qb);
        Settings.renderSettings(qb);
      }
    });

    document.getElementById('playerNameInput').addEventListener('change', () => Settings.saveSettings(qb));

    // AI Settings events (delegated)
    document.addEventListener('change', e => {
      if (e.target.id === 'aiEnabledToggle') {
        qb.settings.aiEnabled = e.target.checked;
        Settings.renderAISettings(qb);
        Storage.save(qb);
        Effects.showToast(qb.settings.aiEnabled ? 'AI suggestions enabled!' : 'AI suggestions disabled');
      }
      if (e.target.id === 'aiApiKeyInput') {
        qb.settings.aiApiKey = e.target.value.trim();
        Settings.renderAISettings(qb);
        Storage.save(qb);
      }
    });

    document.addEventListener('click', e => {
      if (e.target.closest('.ai-provider-option')) {
        qb.settings.aiProvider = e.target.closest('.ai-provider-option').dataset.provider;
        Settings.renderAISettings(qb);
        Storage.save(qb);
      }
      if (e.target.id === 'aiClearCacheBtn') {
        AIService.clearCache();
        Effects.showToast('AI cache cleared!');
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        UI.closeModal(qb);
        UI.closePanel();
        UI.closeSettings();
        UI.closeParty();
        UI.closeSuggestions();
        document.getElementById('levelupOverlay').classList.remove('active');
      }
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (!document.getElementById('questModal').classList.contains('active') &&
            !document.getElementById('panelOverlay').classList.contains('active') &&
            !document.getElementById('settingsOverlay').classList.contains('active') &&
            !document.getElementById('partyOverlay').classList.contains('active') &&
            !document.getElementById('suggestionsOverlay').classList.contains('active')) {
          UI.openAddModal(qb);
        }
      }
    });
  },

  setupDayNightCycle() {
    const update = () => {
      const h = new Date().getHours();
      const bg = document.getElementById('tavernBackground');
      if (!bg) return;
      bg.className = 'tavern-background';
      if (h >= 5 && h < 8) bg.classList.add('dawn');
      else if (h >= 8 && h < 17) bg.classList.add('day');
      else if (h >= 17 && h < 20) bg.classList.add('dusk');
      else bg.classList.add('night');
    };
    update();
    setInterval(update, 60000);
  },

  startIdleTimer() {
    let t;
    const reset = () => {
      clearTimeout(t);
      t = setTimeout(() => Effects.charReact('wave'), 15000);
    };
    ['click', 'keydown', 'mousemove'].forEach(e => document.addEventListener(e, reset));
    reset();
  }
};
