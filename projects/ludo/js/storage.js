/**
 * StorageManager - Versioned, robust LocalStorage management for Board Arena.
 * Supports data migration, corruption fallback, separate saved games for Ludo and Snakes & Ladders,
 * real statistics tracking, achievement persistence, and XP/level progression.
 */
const Storage = (() => {
  const STORAGE_KEY = 'boardGames_v2';
  const LEGACY_STORAGE_KEY = 'ludo_ladder_app_v1';
  const CURRENT_VERSION = 2;

  const defaultData = {
    version: CURRENT_VERSION,
    profile: {
      name: 'Player 1',
      avatar: '👤',
      xp: 0,
      level: 1
    },
    stats: {
      ludo: {
        played: 0,
        won: 0,
        lost: 0,
        captures: 0,
        sixes: 0,
        tokensFinished: 0,
        totalMoves: 0
      },
      ladder: {
        played: 0,
        won: 0,
        lost: 0,
        rolls: 0,
        sixes: 0,
        snakes: 0,
        ladders: 0
      }
    },
    settings: {
      sound: true,
      vibration: true,
      animation: true,
      reducedMotion: false,
      theme: 'dark',
      difficulty: 'normal',
      showCoordinates: false
    },
    achievements: {
      firstWin: { unlocked: false, title: 'First Victory', desc: 'Win your first game', xp: 100, date: null },
      tenWins: { unlocked: false, title: 'Master of Arena', desc: 'Win 10 games', xp: 500, date: null },
      capturer: { unlocked: false, title: 'Token Hunter', desc: 'Capture an opponent token in Ludo', xp: 50, date: null },
      sharpShooter: { unlocked: false, title: 'Strike Master', desc: 'Capture 5 tokens across all games', xp: 200, date: null },
      luckySix: { unlocked: false, title: 'Lucky Sixes', desc: 'Roll a six 10 times', xp: 100, date: null },
      climber: { unlocked: false, title: 'High Climber', desc: 'Climb 5 ladders in Snakes & Ladders', xp: 150, date: null },
      snakeSurvivor: { unlocked: false, title: 'Snake Survivor', desc: 'Encounter 5 snakes and finish the game', xp: 150, date: null },
      perfectFinish: { unlocked: false, title: 'Grand Slam', desc: 'Finish all 4 tokens in a single Ludo match', xp: 300, date: null }
    },
    gameHistory: [],
    savedGames: {
      ludo: null,
      ladder: null
    }
  };

  let cache = null;
  const listeners = new Set();

  function safeClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function init() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        cache = JSON.parse(raw);
        migrateData();
      } else {
        // Check for legacy v1 data
        const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyRaw) {
          try {
            const legacyData = JSON.parse(legacyRaw);
            cache = safeClone(defaultData);
            if (legacyData.profile) {
              cache.profile.name = legacyData.profile.name || 'Player 1';
              cache.profile.xp = legacyData.profile.xp || 0;
              cache.profile.level = legacyData.profile.level || 1;
            }
            if (legacyData.stats) {
              if (legacyData.stats.ludo) Object.assign(cache.stats.ludo, legacyData.stats.ludo);
              if (legacyData.stats.ladder) Object.assign(cache.stats.ladder, legacyData.stats.ladder);
            }
            if (legacyData.settings) {
              Object.assign(cache.settings, legacyData.settings);
            }
            if (legacyData.gameHistory && Array.isArray(legacyData.gameHistory)) {
              cache.gameHistory = legacyData.gameHistory;
            }
          } catch (e) {
            cache = safeClone(defaultData);
          }
        } else {
          cache = safeClone(defaultData);
        }
      }
    } catch (e) {
      console.warn('[Storage] Error loading storage, using defaults:', e);
      cache = safeClone(defaultData);
    }
    commit();
  }

  function migrateData() {
    if (!cache || typeof cache !== 'object') {
      cache = safeClone(defaultData);
      return;
    }
    // Ensure all default top-level fields exist
    Object.keys(defaultData).forEach((key) => {
      if (cache[key] === undefined) {
        cache[key] = safeClone(defaultData[key]);
      }
    });

    // Ensure nested stats fields exist
    ['ludo', 'ladder'].forEach((game) => {
      cache.stats[game] = Object.assign({}, defaultData.stats[game], cache.stats[game] || {});
    });

    // Ensure settings fields exist
    cache.settings = Object.assign({}, defaultData.settings, cache.settings || {});

    // Ensure achievements exist
    Object.keys(defaultData.achievements).forEach((achKey) => {
      if (!cache.achievements[achKey]) {
        cache.achievements[achKey] = safeClone(defaultData.achievements[achKey]);
      }
    });

    // Ensure savedGames structure
    if (!cache.savedGames || typeof cache.savedGames !== 'object') {
      cache.savedGames = { ludo: null, ladder: null };
    }
    cache.version = CURRENT_VERSION;
  }

  function commit() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
      notify();
    } catch (e) {
      console.error('[Storage] Error saving to localStorage:', e);
    }
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function notify() {
    listeners.forEach((fn) => {
      try {
        fn(cache);
      } catch (err) {
        console.error('[Storage] Listener error:', err);
      }
    });
  }

  init();

  return {
    get: (key) => cache ? cache[key] : safeClone(defaultData[key]),
    
    set: (key, val) => {
      if (!cache) init();
      cache[key] = val;
      commit();
    },

    saveGame: (gameType, gameData) => {
      if (!cache) init();
      if (!cache.savedGames) cache.savedGames = { ludo: null, ladder: null };
      cache.savedGames[gameType] = {
        type: gameType,
        timestamp: Date.now(),
        data: gameData
      };
      commit();
    },

    getSavedGame: (gameType) => {
      if (!cache || !cache.savedGames) return null;
      return cache.savedGames[gameType] || null;
    },

    clearSavedGame: (gameType) => {
      if (!cache || !cache.savedGames) return;
      if (gameType) {
        cache.savedGames[gameType] = null;
      } else {
        cache.savedGames = { ludo: null, ladder: null };
      }
      commit();
    },

    hasSavedGame: () => {
      if (!cache || !cache.savedGames) return false;
      return !!(cache.savedGames.ludo || cache.savedGames.ladder);
    },

    addHistory: (record) => {
      if (!cache) init();
      if (!Array.isArray(cache.gameHistory)) cache.gameHistory = [];
      cache.gameHistory.unshift({
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...record
      });
      if (cache.gameHistory.length > 50) {
        cache.gameHistory = cache.gameHistory.slice(0, 50);
      }
      commit();
    },

    addXP: (amount) => {
      if (!cache) init();
      const prevLevel = cache.profile.level || 1;
      cache.profile.xp = (cache.profile.xp || 0) + amount;
      // 500 XP per level
      const newLevel = Math.floor(cache.profile.xp / 500) + 1;
      const leveledUp = newLevel > prevLevel;
      cache.profile.level = newLevel;
      commit();
      return {
        newXP: cache.profile.xp,
        newLevel,
        leveledUp,
        xpIntoLevel: cache.profile.xp % 500,
        xpRequired: 500
      };
    },

    updateStats: (gameType, statUpdates) => {
      if (!cache) init();
      if (!cache.stats[gameType]) {
        cache.stats[gameType] = safeClone(defaultData.stats[gameType]);
      }
      Object.keys(statUpdates).forEach((k) => {
        if (typeof statUpdates[k] === 'number') {
          cache.stats[gameType][k] = (cache.stats[gameType][k] || 0) + statUpdates[k];
        }
      });
      commit();
    },

    unlockAchievement: (key) => {
      if (!cache) init();
      if (cache.achievements[key] && !cache.achievements[key].unlocked) {
        cache.achievements[key].unlocked = true;
        cache.achievements[key].date = new Date().toLocaleDateString();
        const xpEarned = cache.achievements[key].xp || 50;
        commit();
        const xpResult = Storage.addXP(xpEarned);
        return {
          achievement: cache.achievements[key],
          xpEarned,
          xpResult
        };
      }
      return null;
    },

    subscribe,

    reset: () => {
      cache = safeClone(defaultData);
      commit();
    }
  };
})();