/**
 * App - Main Controller for Board Arena.
 * Coordinates Game Engines, High-DPI Renderers, Input Controller, Procedural Audio,
 * Bot AI, Versioned Persistence, Achievements, and PWA Installation.
 * Preserves 100% of underlying game engine logic and rules.
 */
const App = (() => {
  let currentGameType = 'ludo'; // 'ludo' | 'ladder'
  let activeView = 'home';
  let isPaused = false;
  let deferredPrompt = null;
  let debugMode = false;
  let pendingConfirmCallback = null;

  function init() {
    SoundFX.init();
    InputController.init();

    // Canvas initialization
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      LudoRenderer.init(canvas);
      LadderRenderer.init(canvas);
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      TimerManager.setTimeout(handleResize, 100);
    });

    // Theme setup
    const settings = Storage.get('settings') || {};
    const currentTheme = settings.theme || 'dark';
    document.body.setAttribute('data-theme', currentTheme);

    // Sidebar state setup
    if (settings.sidebarCollapsed) {
      document.getElementById('desktop-sidebar')?.classList.add('collapsed');
    }

    // Dynamic Game Area Resize Observer
    const mainContent = document.getElementById('main-content');
    if (mainContent && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        if (activeView === 'game') {
          calculateDesktopBoardSize();
        }
      });
      ro.observe(mainContent);
    }

    // Profile name listener
    const nameInput = document.getElementById('profile-name-input');
    if (nameInput) {
      nameInput.addEventListener('change', (e) => {
        const val = e.target.value.trim() || 'Player 1';
        const p = Storage.get('profile') || {};
        p.name = val;
        Storage.set('profile', p);
        updateProfileUI();
      });
    }

    // Header buttons
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
    document.getElementById('desktop-theme-toggle')?.addEventListener('click', toggleTheme);
    document.getElementById('header-sound-toggle')?.addEventListener('click', toggleSoundSetting);
    document.getElementById('desktop-sound-toggle')?.addEventListener('click', toggleSoundSetting);
    document.getElementById('in-game-sound-toggle')?.addEventListener('click', toggleSoundSetting);

    // PWA Install prompt listener
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const installBtn = document.getElementById('btn-pwa-install');
      const settingsInstallBtn = document.getElementById('btn-pwa-install-settings');
      if (installBtn) installBtn.style.display = 'inline-flex';
      if (settingsInstallBtn) settingsInstallBtn.style.display = 'block';
    });

    // Storage updates subscription
    Storage.subscribe(() => {
      updateProfileUI();
      updateSettingsUI();
    });

    // Check debug flag in URL
    if (window.location && window.location.search && window.location.search.includes('debug=1')) {
      toggleDebugMode(true);
    }

    updateSoundIcons();
    updateThemeIcons();
    updateProfileUI();
    checkSavedGames();

    const urlParams = (window.location && window.location.search) ? new URLSearchParams(window.location.search) : null;
    const initialView = urlParams ? (urlParams.get('view') || 'home') : 'home';
    const gameType = urlParams ? (urlParams.get('type') || 'ludo') : 'ludo';

    if (initialView === 'setup') {
      openSetup(gameType);
    } else if (initialView === 'game') {
      openSetup(gameType);
      startGameFromSetup();
    } else {
      showView(initialView);
    }
  }

  function handleResize() {
    calculateDesktopBoardSize();
    if (currentGameType === 'ludo') {
      LudoRenderer.resize();
    } else {
      LadderRenderer.resize();
    }
    renderCurrentBoard();
  }

  function toggleSidebar() {
    const sb = document.getElementById('desktop-sidebar');
    if (!sb) return;
    sb.classList.toggle('collapsed');
    const isCollapsed = sb.classList.contains('collapsed');
    Storage.update('settings', { sidebarCollapsed: isCollapsed });
    calculateDesktopBoardSize();
    renderCurrentBoard();
  }

  function calculateDesktopBoardSize() {
    if (typeof window === 'undefined') return;
    const arena = document.querySelector('.game-arena-layout');

    if (window.innerWidth < 1024) {
      if (arena) arena.style.removeProperty('--desktop-board-size');
      return;
    }

    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const mainRect = mainContent.getBoundingClientRect();
    const availWidth = mainRect.width || (window.innerWidth - 240);
    const availHeight = mainRect.height || (window.innerHeight - 56);

    // Vertical non-board allowance: header (32px) + turn (32px) + top stations (84px) + bottom stations (84px) + gaps (20px)
    const isShortDesktop = window.innerHeight <= 768;
    const verticalOverhead = isShortDesktop ? 220 : 252;
    const horizontalMargin = 32;

    const maxByWidth = availWidth - horizontalMargin;
    const maxByHeight = availHeight - verticalOverhead;

    let targetSize = Math.floor(Math.min(maxByWidth, maxByHeight));

    // Generous upper bound for large monitors (4K / 1440p)
    targetSize = Math.min(targetSize, 860);
    // Sensible lower bound
    targetSize = Math.max(targetSize, 360);

    if (arena) {
      arena.style.setProperty('--desktop-board-size', `${targetSize}px`);
    }

    if (currentGameType === 'ludo') {
      LudoRenderer.resize();
    } else if (currentGameType === 'ladder') {
      LadderRenderer.resize();
    }
  }

  function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') !== 'light';
    const nextTheme = isDark ? 'light' : 'dark';
    document.body.setAttribute('data-theme', nextTheme);
    const settings = Storage.get('settings') || {};
    Storage.set('settings', { ...settings, theme: nextTheme });
    SoundFX.click();
    updateThemeIcons();
    renderCurrentBoard();
  }

  function updateThemeIcons() {
    const isLight = document.body.getAttribute('data-theme') === 'light';
    const moonSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    const sunSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

    document.querySelectorAll('.theme-icon-container').forEach((el) => {
      el.innerHTML = isLight ? sunSvg : moonSvg;
    });
  }

  function toggleSoundSetting() {
    const current = Storage.get('settings').sound !== false;
    updateSetting('sound', !current);
    updateSoundIcons();
    if (!current) SoundFX.click();
  }

  function updateSoundIcons() {
    const soundOn = Storage.get('settings').sound !== false;
    const soundSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
    const muteSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;

    document.querySelectorAll('.sound-icon-container').forEach((el) => {
      el.innerHTML = soundOn ? soundSvg : muteSvg;
    });
  }

  function showView(viewId) {
    if (viewId === 'leaderboard') viewId = 'history';

    activeView = viewId;
    document.body.classList.toggle('in-game', viewId === 'game');

    // Manage view sections
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) targetView.classList.add('active');

    // Manage navigation tabs
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav-item').forEach((b) => b.classList.remove('active'));

    const navDataView = (viewId === 'setup' || viewId === 'game') ? 'play' : viewId;
    const navBtn = document.querySelector(`.nav-btn[data-view="${navDataView}"]`);
    if (navBtn) navBtn.classList.add('active');

    const sidebarBtn = document.querySelector(`.sidebar-nav-item[data-view="${navDataView}"]`);
    if (sidebarBtn) sidebarBtn.classList.add('active');

    // Desktop top bar contextual back button
    const desktopBackBtn = document.getElementById('desktop-btn-back');
    const desktopTitle = document.getElementById('desktop-view-title');
    if (desktopBackBtn) {
      desktopBackBtn.style.display = (viewId !== 'home') ? 'inline-flex' : 'none';
    }
    if (desktopTitle) {
      const titles = {
        home: 'Home',
        play: 'Choose Game',
        setup: 'Game Setup',
        game: currentGameType === 'ludo' ? 'Ludo Arena' : 'Snakes & Ladders',
        history: 'Match History',
        profile: 'Player Profile',
        settings: 'Settings'
      };
      desktopTitle.innerText = titles[viewId] || 'Board Arena';
    }

    // Screen specific updates
    if (viewId === 'home') {
      checkSavedGames();
      updateProfileUI();
      updateHomeStatsUI();
    } else if (viewId === 'profile') {
      updateProfileUI();
      renderAchievementsList();
    } else if (viewId === 'history') {
      renderHistoryList();
    } else if (viewId === 'settings') {
      updateSettingsUI();
    } else if (viewId === 'game') {
      updateSoundIcons();
      TimerManager.setTimeout(() => {
        handleResize();
      }, 50);
    }
  }

  function openSetup(gameType = 'ludo') {
    currentGameType = gameType;
    const isLudo = gameType === 'ludo';

    const titleEl = document.getElementById('setup-title');
    if (titleEl) {
      titleEl.innerText = isLudo ? 'Ludo Master' : 'Snakes & Ladders';
    }
    const descEl = document.getElementById('setup-title-desc');
    if (descEl) {
      descEl.innerText = isLudo
        ? 'Roll the dice, race your pawns, and bring all tokens home!'
        : 'Climb the ladders and dodge slippery snakes to reach tile 100!';
    }

    // Toggle 3D illustration
    const ludoArt = document.getElementById('setup-art-ludo');
    const ladderArt = document.getElementById('setup-art-ladder');
    if (ludoArt && ladderArt) {
      ludoArt.style.display = isLudo ? 'block' : 'none';
      ladderArt.style.display = isLudo ? 'none' : 'block';
    }

    // Remember last player count (defaults to 4)
    const lastCount = Storage.get('lastPlayerCount') || 4;
    applyPreset(lastCount);
    showView('setup');
  }

  function onPlayerTypeChange(playerIdx, colorIdx) {
    const typeSelect = document.getElementById(`cfg-type-${playerIdx}`);
    const nameInput = document.getElementById(`cfg-name-${playerIdx}`);
    const badge = document.getElementById(`cfg-avatar-badge-${playerIdx}`);
    if (!typeSelect) return;

    const isHuman = typeSelect.value === 'human';
    if (badge) {
      badge.innerHTML = isHuman
        ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
        : `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="16" y1="16" x2="16.01" y2="16"></line></svg>`;
    }

    if (nameInput) {
      if (isHuman) {
        if (nameInput.value.startsWith('Bot')) {
          const defaultProfileName = (Storage.get('profile') && Storage.get('profile').name) || 'Player 1';
          nameInput.value = playerIdx === 0 ? defaultProfileName : `Player ${playerIdx + 1}`;
        }
      } else {
        if (nameInput.value.startsWith('Player')) {
          nameInput.value = `Bot ${playerIdx}`;
        }
      }
    }
  }

  function applyPreset(count) {
    Storage.set('lastPlayerCount', count);

    document.querySelectorAll('.preset-btn, .preset-option-card').forEach((btn) => {
      btn.classList.toggle('active', parseInt(btn.dataset.count, 10) === count);
    });

    const container = document.getElementById('player-config-list');
    if (!container) return;
    container.innerHTML = '';

    const colors = LudoEngine.PLAYER_COLORS_4;
    const defaultProfileName = (Storage.get('profile') && Storage.get('profile').name) || 'Player 1';

    for (let i = 0; i < count; i++) {
      const card = document.createElement('div');
      const colorIdx = (count === 2 && i === 1) ? 2 : i;
      const pColor = colors[colorIdx] || colors[0];
      const colorName = pColor.name;
      const colorKey = colorName.toLowerCase();
      const isHumanDefault = (i === 0);

      card.className = `player-setup-card player-config-row card-color-${colorKey}`;
      card.setAttribute('data-player-idx', i);
      card.style.setProperty('--player-accent', pColor.hex);

      card.innerHTML = `
        <div class="player-card-left">
          <span class="card-num-idx">#${i + 1}</span>
          <div class="pawn-icon-badge pawn-badge-${colorKey}" id="cfg-avatar-badge-${i}" style="border-color: ${pColor.hex};">
            ${isHumanDefault 
              ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
              : `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="16" y1="16" x2="16.01" y2="16"></line></svg>`
            }
          </div>
          <div class="card-name-col">
            <input type="text" id="cfg-name-${i}" class="card-player-input" value="${i === 0 ? defaultProfileName : 'Bot ' + i}" maxlength="16" aria-label="Player ${i + 1} Name">
            <span class="card-color-subtitle" style="color: ${pColor.hex};">${colorName} Team</span>
          </div>
        </div>
        <div class="card-type-wrap">
          <div class="custom-type-select-wrap">
            <select id="cfg-type-${i}" class="card-type-select" onchange="App.onPlayerTypeChange(${i}, ${colorIdx})" aria-label="Player ${i + 1} Type">
              <option value="human" ${isHumanDefault ? 'selected' : ''}>👤 Human</option>
              <option value="bot" ${!isHumanDefault ? 'selected' : ''}>🤖 Bot</option>
            </select>
          </div>
        </div>
      `;
      container.appendChild(card);
    }
  }

  function startGameFromSetup() {
    const rows = document.querySelectorAll('.player-config-row');
    const players = [];
    rows.forEach((r, idx) => {
      const nameInput = document.getElementById(`cfg-name-${idx}`);
      const typeSelect = document.getElementById(`cfg-type-${idx}`);
      players.push({
        id: idx,
        name: (nameInput && typeof nameInput.value === 'string' && nameInput.value.trim()) ? nameInput.value.trim() : `Player ${idx + 1}`,
        type: (typeSelect && typeSelect.value) ? typeSelect.value : (idx === 0 ? 'human' : 'bot')
      });
    });

    if (players.length < 2) return;

    TimerManager.clearAll();
    isPaused = false;

    if (currentGameType === 'ludo') {
      LudoEngine.init(players);
      Storage.updateStats('ludo', { played: 1 });
    } else {
      LadderEngine.init(players);
      Storage.updateStats('ladder', { played: 1 });
    }

    setupGameArena();
    showView('game');
    saveCurrentGameState();
    renderCurrentBoard();
    processTurn();
  }

  function setupGameArena() {
    const isLudo = currentGameType === 'ludo';
    const heading = document.getElementById('game-arena-heading');
    if (heading) {
      heading.innerText = isLudo ? 'Ludo Master' : 'Snakes & Ladders';
    }

    const brandContainer = document.querySelector('.brand-title');
    if (brandContainer) {
      brandContainer.innerHTML = isLudo 
        ? '<span class="brand-ludo-txt">LUDO</span> <span class="brand-arena-txt">MASTER</span>'
        : '<span class="brand-ludo-txt">SNAKES &</span> <span class="brand-arena-txt">LADDERS</span>';
    }

    setupCompactPlayerStatus();
    updateTurnUI();
  }

  function setupCompactPlayerStatus() {
    const isLudo = currentGameType === 'ludo';
    const engine = isLudo ? LudoEngine : LadderEngine;
    const st = engine.getState();
    const pCount = st.players.length;

    const slotTL = document.getElementById('slot-player-tl');
    const slotTR = document.getElementById('slot-player-tr');
    const slotBL = document.getElementById('slot-player-bl');
    const slotBR = document.getElementById('slot-player-br');
    const topRow = document.getElementById('table-top-row');
    const bottomRow = document.getElementById('table-bottom-row');

    // Reset visibility of all 4 player cards
    [0, 1, 2, 3].forEach((cIdx) => {
      const cardEl = document.getElementById(`player-card-${cIdx}`);
      if (cardEl) {
        cardEl.style.display = 'flex';
        cardEl.classList.remove('active', 'inactive-slot');
      }
    });

    if (pCount === 2) {
      const c1 = document.getElementById('player-card-1');
      const c3 = document.getElementById('player-card-3');
      if (c1) c1.style.display = 'none';
      if (c3) c3.style.display = 'none';
      if (slotTR) slotTR.style.display = 'none';
      if (slotBL) slotBL.style.display = 'none';
      if (slotTL) slotTL.style.display = 'flex';
      if (slotBR) slotBR.style.display = 'flex';
      if (topRow) topRow.classList.add('single-active');
      if (bottomRow) bottomRow.classList.add('single-active');
      bindPlayerCardData(0, st.players[0]);
      bindPlayerCardData(2, st.players[1]);
    } else if (pCount === 3) {
      const c3 = document.getElementById('player-card-3');
      if (c3) c3.style.display = 'none';
      if (slotBL) slotBL.style.display = 'none';
      if (slotTL) slotTL.style.display = 'flex';
      if (slotTR) slotTR.style.display = 'flex';
      if (slotBR) slotBR.style.display = 'flex';
      if (topRow) topRow.classList.remove('single-active');
      if (bottomRow) {
        bottomRow.classList.remove('single-active');
        bottomRow.classList.add('single-active-right');
      }
      bindPlayerCardData(0, st.players[0]);
      bindPlayerCardData(1, st.players[1]);
      bindPlayerCardData(2, st.players[2]);
    } else {
      if (slotTL) slotTL.style.display = 'flex';
      if (slotTR) slotTR.style.display = 'flex';
      if (slotBL) slotBL.style.display = 'flex';
      if (slotBR) slotBR.style.display = 'flex';
      if (topRow) topRow.classList.remove('single-active');
      if (bottomRow) bottomRow.classList.remove('single-active', 'single-active-right');
      st.players.slice(0, 4).forEach((p, idx) => {
        bindPlayerCardData(idx, p);
      });
    }
  }

  function bindPlayerCardData(cardIdx, player) {
    if (!player) return;
    const nameEl = document.getElementById(`player-card-name-${cardIdx}`);
    const roleEl = document.getElementById(`player-role-${cardIdx}`);
    const cardEl = document.getElementById(`player-card-${cardIdx}`);
    const avatarEl = document.getElementById(`player-avatar-${cardIdx}`);
    const colName = player.color && player.color.name ? player.color.name.toLowerCase() : 'red';

    if (nameEl) nameEl.innerText = player.name;
    if (roleEl) {
      roleEl.innerText = player.type === 'bot' ? 'BOT' : 'YOU';
      ['tag-red', 'tag-green', 'tag-blue', 'tag-yellow'].forEach((c) => roleEl.classList.remove(c));
      roleEl.classList.add(`tag-${colName}`);
    }
    if (cardEl) {
      ['card-red', 'card-green', 'card-blue', 'card-yellow'].forEach((c) => cardEl.classList.remove(c));
      cardEl.classList.add(`card-${colName}`);
      cardEl.style.setProperty('--player-col', player.color.hex);
    }
    if (avatarEl) {
      avatarEl.style.backgroundColor = player.color.hex;
      avatarEl.innerHTML = player.type === 'human'
        ? `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#ffffff" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
        : `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#ffffff" stroke-width="2.5"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path></svg>`;
    }
  }

  function updateTurnUI() {
    const isLudo = currentGameType === 'ludo';
    const engine = isLudo ? LudoEngine : LadderEngine;
    const st = engine.getState();
    const activePlayer = st.players[st.turnIdx];

    const pCount = st.players.length;
    const activeCardIdx = (pCount === 2 && st.turnIdx === 1) ? 2 : st.turnIdx;

    // Move Action Dock to current player's corner station & update player color theme
    if (activePlayer) {
      updateDynamicDicePosition(activePlayer, pCount);
      updatePlayerColorTheme(activePlayer);
    }

    // Configure Roll Button
    const isHuman = activePlayer?.type === 'human';
    const rollBtn = document.getElementById('btn-roll');

    if (rollBtn) {
      if (isHuman) {
        const canAct = (st.phase === 'WAITING_FOR_ROLL' || (isLudo && st.phase === 'SELECTING_TOKEN')) && !isPaused && st.winner === null;
        rollBtn.disabled = !canAct;
        if (isLudo && st.phase === 'SELECTING_TOKEN') {
          rollBtn.innerText = 'SELECT TOKEN';
        } else if (st.phase === 'MOVING_TOKEN' || st.phase === 'MOVING') {
          rollBtn.disabled = true;
          rollBtn.innerText = 'MOVING...';
        } else if (st.phase === 'ROLLING') {
          rollBtn.disabled = true;
          rollBtn.innerText = 'ROLLING...';
        } else {
          rollBtn.innerText = 'ROLL DICE';
        }
      } else {
        rollBtn.disabled = true;
        if (isLudo && st.phase === 'SELECTING_TOKEN') {
          rollBtn.innerText = 'BOT SELECTING...';
        } else if (st.phase === 'MOVING_TOKEN' || st.phase === 'MOVING') {
          rollBtn.innerText = 'BOT MOVING...';
        } else {
          rollBtn.innerText = 'BOT ROLLING...';
        }
      }
    }

    // Update Turn Banner
    const turnDot = document.getElementById('turn-dot');
    const turnMainText = document.getElementById('turn-main-text');
    const turnInstruction = document.getElementById('turn-instruction');
    const turnBanner = document.getElementById('turn-banner');

    if (turnBanner && activePlayer) {
      turnBanner.style.setProperty('--turn-accent', activePlayer.color.hex);
    }
    if (turnDot && activePlayer) {
      turnDot.style.color = activePlayer.color.hex;
    }

    if (activePlayer && activePlayer.type === 'human') {
      if (isLudo && st.phase === 'SELECTING_TOKEN') {
        if (turnMainText) turnMainText.innerText = `YOU ROLLED ${st.diceVal}`;
        if (turnInstruction) turnInstruction.innerText = 'Choose a token to move';
      } else if (st.phase === 'MOVING_TOKEN' || st.phase === 'MOVING') {
        if (turnMainText) turnMainText.innerText = isLudo ? 'MOVING TOKEN' : 'CLIMBING TO 100';
        if (turnInstruction) turnInstruction.innerText = `Advancing ${st.diceVal} steps...`;
      } else if (st.phase === 'ROLLING') {
        if (turnMainText) turnMainText.innerText = 'ROLLING...';
        if (turnInstruction) turnInstruction.innerText = 'Rolling the dice...';
      } else {
        if (turnMainText) turnMainText.innerText = 'YOUR TURN';
        if (turnInstruction) turnInstruction.innerText = isLudo ? 'Press Space or tap Roll Dice' : 'Roll to race to 100!';
      }
    } else if (activePlayer) {
      if (turnMainText) turnMainText.innerText = `${activePlayer.name.toUpperCase()}'S TURN`;
      if (isLudo && st.phase === 'SELECTING_TOKEN') {
        if (turnInstruction) turnInstruction.innerText = `${activePlayer.name} is selecting a token...`;
      } else if (st.phase === 'MOVING_TOKEN' || st.phase === 'MOVING') {
        if (turnInstruction) turnInstruction.innerText = `Moving ${st.diceVal} steps...`;
      } else {
        if (turnInstruction) turnInstruction.innerText = `${activePlayer.name} is thinking...`;
      }
    }

    // Token Quick Selector Bar (1, 2, 3, 4)
    updateTokenSelectorBar(isHuman && isLudo && st.phase === 'SELECTING_TOKEN', st.validTokens || []);

    // Update Compact Player Status Cards
    updateCompactPlayerCards(activeCardIdx);

    renderDiceFaces(st.diceVal || 1);
    updateDebugHUD();
  }

  function updateDynamicDicePosition(activePlayer, pCount) {
    const isLudo = currentGameType === 'ludo';
    const cIdx = (activePlayer.colorIdx !== undefined)
      ? activePlayer.colorIdx
      : ((pCount === 2 && activePlayer.id === 1) ? 2 : activePlayer.id);

    // Map colorIdx / seat to station mount ID:
    // 0 (Red) -> dock-mount-tl
    // 1 (Green) -> dock-mount-tr
    // 2 (Yellow) -> dock-mount-br
    // 3 (Blue) -> dock-mount-bl
    let mountId = 'dock-mount-tl';
    if (cIdx === 1) mountId = 'dock-mount-tr';
    else if (cIdx === 2) mountId = 'dock-mount-br';
    else if (cIdx === 3) mountId = 'dock-mount-bl';

    const targetMount = document.getElementById(mountId);
    const actionDock = document.getElementById('game-action-dock');

    if (targetMount && actionDock && actionDock.parentElement !== targetMount) {
      actionDock.classList.add('dock-moving');
      targetMount.appendChild(actionDock);
      const rAF = (typeof requestAnimationFrame === 'function') ? requestAnimationFrame : (cb => setTimeout(cb, 16));
      rAF(() => {
        actionDock.classList.remove('dock-moving');
      });
    }
  }

  function updatePlayerColorTheme(activePlayer) {
    if (!activePlayer || !activePlayer.color) return;
    const hex = activePlayer.color.hex || '#4f46e5';
    let r = 79, g = 70, b = 229;
    if (typeof hex === 'string' && hex.startsWith('#') && hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16) || 79;
      g = parseInt(hex.slice(3, 5), 16) || 70;
      b = parseInt(hex.slice(5, 7), 16) || 229;
    }

    const arena = document.querySelector('.game-arena-layout') || document.documentElement;
    if (arena && arena.style) {
      arena.style.setProperty('--current-player-color', hex);
      arena.style.setProperty('--current-player-color-soft', `rgba(${r}, ${g}, ${b}, 0.15)`);
      arena.style.setProperty('--current-player-color-border', `rgba(${r}, ${g}, ${b}, 0.5)`);
      arena.style.setProperty('--current-player-color-glow', `rgba(${r}, ${g}, ${b}, 0.35)`);
    }

    const btnRoll = document.getElementById('btn-roll');
    if (btnRoll) {
      const colName = activePlayer.color.name || 'Player';
      btnRoll.setAttribute('aria-label', `${activePlayer.name}'s turn (${colName}) — Roll Dice`);
    }
  }

  function updateTokenSelectorBar(visible, validTokens) {
    const bar = document.getElementById('token-selector-bar');
    if (!bar) return;

    if (!visible) {
      bar.style.display = 'none';
      return;
    }

    bar.style.display = 'flex';
    const st = LudoEngine.getState();
    const currentPIdx = st.turnIdx;
    const tokens = st.tokens[currentPIdx] || [];
    const playerHex = st.players[currentPIdx]?.color.hex || '#4f46e5';

    for (let i = 0; i < 4; i++) {
      const btn = document.getElementById(`token-select-btn-${i}`);
      if (!btn) continue;

      const isValid = validTokens.includes(i);
      const tok = tokens[i];
      btn.disabled = !isValid;
      btn.classList.toggle('valid-choice', isValid);
      btn.classList.toggle('selected-choice', st.selectedTokenId === i);
      btn.style.setProperty('--token-color', playerHex);

      const statusSpan = btn.querySelector('.token-btn-state');
      if (statusSpan && tok) {
        if (tok.state === 'HOME') statusSpan.innerText = 'Base';
        else if (tok.state === 'FINISHED') statusSpan.innerText = 'Goal';
        else statusSpan.innerText = `Step ${tok.stepCount || 0}`;
      }
    }
  }

  function updateCompactPlayerCards(activeCardIdx) {
    const isLudo = currentGameType === 'ludo';
    const engine = isLudo ? LudoEngine : LadderEngine;
    const st = engine.getState();
    const pCount = st.players.length;

    st.players.forEach((p, pIdx) => {
      const cardIdx = (pCount === 2 && pIdx === 1) ? 2 : pIdx;
      const cardEl = document.getElementById(`player-card-${cardIdx}`);
      const statsRowEl = document.getElementById(`player-stats-${cardIdx}`);
      const turnBadgeEl = document.getElementById(`player-turn-badge-${cardIdx}`);

      if (!cardEl) return;

      const isActive = (cardIdx === activeCardIdx) && st.winner === null;
      cardEl.classList.toggle('active', isActive);

      if (turnBadgeEl) {
        turnBadgeEl.style.display = isActive ? 'inline-block' : 'none';
      }

      if (isLudo) {
        if (st.tokens && st.tokens[pIdx]) {
          const inBase = st.tokens[pIdx].filter((t) => t.state === 'HOME').length;
          const onBoard = st.tokens[pIdx].filter((t) => t.state === 'ON_BOARD' || t.state === 'HOME_COLUMN').length;
          const finished = st.tokens[pIdx].filter((t) => t.state === 'FINISHED').length;

          // Render compact token pips: Finished (★), Active (●), Base (○)
          let pipsHtml = '';
          for (let f = 0; f < finished; f++) pipsHtml += '<span class="token-pip pip-finished" title="Finished">★</span>';
          for (let o = 0; o < onBoard; o++) pipsHtml += '<span class="token-pip pip-board" title="On Track">●</span>';
          for (let b = 0; b < inBase; b++) pipsHtml += '<span class="token-pip pip-base" title="In Base">○</span>';

          if (statsRowEl) {
            statsRowEl.innerHTML = `<div class="token-pips-row">${pipsHtml}</div>`;
          }

          const baseEl = document.getElementById(`p${cardIdx}-base`);
          const activeEl = document.getElementById(`p${cardIdx}-active`);
          const finishedEl = document.getElementById(`p${cardIdx}-finished`);
          if (baseEl) baseEl.innerText = inBase;
          if (activeEl) activeEl.innerText = onBoard;
          if (finishedEl) finishedEl.innerText = finished;
        }
      } else {
        const pos = st.positions ? (st.positions[pIdx] || 0) : 0;
        if (statsRowEl) {
          statsRowEl.innerHTML = `
            <div class="ladder-compact-status">
              <span class="ladder-tile-num">Tile ${pos}</span>
              <div class="ladder-progress-mini"><div class="ladder-progress-fill" style="width:${pos}%;"></div></div>
            </div>
          `;
        }
      }
    });
  }

  function renderDiceFaces(val) {
    const diceEl = document.getElementById('dice-element');
    if (!diceEl) return;

    let pipsHtml = '';
    if (val === 1) {
      pipsHtml = '<span class="pip pip-center"></span>';
    } else if (val === 2) {
      pipsHtml = '<span class="pip pip-tl"></span><span class="pip pip-br"></span>';
    } else if (val === 3) {
      pipsHtml = '<span class="pip pip-tl"></span><span class="pip pip-center"></span><span class="pip pip-br"></span>';
    } else if (val === 4) {
      pipsHtml = '<span class="pip pip-tl"></span><span class="pip pip-tr"></span><span class="pip pip-bl"></span><span class="pip pip-br"></span>';
    } else if (val === 5) {
      pipsHtml = '<span class="pip pip-tl"></span><span class="pip pip-tr"></span><span class="pip pip-center"></span><span class="pip pip-bl"></span><span class="pip pip-br"></span>';
    } else if (val === 6) {
      pipsHtml = '<span class="pip pip-tl"></span><span class="pip pip-tr"></span><span class="pip pip-ml"></span><span class="pip pip-mr"></span><span class="pip pip-bl"></span><span class="pip pip-br"></span>';
    }

    diceEl.innerHTML = `<div class="dice-face face-${val}">${pipsHtml}</div>`;
  }

  function handleHumanRoll() {
    if (isPaused || isDiceRolling) return;
    const engine = currentGameType === 'ludo' ? LudoEngine : LadderEngine;
    const st = engine.getState();

    if (st.players[st.turnIdx]?.type !== 'human' || st.winner !== null) {
      return;
    }

    if (currentGameType === 'ludo' && st.phase === 'SELECTING_TOKEN') {
      const tokId = st.selectedTokenId !== null ? st.selectedTokenId : (st.validTokens && st.validTokens[0]);
      if (tokId !== undefined && tokId !== null) {
        handleTokenSelect(tokId);
      }
      return;
    }

    if (st.phase !== 'WAITING_FOR_ROLL') {
      return;
    }

    // Tactile vibration on press
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(22); } catch (e) {}
    }

    SoundFX.roll();
    const isLudo = currentGameType === 'ludo';

    if (isLudo) {
      const res = LudoEngine.rollDice();
      animateDiceTumble(res.diceVal, () => {
        InputController.announce(`Rolled a ${res.diceVal}`);
        renderCurrentBoard();
        updateTurnUI();

        if (res.threeSixesPenalty) {
          InputController.announce('Three consecutive sixes! Turn lost.');
          TimerManager.setTimeout(() => {
            LudoEngine.passTurn();
            saveCurrentGameState();
            renderCurrentBoard();
            processTurn();
          }, 800);
          return;
        }

        if (!res.movesAvailable) {
          TimerManager.setTimeout(() => {
            LudoEngine.passTurn();
            saveCurrentGameState();
            renderCurrentBoard();
            processTurn();
          }, 700);
        } else if (res.autoSelectable) {
          TimerManager.setTimeout(() => {
            handleTokenSelect(res.tokens[0]);
          }, 260);
        }
      });
    } else {
      const res = LadderEngine.rollDice();
      animateDiceTumble(res.roll, () => {
        InputController.announce(`Rolled a ${res.roll}`);
        renderCurrentBoard();
        updateTurnUI();

        if (!res.canMove) {
          InputController.announce(`Need exact roll to reach 100.`);
          TimerManager.setTimeout(() => {
            LadderEngine.passTurn();
            saveCurrentGameState();
            renderCurrentBoard();
            processTurn();
          }, 700);
          return;
        }

        LadderRenderer.startMovementAnimation(
          st.turnIdx,
          res.walkPath,
          res.effect,
          res.effectTarget,
          () => {
            const moveRes = LadderEngine.applyMove(st.turnIdx, res.finalPos);
            saveCurrentGameState();
            renderCurrentBoard();

            if (moveRes.status === 'win') {
              triggerVictory(st.players[moveRes.winner]);
            } else {
              processTurn();
            }
          }
        );
      });
    }
  }

  function handleTokenSelect(tokenId) {
    if (isPaused || currentGameType !== 'ludo') return;
    const st = LudoEngine.getState();
    const currentPIdx = st.turnIdx;

    if (!st.validTokens.includes(tokenId)) return;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(15); } catch (e) {}
    }

    const path = LudoEngine.getStepPath(currentPIdx, tokenId, st.diceVal);
    st.phase = 'MOVING_TOKEN';
    updateTurnUI();

    LudoRenderer.startTokenAnimation(currentPIdx, tokenId, path, () => {
      const res = LudoEngine.applyTokenMove(currentPIdx, tokenId);
      if (!res) {
        processTurn();
        return;
      }

      const tok = st.tokens[currentPIdx]?.find((t) => t.id === tokenId);
      const playerColor = st.players[currentPIdx]?.color.hex || '#ef4444';

      if (res.captured) {
        SoundFX.capture();
        InputController.announce('Opponent token captured!');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate([40, 40, 60]); } catch (e) {}
        }
        if (tok && LudoRenderer.spawnCaptureEffect) {
          LudoRenderer.spawnCaptureEffect(tok._vx, tok._vy, playerColor);
        }
      }

      if (tok && tok.state === 'FINISHED' && LudoRenderer.spawnFinishEffect) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate([30, 30, 80]); } catch (e) {}
        }
        LudoRenderer.spawnFinishEffect(tok._vx, tok._vy, playerColor);
      }

      saveCurrentGameState();
      renderCurrentBoard();

      if (res.status === 'win') {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate([60, 50, 100, 50, 150]); } catch (e) {}
        }
        triggerVictory(st.players[res.winner]);
      } else {
        processTurn();
      }
    });
  }

  function processTurn() {
    if (isPaused) return;
    const engine = currentGameType === 'ludo' ? LudoEngine : LadderEngine;
    const st = engine.getState();
    updateTurnUI();

    if (st.winner !== null) return;

    const activePlayer = st.players[st.turnIdx];

    if (activePlayer && activePlayer.type === 'bot') {
      const thinkDelay = 600 + Math.random() * 300;

      TimerManager.setTimeout(() => {
        if (isPaused) return;

        SoundFX.roll();
        if (currentGameType === 'ludo') {
          const res = LudoEngine.rollDice();
          if (!res) return;
          animateDiceTumble(res.diceVal, () => {
            if (isPaused) return;
            renderCurrentBoard();
            updateTurnUI();

            if (res.threeSixesPenalty || !res.movesAvailable) {
              TimerManager.setTimeout(() => {
                if (isPaused) return;
                LudoEngine.passTurn();
                saveCurrentGameState();
                renderCurrentBoard();
                processTurn();
              }, 650);
            } else {
              const botChoice = BotAI.chooseLudoMove(st.turnIdx, res.tokens);
              TimerManager.setTimeout(() => {
                if (isPaused) return;
                handleTokenSelect(botChoice);
              }, 450);
            }
          });
        } else {
          const res = LadderEngine.rollDice();
          if (!res) return;
          animateDiceTumble(res.roll, () => {
            if (isPaused) return;
            renderCurrentBoard();
            updateTurnUI();

            if (!res.canMove) {
              TimerManager.setTimeout(() => {
                if (isPaused) return;
                LadderEngine.passTurn();
                saveCurrentGameState();
                renderCurrentBoard();
                processTurn();
              }, 650);
              return;
            }

            LadderRenderer.startMovementAnimation(
              st.turnIdx,
              res.walkPath,
              res.effect,
              res.effectTarget,
              () => {
                if (isPaused) return;
                const moveRes = LadderEngine.applyMove(st.turnIdx, res.finalPos);
                saveCurrentGameState();
                renderCurrentBoard();

                if (moveRes.status === 'win') {
                  triggerVictory(st.players[moveRes.winner]);
                } else {
                  processTurn();
                }
              }
            );
          });
        }
      }, thinkDelay);
    }
  }

  let isDiceRolling = false;

  function animateDiceTumble(finalVal, cb) {
    if (isDiceRolling) return;
    isDiceRolling = true;

    const diceBox = document.querySelector('.dice-box');
    const diceEl = document.getElementById('dice-element');
    const rollBtn = document.getElementById('btn-roll');
    const isReduced = Storage.get('settings')?.reducedMotion ||
                      (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    if (rollBtn) {
      rollBtn.disabled = true;
      rollBtn.classList.add('is-rolling');
      rollBtn.innerText = 'ROLLING...';
    }

    if (!diceEl) {
      isDiceRolling = false;
      if (rollBtn) rollBtn.classList.remove('is-rolling');
      if (cb) cb();
      return;
    }

    if (isReduced) {
      diceEl.classList.add('rolling-reduced');
      TimerManager.setTimeout(() => {
        renderDiceFaces(finalVal);
        diceEl.classList.remove('rolling-reduced');
        isDiceRolling = false;
        if (rollBtn) rollBtn.classList.remove('is-rolling');
        if (cb) cb();
      }, 250);
      return;
    }

    // Realistic 3D Roll Animation
    if (diceBox) diceBox.classList.add('rolling-active');
    diceEl.classList.add('rolling-3d');

    // Rapid intermediate face cycling while airborne
    let cycleCount = 0;
    const maxCycles = 9;
    const cycleInterval = TimerManager.setInterval(() => {
      cycleCount++;
      const randomFace = Math.floor(Math.random() * 6) + 1;
      renderDiceFaces(randomFace);
      if (cycleCount >= maxCycles) {
        TimerManager.clearInterval(cycleInterval);
      }
    }, 65);

    // Impact landing at 700ms: settle on the authoritative finalVal
    TimerManager.setTimeout(() => {
      TimerManager.clearInterval(cycleInterval);
      renderDiceFaces(finalVal);

      // Light tactile tap and impact sound on landing
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(12); } catch (e) {}
      }
      if (typeof SoundFX !== 'undefined' && SoundFX.move) {
        SoundFX.move();
      }
    }, 700);

    // Full animation settles at 880ms
    TimerManager.setTimeout(() => {
      if (diceBox) diceBox.classList.remove('rolling-active');
      diceEl.classList.remove('rolling-3d');
      isDiceRolling = false;
      if (rollBtn) rollBtn.classList.remove('is-rolling');
      if (cb) cb();
    }, 880);
  }

  function renderCurrentBoard() {
    if (currentGameType === 'ludo') {
      LudoRenderer.render(performance.now());
    } else if (currentGameType === 'ladder') {
      LadderRenderer.render(performance.now());
    }
  }

  let confettiAnimId = null;

  function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#fde047'];
    for (let i = 0; i < 75; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * 50 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 10,
        tiltAngleInc: Math.random() * 0.07 + 0.05,
        tiltAngle: 0
      });
    }

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.tiltAngle += p.tiltAngleInc;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.d);
        p.tilt = Math.sin(p.tiltAngle) * 12;

        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
        ctx.stroke();
      });

      if (document.getElementById('modal-victory')?.classList.contains('active')) {
        confettiAnimId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    draw();
  }

  function triggerVictory(winnerPlayer) {
    SoundFX.win();
    Storage.clearSavedGame(currentGameType);

    const xpGained = 250;
    const xpResult = Storage.addXP(xpGained);

    if (winnerPlayer.type === 'human') {
      Storage.updateStats(currentGameType, { won: 1 });
    } else {
      Storage.updateStats(currentGameType, { lost: 1 });
    }

    Achievements.checkEvent('WIN', {
      gameType: currentGameType,
      finishedCount: 4
    });

    Storage.addHistory({
      type: currentGameType === 'ludo' ? 'Ludo Master' : 'Snakes & Ladders',
      winner: winnerPlayer.name,
      players: (currentGameType === 'ludo' ? LudoEngine : LadderEngine).getState().players.length
    });

    const modal = document.getElementById('modal-victory');
    const winnerNameEl = document.getElementById('winner-name');
    const victoryXpEl = document.getElementById('victory-xp-amount');
    const statsSummaryEl = document.getElementById('victory-stats-summary');

    if (winnerNameEl) {
      winnerNameEl.innerText = winnerPlayer.type === 'human' ? 'YOU WIN!' : `${winnerPlayer.name} Won!`;
    }
    if (victoryXpEl) victoryXpEl.innerText = `+${xpGained} XP`;

    if (statsSummaryEl) {
      if (currentGameType === 'ludo') {
        const ludoStats = Storage.get('stats').ludo;
        statsSummaryEl.innerHTML = `
          <div class="stat-badge"><strong>4 / 4</strong> Tokens Finished</div>
          <div class="stat-badge"><strong>${ludoStats.captures || 0}</strong> Total Captures</div>
          <div class="stat-badge"><strong>Level ${xpResult.newLevel}</strong></div>
        `;
      } else {
        const ladderStats = Storage.get('stats').ladder;
        statsSummaryEl.innerHTML = `
          <div class="stat-badge"><strong>${ladderStats.ladders || 0}</strong> Ladders Climbed</div>
          <div class="stat-badge"><strong>${ladderStats.snakes || 0}</strong> Snakes Hit</div>
          <div class="stat-badge"><strong>Level ${xpResult.newLevel}</strong></div>
        `;
      }
    }

    if (modal) {
      modal.classList.add('active');
      launchConfetti();
    }
  }

  function closeVictoryModal() {
    if (confettiAnimId) {
      cancelAnimationFrame(confettiAnimId);
      confettiAnimId = null;
    }
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    document.getElementById('modal-victory')?.classList.remove('active');
  }

  function rematch() {
    closeVictoryModal();
    const engine = currentGameType === 'ludo' ? LudoEngine : LadderEngine;
    const currentPlayers = engine.getState().players;
    TimerManager.clearAll();
    isPaused = false;

    engine.init(currentPlayers);
    setupGameArena();
    saveCurrentGameState();
    renderCurrentBoard();
    processTurn();
  }

  // --- PAUSE & CONFIRMATION MODALS ---
  function togglePause() {
    if (activeView !== 'game') return;
    const modal = document.getElementById('modal-pause');
    isPaused = !isPaused;

    if (isPaused) {
      TimerManager.clearAll();
      modal?.classList.add('active');
    } else {
      modal?.classList.remove('active');
      processTurn();
    }
  }

  function restartCurrentGame() {
    // Confirmation required to prevent accidental destruction of game
    confirmAction({
      title: 'Restart Match?',
      message: 'Your current game progress will be lost and the match will start over.',
      confirmText: 'Restart Game',
      danger: true,
      onConfirm: () => {
        document.getElementById('modal-pause')?.classList.remove('active');
        rematch();
      }
    });
  }

  function saveAndExit() {
    saveCurrentGameState();
    document.getElementById('modal-pause')?.classList.remove('active');
    TimerManager.clearAll();
    isPaused = false;
    showView('home');
  }

  function quitToHome() {
    // Confirmation required to prevent accidental quit
    confirmAction({
      title: 'Quit Match?',
      message: 'Your current match will not be saved and progress will be lost.',
      confirmText: 'Quit Game',
      danger: true,
      onConfirm: () => {
        Storage.clearSavedGame(currentGameType);
        document.getElementById('modal-pause')?.classList.remove('active');
        TimerManager.clearAll();
        isPaused = false;
        showView('home');
      }
    });
  }

  function confirmAction({ title, message, details = '', confirmText = 'Confirm', cancelText = 'Cancel', danger = false, onConfirm }) {
    const modal = document.getElementById('modal-confirm');
    const titleEl = document.getElementById('confirm-title');
    const msgEl = document.getElementById('confirm-message');
    const detailsEl = document.getElementById('confirm-details');
    const btnConfirm = document.getElementById('btn-confirm-action');
    const btnCancel = document.getElementById('btn-confirm-cancel');

    if (!modal) {
      if (confirm(message)) {
        if (onConfirm) onConfirm();
      }
      return;
    }

    if (titleEl) titleEl.innerText = title;
    if (msgEl) msgEl.innerText = message;
    if (detailsEl) {
      detailsEl.innerText = details;
      detailsEl.style.display = details ? 'block' : 'none';
    }

    if (btnConfirm) {
      btnConfirm.innerText = confirmText;
      btnConfirm.className = danger ? 'btn btn-danger btn-block' : 'btn btn-primary btn-block';
      pendingConfirmCallback = onConfirm;
    }

    if (btnCancel) {
      btnCancel.innerText = cancelText;
    }

    modal.classList.add('active');
  }

  function closeConfirmModal() {
    const modal = document.getElementById('modal-confirm');
    if (modal) modal.classList.remove('active');
    pendingConfirmCallback = null;
  }

  function executePendingConfirm() {
    const cb = pendingConfirmCallback;
    closeConfirmModal();
    if (cb) cb();
  }

  function handleEscapeKey() {
    // Modal dismissals in reverse stacking order
    const confirmModal = document.getElementById('modal-confirm');
    if (confirmModal && confirmModal.classList.contains('active')) {
      closeConfirmModal();
      return;
    }

    const victoryModal = document.getElementById('modal-victory');
    if (victoryModal && victoryModal.classList.contains('active')) {
      closeVictoryModal();
      showView('home');
      return;
    }

    const pauseModal = document.getElementById('modal-pause');
    if (pauseModal && pauseModal.classList.contains('active')) {
      togglePause();
      return;
    }

    if (activeView === 'game') {
      togglePause();
    } else if (activeView === 'setup' || activeView === 'play') {
      showView('home');
    }
  }

  function saveCurrentGameState() {
    if (!currentGameType) return;
    const engine = currentGameType === 'ludo' ? LudoEngine : LadderEngine;
    const state = engine.getState();
    if (state.winner === null) {
      Storage.saveGame(currentGameType, state);
    }
  }

  function checkSavedGames() {
    const banner = document.getElementById('continue-banner');
    const desc = document.getElementById('continue-desc');
    const btnResume = document.getElementById('btn-continue-game');
    const btnDelete = document.getElementById('btn-delete-saved');

    const ludoSave = Storage.getSavedGame('ludo');
    const ladderSave = Storage.getSavedGame('ladder');
    const activeSave = ludoSave || ladderSave;

    if (activeSave && activeSave.data && activeSave.data.winner === null) {
      if (banner) banner.style.display = 'flex';
      const isLudo = activeSave.type === 'ludo';
      if (desc) desc.innerText = `${isLudo ? 'Ludo Master' : 'Snakes & Ladders'} • ${activeSave.data.players.length} Players • Saved match`;

      if (btnResume) {
        btnResume.onclick = () => {
          currentGameType = activeSave.type;
          TimerManager.clearAll();
          isPaused = false;
          if (currentGameType === 'ludo') {
            LudoEngine.restoreState(activeSave.data);
          } else {
            LadderEngine.restoreState(activeSave.data);
          }
          setupGameArena();
          showView('game');
          renderCurrentBoard();
          processTurn();
        };
      }

      if (btnDelete) {
        btnDelete.onclick = () => {
          confirmAction({
            title: 'Discard Saved Match?',
            message: 'Are you sure you want to discard this saved game? This cannot be undone.',
            confirmText: 'Discard Match',
            danger: true,
            onConfirm: () => {
              Storage.clearSavedGame(activeSave.type);
              if (banner) banner.style.display = 'none';
              showToast('Saved match discarded.');
            }
          });
        };
      }
    } else {
      if (banner) banner.style.display = 'none';
    }
  }

  function showToast(msg) {
    let toast = document.getElementById('app-global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-global-toast';
      toast.className = 'app-toast';
      document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  function claimDailyReward() {
    const p = Storage.get('profile') || { name: 'Player 1', xp: 150, level: 1 };
    const currentXp = p.xp !== undefined && p.xp !== null ? p.xp : 150;
    const newXp = currentXp + 50;
    const newLvl = Math.floor(newXp / 500) + 1;
    Storage.set('profile', { ...p, xp: newXp, level: newLvl });
    SoundFX.win();
    showToast('🎁 Daily Reward Claimed! +50 XP');
    updateProfileUI();
  }

  function updateHomeStatsUI() {
    const stats = Storage.get('stats') || {};
    const ls = stats.ludo || {};
    const ks = stats.ladder || {};

    const totalPlayed = (ls.played || 0) + (ks.played || 0);
    const totalWon = (ls.won || 0) + (ks.won || 0);
    const winRate = totalPlayed ? Math.round((totalWon / totalPlayed) * 100) : 0;

    const elPlayed = document.getElementById('home-stat-games');
    const elWon = document.getElementById('home-stat-wins');
    const elWinRate = document.getElementById('home-stat-winrate');

    if (elPlayed) elPlayed.innerText = totalPlayed;
    if (elWon) elWon.innerText = totalWon;
    if (elWinRate) elWinRate.innerText = `${winRate}%`;
  }

  function updateProfileUI() {
    const p = Storage.get('profile') || { name: 'Player 1', xp: 0, level: 1 };
    const stats = Storage.get('stats') || {};

    const currentXp = p.xp !== undefined && p.xp !== null ? p.xp : 0;
    const currentLvl = p.level || 1;
    const xpInLevel = currentXp % 500;
    const xpPercent = Math.min((xpInLevel / 500) * 100, 100);

    const welcomeName = document.getElementById('home-welcome-name');
    if (welcomeName) welcomeName.innerText = p.name || 'Player 1';

    // Desktop top bar user pill
    const pillName = document.getElementById('desktop-pill-name');
    if (pillName) pillName.innerText = p.name || 'Player 1';
    const pillLevel = document.getElementById('desktop-pill-level');
    if (pillLevel) pillLevel.innerText = `Level ${currentLvl}`;
    const avatarInitials = document.getElementById('desktop-avatar-initials');
    if (avatarInitials) {
      avatarInitials.innerText = (p.name && p.name.trim()) ? p.name.trim().charAt(0).toUpperCase() : 'P';
    }

    // Sidebar mini profile
    const sbName = document.getElementById('sidebar-profile-name');
    if (sbName) sbName.innerText = p.name || 'Player 1';
    const sbLvl = document.getElementById('sidebar-profile-level');
    if (sbLvl) sbLvl.innerText = `Level ${currentLvl}`;
    const sbAvatar = document.getElementById('sidebar-avatar-initials');
    if (sbAvatar) {
      sbAvatar.innerText = (p.name && p.name.trim()) ? p.name.trim().charAt(0).toUpperCase() : 'P';
    }
    const sbXpFill = document.getElementById('sidebar-xp-fill');
    if (sbXpFill) sbXpFill.style.width = `${xpPercent}%`;
    const sbXpText = document.getElementById('sidebar-xp-text');
    if (sbXpText) sbXpText.innerText = `${xpInLevel}/500 XP`;

    // Profile screen
    const profileNameInput = document.getElementById('profile-name-input');
    const profileLevel = document.getElementById('profile-level');
    const profileXpFill = document.getElementById('profile-xp-fill');
    const profileXpText = document.getElementById('profile-xp-text');

    if (profileNameInput && document.activeElement !== profileNameInput) {
      profileNameInput.value = p.name || 'Player 1';
    }
    if (profileLevel) profileLevel.innerText = `Level ${currentLvl}`;
    if (profileXpFill) profileXpFill.style.width = `${xpPercent}%`;
    if (profileXpText) profileXpText.innerText = `${xpInLevel} / 500 XP to Level ${currentLvl + 1}`;

    // Ludo stats
    const ls = stats.ludo || {};
    setStatVal('stat-ludo-played', ls.played || 0);
    setStatVal('stat-ludo-won', ls.won || 0);
    const ludoWinRate = ls.played ? Math.round(((ls.won || 0) / ls.played) * 100) : 0;
    setStatVal('stat-ludo-winrate', `${ludoWinRate}%`);
    setStatVal('stat-ludo-captures', ls.captures || 0);
    setStatVal('stat-ludo-sixes', ls.sixes || 0);
    setStatVal('stat-ludo-finished', ls.tokensFinished || 0);

    // Ladder stats
    const ks = stats.ladder || {};
    setStatVal('stat-ladder-played', ks.played || 0);
    setStatVal('stat-ladder-won', ks.won || 0);
    const ladderWinRate = ks.played ? Math.round(((ks.won || 0) / ks.played) * 100) : 0;
    setStatVal('stat-ladder-winrate', `${ladderWinRate}%`);
    setStatVal('stat-ladder-ladders', ks.ladders || 0);
    setStatVal('stat-ladder-snakes', ks.snakes || 0);
    setStatVal('stat-ladder-rolls', ks.rolls || 0);
  }

  function setStatVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  }

  function renderAchievementsList() {
    const container = document.getElementById('achievements-list');
    if (!container) return;
    container.innerHTML = '';

    const achievements = Storage.get('achievements') || {};
    const icons = {
      firstWin: '🏆',
      tenWins: '👑',
      capturer: '🎯',
      sharpShooter: '⚡',
      luckySix: '🎲',
      climber: '🪜',
      snakeSurvivor: '🐍',
      perfectFinish: '🌟'
    };

    Object.keys(achievements).forEach((key) => {
      const a = achievements[key];
      const div = document.createElement('div');
      div.className = `achievement-item ${a.unlocked ? 'unlocked' : 'locked'}`;
      div.innerHTML = `
        <div class="achievement-icon">${icons[key] || '⭐'}</div>
        <div class="achievement-content">
          <div class="achievement-title">${a.title} ${a.unlocked ? '✓' : ''}</div>
          <div class="achievement-desc">${a.desc}</div>
        </div>
        <div class="achievement-badge">${a.unlocked ? (a.date || 'Unlocked') : `+${a.xp} XP`}</div>
      `;
      container.appendChild(div);
    });
  }

  function renderHistoryList() {
    const container = document.getElementById('game-history-list');
    if (!container) return;
    const history = Storage.get('gameHistory') || [];

    if (history.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
          </div>
          <h3 class="empty-state-title">No matches yet</h3>
          <p class="empty-state-desc">Play your first game and your match history will appear here.</p>
          <button class="btn btn-primary" onclick="App.openSetup('ludo')">Play Ludo Now</button>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    history.forEach((h) => {
      const isLudo = h.type.includes('Ludo');
      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `
        <div class="history-item-left">
          <div class="history-game-badge ${isLudo ? 'badge-ludo' : 'badge-ladder'}">
            ${isLudo ? '🎲' : '🪜'}
          </div>
          <div>
            <div class="history-game-name">${h.type} <span class="text-muted">• ${h.players} Players</span></div>
            <div class="history-game-date">${h.date} ${h.time ? 'at ' + h.time : ''}</div>
          </div>
        </div>
        <div class="history-item-right">
          <span class="winner-pill">🏆 ${h.winner} Won</span>
        </div>
      `;
      container.appendChild(item);
    });
  }

  function updateSettingsUI() {
    const s = Storage.get('settings') || {};
    setCheckbox('setting-sound', s.sound !== false);
    setCheckbox('setting-vibration', s.vibration !== false);
    setCheckbox('setting-animation', s.animation !== false);
    setCheckbox('setting-reduced-motion', s.reducedMotion === true);

    const diffSelect = document.getElementById('setting-difficulty');
    if (diffSelect) diffSelect.value = s.difficulty || 'normal';
  }

  function setCheckbox(id, val) {
    const el = document.getElementById(id);
    if (el) el.checked = val;
  }

  function updateSetting(key, val) {
    const s = Storage.get('settings') || {};
    s[key] = val;
    Storage.set('settings', s);
    if (key === 'sound') updateSoundIcons();
  }

  function triggerPwaInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          document.getElementById('btn-pwa-install')?.style.setProperty('display', 'none');
          document.getElementById('btn-pwa-install-settings')?.style.setProperty('display', 'none');
        }
        deferredPrompt = null;
      });
    }
  }

  function toggleDebugMode(forcedVal = null) {
    debugMode = forcedVal !== null ? forcedVal : !debugMode;
    const overlay = document.getElementById('debug-overlay');
    if (overlay) overlay.style.display = debugMode ? 'block' : 'none';
    updateDebugHUD();
  }

  function updateDebugHUD() {
    if (!debugMode) return;
    const content = document.getElementById('debug-content');
    if (!content) return;

    if (!currentGameType) {
      content.innerHTML = 'Game not active';
      return;
    }

    const engine = currentGameType === 'ludo' ? LudoEngine : LadderEngine;
    const st = engine.getState();

    content.innerHTML = `
      <div>Type: <strong>${currentGameType}</strong></div>
      <div>Phase: <strong>${st.phase}</strong></div>
      <div>Turn: <strong>${st.players[st.turnIdx]?.name} (${st.turnIdx})</strong></div>
      <div>Dice: <strong>${st.diceVal}</strong></div>
      ${currentGameType === 'ludo' ? `<div>Valid Tokens: [${st.validTokens.join(', ')}]</div>` : ''}
      ${currentGameType === 'ladder' ? `<div>Pos: ${JSON.stringify(st.positions)}</div>` : ''}
    `;
  }

  function debugForceRoll(val) {
    if (!currentGameType) return;
    if (currentGameType === 'ludo') {
      LudoEngine.rollDice(val);
      renderCurrentBoard();
      updateTurnUI();
    } else {
      LadderEngine.rollDice(val);
      renderCurrentBoard();
      updateTurnUI();
    }
  }

  function debugPassTurn() {
    if (!currentGameType) return;
    const engine = currentGameType === 'ludo' ? LudoEngine : LadderEngine;
    engine.passTurn();
    renderCurrentBoard();
    updateTurnUI();
    processTurn();
  }

  function resetAllData() {
    confirmAction({
      title: 'Reset All Local Data?',
      message: 'This will delete your profile, match history, achievements, and all saved games.',
      details: 'This action cannot be undone. All statistics and progression will return to factory default.',
      confirmText: 'Reset Everything',
      cancelText: 'Keep My Data',
      danger: true,
      onConfirm: () => {
        Storage.reset();
        window.location.reload();
      }
    });
  }

  return {
    init,
    showView,
    openSetup,
    applyPreset,
    startGameFromSetup,
    handleHumanRoll,
    handleTokenSelect,
    rematch,
    togglePause,
    restartCurrentGame,
    saveAndExit,
    quitToHome,
    confirmAction,
    closeConfirmModal,
    executePendingConfirm,
    handleEscapeKey,
    closeVictoryModal,
    updateSetting,
    toggleSoundSetting,
    toggleTheme,
    triggerPwaInstall,
    toggleDebugMode,
    debugForceRoll,
    debugPassTurn,
    resetAllData,
    renderCurrentBoard,
    onPlayerTypeChange,
    toggleSidebar,
    calculateDesktopBoardSize,
    updateTurnUI: () => updateTurnUI(),
    getActiveView: () => activeView,
    getCurrentGameType: () => currentGameType
  };
})();

window.addEventListener('DOMContentLoaded', App.init);
