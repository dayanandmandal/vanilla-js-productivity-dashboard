import {
  STORAGE_KEYS,
  TIMER_BUTTON_LABEL,
  TIMER_MODE_CONFIG,
  TIMER_STATUS,
} from "../helpers/constants.js";
import {
  getTimer,
  setTimerDurationLeft,
  setTimerMode,
  setTimerStartTimestamp,
  setTimerStatus,
} from "../helpers/timerService.js";
import { persistStorageValue } from "../helpers/utils.js";

let timerIntervalId = null;

const getTimerSection = function () {
  return document.querySelector(".page-section[data-section='timer']");
};

const getElapsedSeconds = function (startTimestamp) {
  return Math.floor((Date.now() - startTimestamp) / 1000);
};

const getTimerDuration = function (mode) {
  return TIMER_MODE_CONFIG[mode].duration;
};

const resetTimerIntervalId = function () {
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
    return true;
  }

  return false;
};

const persistTimerState = function (state) {
  const timer = getTimer(state);

  const startTimestamp =
    timer.startTimestamp instanceof Date ? timer.startTimestamp : null;

  const durationLeft =
    typeof timer.durationLeft === "number" ? timer.durationLeft : null;

  persistStorageValue(STORAGE_KEYS.TIMER_MODE, timer.mode);
  persistStorageValue(STORAGE_KEYS.TIMER_STATUS, timer.status);
  persistStorageValue(STORAGE_KEYS.TIMER_START_TIMESTAMP, startTimestamp);
  persistStorageValue(STORAGE_KEYS.TIMER_DURATION_LEFT, durationLeft);
  persistStorageValue(
    STORAGE_KEYS.TIMER_HISTORY,
    JSON.stringify(timer.history),
  );
};

const getFormattedRemainingTime = function (timer) {
  let remainingTimeInSeconds = getRemainingSeconds(timer);

  remainingTimeInSeconds = Math.max(0, remainingTimeInSeconds);
  const mins = String(Math.floor(remainingTimeInSeconds / 60)).padStart(2, "0");
  const secs = String(remainingTimeInSeconds % 60).padStart(2, "0");

  return `${mins}:${secs}`;
};

const getRemainingSeconds = function (timer) {
  if (timer.status === TIMER_STATUS.PAUSED) {
    return Math.max(0, timer.durationLeft);
  }

  if (timer.startTimestamp) {
    const remainingTimeInSec =
      getTimerDuration(timer.mode) - getElapsedSeconds(timer.startTimestamp);

    return Math.max(0, remainingTimeInSec);
  }

  return getTimerDuration(timer.mode);
};

const startTimer = function (state) {
  setTimerStartTimestamp(state, new Date());
  setTimerDurationLeft(state, null);
};

const pauseTimer = function (state) {
  const timer = getTimer(state);

  const durationLeft = getRemainingSeconds(timer);

  setTimerDurationLeft(state, durationLeft);
  setTimerStartTimestamp(state, null);
};

const resumeTimer = function (state) {
  const timer = getTimer(state);

  const timeElapsedInSec = getTimerDuration(timer.mode) - timer.durationLeft;
  const startTimestamp = new Date(Date.now() - timeElapsedInSec * 1000);
  setTimerStartTimestamp(state, startTimestamp);
  setTimerDurationLeft(state, null);
};

const addTimerHistory = function (state) {
  const timer = getTimer(state);

  const historyItem = {
    id: Date.now(),
    mode: timer.mode,
    duration: getTimerDuration(timer.mode),
    completedAt: new Date().toISOString(),
    status: TIMER_STATUS.COMPLETED,
  };

  timer.history.push(historyItem);
};

const handleTimerCompletion = function (state) {
  const timer = getTimer(state);
  if (timer.status === TIMER_STATUS.COMPLETED) return;

  setTimerStatus(state, TIMER_STATUS.COMPLETED);
  addTimerHistory(state);
  resetTimerIntervalId();
  persistTimerState(state);
};

const timerReset = function (state) {
  setTimerStatus(state, TIMER_STATUS.IDLE);
  setTimerStartTimestamp(state, null);
  setTimerDurationLeft(state, null);
};

const timerToggle = function (state) {
  const timer = getTimer(state);
  let nextStatus = TIMER_STATUS.IDLE;

  switch (timer.status) {
    case TIMER_STATUS.IDLE: {
      startTimer(state);
      nextStatus = TIMER_STATUS.RUNNING;
      break;
    }
    case TIMER_STATUS.RUNNING: {
      pauseTimer(state);
      nextStatus = TIMER_STATUS.PAUSED;
      break;
    }
    case TIMER_STATUS.PAUSED: {
      nextStatus = TIMER_STATUS.RUNNING;
      resumeTimer(state);
      break;
    }
    case TIMER_STATUS.COMPLETED: {
      // reset button will handle this
      return;
    }
  }

  setTimerStatus(state, nextStatus);
};

const checkRemainingTime = function (state) {
  const timer = getTimer(state);

  const remaining = getRemainingSeconds(timer);

  if (remaining > 0) return;

  handleTimerCompletion(state);
};

const syncRunningInterval = function (state, render) {
  if (timerIntervalId) return;

  timerIntervalId = setInterval(() => {
    checkRemainingTime(state);
    render();
  }, 1000);
};

const syncTimerInterval = function (state, render) {
  const timer = getTimer(state);

  if (timer.status !== TIMER_STATUS.RUNNING) {
    resetTimerIntervalId();
  } else {
    syncRunningInterval(state, render);
  }
};

const setUpClickActionEvents = function (state, render) {
  const handleClickActionEvents = function (event) {
    const element = event.target.closest("[data-action]");
    if (!element) return;

    switch (element.dataset.action) {
      case "timer-toggle": {
        timerToggle(state);
        syncTimerInterval(state, render);
        persistTimerState(state);
        render();
        break;
      }

      case "timer-reset": {
        timerReset(state);
        syncTimerInterval(state, render);
        persistTimerState(state);
        render();
        break;
      }
    }
  };

  const timerSectionEle = getTimerSection();
  if (!timerSectionEle) return;

  const timerEle = timerSectionEle.querySelector('[data-role="timer"]');
  if (!timerEle) return;

  timerEle.addEventListener("click", handleClickActionEvents);
};

const setUpTimerModesEvents = function (state, render) {
  const handleTimerModesEvents = function (event) {
    const element = event.target.closest("[data-mode]");
    if (!element) return;

    const timer = getTimer(state);
    if (element.dataset.mode === timer.mode) return;

    setTimerMode(state, element.dataset.mode);
    timerReset(state);
    resetTimerIntervalId();
    persistTimerState(state);
    render();
  };

  const timerSectionEle = getTimerSection();
  if (!timerSectionEle) return;

  const timerModesEle = timerSectionEle.querySelector("#timer-modes");
  if (!timerModesEle) return;

  timerModesEle.addEventListener("click", handleTimerModesEvents);
};

const restoreRunningTimer = function (state, render) {
  checkRemainingTime(state);

  const updatedTimer = getTimer(state);

  if (updatedTimer.status === TIMER_STATUS.RUNNING) {
    syncRunningInterval(state, render);
  }
};

export const setUpTimerEvents = function (state, render) {
  setUpTimerModesEvents(state, render);
  setUpClickActionEvents(state, render);
  restoreRunningTimer(state, render);
};

export const renderTimerModeTab = function (state) {
  const timerSectionEle = getTimerSection();
  if (!timerSectionEle) return;

  const timerModeTabs = timerSectionEle.querySelectorAll("#timer-modes .tab");
  if (!timerModeTabs.length) return;

  const timer = getTimer(state);

  for (let tab of timerModeTabs) {
    const isActive = tab.dataset.mode === timer.mode;
    tab.classList.toggle("active", isActive);
  }
};

const renderTimerStatus = function (timerSectionEle, status) {
  timerSectionEle.classList.remove(
    "is-idle",
    "is-running",
    "is-paused",
    "is-completed",
  );
  timerSectionEle.classList.add(`is-${status}`);
};

export const renderTimer = function (state) {
  const timerSectionEle = getTimerSection();
  if (!timerSectionEle) return;

  const timerDisplayEle = timerSectionEle.querySelector(
    "[data-role='timer-display']",
  );
  const timerToggleEle = timerSectionEle.querySelector(
    "[data-action='timer-toggle']",
  );

  if (!timerDisplayEle || !timerToggleEle) return;

  const timer = getTimer(state);

  renderTimerStatus(timerSectionEle, timer.status);

  timerDisplayEle.textContent = getFormattedRemainingTime(timer);

  const toggleBtnText =
    TIMER_BUTTON_LABEL[timer.status] ?? TIMER_BUTTON_LABEL[TIMER_STATUS.IDLE];

  timerToggleEle.textContent = toggleBtnText;
};
