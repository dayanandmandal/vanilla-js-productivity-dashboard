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

export const formatDuration = function (seconds) {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  if (totalMinutes > 0) {
    return `${totalMinutes} min`;
  }

  return `${remainingSeconds}s`;
};
