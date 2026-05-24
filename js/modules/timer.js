import {
  STORAGE_KEYS,
  TIMER_BUTTON_LABEL,
  TIMER_DEFAULT_SECONDS,
  TIMER_STATUS,
} from "../helpers/constants.js";
import {
  getTimer,
  setTimerDurationLeft,
  setTimerStartTimestamp,
  setTimerStatus,
} from "../helpers/timerService.js";

let timerIntervalId = null;

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
  if (timer.status) {
    localStorage.setItem(STORAGE_KEYS.TIMER_STATUS, timer.status);
  } else {
    localStorage.removeItem(STORAGE_KEYS.TIMER_STATUS);
  }

  if (timer.startTimestamp instanceof Date) {
    localStorage.setItem(
      STORAGE_KEYS.TIMER_START_TIMESTAMP,
      timer.startTimestamp,
    );
  } else {
    localStorage.removeItem(STORAGE_KEYS.TIMER_START_TIMESTAMP);
  }

  if (typeof timer.totalDuration === "number") {
    localStorage.setItem(
      STORAGE_KEYS.TIMER_TOTAL_DURATION,
      timer.totalDuration,
    );
  } else {
    localStorage.removeItem(STORAGE_KEYS.TIMER_TOTAL_DURATION);
  }

  if (typeof timer.durationLeft === "number") {
    localStorage.setItem(STORAGE_KEYS.TIMER_DURATION_LEFT, timer.durationLeft);
  } else {
    localStorage.removeItem(STORAGE_KEYS.TIMER_DURATION_LEFT);
  }
};

const formatRemainingTime = function (
  startTimestamp,
  totalDuration,
  durationLeft,
) {
  let remainingTimeInSeconds = totalDuration;

  if (startTimestamp) {
    const timeElaspedInSec = Math.floor((Date.now() - startTimestamp) / 1000);
    remainingTimeInSeconds -= timeElaspedInSec;
  } else if (typeof durationLeft === "number") {
    remainingTimeInSeconds = durationLeft;
  }

  remainingTimeInSeconds = Math.max(0, remainingTimeInSeconds);
  const mins = String(Math.floor(remainingTimeInSeconds / 60)).padStart(2, "0");
  const secs = String(remainingTimeInSeconds % 60).padStart(2, "0");

  return `${mins}:${secs}`;
};

// idle => running
// running => paused
// paused => running
const timerToggle = function (state) {
  const timer = getTimer(state);

  const nextStatus =
    timer.status === TIMER_STATUS.RUNNING
      ? TIMER_STATUS.PAUSED
      : TIMER_STATUS.RUNNING;

  if (timer.status === TIMER_STATUS.PAUSED) {
    // when user resume the timer
    const timeElaspedInSec = timer.totalDuration - timer.durationLeft;
    const startTimestamp = new Date(Date.now() - timeElaspedInSec * 1000);
    setTimerStartTimestamp(state, startTimestamp);
    setTimerDurationLeft(state, null);
  } else if (nextStatus === TIMER_STATUS.RUNNING) {
    // when user start the timer
    setTimerStartTimestamp(state, new Date());
    setTimerDurationLeft(state, null);
  }

  if (nextStatus === TIMER_STATUS.PAUSED) {
    // when user click on pause
    let durationLeft =
      timer.totalDuration -
      Math.floor((Date.now() - timer.startTimestamp) / 1000);

    durationLeft = Math.max(0, durationLeft);

    setTimerDurationLeft(state, durationLeft);
    setTimerStartTimestamp(state, null);
  }

  setTimerStatus(state, nextStatus);
};

const timerReset = function (state) {
  setTimerStatus(state, TIMER_STATUS.IDLE);
  setTimerStartTimestamp(state, null);
  setTimerDurationLeft(state, null);
};

const checkRemainingTime = function (state) {
  const timer = getTimer(state);

  const remaining =
    timer.totalDuration -
    Math.floor((Date.now() - timer.startTimestamp) / 1000);

  if (remaining <= 0) {
    timerReset(state);
    resetTimerIntervalId();
    persistTimerState(state);
  }
};

const handleTimerToggleInterval = function (state, render) {
  const timer = getTimer(state);

  switch (timer.status) {
    case TIMER_STATUS.RUNNING: {
      const timer = getTimer(state);
      if (timerIntervalId) return;
      timerIntervalId = setInterval(() => {
        checkRemainingTime(state);
        render();
      }, 1000);
      break;
    }

    case TIMER_STATUS.PAUSED: {
      resetTimerIntervalId();
      break;
    }
  }
};

const setUpClickActionEvents = function (state, render) {
  const handleClickActionEvents = function (event) {
    const element = event.target.closest("[data-action]");
    if (!element) return;

    switch (element.dataset.action) {
      case "timer-toggle": {
        timerToggle(state);
        handleTimerToggleInterval(state, render);
        persistTimerState(state);
        render();
        break;
      }

      case "timer-reset": {
        timerReset(state);
        resetTimerIntervalId();
        persistTimerState(state);
        render();
        break;
      }
    }
  };

  const timerSectionEle = document.querySelector(
    ".page-section[data-section='timer']",
  );
  if (!timerSectionEle) return;

  const timerEle = timerSectionEle.querySelector('[data-role="timer"]');
  if (!timerEle) return;

  timerEle.addEventListener("click", handleClickActionEvents);
};

const restoreRunningTimer = function (state, render) {
  const timer = getTimer(state);

  if (timer.status !== TIMER_STATUS.RUNNING) return;

  handleTimerToggleInterval(state, render);
};

export const setUpTimerEvents = function (state, render) {
  setUpClickActionEvents(state, render);
  restoreRunningTimer(state, render);
};

export const renderTimerCount = function (state) {
  const timerSectionEle = document.querySelector(
    ".page-section[data-section='timer']",
  );
  const timerDisplayEle = timerSectionEle.querySelector(
    "[data-role='timer-display']",
  );
  const timerToggleEle = timerSectionEle.querySelector(
    "[data-action='timer-toggle']",
  );

  if (!timerSectionEle || !timerDisplayEle || !timerToggleEle) return;

  const timer = getTimer(state);

  timerSectionEle.classList.remove("is-idle", "is-running", "is-paused");
  timerSectionEle.classList.add(`is-${timer.status.toLowerCase()}`);

  timerDisplayEle.textContent = formatRemainingTime(
    timer.startTimestamp,
    timer.totalDuration,
    timer.durationLeft,
  );

  const toggleBtnText =
    TIMER_BUTTON_LABEL[timer.status] ?? TIMER_BUTTON_LABEL[TIMER_STATUS.IDLE];

  timerToggleEle.textContent = toggleBtnText;
};
