// ==UserScript==
// @name         Miniblox - Full Polish
// @namespace    https://github.com/
// @version      1.9
// @description  Custom loading screen, no snowflakes, no party, no Discord, spaced nav, custom wallpaper
// @match        https://miniblox.io/*
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  const BLOCKED_METHODS = new Set(['inviteToParty', 'requestToJoinParty']);
  const MAX_PATCH_ATTEMPTS = 60;
  const WALLPAPER_URL = 'https://wallpapers.com/images/hd/coding-background-9izlympnd0ovmpli.jpg';
  const SCRIPT_VERSION = 'v1.9';
  let patchAttempts = 0;

  const TIPS = [
    'Tip: Crouch to reduce your hitbox in fights.',
    'Tip: Sprint jumping is faster than walking.',
    'Tip: High ground gives you a combat advantage.',
    'Tip: Watch your ping — under 200ms is ideal.',
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

  for (let i = TIPS.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [TIPS[i], TIPS[j]] = [TIPS[j], TIPS[i]];
  }

  const CURSOR_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cline x1='16' y1='2' x2='16' y2='14' stroke='%2300ff41' stroke-width='1.5'/%3E%3Cline x1='16' y1='18' x2='16' y2='30' stroke='%2300ff41' stroke-width='1.5'/%3E%3Cline x1='2' y1='16' x2='14' y2='16' stroke='%2300ff41' stroke-width='1.5'/%3E%3Cline x1='18' y1='16' x2='30' y2='16' stroke='%2300ff41' stroke-width='1.5'/%3E%3Ccircle cx='16' cy='16' r='2.5' fill='none' stroke='%2300ff41' stroke-width='1.5'/%3E%3C/svg%3E";

  const PERSISTENT_STYLE = `
@keyframes mb-nav-pulse {
  0%, 100% { box-shadow: 0 0 4px 1px rgba(255,0,0,0.6); }
  50% { box-shadow: 0 0 12px 3px rgba(255,0,0,1); }
}

body *:not(canvas) { cursor: url("${CURSOR_SVG}") 16 16, crosshair; }
`;

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
  cursor: pointer;
  user-select: none;
}

#mb-logo span {
  color: #00cc33;
}

#mb-logo.glitch {
  animation: mb-glitch 0.6s steps(2) forwards;
}

@keyframes mb-glitch {
  0%   { transform: translate(0,0) skewX(0deg); color: #00ff41; text-shadow: 0 0 18px #00ff41; }
  15%  { transform: translate(-4px,2px) skewX(-8deg); color: #ff0040; text-shadow: 3px 0 0 #00ff41, -3px 0 0 #ff0040; }
  30%  { transform: translate(4px,-2px) skewX(8deg); color: #00ff41; text-shadow: -3px 0 0 #ff0040, 3px 0 0 #00ffff; }
  45%  { transform: translate(-3px,1px) skewX(-4deg); color: #00ffff; text-shadow: 3px 0 0 #ff0040; }
  60%  { transform: translate(3px,-1px) skewX(4deg); color: #ff0040; text-shadow: -3px 0 0 #00ffff; }
  75%  { transform: translate(-2px,2px) skewX(-2deg); color: #00ff41; text-shadow: 0 0 18px #00ff41; }
  100% { transform: translate(0,0) skewX(0deg); color: #00ff41; text-shadow: 0 0 18px #00ff41; }
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

  const STAGES = [
    { pct: 5, label: 'BOOTING...', delay: 400 },
    { pct: 12, label: 'CHECKING INTEGRITY...', delay: 700 },
    { pct: 20, label: 'LOADING CORE...', delay: 600 },
    { pct: 28, label: 'LOADING ASSETS...', delay: 800 },
    { pct: 36, label: 'LOADING TEXTURES...', delay: 900 },
    { pct: 44, label: 'LOADING AUDIO...', delay: 700 },
    { pct: 52, label: 'BUILDING WORLD...', delay: 900 },
    { pct: 60, label: 'SPAWNING ENTITIES...', delay: 800 },
    { pct: 67, label: 'CONNECTING TO SERVER...', delay: 700 },
    { pct: 74, label: 'SYNCING PLAYER DATA...', delay: 800 },
    { pct: 80, label: 'APPLYING SETTINGS...', delay: 600 },
    { pct: 85, label: 'ALMOST READY...', delay: 500 },
    { pct: 90, label: 'WAITING FOR GAME...', delay: 400 },
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

  function startTips(tipEl) {
    let idx = 0;
    tipEl.textContent = TIPS[idx];
    return setInterval(() => {
      tipEl.classList.add('hidden');
      setTimeout(() => {
        idx = Math.floor(Math.random() * TIPS.length);
        tipEl.textContent = TIPS[idx];
        tipEl.classList.remove('hidden');
      }, 420);
    }, 4000);
  }

  function initKonamiEasterEgg() {
    const CODE = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let pos = 0;
    document.addEventListener('keydown', e => {
      if (e.key === CODE[pos]) {
        pos++;
        if (pos === CODE.length) {
          pos = 0;
          const msg = document.createElement('div');
          msg.textContent = '> YOU FOUND THE SECRET. NICE. <';
          msg.style.cssText = [
            'position:fixed',
            'bottom:40px',
            'left:50%',
            'transform:translateX(-50%)',
            'z-index:9999999',
            'font-family:Share Tech Mono,monospace',
            'font-size:0.75rem',
            'color:#00ff41',
            'letter-spacing:3px',
            'text-shadow:0 0 10px #00ff41',
            'pointer-events:none',
            'transition:opacity 0.6s ease',
          ].join(';');
          document.body.appendChild(msg);
          setTimeout(() => { msg.style.opacity = '0'; }, 2500);
          setTimeout(() => { msg.remove(); }, 3200);
        }
      } else {
        pos = 0;
      }
    });
  }

  function initLogoEasterEgg(logoEl) {
    let clicks = 0;
    let resetTimer = null;
    logoEl.addEventListener('click', () => {
      clicks++;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { clicks = 0; }, 2000);
      if (clicks >= 5) {
        clicks = 0;
        clearTimeout(resetTimer);
        logoEl.classList.remove('glitch');
        void logoEl.offsetWidth;
        logoEl.classList.add('glitch');
        logoEl.addEventListener('animationend', () => {
          logoEl.classList.remove('glitch');
        }, { once: true });
      }
    });
  }

  function hideSnowflakes() {
    if (!document.body) return;
    document.querySelectorAll('p.chakra-text').forEach(el => {
      if (el.textContent.trim() === '❅') {
        el.style.setProperty('display', 'none', 'important');
      }
    });
  }

  const NAV_LABELS = new Set(['Settings', 'Friends', 'Shop', 'Rankings', 'Contact']);

  function spaceNavButtons() {
    document.querySelectorAll('button, a').forEach(el => {
      if (NAV_LABELS.has(el.textContent.trim())) {
        el.style.setProperty('margin-bottom', '10px', 'important');
        el.style.setProperty('border', '1px solid red', 'important');
        el.style.setProperty('animation', 'mb-nav-pulse 1.5s ease-in-out infinite', 'important');
      }
    });
  }

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

  let wallpaperStyleEl = null;

  function swapWallpaper() {
    if (!wallpaperStyleEl || !document.head.contains(wallpaperStyleEl)) {
      wallpaperStyleEl = document.createElement('style');
      wallpaperStyleEl.textContent = [
        `img[src*="default-"],`,
        `img[class*="background"],`,
        `img[class*="wallpaper"],`,
        `img[class*="bg-"] { content: url(${WALLPAPER_URL}) !important; }`,
      ].join('\n');
      document.head.appendChild(wallpaperStyleEl);
    }
    document.querySelectorAll('img').forEach(img => {
      if (
        img.src.includes('default-') ||
        img.className.includes('background') ||
        img.className.includes('wallpaper') ||
        img.className.includes('bg-')
      ) {
        img.src = WALLPAPER_URL;
      }
    });
    document.querySelectorAll('[style*="background-image"]').forEach(el => {
      if (el.style.backgroundImage.includes('default-')) {
        el.style.setProperty('background-image', `url(${WALLPAPER_URL})`, 'important');
      }
    });
  }

  let sweepDebounceTimer = null;

  function runAllSweeps() {
    hidePartyButton();
    hideDiscord();
    hideSnowflakes();
    spaceNavButtons();
    swapWallpaper();
  }

  function debouncedSweep() {
    clearTimeout(sweepDebounceTimer);
    sweepDebounceTimer = setTimeout(runAllSweeps, 150);
  }

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
    return true;
  }

  function waitForGame() {
    return new Promise(resolve => {
      const check = setInterval(() => {
        try {
          const game = getGame();
          if (game?.resourceMonitor && game?.player) {
            clearInterval(check);
            resolve();
          }
        } catch (_) {}
      }, 300);
      setTimeout(() => {
        clearInterval(check);
        console.warn('[FullPolish] waitForGame timed out — game object never found.');
        resolve();
      }, 20000);
    });
  }

  function mount() {
    if (!document.body) return false;

    const persistentStyleEl = document.createElement('style');
    persistentStyleEl.textContent = PERSISTENT_STYLE;
    document.head.appendChild(persistentStyleEl);

    const styleEl = document.createElement('style');
    styleEl.textContent = STYLE;
    document.head.appendChild(styleEl);

    const loader = document.createElement('div');
    loader.id = 'mb-loader';

    const canvas = document.createElement('canvas');
    canvas.id = 'mb-matrix-canvas';

    const inner = document.createElement('div');
    inner.id = 'mb-loader-inner';
    inner.innerHTML = `
      <div id="mb-logo">MINI<span>BLOX</span></div>
      <div id="mb-tagline">Enhanced by TheM1ddleM1n</div>
      <div id="mb-bar-wrap"><div id="mb-bar"></div></div>
      <div id="mb-status">BOOTING...</div>
      <div id="mb-tip"></div>
    `;

    const version = document.createElement('div');
    version.id = 'mb-version';
    version.textContent = SCRIPT_VERSION;

    const versionInterval = setInterval(() => {
      const match = document.body.innerText.match(/Miniblox\s+(v[\d.]+)/i);
      if (match) {
        version.textContent = match[1];
        clearInterval(versionInterval);
      }
    }, 1000);

    loader.append(canvas, inner, version);
    document.body.prepend(loader);

    const bar = document.getElementById('mb-bar');
    const statusEl = document.getElementById('mb-status');
    const tipEl = document.getElementById('mb-tip');
    const logoEl = document.getElementById('mb-logo');

    const matrixInterval = startMatrixRain(canvas);
    const tipInterval = startTips(tipEl);

    let sweepInterval = setInterval(runAllSweeps, 1000);
    const domObserver = new MutationObserver(() => {
      swapWallpaper();
      debouncedSweep();
    });
    domObserver.observe(document.body, { childList: true, subtree: true });
    runAllSweeps();

    initLogoEasterEgg(logoEl);

    runStages(bar, statusEl).then(() => waitForGame()).then(() => {
      setBar(bar, statusEl, 100, 'READY! Welcome Player!');
      clearInterval(sweepInterval);
      sweepInterval = setInterval(runAllSweeps, 5000);
      setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => {
          loader.remove();
          styleEl.remove();
          clearInterval(matrixInterval);
          clearInterval(tipInterval);
          clearInterval(sweepInterval);
          clearInterval(versionInterval);
          runAllSweeps();
        }, 650);
      }, 400);
    });

    initKonamiEasterEgg();
    return true;
  }

  const patchInterval = setInterval(() => {
    if (++patchAttempts > MAX_PATCH_ATTEMPTS || applyPartyPatch()) {
      clearInterval(patchInterval);
    }
  }, 2000);

  const bootInterval = setInterval(() => {
    if (document.body && mount()) clearInterval(bootInterval);
  }, 50);

})();
