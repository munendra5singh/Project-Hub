/**
 * Achievements - Achievement tracking, live toast notifications, and level progression.
 */
const Achievements = (() => {
  let toastContainer = null;

  function ensureToastContainer() {
    if (!toastContainer) {
      toastContainer = document.getElementById('toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
      }
    }
    return toastContainer;
  }

  function showToast(title, subtitle, icon = '🏆', xpText = '') {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = 'toast-card';
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-subtitle">${subtitle}</div>
      </div>
      ${xpText ? `<div class="toast-xp">+${xpText}</div>` : ''}
    `;

    container.appendChild(toast);
    SoundFX.achievement();

    // Trigger enter animation
    TimerManager.setTimeout(() => {
      toast.classList.add('show');
    }, 20);

    // Auto remove
    TimerManager.setTimeout(() => {
      toast.classList.remove('show');
      TimerManager.setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    }, 3800);
  }

  function checkEvent(eventType, eventData = {}) {
    const stats = Storage.get('stats');
    const achievements = Storage.get('achievements');

    if (!stats || !achievements) return;

    // Check First Victory
    if (eventType === 'WIN') {
      const totalWins = (stats.ludo.won || 0) + (stats.ladder.won || 0);
      if (totalWins >= 1 && !achievements.firstWin.unlocked) {
        unlock('firstWin');
      }
      if (totalWins >= 10 && !achievements.tenWins.unlocked) {
        unlock('tenWins');
      }
      if (eventData.gameType === 'ludo' && eventData.finishedCount === 4 && !achievements.perfectFinish.unlocked) {
        unlock('perfectFinish');
      }
    }

    // Check Capture
    if (eventType === 'CAPTURE') {
      if (!achievements.capturer.unlocked) {
        unlock('capturer');
      }
      if ((stats.ludo.captures || 0) >= 5 && !achievements.sharpShooter.unlocked) {
        unlock('sharpShooter');
      }
    }

    // Check Lucky Sixes
    if (eventType === 'SIX_ROLLED') {
      const totalSixes = (stats.ludo.sixes || 0) + (stats.ladder.sixes || 0);
      if (totalSixes >= 10 && !achievements.luckySix.unlocked) {
        unlock('luckySix');
      }
    }

    // Check Climber
    if (eventType === 'LADDER_CLIMBED') {
      if ((stats.ladder.ladders || 0) >= 5 && !achievements.climber.unlocked) {
        unlock('climber');
      }
    }

    // Check Snake Survivor
    if (eventType === 'SNAKE_ENCOUNTERED') {
      if ((stats.ladder.snakes || 0) >= 5 && !achievements.snakeSurvivor.unlocked) {
        unlock('snakeSurvivor');
      }
    }
  }

  function unlock(key) {
    const result = Storage.unlockAchievement(key);
    if (result && result.achievement) {
      showToast(
        `Achievement Unlocked!`,
        result.achievement.title + ': ' + result.achievement.desc,
        '🌟',
        `${result.xpEarned} XP`
      );

      if (result.xpResult && result.xpResult.leveledUp) {
        TimerManager.setTimeout(() => {
          showToast(
            `Level Up! 🎉`,
            `Congratulations! You reached Level ${result.xpResult.newLevel}!`,
            '⚡'
          );
        }, 1200);
      }
    }
  }

  return {
    checkEvent,
    showToast,
    unlock
  };
})();
