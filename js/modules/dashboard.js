import { TIMER_MODE, TIMER_STATUS } from "../helpers/constants.js";
import { formatDuration, getTimer } from "../helpers/timerService.js";

const qs = function (root, sel) {
  return root.querySelector(sel);
};

const getDashboardSection = function () {
  return document.querySelector(".page-section[data-section='dashboard']");
};

const getMetricEl = function (root, key) {
  return qs(root, `[data-metric='${key}']`);
};

const getTodoMetrics = function (todos, todayStr) {
  const completed = todos.data.filter(function (t) {
    return t.isCompleted;
  });

  const completedToday = todos.data.filter(function (t) {
    return t.completedAt && new Date(t.completedAt).toDateString() === todayStr;
  });

  return {
    total: todos.data.length,
    completed: completed.length,
    remaining: todos.data.length - completed.length,
    completedToday: completedToday.length,
  };
};

const getNotesMetrics = function (notes) {
  return {
    total: notes.data.length,
  };
};

const isFocusCompletedToday = function (entry, todayStr) {
  return (
    entry.status === TIMER_STATUS.COMPLETED &&
    entry.mode === TIMER_MODE.FOCUS &&
    new Date(entry.completedAt).toDateString() === todayStr
  );
};

const getTimerTodayMetrics = function (timer, todayStr) {
  const timerTodayM = timer.history.reduce(
    (acc, entry) => {
      if (isFocusCompletedToday(entry, todayStr)) {
        acc.sessions += 1;
        acc.duration += entry.duration;
      }

      return acc;
    },
    {
      sessions: 0,
      duration: 0,
    },
  );

  return {
    sessions: timerTodayM.sessions,
    durationText: formatDuration(timerTodayM.duration),
  };
};

const setMetric = function (root, key, value) {
  const el = getMetricEl(root, key);
  if (!el) return;

  el.textContent = value;
};

const getCompletedTodayText = function (count) {
  if (count === 0) return "No tasks completed today";
  if (count === 1) return "Nice start!";
  return "Great job!";
};

const getRemainingText = function (count) {
  if (count === 0) return "All done 🎉";
  return `${count} remaining`;
};

const getTimerDurationText = function (sessions) {
  if (sessions === 0) return "No focus sessions yet";
  return `${sessions * 25} min total`;
};

export const renderDashboardCards = function (state) {
  const root = getDashboardSection();
  if (!root) return;

  const todayStr = new Date().toDateString();

  const todoM = getTodoMetrics(state.todo, todayStr);
  const notesM = getNotesMetrics(state.notes);
  const timerTodayM = getTimerTodayMetrics(getTimer(state), todayStr);

  setMetric(root, "todo.total", todoM.total);
  setMetric(root, "todo.remainingText", getRemainingText(todoM.remaining));
  setMetric(root, "todo.completedToday", todoM.completedToday);
  setMetric(
    root,
    "todo.completedTodayText",
    getCompletedTodayText(todoM.completedToday),
  );

  setMetric(root, "notes.total", notesM.total);

  setMetric(root, "timer.sessionsToday", timerTodayM.sessions);
  setMetric(root, "timer.durationTodayText", timerTodayM.durationText);
};
