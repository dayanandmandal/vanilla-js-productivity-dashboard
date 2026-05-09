import { getTimestamps } from "../helpers/utils.js";
import { STORAGE_KEYS } from "../helpers/constants.js";

const persistTodoState = function (state) {
  localStorage.setItem(STORAGE_KEYS.TODO_LIST, JSON.stringify(state.todo.data));
  localStorage.setItem(STORAGE_KEYS.TODO_FILTER, state.todo.ui.filterBy);
  localStorage.setItem(
    STORAGE_KEYS.TODO_DRAFT,
    JSON.stringify(state.todo.ui.draft),
  );
  if (state.todo.ui.editingId) {
    localStorage.setItem(STORAGE_KEYS.TODO_EDITING_ID, state.todo.ui.editingId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.TODO_EDITING_ID);
  }
};

const getTodoIdFromEvent = function (event) {
  const todoDiv = event.target.closest(".todo");
  if (!todoDiv) return {};

  return +todoDiv.dataset.id;
};

const getTodoById = function (todoList, id) {
  return todoList.find((t) => t.id === +id);
};

const clearEditingState = function (state) {
  state.todo.ui.editingId = null;
  state.todo.ui.draft.text = "";
};

const getTodoCheckbox = function (todo) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.isCompleted;
  checkbox.dataset.action = "complete";
  return checkbox;
};
const getTodoSpan = function (todo) {
  const span = document.createElement("span");
  span.classList.add("text");
  span.textContent = todo.text;
  return span;
};
const getTodoEditBtn = function () {
  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.textContent = "✏️";
  editBtn.dataset.action = "edit";
  return editBtn;
};
const getTodoDeleteBtn = function () {
  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.textContent = "🗑️";
  deleteBtn.dataset.action = "delete";
  return deleteBtn;
};
const getTodotimestampsP = function (todo) {
  const timestampsP = document.createElement("p");
  timestampsP.textContent = getTimestamps(todo.createdAt, todo.updatedAt);
  timestampsP.classList.add("todo-time");
  return timestampsP;
};

const setUpAddTodoEvent = function (state, render) {
  const handleDraftChange = function (event) {
    const input = event.target;

    switch (input.name) {
      case "todo-input":
        state.todo.ui.draft.text = input.value;
        persistTodoState(state);
        break;
    }
  };

  const addTodo = function (event) {
    event.preventDefault();

    if (state.todo.ui.editingId) {
      const todo = getTodoById(state.todo.data, state.todo.ui.editingId);
      if (!todo) return;

      todo.text = state.todo.ui.draft.text.trim();
      todo.updatedAt = Date.now();
    } else {
      const todo = {
        id: Date.now(),
        text: state.todo.ui.draft.text.trim(),
        isCompleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      state.todo.data.push(todo);
    }

    event.target.reset();
    clearEditingState(state);
    persistTodoState(state);
    render();
  };

  const cancelTodo = function (event) {
    clearEditingState(state);
    persistTodoState(state);
    render();
  };

  const todoForm = document.querySelector(".todo-form");

  if (todoForm) {
    todoForm.addEventListener("input", handleDraftChange);
    todoForm.addEventListener("submit", addTodo);
    todoForm.addEventListener("reset", cancelTodo);
  }
};

const setUpTodoActionsEvent = function (state, render) {
  const enableEditTodo = function (state, todoId) {
    const todo = getTodoById(state.todo.data, todoId);
    if (!todoId) return;

    state.todo.ui.editingId = todoId;
    state.todo.ui.draft.text = todo.text;
  };

  const deleteTodo = function (state, todoId) {
    state.todo.data = state.todo.data.filter((t) => t.id !== todoId);

    if (state.todo.ui.editingId === todoId) {
      clearEditingState(state);
    }
  };

  const completeTodo = function (state, todoId) {
    const todo = getTodoById(state.todo.data, todoId);
    if (!todo) return;

    todo.isCompleted = !todo.isCompleted;
  };

  const handleTodoClick = function (event) {
    const button = event.target.closest("button");
    if (!button) return;

    switch (button.dataset.action) {
      case "edit": {
        const todoId = getTodoIdFromEvent(event);
        enableEditTodo(state, todoId);
        persistTodoState(state);
        render();
        break;
      }

      case "delete": {
        const todoId = getTodoIdFromEvent(event);
        deleteTodo(state, todoId);
        persistTodoState(state);
        render();
        break;
      }
    }
  };

  const handleTodoChange = function (event) {
    const input = event.target.closest("input");
    if (!input) return;

    switch (input.dataset.action) {
      case "complete": {
        const todoId = getTodoIdFromEvent(event);
        completeTodo(state, todoId);
        persistTodoState(state);
        render();
        break;
      }
    }
  };

  const todoListDiv = document.querySelector(".todo-list");

  if (todoListDiv) {
    todoListDiv.addEventListener("click", handleTodoClick);
    todoListDiv.addEventListener("change", handleTodoChange);
  }
};

const setUpTabChangeEvent = function (state, render) {
  const handleTabChange = function (event) {
    const todoFilterEle = event.target.closest("button");
    if (!todoFilterEle) return;

    const filterBy = todoFilterEle.dataset.filter;
    if (!filterBy) return;

    state.todo.ui.filterBy = filterBy;

    persistTodoState(state);

    render();
  };

  const todoFilters = document.querySelector(".todo-filters");

  if (todoFilters) todoFilters.addEventListener("click", handleTabChange);
};

const setUpClearCompletedEvent = function (state, render) {
  const handleClearCompleted = function () {
    state.todo.data = state.todo.data.filter((t) => !t.isCompleted);

    const todo = getTodoById(state.todo.data, state.todo.ui.editingId);
    if (!todo) {
      clearEditingState(state);
    }

    persistTodoState(state);
    render();
  };

  const clearCompletedBtn = document.querySelector(".clear-completed");
  if (!clearCompletedBtn) return;

  clearCompletedBtn.addEventListener("click", handleClearCompleted);
};

export const setupTodoEvents = (state, render) => {
  setUpAddTodoEvent(state, render);
  setUpTodoActionsEvent(state, render);
  setUpTabChangeEvent(state, render);
  setUpClearCompletedEvent(state, render);
};

export const filterTodoList = function (state) {
  switch (state.todo.ui.filterBy) {
    case "active": {
      return state.todo.data.filter((t) => !t.isCompleted);
    }
    case "done": {
      return state.todo.data.filter((t) => t.isCompleted);
    }

    default:
      return [...state.todo.data];
  }
};

export const renderTodoList = (todoList, editingTodoId) => {
  const todoListEle = document.querySelector(".todo-list");
  if (!todoListEle) return;

  todoListEle.innerHTML = "";

  for (let todo of todoList) {
    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");
    todoDiv.dataset.id = todo.id;

    const checkbox = getTodoCheckbox(todo);
    todoDiv.appendChild(checkbox);

    const span = getTodoSpan(todo);
    todoDiv.appendChild(span);

    if (todo.id === editingTodoId) {
      todoDiv.classList.add("active");
    } else {
      const editBtn = getTodoEditBtn();
      todoDiv.appendChild(editBtn);
    }

    const deleteBtn = getTodoDeleteBtn();
    todoDiv.appendChild(deleteBtn);

    const timestampsP = getTodotimestampsP(todo);
    todoDiv.appendChild(timestampsP);

    if (todo.isCompleted) todoDiv.classList.add("completed");
    todoListEle.appendChild(todoDiv);
  }
};

export const renderRemainingTodoCount = function (state) {
  const remainingTodoDiv = document.querySelector(".remaining-todo-count");
  if (!remainingTodoDiv) return;

  const remainingTaskCount = state.todo.data.reduce((count, t) => {
    return t.isCompleted ? count : count + 1;
  }, 0);

  const text =
    remainingTaskCount === 0
      ? `No task pending.`
      : `${remainingTaskCount} task${remainingTaskCount > 1 ? "s" : ""} remaining.`;

  remainingTodoDiv.textContent = text;
};

export const renderTodoFiltersTab = function (state) {
  const items = document.querySelectorAll(".todo-filters button");
  if (!items.length) return;

  for (let item of items) {
    const isActive = item.dataset.filter === state.todo.ui.filterBy;
    item.classList.toggle("active", isActive);
  }
};

export const renderTodoFormFromDraft = function (state) {
  const todoForm = document.querySelector(".todo-form");
  if (!todoForm) return;

  const submitBtn = todoForm.querySelector(".add-todo");
  if (!submitBtn) return;

  todoForm.elements["todo-input"].value = state.todo.ui.draft.text;
  todoForm.dataset.mode = state.todo.ui.editingId ? "edit" : "create";
  submitBtn.textContent = state.todo.ui.editingId ? "Update" : "Add";
};
