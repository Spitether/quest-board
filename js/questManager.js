// ===== QUEST MANAGEMENT =====

const QuestManager = {
  addQuest(qb, title, category, difficulty = 'easy', description = '', dueDate = '') {
    qb.quests.push({
      id: Date.now().toString(),
      title,
      category,
      difficulty,
      description,
      dueDate: dueDate || null,
      completed: false,
      completedAt: null,
      createdAt: Date.now()
    });
    Storage.save(qb);
    qb.render();
    Effects.showToast('Quest posted!');
  },

  editQuest(qb, id, title, category, difficulty, description = '', dueDate = '') {
    const q = qb.quests.find(x => x.id === id);
    if (q) {
      q.title = title;
      q.category = category;
      q.difficulty = difficulty;
      q.description = description;
      q.dueDate = dueDate || null;
      Storage.save(qb);
      qb.render();
      Effects.showToast('Quest updated!');
    }
  },

  deleteQuest(qb, id) {
    if (confirm('Delete this quest?')) {
      const q = qb.quests.find(x => x.id === id);
      if (q && q.completed) {
        qb.xp = Math.max(0, qb.xp - calcXP(q));
        Progression.updateLevel(qb);
      }
      qb.quests = qb.quests.filter(x => x.id !== id);
      Storage.save(qb);
      qb.render();
      Effects.showToast('Quest deleted!');
    }
  },

  toggleQuest(qb, id, el) {
    const q = qb.quests.find(x => x.id === id);
    if (!q) return;
    const wasCompleted = q.completed;
    q.completed = !q.completed;
    q.completedAt = q.completed ? Date.now() : null;

    if (q.completed && !wasCompleted) {
      const xp = calcXP(q);
      qb.xp += xp;
      Progression.updateStats(qb, q);
      Progression.updateStreak(qb);
      Progression.updateLevel(qb);
      Effects.createSparkles(el);
      Effects.createFloatXP(el, xp);
      Effects.charReact('jump');

      const oldLevel = qb.level;
      Progression.updateLevel(qb);
      if (qb.level > oldLevel) {
        setTimeout(() => {
          Effects.triggerConfetti();
          Effects.showLevelUp(qb.level);
          Effects.playSound();
          Effects.charReact('cheer');
        }, 300);
      }

      Inventory.tryDrop(qb);
      Inventory.checkAchievements(qb);
    } else if (!q.completed && wasCompleted) {
      qb.xp = Math.max(0, qb.xp - calcXP(q));
      Progression.updateLevel(qb);
    }

    Storage.save(qb);
    qb.render();
  },

  resetDailyQuests(qb) {
    let c = 0;
    qb.quests.forEach(q => {
      if (q.category === 'daily' && q.completed) {
        q.completed = false;
        q.completedAt = null;
        c++;
      }
    });
    if (c > 0) {
      Storage.save(qb);
      Effects.showToast(`${c} daily quest${c > 1 ? 's' : ''} reset!`);
    }
  },

  resetWeeklyQuests(qb) {
    let c = 0;
    qb.quests.forEach(q => {
      if (q.category === 'weekly' && q.completed) {
        q.completed = false;
        q.completedAt = null;
        c++;
      }
    });
    if (c > 0) {
      Storage.save(qb);
      Effects.showToast(`${c} weekly quest${c > 1 ? 's' : ''} reset!`);
    }
  },

  renderQuests(qb) {
    const board = document.getElementById('questBoard');
    const filtered = qb.currentCategory === 'all'
      ? qb.quests
      : qb.quests.filter(q => q.category === qb.currentCategory);

    filtered.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return b.createdAt - a.createdAt;
    });

    if (filtered.length === 0) {
      board.innerHTML = '<div class="empty-state"><div class="icon">📜</div><p>No quests found.</p><p style="font-size:0.9rem;margin-top:8px">Click + to add one!</p></div>';
      return;
    }

    board.innerHTML = filtered.map(q => this.qHTML(q)).join('');

    filtered.forEach(q => {
      const card = document.getElementById(`quest-${q.id}`);
      if (card) {
        const cb = card.querySelector('.quest-checkbox');
        const eb = card.querySelector('.action-btn.edit');
        const db = card.querySelector('.action-btn.delete');

        cb.addEventListener('click', e => {
          e.stopPropagation();
          this.toggleQuest(qb, q.id, cb);
        });
        eb.addEventListener('click', e => {
          e.stopPropagation();
          UI.openEditModal(qb, q);
        });
        db.addEventListener('click', e => {
          e.stopPropagation();
          this.deleteQuest(qb, q.id);
        });
      }
    });
  },

  qHTML(q) {
    const xp = calcXP(q);
    let dueHtml = '';
    if (q.dueDate) {
      const due = new Date(q.dueDate);
      const now = new Date();
      now.setHours(0,0,0,0);
      due.setHours(0,0,0,0);
      const isOverdue = due < now && !q.completed;
      const isToday = due.getTime() === now.getTime();
      const label = isToday ? 'Today' : due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dueHtml = `<span class="due-badge ${isOverdue ? 'overdue' : isToday ? 'today' : ''}">📅 ${label}</span>`;
    }
    const seasonalBadge = q.isSeasonal ? '<span class="seasonal-badge">🎉 Seasonal</span>' : '';
    const descHtml = q.description ? `<div class="quest-desc">${esc(q.description)}</div>` : '';
    return `<div class="quest-card ${q.category} ${q.completed ? 'completed' : ''} ${q.isSeasonal ? 'seasonal' : ''}" id="quest-${q.id}">
      <div class="quest-checkbox ${q.completed ? 'checked' : ''}"></div>
      <div class="quest-content">
        <div class="quest-title">${esc(q.title)}<span class="difficulty-stars ${q.difficulty}">${DIFFICULTY_STARS[q.difficulty]}</span>${seasonalBadge}</div>
        <div class="quest-meta">
          <span class="category-badge ${q.category}">${CATEGORY_LABELS[q.category]}</span>
          <span class="xp-reward">+${xp} XP</span>
          ${dueHtml}
        </div>
        ${descHtml}
      </div>
      <div class="quest-actions">
        <button class="action-btn edit" title="Edit">✏️</button>
        <button class="action-btn delete" title="Delete">🗑️</button>
      </div>
    </div>`;
  }
};
