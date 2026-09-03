/**
 * TimerManager - Centralized timer and animation frame manager.
 * Prevents orphaned setTimeout callbacks and zombie bot turns when pausing,
 * exiting, rematching, or restarting games.
 */
const TimerManager = (() => {
  const activeTimeouts = new Set();
  const activeIntervals = new Set();
  let activeRaf = null;

  function setTimeoutTracked(callback, delay) {
    const id = window.setTimeout(() => {
      activeTimeouts.delete(id);
      try {
        callback();
      } catch (err) {
        console.error('[TimerManager] Error in timeout callback:', err);
      }
    }, delay);
    activeTimeouts.add(id);
    return id;
  }

  function clearTimeoutTracked(id) {
    if (id !== undefined && id !== null) {
      window.clearTimeout(id);
      activeTimeouts.delete(id);
    }
  }

  function setIntervalTracked(callback, interval) {
    const id = window.setInterval(() => {
      try {
        callback();
      } catch (err) {
        console.error('[TimerManager] Error in interval callback:', err);
      }
    }, interval);
    activeIntervals.add(id);
    return id;
  }

  function clearIntervalTracked(id) {
    if (id !== undefined && id !== null) {
      window.clearInterval(id);
      activeIntervals.delete(id);
    }
  }

  function requestAnimationFrameTracked(callback) {
    cancelAnimationFrameTracked();
    activeRaf = window.requestAnimationFrame((time) => {
      activeRaf = null;
      try {
        callback(time);
      } catch (err) {
        console.error('[TimerManager] Error in rAF callback:', err);
      }
    });
    return activeRaf;
  }

  function cancelAnimationFrameTracked() {
    if (activeRaf !== null) {
      window.cancelAnimationFrame(activeRaf);
      activeRaf = null;
    }
  }

  function clearAll() {
    activeTimeouts.forEach((id) => window.clearTimeout(id));
    activeTimeouts.clear();
    activeIntervals.forEach((id) => window.clearInterval(id));
    activeIntervals.clear();
    cancelAnimationFrameTracked();
  }

  return {
    setTimeout: setTimeoutTracked,
    clearTimeout: clearTimeoutTracked,
    setInterval: setIntervalTracked,
    clearInterval: clearIntervalTracked,
    requestAnimationFrame: requestAnimationFrameTracked,
    cancelAnimationFrame: cancelAnimationFrameTracked,
    clearAll
  };
})();
