export const getTimer = function (state) {
  return state.timer;
};

export const setTimerStatus = function (state, status) {
  const timer = getTimer(state);
  timer.status = status;
};

export const setTimerStartTimestamp = function (state, timestamp) {
  const timer = getTimer(state);
  timer.startTimestamp = timestamp;
};

export const setTimerDurationLeft = function (state, durationLeft) {
  const timer = getTimer(state);
  timer.durationLeft = durationLeft;
};

export const setTimerMode = function (state, mode) {
  const timer = getTimer(state);
  timer.mode = mode;
};
