// ===== SMART QUEST SUGGESTIONS (AI-POWERED) =====

const Suggestions = {
  currentMood: 'focused',
  _usedIndices: {}, // Track used template indices for variety
  _lastGenerated: 0,

  TOPIC_KEYWORDS: {
    sewing: ['sew','sewing','stitch','fabric','pattern','quilt','embroider','hem','thread','needle','seam','garment','clothes','dress','patch','zipper','button'],
    coding: ['code','coding','program','programming','debug','develop','app','website','software','script','function','bug','git','deploy','api','database','refactor'],
    reading: ['read','reading','book','novel','chapter','literature','audiobook','ebook','kindle','library','study','research','paper','journal'],
    writing: ['write','writing','blog','essay','draft','journal','story','article','content','copy','edit','proofread','manuscript','poem','script'],
    cooking: ['cook','cooking','bake','baking','recipe','meal','dinner','lunch','breakfast','grocery','kitchen','prep','food','cuisine','grill','roast'],
    fitness: ['workout','gym','exercise','run','running','jog','yoga','pilates','lift','cardio','stretch','walk','hike','swim','sport','train','squat'],
    art: ['draw','drawing','paint','painting','sketch','art','illustrate','design','color','canvas','portrait','landscape','creative','sculpture'],
    music: ['music','practice','guitar','piano','violin','sing','song','compose','rehearse','instrument','drum','band','orchestra','melody','chord'],
    gardening: ['garden','gardening','plant','water','weed','prune','flower','vegetable','herb','soil','compost','greenhouse','harvest','seed','sprout'],
    studying: ['study','homework','assignment','exam','test','quiz','lecture','course','class','learn','revision','notes','flashcard','thesis','project'],
    cleaning: ['clean','tidy','organize','declutter','laundry','vacuum','dust','mop','dishes','wash','fold','scrub','sanitize','closet','garage'],
    shopping: ['shop','shopping','buy','purchase','groceries','mall','store','order','amazon','budget','list','supplies','materials'],
    gaming: ['game','gaming','play','stream','twitch','level','quest','raid','rank','competitive','esports','console','pc'],
    photography: ['photo','photography','shoot','camera','edit','lightroom','photoshop','portrait','landscape','album','gallery'],
    crafting: ['craft','crafting','diy','knit','crochet','woodwork','pottery','jewelry','bead','scrapbook','origami','model','build'],
    finance: ['budget','finance','save','invest','tax','bill','expense','income','account','bank','money','debt','retirement','stock'],
    health: ['doctor','dentist','appointment','medication','vitamin','sleep','hydrate','meditate','mental','therapy','checkup','wellness'],
    social: ['call','message','email','meet','lunch','coffee','date','party','event','friend','family','network','connect','catchup'],
    travel: ['travel','trip','vacation','flight','hotel','pack','passport','itinerary','booking','drive','roadtrip','explore']
  },

  // Expanded templates with much more variety
  TOPIC_TEMPLATES: {
    sewing: [
      {title:'Sew a New Pattern',desc:'Pick a fresh pattern and cut your fabric. A new creation awaits!',category:'side',diff:'medium'},
      {title:'Organize Thread Collection',desc:'Sort threads by color and check which spools are running low.',category:'daily',diff:'easy'},
      {title:'Hem or Mend Garments',desc:'Fix those pants that are too long or patch a worn favorite.',category:'weekly',diff:'easy'},
      {title:'Embroider a Detail',desc:'Add a personal embroidered touch to a plain piece.',category:'side',diff:'medium'},
      {title:'Plan a Quilt Block',desc:'Design and cut pieces for your next quilt block.',category:'main',diff:'hard'},
      {title:'Sew Buttonholes',desc:'Practice making clean buttonholes on scrap fabric.',category:'daily',diff:'easy'},
      {title:'Draft a Custom Pattern',desc:'Take body measurements and draft a simple pattern from scratch.',category:'main',diff:'hard'},
      {title:'Learn a New Stitch Type',desc:'Watch a tutorial on French seams or flat-felled seams.',category:'side',diff:'medium'},
      {title:'Upcycle Old Clothing',desc:'Transform an unworn garment into something fresh and wearable.',category:'side',diff:'medium'},
      {title:'Organize Sewing Space',desc:'Clean and reorganize your sewing area for better workflow.',category:'daily',diff:'easy'}
    ],
    coding: [
      {title:'Refactor One Function',desc:'Clean up a messy function — better readability, same behavior.',category:'daily',diff:'medium'},
      {title:'Write Unit Tests',desc:'Add tests for a module you recently changed. Future you will thank you.',category:'side',diff:'medium'},
      {title:'Fix a Bug',desc:'Squash that annoying bug you have been putting off.',category:'daily',diff:'easy'},
      {title:'Deploy to Production',desc:'Push your latest changes live and monitor for issues.',category:'main',diff:'hard'},
      {title:'Review Pull Request',desc:'Help a teammate by reviewing their code with thoughtful feedback.',category:'side',diff:'easy'},
      {title:'Update Documentation',desc:'Write clear docs for a feature you built recently.',category:'daily',diff:'easy'},
      {title:'Learn a New Design Pattern',desc:'Study and implement one design pattern you have not used before.',category:'main',diff:'hard'},
      {title:'Optimize a Slow Query',desc:'Find and fix a database query that is causing performance issues.',category:'side',diff:'hard'},
      {title:'Build a Mini Side Project',desc:'Create a small tool or script that solves a personal problem.',category:'side',diff:'medium'},
      {title:'Read Source Code of a Library',desc:'Pick an open-source library you use and understand how it works.',category:'weekly',diff:'medium'}
    ],
    reading: [
      {title:'Read One Chapter',desc:'Dive into your current book. Just one chapter to keep momentum.',category:'daily',diff:'easy'},
      {title:'Take Reading Notes',desc:'Jot down key ideas and quotes from your latest read.',category:'side',diff:'easy'},
      {title:'Start a New Book',desc:'Finish your current read and pick the next one from your list.',category:'main',diff:'medium'},
      {title:'Research a Topic',desc:'Deep-dive into a subject that fascinates you. Gather sources.',category:'weekly',diff:'medium'},
      {title:'Join a Book Discussion',desc:'Share your thoughts on a recent read with a friend or club.',category:'side',diff:'easy'},
      {title:'Read Outside Your Genre',desc:'Pick up something completely different from your usual reads.',category:'side',diff:'medium'},
      {title:'Summarize What You Read',desc:'Write a one-page summary of a book or article you finished.',category:'weekly',diff:'medium'},
      {title:'Create a Reading List',desc:'Curate a themed list of 5 books you want to read this year.',category:'daily',diff:'easy'}
    ],
    writing: [
      {title:'Morning Pages',desc:'Write three pages of stream-of-consciousness to clear your mind.',category:'daily',diff:'easy'},
      {title:'Edit a Draft',desc:'Polish a piece you wrote recently. Cut the fluff, sharpen the message.',category:'side',diff:'medium'},
      {title:'Outline Next Article',desc:'Map out the structure for your next blog post or essay.',category:'weekly',diff:'easy'},
      {title:'Submit to Publication',desc:'Send your polished piece to a magazine, blog, or contest.',category:'main',diff:'hard'},
      {title:'Character Development',desc:'Flesh out a character backstory or motivation arc.',category:'side',diff:'medium'},
      {title:'Write in a Different Style',desc:'Try writing poetry, flash fiction, or a dialogue-only scene.',category:'side',diff:'medium'},
      {title:'Analyze Your Favorite Author',desc:'Study a passage you love and identify what makes it work.',category:'weekly',diff:'medium'},
      {title:'Write a Letter to Your Future Self',desc:'Reflect on where you are and where you want to be.',category:'daily',diff:'easy'}
    ],
    cooking: [
      {title:'Prep Ingredients',desc:'Wash, chop, and organize ingredients for tonight\'s meal.',category:'daily',diff:'easy'},
      {title:'Try a New Recipe',desc:'Cook something you have never made before. Adventure in the kitchen!',category:'side',diff:'medium'},
      {title:'Meal Prep for Week',desc:'Batch-cook proteins and veggies to save time later.',category:'weekly',diff:'medium'},
      {title:'Bake Something Sweet',desc:'Cookies, cake, or bread — treat yourself and others.',category:'side',diff:'medium'},
      {title:'Plan Weekly Menu',desc:'Design a balanced menu and build your grocery list.',category:'main',diff:'easy'},
      {title:'Master a Knife Skill',desc:'Practice julienne, brunoise, or chiffonade cuts.',category:'side',diff:'medium'},
      {title:'Cook a Cuisine You Never Tried',desc:'Pick a culture\'s cuisine and make an authentic dish.',category:'main',diff:'hard'},
      {title:'Ferment Something',desc:'Try making kimchi, sourdough starter, or pickled vegetables.',category:'weekly',diff:'hard'}
    ],
    fitness: [
      {title:'Morning Stretch Routine',desc:'Wake up your body with 10 minutes of gentle stretching.',category:'daily',diff:'easy'},
      {title:'Go for a Run',desc:'Hit the pavement or trail. Set a distance or time goal.',category:'side',diff:'medium'},
      {title:'Strength Training',desc:'Lift weights or do bodyweight exercises. Push your limits!',category:'weekly',diff:'hard'},
      {title:'Yoga Flow Session',desc:'Unwind with a calming yoga practice. Breathe deeply.',category:'side',diff:'easy'},
      {title:'Track Your Progress',desc:'Log your workouts and note improvements in strength or endurance.',category:'daily',diff:'easy'},
      {title:'Try a New Sport',desc:'Pick up something you have never done — climbing, swimming, boxing.',category:'side',diff:'medium'},
      {title:'Create a Workout Playlist',desc:'Curate music that pumps you up for different workout types.',category:'daily',diff:'easy'},
      {title:'Plan a Fitness Challenge',desc:'Design a 30-day challenge for yourself with progressive goals.',category:'main',diff:'medium'}
    ],
    art: [
      {title:'Sketch for 15 Minutes',desc:'Quick gesture drawings or doodles to warm up your hand.',category:'daily',diff:'easy'},
      {title:'Study a Reference',desc:'Analyze a photo or masterwork. Break down shapes and values.',category:'side',diff:'easy'},
      {title:'Finish a Piece',desc:'Push that work-in-progress to completion. Details matter!',category:'main',diff:'medium'},
      {title:'Experiment with Color',desc:'Try a new palette or mixing technique. Play and discover.',category:'side',diff:'medium'},
      {title:'Frame or Display Art',desc:'Prepare a finished piece for showing. Presentation counts!',category:'weekly',diff:'easy'},
      {title:'Draw With Your Non-Dominant Hand',desc:'Challenge yourself with a different approach to line work.',category:'side',diff:'medium'},
      {title:'Visit a Museum or Gallery',desc:'Get inspired by seeing art in person. Take notes.',category:'weekly',diff:'easy'},
      {title:'Teach Someone a Technique',desc:'Share your knowledge by teaching a friend one art skill.',category:'side',diff:'medium'}
    ],
    music: [
      {title:'Scale Practice',desc:'Run through scales and arpeggios to build finger dexterity.',category:'daily',diff:'easy'},
      {title:'Learn a New Piece',desc:'Tackle a song or section that challenges your current skill.',category:'side',diff:'medium'},
      {title:'Record a Cover',desc:'Perform and record a song you love. Share it or keep it private.',category:'main',diff:'hard'},
      {title:'Ear Training',desc:'Practice identifying intervals, chords, or melodies by ear.',category:'side',diff:'medium'},
      {title:'Write a Short Melody',desc:'Compose something new. Even 4 bars is a win.',category:'weekly',diff:'easy'},
      {title:'Transcribe a Solo',desc:'Pick a solo you love and write it out note for note.',category:'main',diff:'hard'},
      {title:'Practice Sight Reading',desc:'Pick a piece at your level and play it without prior practice.',category:'daily',diff:'medium'},
      {title:'Explore a New Genre',desc:'Play or listen to a musical style outside your comfort zone.',category:'side',diff:'easy'}
    ],
    gardening: [
      {title:'Water the Plants',desc:'Check soil moisture and give each plant the hydration it needs.',category:'daily',diff:'easy'},
      {title:'Prune and Deadhead',desc:'Remove dead blooms and trim overgrowth for healthier plants.',category:'side',diff:'easy'},
      {title:'Plant New Seeds',desc:'Start seeds for the next growing season. Label everything!',category:'main',diff:'medium'},
      {title:'Compost Maintenance',desc:'Turn the compost pile and balance greens with browns.',category:'weekly',diff:'easy'},
      {title:'Harvest and Preserve',desc:'Pick ripe produce and try preserving or freezing extras.',category:'side',diff:'medium'},
      {title:'Research Companion Planting',desc:'Learn which plants grow well together and plan your layout.',category:'side',diff:'medium'},
      {title:'Build a Raised Bed',desc:'Construct a new growing space for next season.',category:'main',diff:'hard'},
      {title:'Create Plant Labels',desc:'Make beautiful, durable labels for all your plants.',category:'daily',diff:'easy'}
    ],
    studying: [
      {title:'Review Notes',desc:'Go over today\'s class notes and highlight key concepts.',category:'daily',diff:'easy'},
      {title:'Complete Assignment',desc:'Work on that assignment due soon. Break it into chunks.',category:'main',diff:'medium'},
      {title:'Flashcard Session',desc:'Quiz yourself with flashcards on topics you are learning.',category:'side',diff:'easy'},
      {title:'Practice Problems',desc:'Solve practice problems to reinforce your understanding.',category:'weekly',diff:'medium'},
      {title:'Study Group Prep',desc:'Prepare questions and topics for your next study group.',category:'side',diff:'easy'},
      {title:'Teach the Material',desc:'Explain a concept aloud as if teaching a student.',category:'side',diff:'medium'},
      {title:'Create a Mind Map',desc:'Visually organize a complex topic to see connections.',category:'weekly',diff:'easy'},
      {title:'Research Beyond the Syllabus',desc:'Dive deeper into a topic that sparked your curiosity.',category:'side',diff:'medium'}
    ],
    cleaning: [
      {title:'Quick Tidy-Up',desc:'Spend 15 minutes clearing surfaces and putting things away.',category:'daily',diff:'easy'},
      {title:'Deep Clean One Room',desc:'Pick one room and give it a thorough cleaning.',category:'weekly',diff:'medium'},
      {title:'Organize a Closet',desc:'Sort clothes by season and donate what you no longer wear.',category:'side',diff:'medium'},
      {title:'Laundry Day',desc:'Wash, dry, fold, and put away all your laundry.',category:'main',diff:'easy'},
      {title:'Declutter Drawer',desc:'Pick one junk drawer and make it functional again.',category:'daily',diff:'easy'},
      {title:'Clean Digital Files',desc:'Organize your downloads folder and desktop.',category:'side',diff:'easy'},
      {title:'Create a Cleaning Schedule',desc:'Design a rotation system that keeps your space consistently clean.',category:'weekly',diff:'easy'},
      {title:'Deep Clean Appliances',desc:'Clean the fridge, oven, or washing machine thoroughly.',category:'main',diff:'medium'}
    ],
    photography: [
      {title:'Photo Walk',desc:'Take a 30-minute walk and capture interesting compositions.',category:'side',diff:'easy'},
      {title:'Edit a Photo Set',desc:'Select and edit your best shots from a recent session.',category:'weekly',diff:'medium'},
      {title:'Try a New Technique',desc:'Experiment with long exposure, macro, or portrait lighting.',category:'main',diff:'hard'},
      {title:'Organize Photos',desc:'Sort and tag photos in your library. Backup the best ones.',category:'side',diff:'easy'},
      {title:'Shoot in Black & White',desc:'Set your camera to monochrome and focus on contrast and texture.',category:'side',diff:'medium'},
      {title:'Create a Photo Series',desc:'Tell a story through 5-7 connected images on a theme.',category:'main',diff:'medium'},
      {title:'Study a Master Photographer',desc:'Analyze the work of a photographer you admire.',category:'side',diff:'easy'}
    ],
    crafting: [
      {title:'Start a Small Project',desc:'Begin a quick craft you can finish in one session.',category:'side',diff:'easy'},
      {title:'Organize Supplies',desc:'Sort beads, yarn, or tools so everything is easy to find.',category:'daily',diff:'easy'},
      {title:'Learn a New Stitch',desc:'Watch a tutorial and practice a new knitting or crochet stitch.',category:'weekly',diff:'medium'},
      {title:'Gift Craft',desc:'Make a handmade gift for someone special.',category:'main',diff:'medium'},
      {title:'Upcycle Household Items',desc:'Turn something destined for trash into something beautiful.',category:'side',diff:'medium'},
      {title:'Create a Mood Board',desc:'Collect textures, colors, and ideas for your next big project.',category:'daily',diff:'easy'},
      {title:'Try a New Material',desc:'Work with something you have never used before.',category:'side',diff:'medium'}
    ],
    social: [
      {title:'Catch Up with a Friend',desc:'Call or message someone you have not spoken to in a while.',category:'side',diff:'easy'},
      {title:'Plan a Gathering',desc:'Organize a dinner, game night, or outing with friends.',category:'weekly',diff:'medium'},
      {title:'Write a Thank-You Note',desc:'Send a heartfelt note to someone who helped you recently.',category:'daily',diff:'easy'},
      {title:'Networking Coffee',desc:'Reach out to someone in your field for a virtual coffee chat.',category:'side',diff:'easy'},
      {title:'Host a Skill Share',desc:'Teach friends something you know and learn from them too.',category:'main',diff:'medium'},
      {title:'Volunteer for a Cause',desc:'Give your time to a community organization.',category:'weekly',diff:'medium'},
      {title:'Reconnect with Family',desc:'Have a meaningful conversation with a family member.',category:'side',diff:'easy'},
      {title:'Join a New Community',desc:'Find and participate in a local club or online group.',category:'side',diff:'easy'}
    ],
    finance: [
      {title:'Track Daily Spending',desc:'Log every purchase today to understand your habits.',category:'daily',diff:'easy'},
      {title:'Review Subscriptions',desc:'Cancel services you no longer use or need.',category:'side',diff:'easy'},
      {title:'Build a Budget Spreadsheet',desc:'Create a detailed monthly budget with categories.',category:'main',diff:'medium'},
      {title:'Research an Investment',desc:'Learn about one stock, fund, or investment strategy.',category:'weekly',diff:'medium'},
      {title:'Set a Savings Goal',desc:'Define a specific amount and deadline for your next savings target.',category:'side',diff:'easy'},
      {title:'Calculate Net Worth',desc:'List all assets and liabilities to see your financial picture.',category:'main',diff:'medium'},
      {title:'Automate a Bill Payment',desc:'Set up auto-pay to never miss a due date again.',category:'daily',diff:'easy'}
    ],
    health: [
      {title:'Morning Meditation',desc:'Spend 10 minutes in quiet mindfulness before the day begins.',category:'daily',diff:'easy'},
      {title:'Meal Plan for Nutrition',desc:'Design meals that hit your nutritional goals.',category:'weekly',diff:'medium'},
      {title:'Schedule a Checkup',desc:'Book that doctor or dentist appointment you have been delaying.',category:'main',diff:'easy'},
      {title:'Digital Sunset',desc:'Turn off screens one hour before bed for better sleep.',category:'daily',diff:'easy'},
      {title:'Hydration Challenge',desc:'Drink the recommended daily water intake.',category:'daily',diff:'easy'},
      {title:'Practice Gratitude Journaling',desc:'Write three things you are grateful for today.',category:'daily',diff:'easy'},
      {title:'Try a New Healthy Recipe',desc:'Cook a meal focused on whole foods and nutrition.',category:'side',diff:'medium'}
    ],
    travel: [
      {title:'Research a Destination',desc:'Pick a place you want to visit and plan an itinerary.',category:'side',diff:'easy'},
      {title:'Learn Travel Phrases',desc:'Study basic greetings in the language of your next destination.',category:'daily',diff:'easy'},
      {title:'Create a Travel Budget',desc:'Plan the finances for your next adventure.',category:'weekly',diff:'medium'},
      {title:'Pack a Go-Bag',desc:'Assemble a bag ready for spontaneous weekend trips.',category:'side',diff:'easy'},
      {title:'Explore Your Own City',desc:'Be a tourist in your hometown. Find hidden gems.',category:'side',diff:'easy'},
      {title:'Plan a Road Trip',desc:'Map out a scenic route with stops and sights.',category:'main',diff:'medium'}
    ],
    gaming: [
      {title:'Practice Mechanics',desc:'Spend time in training mode mastering a difficult technique.',category:'daily',diff:'medium'},
      {title:'Watch Pro Gameplay',desc:'Study how top players approach your favorite game.',category:'side',diff:'easy'},
      {title:'Try a New Genre',desc:'Play a game type you normally avoid for fresh perspective.',category:'side',diff:'easy'},
      {title:'Organize Game Library',desc:'Clean up your backlog and prioritize what to play next.',category:'daily',diff:'easy'},
      {title:'Join a Community Event',desc:'Participate in a tournament, raid, or online event.',category:'main',diff:'medium'},
      {title:'Review and Improve',desc:'Record your gameplay and identify areas to improve.',category:'weekly',diff:'medium'}
    ]
  },

  // Cross-topic hybrid suggestions for variety
  HYBRID_TEMPLATES: [
    {title:'Fitness + Learning Combo',desc:'Listen to an educational podcast during your workout. Double the gains!',category:'side',diff:'easy'},
    {title:'Creative Morning Routine',desc:'Spend 20 minutes on your craft right after waking up.',category:'daily',diff:'medium'},
    {title:'Social Skill Share',desc:'Teach a friend one of your skills while learning one of theirs.',category:'main',diff:'medium'},
    {title:'Nature + Photography Walk',desc:'Go outside specifically to capture nature\'s beauty today.',category:'side',diff:'easy'},
    {title:'Cooking + Music Session',desc:'Cook a new recipe while playing music you are learning.',category:'side',diff:'medium'},
    {title:'Study + Fitness Break',desc:'Do 20 minutes of study, then a 5-minute exercise burst. Repeat.',category:'weekly',diff:'medium'}
  ],

  // ─── AI ANALYSIS ENGINE ───

  analyzePatterns(qb) {
    if (!qb.quests.length) {
      return {
        favoriteCategory: 'daily',
        avgDifficulty: 'easy',
        preferredTime: 'morning',
        completionRate: 0,
        categoryBalance: { daily: 0, weekly: 0, side: 0, main: 0 },
        difficultyTrend: 1,
        streakRisk: false,
        overdueCount: 0,
        workloadScore: 0,
        dominantTopic: null,
        topicCounts: {}
      };
    }

    const completed = qb.quests.filter(q => q.completed);
    const total = qb.quests.length;
    const completionRate = total > 0 ? completed.length / total : 0;

    const categoryCounts = { daily: 0, weekly: 0, side: 0, main: 0 };
    const categoryCompleted = { daily: 0, weekly: 0, side: 0, main: 0 };
    const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
    const hours = [];

    qb.quests.forEach(q => {
      categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
      difficultyCounts[q.difficulty] = (difficultyCounts[q.difficulty] || 0) + 1;
      if (q.completed) {
        categoryCompleted[q.category] = (categoryCompleted[q.category] || 0) + 1;
        if (q.completedAt) {
          hours.push(new Date(q.completedAt).getHours());
        }
      }
    });

    const favoriteCategory = Object.entries(categoryCompleted)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'daily';

    const avgDiff = Object.entries(difficultyCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'easy';

    const avgHour = hours.length ? hours.reduce((a, b) => a + b, 0) / hours.length : 12;
    let preferredTime = 'morning';
    if (avgHour >= 17) preferredTime = 'evening';
    else if (avgHour >= 12) preferredTime = 'afternoon';

    const difficultyTrend = completed
      .slice(-5)
      .map(q => ({ easy: 1, medium: 2, hard: 3 }[q.difficulty] || 1));
    const avgTrend = difficultyTrend.length
      ? difficultyTrend.reduce((a, b) => a + b, 0) / difficultyTrend.length
      : 1;

    const dailyQuests = qb.quests.filter(q => q.category === 'daily');
    const hasDaily = dailyQuests.length > 0;
    const allDailyDone = hasDaily && dailyQuests.every(q => q.completed);
    const streakRisk = hasDaily && !allDailyDone && qb.streak > 0;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const overdueCount = qb.quests.filter(q => {
      if (!q.dueDate || q.completed) return false;
      return q.dueDate < todayStr;
    }).length;

    const pendingHard = qb.quests.filter(q => !q.completed && q.difficulty === 'hard').length;
    const pendingTotal = qb.quests.filter(q => !q.completed).length;
    const workloadScore = pendingTotal > 5 ? (pendingHard > 2 ? 3 : 2) : pendingHard > 1 ? 2 : 1;

    const topicData = this.detectTopics(qb);

    return {
      favoriteCategory,
      avgDifficulty: avgDiff,
      preferredTime,
      completionRate,
      categoryBalance: categoryCounts,
      difficultyTrend: avgTrend,
      streakRisk,
      overdueCount,
      workloadScore,
      hasDaily,
      allDailyDone,
      dominantTopic: topicData.dominantTopic,
      topicCounts: topicData.topicCounts
    };
  },

  // ─── SMART TOPIC DETECTION ───

  detectTopics(qb) {
    const topicCounts = {};
    const allTitles = qb.quests.map(q => q.title.toLowerCase()).join(' ');

    for (const [topic, keywords] of Object.entries(this.TOPIC_KEYWORDS)) {
      let count = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        const matches = allTitles.match(regex);
        if (matches) count += matches.length;
      }
      if (count > 0) topicCounts[topic] = count;
    }

    const dominantTopic = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return { dominantTopic, topicCounts };
  },

  // ─── GENERATE AI INSIGHTS ───

  generateInsights(qb) {
    const p = this.analyzePatterns(qb);
    const insights = [];

    if (qb.quests.length === 0) {
      insights.push({ icon: '🌟', text: 'Welcome! Start with a simple daily quest to build momentum.', type: 'tip' });
      return insights;
    }

    if (p.streakRisk) {
      insights.push({ icon: '⚠️', text: `Your ${qb.streak}-day streak is at risk! Complete your daily quests.`, type: 'warning' });
    }

    if (p.overdueCount > 0) {
      insights.push({ icon: '⏰', text: `You have ${p.overdueCount} overdue quest${p.overdueCount > 1 ? 's' : ''}. Consider breaking them into smaller tasks.`, type: 'warning' });
    }

    if (p.completionRate < 0.3 && qb.quests.length > 5) {
      insights.push({ icon: '📉', text: 'Your completion rate is low. Try easier quests to rebuild confidence.', type: 'warning' });
    } else if (p.completionRate > 0.8) {
      insights.push({ icon: '🔥', text: 'Amazing completion rate! You\'re on fire — try a harder challenge?', type: 'success' });
    }

    if (p.workloadScore >= 3) {
      insights.push({ icon: '😰', text: 'Your quest load looks heavy. Focus on easy wins today.', type: 'warning' });
    }

    const underrepresented = Object.entries(p.categoryBalance)
      .filter(([, count]) => count === 0)
      .map(([cat]) => cat);
    if (underrepresented.length > 0) {
      insights.push({ icon: '⚖️', text: `No ${underrepresented[0]} quests yet. Balance your adventure!`, type: 'tip' });
    }

    if (p.dominantTopic) {
      const topicEmoji = {
        sewing: '🧵', coding: '💻', reading: '📚', writing: '✍️', cooking: '🍳',
        fitness: '💪', art: '🎨', music: '🎵', gardening: '🌱', studying: '📖',
        cleaning: '🧹', shopping: '🛒', gaming: '🎮', photography: '📷',
        crafting: '✂️', finance: '💰', health: '❤️', social: '👥', travel: '✈️'
      }[p.dominantTopic] || '✨';
      insights.push({ icon: topicEmoji, text: `Your quests show a strong ${p.dominantTopic} theme. Keep nurturing that passion!`, type: 'success' });
    }

    if (insights.length === 0) {
      insights.push({ icon: '✨', text: `You're most productive in the ${p.preferredTime}. Keep it up!`, type: 'tip' });
    }

    return insights;
  },

  // ─── VARIED LOCAL TEMPLATE SUGGESTIONS (FALLBACK) ───

  _getShuffledTemplates(topic) {
    const templates = this.TOPIC_TEMPLATES[topic];
    if (!templates || templates.length === 0) return [];
    // Shuffle using Fisher-Yates
    const shuffled = [...templates];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  _pickVaried(templates, count) {
    if (templates.length <= count) return templates;
    const shuffled = [...templates];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  },

  generateLocalSuggestions(qb) {
    const p = this.analyzePatterns(qb);
    const suggestions = [];
    const now = new Date();
    const usedTitles = new Set();

    const moodDiffModifiers = { focused: 0, relaxed: -1, challenged: 1, creative: 0, social: 0 };
    const diffLevels = ['easy', 'medium', 'hard'];
    let targetDiffIndex = diffLevels.indexOf(p.avgDifficulty) + (moodDiffModifiers[this.currentMood] || 0);
    targetDiffIndex = Math.max(0, Math.min(2, targetDiffIndex));
    const targetDiff = diffLevels[targetDiffIndex];

    const addUnique = (s) => {
      if (!usedTitles.has(s.title)) {
        usedTitles.add(s.title);
        suggestions.push(s);
      }
    };

    // 1. Streak preservation
    if (p.streakRisk) {
      const pendingDaily = qb.quests.find(q => q.category === 'daily' && !q.completed);
      if (pendingDaily) {
        addUnique({
          title: `Complete: ${pendingDaily.title}`,
          category: 'daily',
          difficulty: pendingDaily.difficulty,
          description: '🔥 Priority: Save your streak! This daily quest needs completion.',
          isPriority: true,
          reason: 'streak'
        });
      } else {
        addUnique({
          title: 'Quick Daily Win',
          category: 'daily',
          difficulty: 'easy',
          description: '🔥 Start a new daily quest to keep your streak alive!',
          isPriority: true,
          reason: 'streak'
        });
      }
    }

    // 2. Overdue quest
    if (p.overdueCount > 0) {
      const overdue = qb.quests.find(q => q.dueDate && !q.completed && q.dueDate < now.toISOString().split('T')[0]);
      if (overdue) {
        addUnique({
          title: `Tackle: ${overdue.title}`,
          category: overdue.category,
          difficulty: 'easy',
          description: `⏰ This was due ${overdue.dueDate}. Break it into smaller steps!`,
          isPriority: true,
          reason: 'overdue'
        });
      }
    }

    // 3. Topic-based suggestions (pick 2 varied ones)
    if (p.dominantTopic && this.TOPIC_TEMPLATES[p.dominantTopic]) {
      const topicTemplates = this._getShuffledTemplates(p.dominantTopic);
      topicTemplates.slice(0, 2).forEach(template => {
        addUnique({
          title: template.title,
          category: template.category,
          difficulty: template.diff,
          description: `🧠 Based on your ${p.dominantTopic} interests: ${template.desc}`,
          reason: 'habit'
        });
      });
    }

    // 4. Secondary topic (if exists)
    const topicEntries = Object.entries(p.topicCounts).sort((a, b) => b[1] - a[1]);
    if (topicEntries.length > 1) {
      const secondTopic = topicEntries[1][0];
      const secondTemplates = this._getShuffledTemplates(secondTopic);
      if (secondTemplates.length > 0) {
        const t = secondTemplates[0];
        addUnique({
          title: t.title,
          category: t.category,
          difficulty: t.diff,
          description: `🌱 Your secondary interest ${secondTopic}: ${t.desc}`,
          reason: 'skill'
        });
      }
    }

    // 5. Hybrid suggestion for variety
    if (Math.random() > 0.3 && this.HYBRID_TEMPLATES.length > 0) {
      const hybrid = this.HYBRID_TEMPLATES[Math.floor(Math.random() * this.HYBRID_TEMPLATES.length)];
      addUnique({
        title: hybrid.title,
        category: hybrid.category,
        difficulty: hybrid.difficulty,
        description: hybrid.desc,
        reason: 'creative'
      });
    }

    // 6. Time-appropriate
    const timeSuggestions = {
      morning: [
        { title: 'Morning Routine Quest', category: 'daily', desc: '🌅 Start your day strong with a quick win that sets the tone.' },
        { title: 'Sunrise Skill Practice', category: 'side', desc: '🌅 Dedicate 20 minutes to your craft while your mind is fresh.' }
      ],
      afternoon: [
        { title: 'Afternoon Focus Quest', category: 'side', desc: '☀️ Tackle something meaningful while your energy is at its peak.' },
        { title: 'Midday Momentum Builder', category: 'daily', desc: '☀️ A quick task to keep your day moving forward.' }
      ],
      evening: [
        { title: 'Evening Wind-Down', category: 'daily', desc: '🌙 A light quest to end the day on a positive, restful note.' },
        { title: 'Night Reflection Quest', category: 'side', desc: '🌙 Review your day and plan one thing to improve tomorrow.' }
      ]
    };
    const timeOpts = timeSuggestions[p.preferredTime] || timeSuggestions.morning;
    const timeSugg = timeOpts[Math.floor(Math.random() * timeOpts.length)];
    addUnique({
      title: timeSugg.title,
      category: timeSugg.category,
      difficulty: targetDiff,
      description: timeSugg.desc,
      reason: 'time'
    });

    // 7. Category balance
    const catCounts = { daily: 0, weekly: 0, side: 0, main: 0 };
    qb.quests.forEach(q => { catCounts[q.category]++; });
    const lowestCat = Object.entries(catCounts).sort((a, b) => a[1] - b[1])[0][0];
    const catTitles = {
      daily: ['Daily Discipline', 'Habit Builder', 'Morning Ritual', 'Consistency Check'],
      weekly: ['Weekly Challenge', 'Big Picture Task', 'Week Goal', 'Strategic Planning'],
      side: ['Side Adventure', 'Bonus Mission', 'Exploration Quest', 'Skill Expansion'],
      main: ['Main Story Quest', 'Epic Challenge', 'Primary Objective', 'Major Milestone']
    };
    addUnique({
      title: catTitles[lowestCat][Math.floor(Math.random() * catTitles[lowestCat].length)],
      category: lowestCat,
      difficulty: targetDiff,
      description: `⚖️ Your ${lowestCat} quests are underrepresented. Balance your journey with something new!`,
      reason: 'balance'
    });

    // 8. Difficulty progression
    if (p.difficultyTrend >= 2.5 && p.completionRate > 0.6) {
      addUnique({
        title: 'Push Your Limits',
        category: p.favoriteCategory,
        difficulty: 'hard',
        description: '💪 You\'ve been crushing hard quests. Time for an epic challenge that scares you a little!',
        reason: 'progression'
      });
    } else if (p.completionRate < 0.4) {
      addUnique({
        title: 'Confidence Builder',
        category: 'daily',
        difficulty: 'easy',
        description: '🌱 Start small. A quick, easy win builds momentum for bigger quests ahead.',
        reason: 'recovery'
      });
    }

    // 9. Mood-based (varied by mood)
    const moodSuggestions = {
      focused: [
        { title: 'Deep Work Session', category: 'main', diff: 'medium', desc: '🎯 Your focused mood is perfect for a meaningful main quest. Block distractions and dive deep.' },
        { title: 'Single-Task Sprint', category: 'side', diff: 'medium', desc: '🎯 Pick ONE thing and give it your undivided attention for 45 minutes.' }
      ],
      relaxed: [
        { title: 'Gentle Progress', category: 'side', diff: 'easy', desc: '😌 Take it easy with a relaxed side quest. No pressure, just enjoy the process.' },
        { title: 'Mindful Maintenance', category: 'daily', diff: 'easy', desc: '😌 A low-stakes task that keeps things running smoothly without stress.' }
      ],
      challenged: [
        { title: 'Skill Test', category: 'weekly', diff: 'hard', desc: '🏋️ You\'re feeling challenged — channel that energy into a tough weekly quest.' },
        { title: 'Breakthrough Attempt', category: 'main', diff: 'hard', desc: '🏋️ Push past your current limit. Try something you think might be too hard.' }
      ],
      creative: [
        { title: 'Creative Exploration', category: 'side', diff: 'easy', desc: '🎨 Explore a new creative idea with no rules. Just play and see what emerges!' },
        { title: 'Experiment Day', category: 'side', diff: 'medium', desc: '🎨 Try a completely new technique or approach in your creative work.' }
      ],
      social: [
        { title: 'Connect with Others', category: 'side', diff: 'easy', desc: '👥 Reach out to someone. Collaboration makes quests more fun and effective!' },
        { title: 'Community Contribution', category: 'weekly', diff: 'medium', desc: '👥 Give back to a community you care about. Share knowledge or help out.' }
      ]
    };
    const msOptions = moodSuggestions[this.currentMood] || moodSuggestions.focused;
    const ms = msOptions[Math.floor(Math.random() * msOptions.length)];
    addUnique({
      title: ms.title,
      category: ms.category,
      difficulty: ms.diff,
      description: ms.desc,
      reason: 'mood'
    });

    // 10. Random wildcard for maximum variety
    const allTopics = Object.keys(this.TOPIC_TEMPLATES);
    const randomTopic = allTopics[Math.floor(Math.random() * allTopics.length)];
    const randomTemplates = this._getShuffledTemplates(randomTopic);
    if (randomTemplates.length > 0) {
      const rt = randomTemplates[0];
      addUnique({
        title: rt.title,
        category: rt.category,
        difficulty: rt.diff,
        description: `🎲 Something different: ${rt.desc}`,
        reason: 'creative'
      });
    }

    return suggestions;
  },

  // ─── AI-POWERED SUGGESTIONS ───

  async generateAISuggestions(qb) {
    if (AIService && typeof AIService.isAvailable === 'function' && AIService.isAvailable(qb)) {
      try {
        const aiSuggestions = await AIService.generateSuggestions(qb, this.currentMood);
        if (aiSuggestions && aiSuggestions.length > 0) {
          return aiSuggestions;
        }
      } catch (err) {
        console.warn('[Suggestions] AI generation failed, falling back to local:', err);
      }
    }
    return this.generateLocalSuggestions(qb);
  },

  // ─── RENDER METHODS ───

  renderAll(qb) {
    this.renderMoodSelector(qb);
    this.renderInsights(qb);
    this.renderSuggestions(qb);
    this.renderInline(qb);
  },

  renderMoodSelector(qb) {
    const containers = [
      document.getElementById('moodBar'),
      document.getElementById('inlineMoodBar')
    ].filter(Boolean);

    const moods = [
      { id: 'focused', label: 'Focused', icon: '🎯' },
      { id: 'relaxed', label: 'Relaxed', icon: '😌' },
      { id: 'challenged', label: 'Challenged', icon: '🏋️' },
      { id: 'creative', label: 'Creative', icon: '🎨' },
      { id: 'social', label: 'Social', icon: '👥' }
    ];

    const html = `<div class="mood-label">How are you feeling?</div>
      <div class="mood-chips">
        ${moods.map(m => `<button class="mood-chip ${this.currentMood === m.id ? 'active' : ''}" data-mood="${m.id}">
          <span class="mood-chip-icon">${m.icon}</span>
          <span>${m.label}</span>
        </button>`).join('')}
      </div>`;

    containers.forEach(container => {
      container.innerHTML = html;
      container.querySelectorAll('.mood-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          this.currentMood = btn.dataset.mood;
          this.renderAll(qb);
        });
      });
    });
  },

  renderInsights(qb) {
    const container = document.getElementById('aiInsights');
    if (!container) return;

    const insights = this.generateInsights(qb);
    container.innerHTML = insights.map(i => `<div class="ai-insight ${i.type}">
      <span class="insight-icon">${i.icon}</span>
      <span class="insight-text">${i.text}</span>
    </div>`).join('');
  },

  renderSuggestions(qb) {
    const container = document.getElementById('suggestionsListPanel');
    if (!container) return;

    const render = (suggestions) => {
      if (!suggestions || suggestions.length === 0) {
        container.innerHTML = '<div class="suggestions-empty">Complete some quests to get personalized suggestions!</div>';
        return;
      }

      container.innerHTML = suggestions.map(s => {
        const xp = Math.floor(XP_REWARDS[s.category] * (DIFFICULTY_MULTIPLIERS[s.difficulty] || 1));
        const icons = {
          streak: '🔥', overdue: '⏰', time: '🕐', balance: '⚖️',
          progression: '📈', recovery: '🌱', mood: '🎭', habit: '🧠',
          ai: '🤖', creative: '💡', skill: '🎓', challenge: '🏆',
          wellness: '🌿', social: '👥', routine: '📅'
        };
        const icon = icons[s.reason] || '💡';
        return `<div class="suggestion-card-panel ${s.reason} ${s.isPriority ? 'priority' : ''}">
          <div class="suggestion-card-header">
            <div class="suggestion-card-icon">${icon}</div>
            <div class="suggestion-card-meta">
              <span class="suggestion-badge">${s.category}</span>
              <span class="suggestion-badge">${s.difficulty}</span>
            </div>
          </div>
          <div class="suggestion-card-body">
            <div class="suggestion-card-title">${esc(s.title)}</div>
            <div class="suggestion-card-desc">${s.description}</div>
          </div>
          <div class="suggestion-card-footer">
            <span class="suggestion-xp">🏆 ${xp} XP</span>
            <button class="suggestion-card-add" data-suggestion='${JSON.stringify(s).replace(/'/g, "&apos;")}'>Add Quest</button>
          </div>
        </div>`;
      }).join('');

      container.querySelectorAll('.suggestion-card-add').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const s = JSON.parse(btn.dataset.suggestion);
          this.addSuggestionFrom(qb, s);
        });
      });
    };

    const result = this.generateAISuggestions(qb);
    if (result && typeof result.then === 'function') {
      container.innerHTML = '<div class="suggestions-empty">🤖 Consulting the AI oracle...</div>';
      result.then(render).catch(() => render(this.generateLocalSuggestions(qb)));
    } else {
      render(result);
    }
  },

  renderInline(qb) {
    const container = document.getElementById('suggestionsList');
    if (!container) return;

    const render = (suggestions) => {
      const top3 = (suggestions || []).slice(0, 3);
      if (top3.length === 0) {
        container.innerHTML = '<div style="color:var(--text-dim);font-size:0.8rem;text-align:center;padding:10px;">Complete quests to get AI suggestions!</div>';
        return;
      }

      container.innerHTML = top3.map(s => {
        const icons = {
          streak: '🔥', overdue: '⏰', time: '🕐', balance: '⚖️',
          progression: '📈', recovery: '🌱', mood: '🎭', habit: '🧠',
          ai: '🤖', creative: '💡', skill: '🎓', challenge: '🏆',
          wellness: '🌿', social: '👥', routine: '📅'
        };
        const icon = icons[s.reason] || '💡';
        return `<div class="suggestion-item" data-suggestion='${JSON.stringify(s).replace(/'/g, "&apos;")}'>
          <span class="suggestion-icon">${icon}</span>
          <div class="suggestion-text">
            <div>${esc(s.title)}</div>
            <div class="suggestion-reason">${s.description}</div>
          </div>
          <button class="suggestion-add">＋</button>
        </div>`;
      }).join('');

      container.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', e => {
          if (e.target.closest('.suggestion-add')) {
            e.stopPropagation();
            const s = JSON.parse(item.dataset.suggestion);
            this.addSuggestionFrom(qb, s);
          }
        });
      });
    };

    const result = this.generateAISuggestions(qb);
    if (result && typeof result.then === 'function') {
      result.then(sugs => render(sugs.slice(0, 3))).catch(() => render(this.generateLocalSuggestions(qb).slice(0, 3)));
    } else {
      render(result.slice(0, 3));
    }
  },

  // ─── ADD SUGGESTION AS QUEST ───

  addSuggestionFrom(qb, s) {
    const quest = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      title: s.title,
      description: s.description,
      category: s.category || 'side',
      difficulty: s.difficulty || 'easy',
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: s.dueDate || null
    };
    qb.quests.push(quest);
    Storage.save(qb);
    QuestManager.renderQuests(qb);
    qb.renderCalendar();
    Effects.showToast('Quest added from suggestion!');
    Effects.spawnConfetti();
    Suggestions.renderAll(qb);
  }
};

