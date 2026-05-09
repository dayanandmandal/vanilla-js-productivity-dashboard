import {
  renderTodoList,
  setupTodoEvents,
  filterTodoList,
  renderRemainingTodoCount,
  renderTodoFiltersTab,
  renderTodoFormFromDraft,
} from "./modules/todo.js";
import {
  renderNotesFormFromDraft,
  renderNotesList,
  setUpNotesEvent,
  sortNotesList,
} from "./modules/notes.js";
import { STORAGE_KEYS } from "./helpers/constants.js";

const state = {
  activeSection: "todo",
  theme: "dark",

  todo: {
    data: localStorage.getItem("todoList")
      ? JSON.parse(localStorage.getItem("todoList"))
      : [],
    ui: {
      selectedId: localStorage.getItem(STORAGE_KEYS.TODO_EDITING_ID)
        ? +localStorage.getItem(STORAGE_KEYS.TODO_EDITING_ID)
        : null,
      draft: localStorage.getItem(STORAGE_KEYS.TODO_DRAFT) || "",
      filterBy: localStorage.getItem(STORAGE_KEYS.TODO_FILTER) || "all",
    },
  },

  notes: {
    data: localStorage.getItem(STORAGE_KEYS.NOTES_LIST)
      ? JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES_LIST))
      : [],
    ui: {
      selectedId: localStorage.getItem(STORAGE_KEYS.NOTES_SELECTED_ID)
        ? +localStorage.getItem(STORAGE_KEYS.NOTES_SELECTED_ID)
        : null,
      draft: localStorage.getItem(STORAGE_KEYS.NOTES_DRAFT)
        ? JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES_DRAFT))
        : { title: "", desc: "" },
      sortDirection: localStorage.getItem(STORAGE_KEYS.NOTES_SORT) || "desc",
    },
  },
};

const themeToggleBtn = document.querySelector("#theme-toggle");

const renderTheme = function () {
  document.body.classList.toggle("dark", state.theme === "dark");

  if (themeToggleBtn) {
    themeToggleBtn.textContent = state.theme === "dark" ? "☀️" : "🌙";
  }
};

const renderSidebar = function () {
  const items = document.querySelectorAll(".sidebar li");
  if (!items.length) return;

  items.forEach((item) => {
    const isActive = item.dataset.section === state.activeSection;
    item.classList.toggle("active", isActive);
  });
};

const renderContent = function () {
  const sections = document.querySelectorAll(".page-section");
  if (!sections.length) return;

  sections.forEach((section) => {
    const isActive = state.activeSection === section.dataset.section;
    section.classList.toggle("active", isActive);
  });
};

const renderApp = function () {
  renderTheme();
  renderSidebar();
  renderContent();
};

const renderTodoScreen = function () {
  renderTodoFiltersTab(state);
  renderTodoList(filterTodoList(state), state.todo.ui.selectedId);
  renderTodoFormFromDraft(state);
  renderRemainingTodoCount(state);
};

const renderNotesScreen = function () {
  renderNotesList(
    sortNotesList(state.notes.data, state.notes.ui.sortDirection),
    state.notes.ui.selectedId,
  );
  renderNotesFormFromDraft(state);
};

const render = function () {
  renderApp();

  switch (state.activeSection) {
    case "todo":
      renderTodoScreen();
      break;

    case "notes":
      renderNotesScreen();
      break;
  }
};

(function () {
  const handleSidebarNavigation = function (event) {
    const clickedItem = event.target.closest("li");
    if (!clickedItem) return;

    const section = clickedItem.dataset.section;
    if (!section || section === state.activeSection) return;

    state.activeSection = section;

    render();
  };

  const sidebarNav = document.querySelector(".nav-wrap");

  if (sidebarNav) sidebarNav.addEventListener("click", handleSidebarNavigation);
})();

(function () {
  const handleThemeToggle = function () {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEYS.THEME, state.theme);

    render();
  };

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", handleThemeToggle);
  }
})();

setupTodoEvents(state, render);
setUpNotesEvent(state, render);

render();
