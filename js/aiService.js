// ===== AI SERVICE - REAL LLM INTEGRATION =====

const AIService = {
  CACHE_KEY: 'ai_suggestions_cache_v2',
  CACHE_TTL_MS: 3 * 60 * 1000, // 3 minutes
  RATE_LIMIT_KEY: 'ai_rate_limit_v2',
  MAX_REQUESTS_PER_MINUTE: 8,
  VARIETY_KEY: 'ai_suggestion_history',
  MAX_HISTORY: 50,

  // ─── MOOD PROFILES — Detailed guidance for AI generation ───

  MOOD_PROFILES: {
    focused: {
      description: 'The user is in a deep-work, high-concentration state. They want to tackle meaningful tasks with full attention.',
      difficultyBias: 'medium to hard',
      categoryBias: 'main, side',
      tone: 'direct, purposeful, action-oriented',
      rules: [
        'Prioritize single-task quests that require sustained attention',
        'Suggest medium or hard difficulty quests — the user wants to engage their mind',
        'Avoid social or highly fragmented tasks',
        'Descriptions should emphasize focus blocks, uninterrupted time, and deep engagement',
        'Include at least one "main" category quest'
      ],
      examples: ['Deep Work Session on [topic]', 'Single-Task Sprint: 45 min uninterrupted', 'Complete the hardest pending quest', 'Refine or perfect a current project']
    },
    relaxed: {
      description: 'The user wants low-pressure, gentle progress. They are not looking for intense challenges.',
      difficultyBias: 'easy',
      categoryBias: 'daily, side',
      tone: 'calm, encouraging, low-stakes',
      rules: [
        'Suggest ONLY easy difficulty quests',
        'Prioritize daily maintenance and light side quests',
        'Avoid hard quests or anything with tight deadlines',
        'Descriptions should emphasize enjoyment, mindfulness, and process over outcome',
        'Include restorative or organizing tasks'
      ],
      examples: ['Light tidying or organizing', '15-minute mindful walk', 'Gentle reading or journaling', 'Water plants or small maintenance']
    },
    challenged: {
      description: 'The user is feeling ambitious, energized by difficulty, or wants to prove something to themselves.',
      difficultyBias: 'hard',
      categoryBias: 'main, weekly',
      tone: 'motivational, bold, pushing boundaries',
      rules: [
        'Suggest mostly hard difficulty quests — the user WANTS a challenge',
        'Prioritize main and weekly category quests',
        'Frame descriptions as breakthroughs, limits to push, or skills to test',
        'Include at least one quest that scares them a little (in a good way)',
        'Avoid easy "filler" tasks — they will feel patronizing'
      ],
      examples: ['Tackle your hardest pending quest', 'Learn something completely new in [topic]', 'Double your usual output goal', 'Attempt a project you think is too big']
    },
    creative: {
      description: 'The user is in an exploratory, playful, idea-generating mindset. They want novelty and self-expression.',
      difficultyBias: 'easy to medium',
      categoryBias: 'side',
      tone: 'playful, experimental, imaginative',
      rules: [
        'Suggest creative, open-ended, or experimental quests',
        'Prioritize side quests that allow exploration',
        'Include cross-topic hybrid ideas (e.g., music + cooking)',
        'Descriptions should invite play, curiosity, and "what if" thinking',
        'Avoid rigid, repetitive, or highly structured tasks'
      ],
      examples: ['Try a completely new technique in [topic]', 'Combine two interests in one quest', 'Create something with no rules or expectations', 'Explore an idea you have been saving for later']
    },
    social: {
      description: 'The user wants connection, collaboration, or to engage with others. They are energized by people.',
      difficultyBias: 'easy to medium',
      categoryBias: 'side, weekly',
      tone: 'warm, collaborative, community-minded',
      rules: [
        'Suggest quests that involve other people directly or indirectly',
        'Include teaching, sharing, networking, or helping others',
        'Collaborative or communicative tasks are ideal',
        'Descriptions should emphasize connection, shared goals, or giving back',
        'Include at least one quest that strengthens a relationship'
      ],
      examples: ['Teach someone a skill you know', 'Reach out to a friend or colleague', 'Join or contribute to a community', 'Collaborate on a shared project']
    }
  },

  // ─── MAIN ENTRY POINT ───

  async generateSuggestions(qb, currentMood) {
    console.log('[AIService] generateSuggestions called. aiEnabled:', qb.settings.aiEnabled, 'provider:', qb.settings.aiProvider);
    if (!qb.settings.aiEnabled) {
      console.log('[AIService] AI not enabled, skipping');
      throw new Error('AI is not enabled in settings');
    }

    const cached = this.getCached();
    if (cached) {
      console.log('[AIService] Returning cached suggestions');
      return cached;
    }

    if (this.isRateLimited()) {
      console.log('[AIService] Rate limited, skipping');
      throw new Error('Rate limited — too many requests. Try again in a minute.');
    }

    const provider = qb.settings.aiProvider || 'pollinations';
    console.log('[AIService] Using provider:', provider);

    let result;
    if (provider === 'pollinations') {
      result = await this.callPollinations(qb, currentMood);
    } else if (provider === 'server') {
      result = await this.callServerProxy(qb, currentMood);
    } else if (provider === 'gemini') {
      const apiKey = qb.settings.aiApiKey;
      console.log('[AIService] Gemini API key present:', !!apiKey, 'length:', apiKey?.length);
      if (!apiKey) throw new Error('No Gemini API key configured');
      result = await this.callGemini(qb, currentMood, apiKey);
    } else if (provider === 'openai') {
      const apiKey = qb.settings.aiApiKey;
      if (!apiKey) throw new Error('No OpenAI API key configured');
      result = await this.callOpenAI(qb, currentMood, apiKey);
    } else if (provider === 'chrome') {
      result = await this.callChromeAI(qb, currentMood);
    }

    console.log('[AIService] Provider returned result:', result);

    if (!result || result.length === 0) {
      throw new Error('AI returned empty suggestions');
    }

    this.setCache(result);
    this.recordRequest();
    this.trackHistory(result);
    return result;
  },

  // ─── CUSTOM PROMPT ENTRY POINT ───

  async generateCustomSuggestions(qb, currentMood, userPrompt) {
    console.log('[AIService] generateCustomSuggestions called. aiEnabled:', qb.settings.aiEnabled, 'provider:', qb.settings.aiProvider);
    if (!qb.settings.aiEnabled) {
      throw new Error('AI is not enabled in settings');
    }

    if (this.isRateLimited()) {
      throw new Error('Rate limited — too many requests. Try again in a minute.');
    }

    const provider = qb.settings.aiProvider || 'pollinations';
    console.log('[AIService] Using provider for custom prompt:', provider);

    let result;
    if (provider === 'pollinations') {
      result = await this.callPollinationsCustom(qb, currentMood, userPrompt);
    } else if (provider === 'server') {
      result = await this.callServerProxyCustom(qb, currentMood, userPrompt);
    } else if (provider === 'gemini') {
      const apiKey = qb.settings.aiApiKey;
      if (!apiKey) throw new Error('No Gemini API key configured');
      result = await this.callGeminiCustom(qb, currentMood, userPrompt, apiKey);
    } else if (provider === 'openai') {
      const apiKey = qb.settings.aiApiKey;
      if (!apiKey) throw new Error('No OpenAI API key configured');
      result = await this.callOpenAICustom(qb, currentMood, userPrompt, apiKey);
    } else if (provider === 'chrome') {
      result = await this.callChromeAICustom(qb, currentMood, userPrompt);
    }

    console.log('[AIService] Custom prompt provider returned result:', result);

    if (!result || result.length === 0) {
      throw new Error('AI returned empty suggestions');
    }

    this.recordRequest();
    this.trackHistory(result);
    return result;
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

  async callServerProxyCustom(qb, currentMood, userPrompt) {
    const prompt = this.buildPrompt(qb, currentMood, userPrompt);

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

  buildPrompt(qb, currentMood, customUserPrompt = null) {
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

    // Build mood guidance from MOOD_PROFILES
    const moodProfile = this.MOOD_PROFILES[currentMood] || this.MOOD_PROFILES.focused;
    const moodGuidance = `MOOD PROFILE — ${currentMood.toUpperCase()}:\n${moodProfile.description}\n- Difficulty bias: ${moodProfile.difficultyBias}\n- Category bias: ${moodProfile.categoryBias}\n- Tone: ${moodProfile.tone}\n- Mood-specific rules:\n${moodProfile.rules.map(r => '  • ' + r).join('\n')}\n- Example quests for this mood: ${moodProfile.examples.join('; ')}`;

    const customSection = customUserPrompt
      ? `\nUSER'S CUSTOM REQUEST:\n"""${customUserPrompt}"""\nIncorporate this request into your suggestions while still respecting the mood profile and quest history above.`
      : '';

    return `You are an elite personal growth coach and quest designer for a gamified productivity app called "Quest Board". The user is an adventurer who completes quests (tasks) to gain XP and level up.\n\nUSER PROFILE:\n- Name: ${qb.settings.name || 'Adventurer'}\n- Level: ${qb.level} | Streak: ${qb.streak} days\n- Current mood: ${currentMood}\n- Time of day: ${timeOfDay} (${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})\n- Completion rate: ${(patterns.completionRate * 100).toFixed(0)}%\n- Preferred productivity time: ${patterns.preferredTime}\n- Workload stress: ${patterns.workloadScore}/3\n- Overdue quests: ${patterns.overdueCount}\n\n${moodGuidance}\n\nQUEST HISTORY ANALYSIS:\nTotal quests: ${allQuests.length} | Completed: ${completedQuests.length} | Pending: ${pendingQuests.length}\nCategory distribution: ${catBreakdown}\nDifficulty distribution: ${diffBreakdown}\nTime-of-day pattern: ${timePattern}\nDetected interest topics: ${topics}\nInferred skill areas: ${skillAreas.join(', ') || 'still discovering'}\n\nRECENTLY COMPLETED QUESTS:\n${recentCompleted}\n\nPENDING QUESTS:\n${pendingList}\n\nPREVIOUSLY SUGGESTED (AVOID REPEATING):\n${recentTitles}${customSection}\n\nYOUR TASK:\nGenerate 6-8 quest suggestions that are:\n1. HIGHLY SPECIFIC to the user's detected interests and skills\n2. MOOD-FIRST — at least 60% of suggestions must strongly reflect the current mood profile above\n3. VARIED — mix different categories, difficulties, and types (within mood constraints)\n4. SKILL-BUILDING — each quest should help the user improve in a concrete way\n5. PERSONALITY-FITTING — match the user's apparent personality from their quest patterns\n6. CONTEXT-AWARE — consider workload, time of day, and overdue items\n7. CREATIVE — use adventure/RPG themed language but keep tasks actionable\n\nFor each suggestion, provide:\n- title: specific, creative quest name (NOT generic)\n- category: one of [daily, weekly, side, main]\n- difficulty: one of [easy, medium, hard]\n- description: 1-2 sentences explaining WHY this quest matters for THEM specifically. The tone MUST match the mood profile.\n- reason: one of [streak, overdue, time, balance, progression, recovery, mood, habit, skill, creative, challenge, wellness]\n\nCRITICAL RULES:\n- NEVER suggest something they've recently done\n- If they have many pending hard quests, suggest easier ones\n- If their completion rate is low, suggest quick wins\n- If they have a dominant topic, suggest quests that EXPAND their skills\n- Include at least ONE quest from a category they rarely use\n- Include at least ONE quest that challenges them slightly (if mood allows)\n- Include at least ONE creative/unusual quest\n- MOOD IS PARAMOUNT: every suggestion must feel like it was crafted specifically for someone feeling "${currentMood}"\n\nReturn ONLY a valid JSON array. No markdown, no explanation.`;
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
    console.log('[AIService] Calling Gemini API...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 4096
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('[AIService] Gemini API error:', response.status, err);
      throw new Error(`Gemini API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    console.log('[AIService] Gemini response:', data);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    return this.parseResponse(text);
  },

  async callGeminiCustom(qb, currentMood, userPrompt, apiKey) {
    const prompt = this.buildPrompt(qb, currentMood, userPrompt);
    console.log('[AIService] Calling Gemini API with custom prompt...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 4096
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('[AIService] Gemini API error:', response.status, err);
      throw new Error(`Gemini API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    console.log('[AIService] Gemini custom response:', data);
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

  async callOpenAICustom(qb, currentMood, userPrompt, apiKey) {
    const prompt = this.buildPrompt(qb, currentMood, userPrompt);
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

  // ─── PROVIDER: POLLINATIONS AI (FREE, NO KEY) ───

  async callPollinations(qb, currentMood) {
    const prompt = this.buildPrompt(qb, currentMood);
    console.log('[AIService] Calling Pollinations AI...');
    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages: [
          {
            role: 'system',
            content: 'You are a personal growth coach. Return only valid JSON arrays of quest suggestions. No markdown, no explanation.'
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
      console.error('[AIService] Pollinations API error:', response.status, err);
      throw new Error(`Pollinations API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    console.log('[AIService] Pollinations response:', data);
    const text = data.choices?.[0]?.message?.content || '[]';
    return this.parseResponse(text);
  },

  async callPollinationsCustom(qb, currentMood, userPrompt) {
    const prompt = this.buildPrompt(qb, currentMood, userPrompt);
    console.log('[AIService] Calling Pollinations AI with custom prompt...');
    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages: [
          {
            role: 'system',
            content: 'You are a personal growth coach. Return only valid JSON arrays of quest suggestions. No markdown, no explanation.'
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
      console.error('[AIService] Pollinations API error:', response.status, err);
      throw new Error(`Pollinations API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    console.log('[AIService] Pollinations custom response:', data);
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

  async callChromeAICustom(qb, currentMood, userPrompt) {
    if (!window.ai || !window.ai.languageModel) {
      throw new Error('Chrome Built-in AI not available');
    }

    const session = await window.ai.languageModel.create({
      systemPrompt: 'You are a personal growth coach. Return only valid JSON arrays of quest suggestions.'
    });

    const prompt = this.buildPrompt(qb, currentMood, userPrompt);
    const result = await session.prompt(prompt);
    session.destroy();

    return this.parseResponse(result);
  },

  // ─── RESPONSE PARSING ───

  parseResponse(text) {
    console.log('[AIService] Parsing response, text length:', text?.length);
    try {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const cleanText = jsonMatch ? jsonMatch[1] : text;
      const parsed = JSON.parse(cleanText);

      const suggestions = Array.isArray(parsed)
        ? parsed
        : parsed.suggestions || parsed.quests || parsed.data || [];

      console.log('[AIService] Parsed suggestions count:', suggestions.length);

      const validReasons = [
        'streak', 'overdue', 'time', 'balance', 'progression',
        'recovery', 'mood', 'habit', 'skill', 'creative', 'challenge', 'wellness'
      ];

      const valid = suggestions
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

      if (valid.length === 0) {
        throw new Error('AI response contained no valid suggestions');
      }
      return valid;
    } catch (e) {
      console.error('[AIService] Failed to parse AI response:', e, 'Raw text:', text?.substring(0, 500));
      throw new Error(`Failed to parse AI response: ${e.message}`);
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
    const provider = qb.settings.aiProvider || 'pollinations';
    if (provider === 'pollinations' || provider === 'server') {
      // These providers need no user API key
      return true;
    }
    if (provider === 'chrome') {
      return !!(window.ai && window.ai.languageModel);
    }
    return !!(qb.settings.aiApiKey && qb.settings.aiApiKey.length > 10);
  }
};

