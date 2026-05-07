import {
  renderTodoList,
  setupTodoEvents,
  filterTodoList,
  renderRemainingTodoCount,
  renderTodoFiltersTab,
} from "./modules/todo.js";

const state = {
  activeSection: "todo",
  theme: localStorage.getItem("theme") || "dark",
  todo: {
    list: localStorage.getItem("todoList")
      ? JSON.parse(localStorage.getItem("todoList"))
      : [],
    filterBy: localStorage.getItem("todoListFilterBy") || "all",
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

const render = function () {
  renderTheme();
  renderSidebar();
  renderContent();
  renderTodoFiltersTab(state);
  const filteredTodoList = filterTodoList(state);
  renderTodoList(filteredTodoList);
  renderRemainingTodoCount(state);
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

render();
