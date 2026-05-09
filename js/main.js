import {
  renderTodoList,
  setupTodoEvents,
  filterTodoList,
  renderRemainingTodoCount,
  renderTodoFiltersTab,
} from "./modules/todo.js";
import {
  renderNotesFormFromDraft,
  renderNotesList,
  setUpNotesEvent,
  sortNotesList,
} from "./modules/notes.js";

const state = {
  activeSection: "notes",
  theme: localStorage.getItem("theme") || "dark",
  todo: {
    list: localStorage.getItem("todoList")
      ? JSON.parse(localStorage.getItem("todoList"))
      : [],
    filterBy: localStorage.getItem("todoListFilterBy") || "all",
  },
  notes: {
    list: localStorage.getItem("notesList")
      ? JSON.parse(localStorage.getItem("notesList"))
      : [],
    selectedNoteId: localStorage.getItem("notesSelectedNoteId")
      ? +localStorage.getItem("notesSelectedNoteId")
      : null,
    draft: localStorage.getItem("notesDraft")
      ? JSON.parse(localStorage.getItem("notesDraft"))
      : { title: "", desc: "" },
    sortDirection: localStorage.getItem("notesSortDirection") || "desc",
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
  const filteredTodoList = filterTodoList(state);
  renderTodoList(filteredTodoList);
  renderRemainingTodoCount(state);
};

const renderNotesScreen = function () {
  const sortedNotes = sortNotesList(
    state.notes.list,
    state.notes.sortDirection,
  );
  renderNotesList(sortedNotes, state.notes.selectedNoteId);
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
    localStorage.setItem("theme", state.theme);

    render();
  };

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", handleThemeToggle);
  }
})();

setupTodoEvents(state, render);
setUpNotesEvent(state, render);

render();
