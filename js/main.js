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
import { loadJSON, loadNumber, loadString } from "./helpers/utils.js";

const state = {
  app: {
    activeSection: loadString(STORAGE_KEYS.ACTIVE_SECTION, "dashboard"),
    theme: loadString(STORAGE_KEYS.THEME, "light"),
  },

  todo: {
    data: loadJSON(STORAGE_KEYS.TODO_LIST, []),
    ui: {
      editingId: loadNumber(STORAGE_KEYS.TODO_EDITING_ID, null),
      draft: loadJSON(STORAGE_KEYS.TODO_DRAFT, { text: "" }),
      filterBy: loadString(STORAGE_KEYS.TODO_FILTER, "all"),
    },
  },

  notes: {
    data: loadJSON(STORAGE_KEYS.NOTES_LIST, []),
    ui: {
      editingId: loadNumber(STORAGE_KEYS.NOTES_EDITING_ID, null),
      draft: loadJSON(STORAGE_KEYS.NOTES_DRAFT, { title: "", desc: "" }),
      sortDirection: loadString(STORAGE_KEYS.NOTES_SORT, "desc"),
    },
  },
};

const persistAppData = function () {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_SECTION, state.app.activeSection);
  localStorage.setItem(STORAGE_KEYS.THEME, state.app.theme);
};

const themeToggleBtn = document.querySelector("#theme-toggle");

const renderTheme = function () {
  document.body.classList.toggle("dark", state.app.theme === "dark");

  if (themeToggleBtn) {
    themeToggleBtn.textContent = state.app.theme === "dark" ? "☀️" : "🌙";
  }
};

const renderSidebar = function () {
  const items = document.querySelectorAll(".sidebar li");
  if (!items.length) return;

  items.forEach((item) => {
    const isActive = item.dataset.section === state.app.activeSection;
    item.classList.toggle("active", isActive);
  });
};

const renderContent = function () {
  const sections = document.querySelectorAll(".page-section");
  if (!sections.length) return;

  sections.forEach((section) => {
    const isActive = state.app.activeSection === section.dataset.section;
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
  renderTodoList(filterTodoList(state), state.todo.ui.editingId);
  renderTodoFormFromDraft(state);
  renderRemainingTodoCount(state);
};

const renderNotesScreen = function () {
  renderNotesList(
    sortNotesList(state.notes.data, state.notes.ui.sortDirection),
    state.notes.ui.editingId,
  );
  renderNotesFormFromDraft(state);
};

const render = function () {
  renderApp();

  switch (state.app.activeSection) {
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
    if (!section || section === state.app.activeSection) return;

    state.app.activeSection = section;

    persistAppData();

    render();
  };

  const sidebarNav = document.querySelector(".nav-wrap");

  if (sidebarNav) sidebarNav.addEventListener("click", handleSidebarNavigation);
})();

(function () {
  const handleThemeToggle = function () {
    state.app.theme = state.app.theme === "dark" ? "light" : "dark";

    persistAppData();

    render();
  };

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", handleThemeToggle);
  }
})();

setupTodoEvents(state, render);
setUpNotesEvent(state, render);

render();
