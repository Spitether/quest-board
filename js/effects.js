// ===== VISUAL EFFECTS & AUDIO =====

const Effects = {
  createSparkles(el) {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const cols = ['#FFD700', '#FF6B8A', '#4ECCA3', '#F4D03F', '#FFF'];

    for (let i = 0; i < 8; i++) {
      const s = document.createElement('div');
      s.className = 'sparkle';
      s.textContent = ['✨', '⭐', '💫', '✦'][Math.floor(Math.random() * 4)];
      s.style.left = `${cx}px`;
      s.style.top = `${cy}px`;
      s.style.color = cols[Math.floor(Math.random() * cols.length)];

      const ang = (Math.PI * 2 * i) / 8;
      const dist = 30 + Math.random() * 40;
      s.style.setProperty('--tx', `${Math.cos(ang) * dist}px`);
      s.style.setProperty('--ty', `${Math.sin(ang) * dist}px`);

      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1000);
    }
  },

  createFloatXP(el, amt) {
    const r = el.getBoundingClientRect();
    const fx = document.createElement('div');
    fx.className = 'float-xp';
    fx.textContent = `+${amt} XP`;
    fx.style.left = `${r.left + r.width / 2}px`;
    fx.style.top = `${r.top}px`;
    document.body.appendChild(fx);
    setTimeout(() => fx.remove(), 1500);
  },

  triggerConfetti() {
    const c = document.getElementById('confettiCanvas');
    const ctx = c.getContext('2d');
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    const pts = [];
    const cols = ['#e94560', '#4ecca3', '#f4d03f', '#9b59b6', '#e74c3c', '#3498db', '#fff'];

    for (let i = 0; i < 150; i++) {
      pts.push({
        x: c.width / 2,
        y: c.height / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15 - 5,
        color: cols[Math.floor(Math.random() * cols.length)],
        size: Math.random() * 6 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.2,
        drag: 0.98,
        life: 1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      let alive = false;

      pts.forEach(p => {
        if (p.life <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.rotation += p.rotationSpeed;
        p.life -= 0.008;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (alive) requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, c.width, c.height);
    };

    animate();
  },

  showLevelUp(level) {
    const o = document.getElementById('levelupOverlay');
    document.getElementById('levelupLevel').textContent = level;
    o.classList.add('active');

    const f = document.createElement('div');
    f.className = 'screen-flash';
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 500);

    setTimeout(() => o.classList.remove('active'), 3000);
  },

  playSound() {
    try {
      const a = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50];

      notes.forEach((freq, i) => {
        const o = a.createOscillator();
        const g = a.createGain();
        o.connect(g);
        g.connect(a.destination);
        o.frequency.value = freq;
        o.type = 'sine';

        const t = a.currentTime + i * 0.15;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.15, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

        o.start(t);
        o.stop(t + 0.5);
      });
    } catch (e) {
      console.log('Audio not supported');
    }
  },

  showItemDrop(item) {
    const container = document.getElementById('itemDropContainer');
    const drop = document.createElement('div');
    drop.className = 'item-drop';
    drop.innerHTML = `<span class="drop-icon">${item.icon}</span><span class="drop-text">Found <span class="drop-name">${item.name}</span>!</span>`;
    container.appendChild(drop);
    setTimeout(() => drop.remove(), 3000);
  },

  showToast(msg, type = 'default') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'achievement' ? 'achievement' : ''}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  charReact(reaction) {
    const a = document.getElementById('characterAvatar');
    const b = document.getElementById('characterBubble');
    if (!a) return;

    a.classList.remove('jump', 'cheer', 'wave');
    void a.offsetWidth;
    a.classList.add(reaction);

    const msgs = {
      jump: ['Nice!', 'Good job!', 'Awesome!', 'Keep it up!'],
      cheer: ['Amazing!', 'You did it!', 'Hooray!', 'Fantastic!'],
      wave: ['Hello!', 'Ready?', 'Let\'s go!', 'Hi there!']
    };
    const m = msgs[reaction] || msgs.wave;

    if (b) {
      b.textContent = m[Math.floor(Math.random() * m.length)];
      b.classList.add('show');
      setTimeout(() => b.classList.remove('show'), 2000);
    }

    setTimeout(() => a.classList.remove(reaction), 1000);
  },

  companionReact(qb) {
    const b = document.getElementById('companionBubble');
    const c = COMPANIONS.find(x => x.id === qb.settings.companion);
    if (b && c) {
      b.textContent = c.msgs[Math.floor(Math.random() * c.msgs.length)];
      b.classList.add('show');
      setTimeout(() => b.classList.remove('show'), 2000);
    }
  }
};
