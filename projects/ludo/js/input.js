/**
 * InputController - Central unified input manager for Touch, Mouse, and Keyboard.
 * Translates all hardware interactions into authoritative GameActions.
 * Features ARIA live announcements, arrow-key token navigation, and touch-target optimization.
 */
const InputController = (() => {
  let ariaRegion = null;

  function init() {
    ensureAriaRegion();
    bindKeyboardEvents();
    bindCanvasPointerEvents();
  }

  function ensureAriaRegion() {
    ariaRegion = document.getElementById('aria-announcements');
    if (!ariaRegion) {
      ariaRegion = document.createElement('div');
      ariaRegion.id = 'aria-announcements';
      ariaRegion.className = 'sr-only';
      ariaRegion.setAttribute('aria-live', 'polite');
      ariaRegion.setAttribute('aria-atomic', 'true');
      document.body.appendChild(ariaRegion);
    }
  }

  function announce(message) {
    if (ariaRegion) {
      ariaRegion.textContent = '';
      window.setTimeout(() => {
        ariaRegion.textContent = message;
      }, 50);
    }
  }

  function bindKeyboardEvents() {
    window.addEventListener('keydown', (e) => {
      // Ignore keyboard events if user is typing in an input or select
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        if (e.key === 'Escape') document.activeElement.blur();
        return;
      }

      const activeView = App.getActiveView();

      // Global shortcuts
      if (e.key === 'Escape') {
        e.preventDefault();
        App.handleEscapeKey();
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        App.toggleSoundSetting();
        return;
      }

      if (e.key === 'F2' || e.key === '`') {
        e.preventDefault();
        App.toggleDebugMode();
        return;
      }

      // In-game shortcuts
      if (activeView === 'game') {
        if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          App.togglePause();
          return;
        }

        if (e.key === 'r' || e.key === 'R') {
          const victoryModal = document.getElementById('modal-victory');
          if (victoryModal && victoryModal.classList.contains('active')) {
            e.preventDefault();
            App.rematch();
            return;
          }
        }

        // Gameplay actions
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleAction('PRIMARY_CONFIRM');
          return;
        }

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'Tab') {
          e.preventDefault();
          handleAction('CYCLE_TOKEN_FORWARD');
          return;
        }

        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          handleAction('CYCLE_TOKEN_BACKWARD');
          return;
        }

        // Number keys 1-4 for instant token selection
        if (['1', '2', '3', '4'].includes(e.key)) {
          e.preventDefault();
          const tokenId = parseInt(e.key, 10) - 1;
          handleAction('DIRECT_TOKEN_SELECT', { tokenId });
          return;
        }
      }
    });
  }

  function bindCanvasPointerEvents() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    // Prevent default touch behaviors over board (zoom, scroll)
    canvas.style.touchAction = 'none';

    canvas.addEventListener('pointerdown', (e) => {
      if (App.getActiveView() !== 'game') return;
      
      const gameType = App.getCurrentGameType();
      if (gameType === 'ludo') {
        const hitToken = LudoRenderer.hitTestToken(e.clientX, e.clientY);
        if (hitToken) {
          e.preventDefault();
          handleAction('SELECT_OR_MOVE_TOKEN', { tokenId: hitToken.id });
        }
      }
    });
  }

  function handleAction(actionType, payload = {}) {
    const gameType = App.getCurrentGameType();
    if (!gameType) return;

    if (actionType === 'PRIMARY_CONFIRM') {
      if (gameType === 'ludo') {
        const st = LudoEngine.getState();
        if (st.phase === 'WAITING_FOR_ROLL' && st.players[st.turnIdx]?.type === 'human') {
          App.handleHumanRoll();
        } else if (st.phase === 'SELECTING_TOKEN' && st.selectedTokenId !== null) {
          App.handleTokenSelect(st.selectedTokenId);
        }
      } else {
        const st = LadderEngine.getState();
        if (st.phase === 'WAITING_FOR_ROLL' && st.players[st.turnIdx]?.type === 'human') {
          App.handleHumanRoll();
        }
      }
    } else if (actionType === 'CYCLE_TOKEN_FORWARD') {
      if (gameType === 'ludo') {
        const st = LudoEngine.getState();
        if (st.phase === 'SELECTING_TOKEN') {
          const nextId = LudoEngine.cycleSelectedToken(1);
          SoundFX.click();
          App.renderCurrentBoard();
          announce(`Token ${nextId + 1} selected`);
        }
      }
    } else if (actionType === 'CYCLE_TOKEN_BACKWARD') {
      if (gameType === 'ludo') {
        const st = LudoEngine.getState();
        if (st.phase === 'SELECTING_TOKEN') {
          const nextId = LudoEngine.cycleSelectedToken(-1);
          SoundFX.click();
          App.renderCurrentBoard();
          announce(`Token ${nextId + 1} selected`);
        }
      }
    } else if (actionType === 'DIRECT_TOKEN_SELECT') {
      if (gameType === 'ludo') {
        const st = LudoEngine.getState();
        if (st.phase === 'SELECTING_TOKEN' && st.validTokens.includes(payload.tokenId)) {
          LudoEngine.selectTokenById(payload.tokenId);
          SoundFX.click();
          App.handleTokenSelect(payload.tokenId);
        }
      }
    } else if (actionType === 'SELECT_OR_MOVE_TOKEN') {
      if (gameType === 'ludo') {
        const st = LudoEngine.getState();
        if (st.phase === 'SELECTING_TOKEN' && st.validTokens.includes(payload.tokenId)) {
          LudoEngine.selectTokenById(payload.tokenId);
          App.handleTokenSelect(payload.tokenId);
        }
      }
    }
  }

  return {
    init,
    announce,
    handleAction
  };
})();
