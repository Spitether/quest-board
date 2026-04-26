// ===== SETTINGS & PERSONALIZATION =====

const Settings = {
  applyTheme(qb) {
    document.body.className = `theme-${qb.settings.theme}`;
  },

  renderDecorations(qb) {
    const dl = document.getElementById('decorationsLayer');
    if (!dl) return;
    dl.innerHTML = '';

    qb.settings.decorations.forEach((d, i) => {
      const dec = DECORATIONS.find(x => x.id === d);
      if (!dec) return;

      const el = document.createElement('div');
      el.className = 'decoration-item';
      el.textContent = dec.icon;

      const pos = [
        { t: 5, l: 5 }, { t: 10, l: 85 },
        { t: 80, l: 10 }, { t: 85, l: 80 },
        { t: 45, l: 3 }, { t: 50, l: 90 },
        { t: 3, l: 45 }, { t: 90, l: 50 }
      ];
      const p = pos[i % pos.length];
      el.style.top = `${p.t}%`;
      el.style.left = `${p.l}%`;

      dl.appendChild(el);
    });
  },

  renderSettings(qb) {
    const ag = document.getElementById('avatarGrid');
    if (ag) ag.innerHTML = AVATARS.map(a => `<div class="avatar-option ${qb.settings.avatar === a ? 'selected' : ''}" data-avatar="${a}">${a}</div>`).join('');

    const tg = document.getElementById('themeGrid');
    if (tg) {
      tg.innerHTML = THEMES.map(t => {
        const isSelected = qb.settings.theme === t.id;
        return `<div class="theme-option ${isSelected ? 'selected' : ''}" data-theme="${t.id}">
          <div class="theme-preview" style="background:${t.preview}"></div>
          <div class="theme-info">
            <div class="theme-name">${t.name}</div>
            <div class="theme-desc">${t.description}</div>
          </div>
          ${isSelected ? '<div class="theme-check">✓</div>' : ''}
        </div>`;
      }).join('');
    }

    const dg = document.getElementById('decorGrid');
    if (dg) {
      const selectedCount = qb.settings.decorations.length;
      dg.innerHTML = DECORATIONS.map(d => {
        const isSelected = qb.settings.decorations.includes(d.id);
        return `<div class="decor-option ${isSelected ? 'selected' : ''}" data-decor="${d.id}">
          <div class="decor-icon">${d.icon}</div>
          <div class="decor-name">${d.name}</div>
          ${isSelected ? '<div class="decor-check">✓</div>' : ''}
        </div>`;
      }).join('');
      dg.setAttribute('data-count', `${selectedCount}/4`);
    }

    const cg = document.getElementById('companionGrid');
    if (cg) cg.innerHTML = COMPANIONS.map(c => {
      const isSelected = qb.settings.companion === c.id;
      return `<div class="companion-option ${isSelected ? 'selected' : ''}" data-companion="${c.id}">
        <div class="companion-icon">${c.icon}</div>
        <div class="companion-name">${c.name}</div>
        ${isSelected ? '<div class="companion-check">✓</div>' : ''}
      </div>`;
    }).join('');

    const ni = document.getElementById('playerNameInput');
    if (ni) ni.value = qb.settings.name;

    this.renderAISettings(qb);
  },

  renderAISettings(qb) {
    const container = document.getElementById('aiPanel');
    if (!container) return;

    const aiEnabled = qb.settings.aiEnabled || false;
    const aiProvider = qb.settings.aiProvider || 'server';
    const aiApiKey = qb.settings.aiApiKey || '';
    const isAvailable = AIService.isAvailable(qb);
    const isServer = aiProvider === 'server';

    container.innerHTML = `
      <div class="settings-section">
        <h3>🤖 AI Suggestions</h3>
        <div class="ai-toggle-row">
          <label class="ai-toggle-label">
            <input type="checkbox" id="aiEnabledToggle" ${aiEnabled ? 'checked' : ''}>
            <span class="ai-toggle-slider"></span>
            <span class="ai-toggle-text">Enable AI-powered suggestions</span>
          </label>
        </div>
        <div class="ai-status ${isAvailable ? 'available' : 'unavailable'}">
          ${isAvailable ? '✅ AI is ready' : '⚠️ AI not configured'}
        </div>
      </div>
      <div class="settings-section ${aiEnabled ? '' : 'disabled'}">
        <h3>Provider</h3>
        <div class="ai-provider-grid">
          ${AI_PROVIDERS.map(p => {
            const isSel = aiProvider === p.id;
            return `<div class="ai-provider-option ${isSel ? 'selected' : ''}" data-provider="${p.id}">
              <div class="ai-provider-icon">${p.icon}</div>
              <div class="ai-provider-info">
                <div class="ai-provider-name">${p.name}</div>
                <div class="ai-provider-desc">${p.desc}</div>
              </div>
              ${isSel ? '<div class="ai-provider-check">✓</div>' : ''}
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="settings-section ${aiEnabled && !isServer ? '' : 'disabled'}">
        <h3>API Key</h3>
        <input type="password" class="settings-input" id="aiApiKeyInput" placeholder="Enter your API key..." value="${esc(aiApiKey)}">
        <div class="ai-key-hint">
          ${aiProvider === 'gemini'
            ? 'Get a free key at <a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a>'
            : aiProvider === 'openai'
            ? 'Get your key at <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a>'
            : 'Select Gemini or OpenAI to enter your own key'}
        </div>
      </div>
      <div class="settings-section">
        <button class="btn-secondary" id="aiClearCacheBtn">🗑️ Clear AI Cache</button>
      </div>
    `;
  },

  saveSettings(qb) {
    qb.settings.name = document.getElementById('playerNameInput').value.trim() || 'Adventurer';
    Storage.save(qb);
    Settings.applyTheme(qb);
    Settings.renderDecorations(qb);
    qb.render();
    Effects.showToast('Settings saved!');
  }
};
