// ==UserScript==
// @name         Miniblox - Full Polish
// @namespace    https://github.com/
// @version      1.4
// @description  Custom loading screen, no snowflakes, no party, no Discord, spaced nav
// @match        https://miniblox.io/
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  const BLOCKED_METHODS = new Set(['inviteToParty', 'requestToJoinParty']);
  const MAX_PATCH_ATTEMPTS = 60;
  let patchAttempts = 0;

  const TIPS = [
    'Tip: Crouch to reduce your hitbox in fights.',
    'Tip: Sprint jumping is faster than walking.',
    'Tip: High ground gives you a combat advantage.',
    'Tip: Watch your ping — under 80ms is ideal.',
    'Tip: Strafe left and right to dodge shots.',
    'Tip: Block placement is faster when you pre-aim.',
    'Tip: Land your first hit to set the pace of a fight.',
    'Tip: Low health? Disengage and heal before re-engaging.',
    'Tip: Practice aim in lower-stakes modes first.',
    'Tip: Use cover to break line of sight when retreating.',
    'Tip: Jumping while taking damage can throw off enemy aim.',
    'Tip: Keep moving — standing still makes you an easy target.',
    'Tip: Learn spawn points to predict enemy locations.',
    'Tip: Don\'t chase a fight you can\'t win — live to play again.',
    'Tip: Build ramps for quick elevation in open areas.',
    'Tip: Inventory management matters — know your loadout.',
    'Tip: Listen for footsteps to track nearby enemies.',
    'Tip: Aim for the head for maximum damage output.',
    'Tip: Reload behind cover, never in the open.',
    'Tip: Master one game mode before branching out.',
    'Tip: Watch top players to pick up movement tricks.',
    'Tip: Use terrain to funnel enemies into predictable paths.',
    'Tip: Communicate with teammates early in a match.',
    'Tip: A good defence wins as many games as a good offence.',
    'Tip: Check corners before running through doorways.',
    'Tip: Timing your attacks matters as much as aim.',
    'Tip: Play aggressively when you have the health advantage.',
    'Tip: Stay calm under pressure — panic leads to mistakes.',
    'Tip: Review your losses — they teach more than wins.',
    'Tip: Consistency beats flashy plays in the long run.',
  ];

  const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

#mb-loader {
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: #020c02;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  font-family: 'Share Tech Mono', 'Courier New', monospace;
  transition: opacity 0.6s ease;
}

#mb-loader.fade-out {
  opacity: 0;
  pointer-events: none;
}

#mb-matrix-canvas {
  position: absolute;
  inset: 0;
  opacity: 0.13;
}

#mb-loader-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

#mb-logo {
  font-size: 3rem;
  font-weight: 900;
  letter-spacing: 6px;
  color: #00ff41;
  text-shadow: 0 0 18px #00ff41, 0 0 40px rgba(0,255,65,0.3);
  text-transform: uppercase;
}

#mb-logo span {
  color: #00cc33;
}

#mb-tagline {
  font-size: 0.72rem;
  color: #00802b;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-top: -22px;
}

#mb-bar-wrap {
  width: 340px;
  height: 4px;
  background: rgba(0,255,65,0.1);
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid rgba(0,255,65,0.15);
}

#mb-bar {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #00cc33, #00ff41);
  border-radius: 2px;
  box-shadow: 0 0 10px #00ff41;
  transition: width 0.4s ease;
}

#mb-status {
  font-size: 0.7rem;
  color: #00802b;
  letter-spacing: 2px;
  text-transform: uppercase;
  min-height: 1.2em;
}

#mb-tip {
  font-size: 0.72rem;
  color: rgba(0,255,65,0.45);
  letter-spacing: 1px;
  max-width: 340px;
  text-align: center;
  min-height: 2em;
  transition: opacity 0.4s ease;
}

#mb-tip.hidden { opacity: 0; }

#mb-version {
  position: absolute;
  bottom: 20px;
  right: 24px;
  font-size: 0.62rem;
  color: #004d16;
  letter-spacing: 2px;
  font-family: 'Share Tech Mono', monospace;
}

canvas#snow,
canvas[class*="snow"],
div[class*="snow"],
span[class*="snow"],
div[class*="flake"],
span[class*="flake"],
div[class*="particle"],
span[class*="particle"] { display: none !important; }

a[href*="discord"],
div[class*="discord"],
img[src*="discord"],
a[href*="discord.gg"] { display: none !important; }
`;

  // ─── Matrix rain ──────────────────────────────────────────────────────────────
  function startMatrixRain(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }, { passive: true });

    const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF';
    const COL_W = 18;
    const cols = Math.floor(canvas.width / COL_W);
    const drops = Array(cols).fill(1);

    function draw() {
      ctx.fillStyle = 'rgba(2,12,2,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff41';
      ctx.font = '14px Share Tech Mono, monospace';
      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(char, i * COL_W, drops[i] * COL_W);
        if (drops[i] * COL_W > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }

    return setInterval(draw, 45);
  }

  // ─── Loading stages ───────────────────────────────────────────────────────────
  const STAGES = [
    { pct: 5,  label: 'BOOTING...',              delay: 400 },
    { pct: 12, label: 'CHECKING INTEGRITY...',   delay: 700 },
    { pct: 20, label: 'LOADING CORE...',         delay: 600 },
    { pct: 28, label: 'LOADING ASSETS...',       delay: 800 },
    { pct: 36, label: 'LOADING TEXTURES...',     delay: 900 },
    { pct: 44, label: 'LOADING AUDIO...',        delay: 700 },
    { pct: 52, label: 'BUILDING WORLD...',       delay: 900 },
    { pct: 60, label: 'SPAWNING ENTITIES...',    delay: 800 },
    { pct: 67, label: 'CONNECTING TO SERVER...',  delay: 700 },
    { pct: 74, label: 'SYNCING PLAYER DATA...',  delay: 800 },
    { pct: 80, label: 'APPLYING SETTINGS...',    delay: 600 },
    { pct: 85, label: 'ALMOST READY...',         delay: 500 },
    { pct: 90, label: 'WAITING FOR GAME...',     delay: 400 },
  ];

  function setBar(bar, statusEl, pct, label) {
    bar.style.width = pct + '%';
    statusEl.textContent = label;
  }

  async function runStages(bar, statusEl) {
    for (const stage of STAGES) {
      await new Promise(r => setTimeout(r, stage.delay));
      setBar(bar, statusEl, stage.pct, stage.label);
    }
  }

  // ─── Tip rotator ──────────────────────────────────────────────────────────────
  function startTips(tipEl) {
    let idx = Math.floor(Math.random() * TIPS.length);
    tipEl.textContent = TIPS[idx];
    return setInterval(() => {
      tipEl.classList.add('hidden');
      setTimeout(() => {
        idx = (idx + 1) % TIPS.length;
        tipEl.textContent = TIPS[idx];
        tipEl.classList.remove('hidden');
      }, 420);
    }, 4000);
  }

  // ─── Snowflakes ───────────────────────────────────────────────────────────────
  const SNOW_CHARS = new Set(['❄', '❅', '❆', '*', '✦', '·', '•']);

  function hideSnowflakes() {
    if (!document.body) return;
    document.querySelectorAll('*').forEach(el => {
      if (el.children.length > 0) return;
      const text = el.textContent.trim();
      if (!SNOW_CHARS.has(text)) return;
      const s = window.getComputedStyle(el);
      if (s.position === 'absolute' || s.position === 'fixed') {
        el.style.setProperty('display', 'none', 'important');
      }
    });
    document.querySelectorAll('canvas').forEach(c => {
      if (
        c.id?.toLowerCase().includes('snow') ||
        c.className?.toLowerCase().includes('snow') ||
        (c.width < 5 && c.height < 5)
      ) {
        c.style.setProperty('display', 'none', 'important');
      }
    });
  }

  // ─── Nav button spacing ───────────────────────────────────────────────────────
  const NAV_LABELS = new Set(['Settings', 'Friends', 'Shop', 'Rankings', 'Contact']);

  function spaceNavButtons() {
    document.querySelectorAll('button, a').forEach(el => {
      if (NAV_LABELS.has(el.textContent.trim())) {
        el.style.setProperty('margin-bottom', '10px', 'important');
      }
    });
  }

  // ─── Party button + Discord sweeps ───────────────────────────────────────────
  function hidePartyButton() {
    document.querySelectorAll('button, a').forEach(el => {
      if (el.textContent.trim() === 'Party') {
        el.style.setProperty('display', 'none', 'important');
      }
    });
  }

  function hideDiscord() {
    document.querySelectorAll('a, div, img').forEach(el => {
      const href = el.href?.toLowerCase() ?? '';
      const src = el.src?.toLowerCase() ?? '';
      const text = el.textContent?.toLowerCase() ?? '';
      if (href.includes('discord') || src.includes('discord') || text.includes('join our discord')) {
        el.style.setProperty('display', 'none', 'important');
      }
    });
  }

  function runAllSweeps() {
    hidePartyButton();
    hideDiscord();
    hideSnowflakes();
    spaceNavButtons();
  }

  // ─── Party RPC patch ──────────────────────────────────────────────────────────
  function getGame() {
    try {
      const fiber = Object.values(document.querySelector('#react') ?? {})?.[0];
      return fiber?.updateQueue?.baseState?.element?.props?.game ?? null;
    } catch (_) { return null; }
  }

  function applyPartyPatch() {
    const game = getGame();
    if (!game?.party || typeof game.party.invoke !== 'function') return false;
    if (game.party._blockRqPatched) return true;
    const original = game.party.invoke.bind(game.party);
    game.party.invoke = function (method, ...args) {
      if (BLOCKED_METHODS.has(method)) return;
      return original(method, ...args);
    };
    game.party._blockRqPatched = true;
    console.log('[FullPolish] Party patch applied.');
    return true;
  }

  // ─── Game ready detection ─────────────────────────────────────────────────────
  function waitForGame() {
    return new Promise(resolve => {
      const check = setInterval(() => {
        try {
          const fiber = Object.values(document.querySelector('#react') ?? {})?.[0];
          const game = fiber?.updateQueue?.baseState?.element?.props?.game;
          if (game?.resourceMonitor && game?.player) {
            clearInterval(check);
            resolve();
          }
        } catch (_) {}
      }, 300);
      setTimeout(() => { clearInterval(check); resolve(); }, 20000);
    });
  }

  // ─── Build & mount ────────────────────────────────────────────────────────────
  function mount() {
    if (!document.body) return false;

    const styleEl = document.createElement('style');
    styleEl.textContent = STYLE;
    document.head.appendChild(styleEl);

    const loader = document.createElement('div');
    loader.id = 'mb-loader';

    const canvas = document.createElement('canvas');
    canvas.id = 'mb-matrix-canvas';

    const inner = document.createElement('div');
    inner.id = 'mb-loader-inner';
    inner.innerHTML = [
      '<div id="mb-logo">MINI<span>BLOX</span></div>',
      '<div id="mb-tagline">Enhanced by TheM1ddleM1n</div>',
      '<div id="mb-bar-wrap"><div id="mb-bar"></div></div>',
      '<div id="mb-status">BOOTING...</div>',
      '<div id="mb-tip"></div>',
    ].join('');

    const version = document.createElement('div');
    version.id = 'mb-version';
    version.textContent = 'v?.??.??';

    const versionObserver = new MutationObserver(() => {
      const match = document.body.innerText.match(/Miniblox\s+(v[\d.]+)/i);
      if (match) {
        version.textContent = match[1];
        versionObserver.disconnect();
      }
    });
    versionObserver.observe(document.body, { childList: true, subtree: true, characterData: true });

    loader.append(canvas, inner, version);
    document.body.prepend(loader);

    const bar = document.getElementById('mb-bar');
    const statusEl = document.getElementById('mb-status');
    const tipEl = document.getElementById('mb-tip');

    const matrixInterval = startMatrixRain(canvas);
    const tipInterval = startTips(tipEl);

    const sweepInterval = setInterval(runAllSweeps, 100);
    const domObserver = new MutationObserver(runAllSweeps);
    domObserver.observe(document.body, { childList: true, subtree: true });
    runAllSweeps();

    runStages(bar, statusEl).then(() => waitForGame()).then(() => {
      setBar(bar, statusEl, 100, 'READY! Welcome Player!');
      setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => {
          loader.remove();
          styleEl.remove();
          clearInterval(matrixInterval);
          clearInterval(tipInterval);
          clearInterval(sweepInterval);
          runAllSweeps();
        }, 650);
      }, 400);
    });

    return true;
  }

  // ─── Party RPC poll ───────────────────────────────────────────────────────────
  const patchInterval = setInterval(() => {
    if (++patchAttempts > MAX_PATCH_ATTEMPTS) { clearInterval(patchInterval); return; }
    applyPartyPatch();
  }, 2000);

  // ─── Boot ─────────────────────────────────────────────────────────────────────
  const bootInterval = setInterval(() => {
    if (document.body && mount()) clearInterval(bootInterval);
  }, 50);

})();
