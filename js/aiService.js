// ===== AI SERVICE - REAL LLM INTEGRATION =====

const AIService = {
  CACHE_KEY: 'ai_suggestions_cache_v2',
  CACHE_TTL_MS: 3 * 60 * 1000, // 3 minutes
  RATE_LIMIT_KEY: 'ai_rate_limit_v2',
  MAX_REQUESTS_PER_MINUTE: 8,
  VARIETY_KEY: 'ai_suggestion_history',
  MAX_HISTORY: 50,

  // ─── MAIN ENTRY POINT ───

  async generateSuggestions(qb, currentMood) {
    if (!qb.settings.aiEnabled) return null;

    const cached = this.getCached();
    if (cached) return cached;

    if (this.isRateLimited()) return null;

    const provider = qb.settings.aiProvider || 'server';

    try {
      let result;
      if (provider === 'server') {
        result = await this.callServerProxy(qb, currentMood);
      } else if (provider === 'gemini') {
        const apiKey = qb.settings.aiApiKey;
        if (!apiKey) return null;
        result = await this.callGemini(qb, currentMood, apiKey);
      } else if (provider === 'openai') {
        const apiKey = qb.settings.aiApiKey;
        if (!apiKey) return null;
        result = await this.callOpenAI(qb, currentMood, apiKey);
      } else if (provider === 'chrome') {
        result = await this.callChromeAI(qb, currentMood);
      }

      if (result && result.length > 0) {
        this.setCache(result);
        this.recordRequest();
        this.trackHistory(result);
      }
      return result;
    } catch (err) {
      console.error('AI Service error:', err);
      return null;
    }
  },

  // ─── SERVER PROXY (SHARED KEY) ───

  async callServerProxy(qb, currentMood) {
    const prompt = this.buildPrompt(qb, currentMood);

    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Server proxy error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    return this.parseResponse(text);
  },

  // ─── RICH PERSONALIZED PROMPT ENGINEERING ───

  buildPrompt(qb, currentMood) {
    const patterns = Suggestions.analyzePatterns(qb);
    const allQuests = qb.quests;
    const completedQuests = allQuests.filter(q => q.completed);
    const pendingQuests = allQuests.filter(q => !q.completed);

    const topicData = Suggestions.detectTopics(qb);
    const topics = Object.entries(topicData.topicCounts || {})
      .sort((a, b) => b[1] - a[1])
      .map(([t, c]) => `${t}(${c})`)
      .join(', ') || 'none yet';

    const catBreakdown = Object.entries(patterns.categoryBalance)
      .map(([cat, count]) => `${cat}: ${count}`)
      .join(', ');

    const diffCounts = { easy: 0, medium: 0, hard: 0 };
    allQuests.forEach(q => { diffCounts[q.difficulty] = (diffCounts[q.difficulty] || 0) + 1; });
    const diffBreakdown = Object.entries(diffCounts)
      .map(([d, c]) => `${d}: ${c}`)
      .join(', ');

    const recentCompleted = completedQuests
      .slice(-15)
      .reverse()
      .map(q => {
        const date = q.completedAt ? new Date(q.completedAt).toLocaleDateString() : 'unknown';
        return `"${q.title}" [${q.category}, ${q.difficulty}, completed ${date}]`;
      })
      .join('\n') || 'None yet';

    const pendingList = pendingQuests
      .slice(0, 10)
      .map(q => `"${q.title}" [${q.category}, ${q.difficulty}${q.dueDate ? ', due ' + q.dueDate : ''}]`)
      .join('\n') || 'None';

    const hourCounts = {};
    completedQuests.forEach(q => {
      if (q.completedAt) {
        const h = new Date(q.completedAt).getHours();
        const slot = h < 6 ? 'night' : h < 12 ? 'morning' : h < 17 ? 'afternoon' : h < 21 ? 'evening' : 'night';
        hourCounts[slot] = (hourCounts[slot] || 0) + 1;
      }
    });
    const timePattern = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([t, c]) => `${t}: ${c}`)
      .join(', ') || 'no data';

    const skillAreas = this.inferSkillAreas(allQuests);
    const history = this.getHistory();
    const recentTitles = history.slice(-20).map(h => h.title).join('; ') || 'none';

    const now = new Date();
    const hour = now.getHours();
    let timeOfDay = 'morning';
    if (hour >= 21 || hour < 5) timeOfDay = 'late night';
    else if (hour >= 17) timeOfDay = 'evening';
    else if (hour >= 12) timeOfDay = 'afternoon';

    return `You are an elite personal growth coach and quest designer for a gamified productivity app called "Quest Board". The user is an adventurer who completes quests (tasks) to gain XP and level up.

USER PROFILE:
- Name: ${qb.settings.name || 'Adventurer'}
- Level: ${qb.level} | Streak: ${qb.streak} days
- Current mood: ${currentMood}
- Time of day: ${timeOfDay} (${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})
- Completion rate: ${(patterns.completionRate * 100).toFixed(0)}%
- Preferred productivity time: ${patterns.preferredTime}
- Workload stress: ${patterns.workloadScore}/3
- Overdue quests: ${patterns.overdueCount}

QUEST HISTORY ANALYSIS:
Total quests: ${allQuests.length} | Completed: ${completedQuests.length} | Pending: ${pendingQuests.length}
Category distribution: ${catBreakdown}
Difficulty distribution: ${diffBreakdown}
Time-of-day pattern: ${timePattern}
Detected interest topics: ${topics}
Inferred skill areas: ${skillAreas.join(', ') || 'still discovering'}

RECENTLY COMPLETED QUESTS:
${recentCompleted}

PENDING QUESTS:
${pendingList}

PREVIOUSLY SUGGESTED (AVOID REPEATING):
${recentTitles}

YOUR TASK:
Generate 6-8 quest suggestions that are:
1. HIGHLY SPECIFIC to the user's detected interests and skills
2. VARIED — mix different categories, difficulties, and types
3. SKILL-BUILDING — each quest should help the user improve in a concrete way
4. PERSONALITY-FITTING — match the user's apparent personality from their quest patterns
5. CONTEXT-AWARE — consider their current mood, workload, time of day, and overdue items
6. CREATIVE — use adventure/RPG themed language but keep tasks actionable

For each suggestion, provide:
- title: specific, creative quest name (NOT generic)
- category: one of [daily, weekly, side, main]
- difficulty: one of [easy, medium, hard]
- description: 1-2 sentences explaining WHY this quest matters for THEM specifically
- reason: one of [streak, overdue, time, balance, progression, recovery, mood, habit, skill, creative, challenge, wellness]

CRITICAL RULES:
- NEVER suggest something they've recently done
- If they have many pending hard quests, suggest easier ones
- If their completion rate is low, suggest quick wins
- If they have a dominant topic, suggest quests that EXPAND their skills
- Include at least ONE quest from a category they rarely use
- Include at least ONE quest that challenges them slightly
- Include at least ONE creative/unusual quest

Return ONLY a valid JSON array. No markdown, no explanation.`;
  },

  inferSkillAreas(quests) {
    const skillMap = {
      coding: ['programming', 'software engineering', 'technical skills', 'problem solving'],
      sewing: ['craftsmanship', 'design', 'attention to detail', 'creativity'],
      reading: ['knowledge acquisition', 'critical thinking', 'research'],
      writing: ['communication', 'storytelling', 'self-expression'],
      cooking: ['culinary arts', 'planning', 'creativity', 'nutrition'],
      fitness: ['physical discipline', 'endurance', 'health management'],
      art: ['visual creativity', 'aesthetic sense', 'fine motor skills'],
      music: ['auditory skills', 'rhythm', 'performance', 'discipline'],
      gardening: ['patience', 'nurturing', 'botanical knowledge'],
      studying: ['academic discipline', 'memory', 'analytical thinking'],
      cleaning: ['organization', 'systems thinking', 'maintenance'],
      photography: ['visual composition', 'technical photography', 'editing'],
      crafting: ['handicraft', 'DIY skills', 'materials knowledge'],
      finance: ['financial literacy', 'planning', 'discipline'],
      health: ['self-care', 'preventive health', 'mindfulness'],
      social: ['relationship building', 'networking', 'communication'],
      travel: ['exploration', 'adaptability', 'cultural awareness'],
      gaming: ['strategic thinking', 'reaction time', 'competitive skills']
    };

    const topics = Suggestions.detectTopics({ quests });
    const areas = new Set();
    Object.entries(topics.topicCounts || {}).forEach(([topic]) => {
      const skills = skillMap[topic] || [topic + ' skills'];
      skills.forEach(s => areas.add(s));
    });
    return Array.from(areas).slice(0, 6);
  },

  // ─── PROVIDER: GOOGLE GEMINI ───

  async callGemini(qb, currentMood, apiKey) {
    const prompt = this.buildPrompt(qb, currentMood);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    return this.parseResponse(text);
  },

  // ─── PROVIDER: OPENAI ───

  async callOpenAI(qb, currentMood, apiKey) {
    const prompt = this.buildPrompt(qb, currentMood);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a personal growth coach. Return only valid JSON arrays of quest suggestions.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 4096,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '[]';
    return this.parseResponse(text);
  },

  // ─── PROVIDER: CHROME BUILT-IN AI ───

  async callChromeAI(qb, currentMood) {
    if (!window.ai || !window.ai.languageModel) {
      throw new Error('Chrome Built-in AI not available');
    }

    const session = await window.ai.languageModel.create({
      systemPrompt: 'You are a personal growth coach. Return only valid JSON arrays of quest suggestions.'
    });

    const prompt = this.buildPrompt(qb, currentMood);
    const result = await session.prompt(prompt);
    session.destroy();

    return this.parseResponse(result);
  },

  // ─── RESPONSE PARSING ───

  parseResponse(text) {
    try {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const cleanText = jsonMatch ? jsonMatch[1] : text;
      const parsed = JSON.parse(cleanText);

      const suggestions = Array.isArray(parsed)
        ? parsed
        : parsed.suggestions || parsed.quests || parsed.data || [];

      const validReasons = [
        'streak', 'overdue', 'time', 'balance', 'progression',
        'recovery', 'mood', 'habit', 'skill', 'creative', 'challenge', 'wellness'
      ];

      return suggestions
        .filter(s => s.title && s.category && s.difficulty && s.description)
        .map(s => ({
          title: String(s.title).trim(),
          category: ['daily', 'weekly', 'side', 'main'].includes(s.category)
            ? s.category
            : 'side',
          difficulty: ['easy', 'medium', 'hard'].includes(s.difficulty)
            ? s.difficulty
            : 'medium',
          description: String(s.description).trim(),
          reason: validReasons.includes(s.reason)
            ? s.reason
            : 'skill',
          isPriority: s.isPriority || false
        }));
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      return null;
    }
  },

  // ─── VARIETY TRACKING ───

  getHistory() {
    try {
      const raw = localStorage.getItem(this.VARIETY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  trackHistory(suggestions) {
    try {
      const history = this.getHistory();
      suggestions.forEach(s => {
        history.push({ title: s.title, timestamp: Date.now() });
      });
      while (history.length > this.MAX_HISTORY) history.shift();
      localStorage.setItem(this.VARIETY_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  },

  // ─── CACHE & RATE LIMITING ───

  getCached() {
    try {
      const raw = localStorage.getItem(this.CACHE_KEY);
      if (!raw) return null;
      const { data, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp > this.CACHE_TTL_MS) {
        localStorage.removeItem(this.CACHE_KEY);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  setCache(data) {
    localStorage.setItem(
      this.CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  },

  isRateLimited() {
    try {
      const raw = localStorage.getItem(this.RATE_LIMIT_KEY);
      if (!raw) return false;
      const requests = JSON.parse(raw).filter(t => Date.now() - t < 60000);
      localStorage.setItem(this.RATE_LIMIT_KEY, JSON.stringify(requests));
      return requests.length >= this.MAX_REQUESTS_PER_MINUTE;
    } catch {
      return false;
    }
  },

  recordRequest() {
    try {
      const raw = localStorage.getItem(this.RATE_LIMIT_KEY);
      const requests = raw ? JSON.parse(raw) : [];
      requests.push(Date.now());
      localStorage.setItem(this.RATE_LIMIT_KEY, JSON.stringify(requests));
    } catch {
      // ignore
    }
  },

  clearCache() {
    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem(this.VARIETY_KEY);
  },

  // ─── UTILITY ───

  isAvailable(qb) {
    if (!qb.settings.aiEnabled) return false;
    const provider = qb.settings.aiProvider || 'server';
    if (provider === 'server') {
      // Server proxy is always available if enabled (server has the key)
      return true;
    }
    if (provider === 'chrome') {
      return !!(window.ai && window.ai.languageModel);
    }
    return !!(qb.settings.aiApiKey && qb.settings.aiApiKey.length > 10);
  }
};

