// ===== CONFIG / CONSTANTS =====

const XP_REWARDS = { daily: 10, weekly: 50, side: 25, main: 100 };
const DIFFICULTY_MULTIPLIERS = { easy: 1, medium: 1.5, hard: 2 };
const CATEGORY_LABELS = { daily: 'Daily', weekly: 'Weekly', side: 'Side', main: 'Main' };
const DIFFICULTY_STARS = { easy: '⭐', medium: '⭐⭐', hard: '⭐⭐⭐' };
const XP_PER_LEVEL = 100;

const ITEMS = [
  { id: 'health_potion', name: 'Health Potion', icon: '🧪', dropChance: 0.3 },
  { id: 'mana_crystal', name: 'Mana Crystal', icon: '💎', dropChance: 0.25 },
  { id: 'gold_coin', name: 'Gold Coin', icon: '🪙', dropChance: 0.4 },
  { id: 'rare_gem', name: 'Rare Gem', icon: '💠', dropChance: 0.08 },
  { id: 'legendary_scroll', name: 'Legendary Scroll', icon: '📜', dropChance: 0.02 }
];

const ACHIEVEMENTS = [
  { id: 'first_blood', name: 'First Blood', icon: '🩸', description: 'Complete your first quest', condition: s => s.totalCompleted >= 1 },
  { id: 'daily_warrior', name: 'Daily Warrior', icon: '⚔️', description: 'Complete 10 daily quests', condition: s => s.dailyCompleted >= 10 },
  { id: 'weekly_champion', name: 'Weekly Champion', icon: '🏆', description: 'Complete 5 weekly quests', condition: s => s.weeklyCompleted >= 5 },
  { id: 'hoarder', name: 'Hoarder', icon: '🎒', description: 'Collect 10 items', condition: s => s.totalItems >= 10 },
  { id: 'speedster', name: 'Speedster', icon: '⚡', description: 'Complete 3 quests in one day', condition: s => s.dailyMax >= 3 },
  { id: 'legend', name: 'Legend', icon: '👑', description: 'Reach level 10', condition: s => s.maxLevel >= 10 },
  { id: 'streak_master', name: 'Streak Master', icon: '🔥', description: '7 day streak', condition: s => s.maxStreak >= 7 },
  { id: 'difficult', name: 'Challenge Seeker', icon: '🎯', description: 'Complete 5 hard quests', condition: s => s.hardCompleted >= 5 }
];

const AVATARS = ['🧙‍♂️','🧝‍♀️','🧛','🤴','👸','🦸‍♂️','🦹‍♀️','🧚‍♂️','🧜‍♀️','👨‍🚀','🥷','🤠','👨‍🌾','🧟‍♂️','👩‍🎤'];

const THEMES = [
  { id: 'fantasy', name: 'Fantasy', preview: 'linear-gradient(90deg,#2c1810,#4a3428)', description: 'Classic tavern adventure' },
  { id: 'pixel', name: 'Pixel', preview: 'linear-gradient(90deg,#1a1a2e,#16213e)', description: 'Retro 8-bit dungeon' },
  { id: 'cozy', name: 'Cozy', preview: 'linear-gradient(90deg,#5d4037,#795548)', description: 'Warm fireplace vibes' },
  { id: 'scifi', name: 'Sci-Fi', preview: 'linear-gradient(90deg,#0a0e27,#1a1f4b)', description: 'Neon cyberpunk hub' }
];

const DECORATIONS = [
  { id: 'plant', icon: '🪴', name: 'Plant' },
  { id: 'candle', icon: '🕯️', name: 'Candle' },
  { id: 'banner', icon: '🚩', name: 'Banner' },
  { id: 'crystal', icon: '🔮', name: 'Crystal' },
  { id: 'shield', icon: '🛡️', name: 'Shield' },
  { id: 'sword', icon: '⚔️', name: 'Sword' },
  { id: 'chest', icon: '📦', name: 'Chest' },
  { id: 'potion', icon: '⚗️', name: 'Potion' }
];

const COMPANIONS = [
  { id: 'cat', icon: '🐱', name: 'Cat', msgs: ['Meow!','Purr...','*stretches*'] },
  { id: 'dog', icon: '🐶', name: 'Dog', msgs: ['Woof!','*wags tail*','Arf!'] },
  { id: 'fairy', icon: '🧚', name: 'Fairy', msgs: ['✨','*giggles*','Sparkle!'] },
  { id: 'slime', icon: '💧', name: 'Slime', msgs: ['Bloop!','Squish...','*jiggles*'] },
  { id: 'dragon', icon: '🐉', name: 'Dragon', msgs: ['Rawr!','*snort fire*','Roar!'] },
  { id: 'owl', icon: '🦉', name: 'Owl', msgs: ['Hoot!','*blinks*','Wise...'] },
  { id: 'fox', icon: '🦊', name: 'Fox', msgs: ['Yip!','*tilts head*','Hehe!'] },
  { id: 'robot', icon: '🤖', name: 'Robot', msgs: ['Beep!','Boop...','*whirs*'] }
];

// ===== SMART SUGGESTIONS =====
const MOODS = [
  { id: 'focused', icon: '⚔️', name: 'Focused', desc: 'High-intensity tasks' },
  { id: 'relaxed', icon: '🧘', name: 'Relaxed', desc: 'Easy-going tasks' },
  { id: 'energetic', icon: '🔥', name: 'Energetic', desc: 'Batch tasks' }
];

const SUGGESTIONS = {
  focused: [
    { title: 'Deep Work Session', category: 'main', difficulty: 'hard', description: '90 minutes of uninterrupted focus' },
    { title: 'Review & Plan', category: 'weekly', difficulty: 'medium', description: 'Strategic planning for the week' },
    { title: 'Learn Something New', category: 'side', difficulty: 'hard', description: 'Study a new skill for 1 hour' },
    { title: 'Complete Priority Task', category: 'main', difficulty: 'hard', description: 'Tackle your most important task' }
  ],
  relaxed: [
    { title: 'Light Reading', category: 'daily', difficulty: 'easy', description: 'Read for 15 minutes' },
    { title: 'Tidy Up Space', category: 'daily', difficulty: 'easy', description: 'Organize one small area' },
    { title: 'Take a Walk', category: 'side', difficulty: 'easy', description: '15-minute mindful walk' },
    { title: 'Journal Entry', category: 'daily', difficulty: 'easy', description: 'Write 3 things you are grateful for' }
  ],
  energetic: [
    { title: 'Power Hour', category: 'main', difficulty: 'medium', description: 'Complete as many small tasks as possible' },
    { title: 'Workout Session', category: 'daily', difficulty: 'medium', description: '30 minutes of exercise' },
    { title: 'Batch Process Emails', category: 'side', difficulty: 'medium', description: 'Clear your inbox in one go' },
    { title: 'Social Connection', category: 'weekly', difficulty: 'easy', description: 'Reach out to a friend or family member' }
  ]
};

// ===== SEASONAL EVENTS =====
const SEASONS = {
  spring: { name: 'Spring Festival', icon: '🌸', months: [2, 3, 4], multiplier: 1.25, decorations: ['🌷','🦋','🌱'], item: { id: 'blossom_petal', name: 'Blossom Petal', icon: '🌸', dropChance: 0.15 } },
  summer: { name: 'Summer Solstice', icon: '☀️', months: [5, 6, 7], multiplier: 1.2, decorations: ['🌻','⛱️','🍉'], item: { id: 'sun_essence', name: 'Sun Essence', icon: '☀️', dropChance: 0.15 } },
  autumn: { name: 'Harvest Moon', icon: '🍂', months: [8, 9, 10], multiplier: 1.25, decorations: ['🎃','🍁','🌽'], item: { id: 'harvest_corn', name: 'Harvest Corn', icon: '🌽', dropChance: 0.15 } },
  winter: { name: 'Questmas', icon: '❄️', months: [11, 0, 1], multiplier: 1.5, decorations: ['🎄','⛄','🎁'], item: { id: 'snowflake', name: 'Snowflake', icon: '❄️', dropChance: 0.2 } }
};

const SEASONAL_QUESTS = {
  spring: [
    { title: 'Plant a New Habit', category: 'main', difficulty: 'medium', description: 'Start a new daily practice' },
    { title: 'Spring Cleaning', category: 'weekly', difficulty: 'medium', description: 'Deep clean one room' }
  ],
  summer: [
    { title: 'Soak Up the Sun', category: 'daily', difficulty: 'easy', description: 'Spend 30 minutes outdoors' },
    { title: 'Summer Adventure', category: 'main', difficulty: 'hard', description: 'Try something completely new' }
  ],
  autumn: [
    { title: 'Harvest Your Wins', category: 'weekly', difficulty: 'easy', description: 'Review and celebrate achievements' },
    { title: 'Prepare for Winter', category: 'main', difficulty: 'medium', description: 'Set goals for the next quarter' }
  ],
  winter: [
    { title: 'Gift of Time', category: 'daily', difficulty: 'easy', description: 'Help someone with a task' },
    { title: 'Questmas Spirit', category: 'main', difficulty: 'hard', description: 'Complete 5 quests in one day' }
  ]
};

// ===== GUILD RANKS =====
const GUILD_RANKS = [
  { name: 'Bronze', icon: '🥉', minTotalXP: 0 },
  { name: 'Silver', icon: '🥈', minTotalXP: 500 },
  { name: 'Gold', icon: '🥇', minTotalXP: 1500 },
  { name: 'Platinum', icon: '💎', minTotalXP: 3000 },
  { name: 'Diamond', icon: '👑', minTotalXP: 5000 },
  { name: 'Legendary', icon: '⭐', minTotalXP: 10000 }
];

const PARTY_BONUS_XP = 10;

// ===== AI PROVIDER CONFIG =====
const AI_PROVIDERS = [
  { id: 'server', name: 'Server (Shared)', icon: '🌐', desc: 'Uses site owner\'s key — no setup needed!' },
  { id: 'gemini', name: 'Google Gemini', icon: '🔮', desc: 'Free tier: 15 req/min, 1500/day' },
  { id: 'openai', name: 'OpenAI', icon: '🤖', desc: 'Pay-per-use, most capable' },
  { id: 'chrome', name: 'Chrome Built-in AI', icon: '💻', desc: 'Runs locally in Chrome (experimental)' }
];
