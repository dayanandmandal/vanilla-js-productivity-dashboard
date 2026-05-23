export const STORAGE_KEYS = {
  THEME: "theme",
  ACTIVE_SECTION: "activeSection",

  TODO_LIST: "todoList",
  TODO_FILTER: "todoListFilterBy",
  TODO_DRAFT: "todoDraftText",
  TODO_EDITING_ID: "editingTodoId",
  TODO_SELECTED_IDS: "selectedIds",
  TODO_SEARCH_TEXT: "todoSearchText",

  NOTES_LIST: "notesList",
  NOTES_DRAFT: "notesDraft",
  NOTES_SORT: "notesSortDirection",
  NOTES_EDITING_ID: "notesEditingId",
};

export const TODO_PRIORITY = {
  HIGH: {
    value: "HIGH",
    label: "High",
  },

  MEDIUM: {
    value: "MEDIUM",
    label: "Medium",
  },

  LOW: {
    value: "LOW",
    label: "Low",
  },
};

export const EMPTY_STATE = {
  blank: {
    title: "No todos yet",
    desc: "Notes you add appear here.",
  },

  search: {
    title: "No matching tasks",
    desc: "Try a different keyword or clear search.",
  },

  active: {
    title: "No active tasks",
    desc: "Everything is completed 🎉",
  },

  completed: {
    title: "No completed tasks",
    desc: "Completed todos will appear here.",
  },

  overdue: {
    title: "No overdue tasks",
    desc: "You're all caught up 🚀",
  },
};
