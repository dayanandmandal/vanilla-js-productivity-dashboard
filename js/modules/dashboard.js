import {
  DASHBOARD_PERIODS,
  STORAGE_KEYS,
  TIMER_MODE,
  TIMER_STATUS,
} from "../helpers/constants.js";
import { formatDuration, getTimer } from "../helpers/timerService.js";
import { persistStorageValue } from "../helpers/utils.js";

const persistDashboardState = function (state) {
  persistStorageValue(STORAGE_KEYS.DASHBOARD_PERIOD, state.dashboard.ui.period);
};

const qs = function (root, sel) {
  return root.querySelector(sel);
};

const getDashboardSection = function () {
  return document.querySelector(".page-section[data-section='dashboard']");
};

const getMetricEl = function (root, key) {
  return qs(root, `[data-metric='${key}']`);
};

const getTodosByPeriod = function (todos, period) {
  if (period === "all") {
    return todos;
  }

  const now = new Date();

  return todos.filter((todo) => {
    const date = new Date(todo.createdAt);

    switch (period) {
      case DASHBOARD_PERIODS.TODAY:
        return date.toDateString() === now.toDateString();

      case DASHBOARD_PERIODS.WEEK: {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);

        return date >= weekAgo;
      }

      case DASHBOARD_PERIODS.MONTH: {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);

        return date >= monthAgo;
      }

      default:
        return true;
    }
  });
};

const getTodoMetrics = function (todoState, period) {
  const todos = getTodosByPeriod(todoState.data, period);

  const completed = todos.filter((todo) => todo.isCompleted);

  const overdue = todos.filter((todo) => {
    return !todo.isCompleted && new Date(todo.dueDate) < new Date();
  });

  return {
    total: todos.length,
    completed: completed.length,
    remaining: todos.length - completed.length,
    overdue: overdue.length,
  };
};

const getNotesMetrics = function (notesState, period) {
  const notes = notesState.data;

  const isInPeriod = function (timestamp) {
    if (!timestamp) return false;

    if (period === "all") {
      return true;
    }

    const date = new Date(timestamp);
    const now = new Date();

    switch (period) {
      case "today":
        return date.toDateString() === now.toDateString();

      case "week": {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);

        return date >= weekAgo;
      }

      case "month": {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);

        return date >= monthAgo;
      }

      default:
        return true;
    }
  };

  const created = notes.filter((note) => {
    return isInPeriod(note.createdAt);
  });

  const updated = notes.filter((note) => {
    return (
      note.updatedAt &&
      note.updatedAt !== note.createdAt &&
      isInPeriod(note.updatedAt)
    );
  });

  return {
    total: notes.length,
    created: created.length,
    updated: updated.length,
  };
};

const isFocusCompleted = function (entry) {
  return (
    entry.status === TIMER_STATUS.COMPLETED && entry.mode === TIMER_MODE.FOCUS
  );
};

const getTimerMetrics = function (timerState, period) {
  const history = timerState.history;

  const isInPeriod = function (timestamp) {
    if (!timestamp) return false;

    if (period === "all") {
      return true;
    }

    const date = new Date(timestamp);
    const now = new Date();

    switch (period) {
      case "today":
        return date.toDateString() === now.toDateString();

      case "week": {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);

        return date >= weekAgo;
      }

      case "month": {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);

        return date >= monthAgo;
      }

      default:
        return true;
    }
  };

  const metrics = history.reduce(
    (acc, entry) => {
      if (isFocusCompleted(entry) && isInPeriod(entry.completedAt)) {
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
    sessions: metrics.sessions,
    duration: metrics.duration,
    durationText: formatDuration(metrics.duration),
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

  const todoMetricAll = getTodoMetrics(state.todo, "all");
  const notesMetricAll = getNotesMetrics(state.notes, "all");
  const timerMetricAll = getTimerMetrics(getTimer(state), "all");

  setMetric(root, "todo.total", todoMetricAll.total);
  setMetric(
    root,
    "todo.remainingText",
    getRemainingText(todoMetricAll.remaining),
  );

  setMetric(root, "notes.total", notesMetricAll.total);

  setMetric(root, "timer.sessions", timerMetricAll.sessions);
  setMetric(root, "timer.durationText", timerMetricAll.durationText);
};

export const renderDashboardPeriodTab = function (state) {
  const items = document.querySelectorAll("#period-wrap .tab");
  if (!items.length) return;

  for (let item of items) {
    const isActive = item.dataset.period === state.dashboard.ui.period;
    item.classList.toggle("active", isActive);
  }
};

export const renderDashboardPeriodCards = function (state) {
  const root = getDashboardSection();
  if (!root) return;

  const todayStr = new Date().toDateString();

  const period = state.dashboard.ui.period;

  const todoM = getTodoMetrics(state.todo, period);
  const notesM = getNotesMetrics(state.notes, period);
  const timerM = getTimerMetrics(getTimer(state), period);

  setMetric(root, "todo.period.due", todoM.remaining);
  setMetric(root, "todo.period.completed", todoM.completed);

  setMetric(root, "notes.period.created", notesM.created);
  setMetric(root, "notes.period.updated", notesM.updated);

  setMetric(root, "timer.period.sessions", timerM.sessions);
  setMetric(root, "timer.period.durationText", timerM.durationText);
};

const setUpPeriodTabChangeEvent = function (state, render) {
  const handleTabChange = function (event) {
    const periodTabEl = event.target.closest(".tab");
    if (!periodTabEl) return;

    const period = periodTabEl.dataset.period;
    if (!period) return;

    state.dashboard.ui.period = period;

    persistDashboardState(state);

    render();
  };

  const periodWrapEl = document.querySelector("#period-wrap");

  if (periodWrapEl) periodWrapEl.addEventListener("click", handleTabChange);
};

export const setupDashboardEvents = function (state, render) {
  setUpPeriodTabChangeEvent(state, render);
};
