// ===== UTILITY FUNCTIONS =====

function esc(t) {
  const d = document.createElement('div');
  d.textContent = t;
  return d.innerHTML;
}

function calcXP(q) {
  const base = Math.floor(XP_REWARDS[q.category] * (DIFFICULTY_MULTIPLIERS[q.difficulty] || 1));
  const multiplier = Seasons.getMultiplier ? Seasons.getMultiplier() : 1;
  return Math.floor(base * multiplier);
}

function getXPProg(xp) {
  return ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
}

function getXPText(xp) {
  return `${xp % XP_PER_LEVEL} / ${XP_PER_LEVEL} XP`;
}
