import {
  getFullDateString,
  getYYYYMMDDDateString,
  isTodoActive,
  isTodoCompleted,
  isTodoOverdue,
} from "../helpers/utils.js";
import {
  EMPTY_STATE,
  STORAGE_KEYS,
  TODO_PRIORITY,
} from "../helpers/constants.js";

const persistTodoState = function (state) {
  localStorage.setItem(STORAGE_KEYS.TODO_LIST, JSON.stringify(state.todo.data));
  localStorage.setItem(STORAGE_KEYS.TODO_FILTER, state.todo.ui.filterBy);
  localStorage.setItem(
    STORAGE_KEYS.TODO_DRAFT,
    JSON.stringify(state.todo.ui.draft),
  );
  localStorage.setItem(STORAGE_KEYS.TODO_SEARCH_TEXT, state.todo.ui.searchText);
  if (state.todo.ui.editingId) {
    localStorage.setItem(STORAGE_KEYS.TODO_EDITING_ID, state.todo.ui.editingId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.TODO_EDITING_ID);
  }
  if (state.todo.ui.selectedIds.size) {
    const selectedIdsStr = JSON.stringify([...state.todo.ui.selectedIds]);
    localStorage.setItem(STORAGE_KEYS.TODO_SELECTED_IDS, selectedIdsStr);
  } else {
    localStorage.removeItem(STORAGE_KEYS.TODO_SELECTED_IDS);
  }
};

const getTodoIdFromEvent = function (event) {
  const todoDiv = event.target.closest(".todo");
  if (!todoDiv) return null;

  return +todoDiv.dataset.id;
};

const getTodoById = function (todoList, id) {
  return todoList.find((t) => t.id === +id);
};

const clearEditingState = function (state) {
  state.todo.ui.editingId = null;
  state.todo.ui.draft.text = "";
  state.todo.ui.draft.dueDate = "";
  state.todo.ui.draft.priority = "";
};

const getEmptyState = function (filterBy, hasTodos, searchText) {
  const hasSearch = searchText.trim();

  let emptyState = EMPTY_STATE.blank;

  if (hasTodos && hasSearch) {
    emptyState = EMPTY_STATE.search;
  } else if (hasTodos) {
    emptyState = EMPTY_STATE[filterBy] ?? EMPTY_STATE.blank;
  }

  return `
    <div class="no-todos">
      <h4>${emptyState.title}</h4>
      <p>${emptyState.desc}</p>
    </div>`;
};

const clearSearchInput = function (state) {
  state.todo.ui.searchText = "";
};

const areAllTodoSelected = function (state) {
  const { selectedIds } = state.todo.ui;
  const todos = state.todo.data;

  return todos.every((todo) => selectedIds.has(todo.id));
};

const toggleAll = function (state) {
  const { selectedIds } = state.todo.ui;
  const todos = state.todo.data;

  const areAllSelected = areAllTodoSelected(state);

  if (areAllSelected) {
    selectedIds.clear();
    return;
  }

  todos.forEach((todo) => selectedIds.add(todo.id));
};

const setTodoCompletionState = function (todo, isCompleted) {
  if (!todo) return;

  todo.isCompleted = isCompleted;
  todo.completedAt = isCompleted ? Date.now() : null;
};

const setMultipleTodoCompletionState = function (state, todoIds, isCompleted) {
  const todoMap = new Map(state.todo.data.map((todo) => [todo.id, todo]));

  todoIds.forEach((id) => {
    const todo = todoMap.get(id);
    if (!todo) return console.error(`${id} not found`);

    setTodoCompletionState(todo, isCompleted);
  });
};

const deleteSelected = function (state) {
  const selectedIds = state.todo.ui.selectedIds;

  state.todo.data = state.todo.data.filter((todo) => !selectedIds.has(todo.id));

  if (selectedIds.has(state.todo.ui.editingId)) {
    clearEditingState(state);
  }

  selectedIds.clear();
};

const getTodoCheckbox = function (todo, selectedIds) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = selectedIds.has(todo.id);
  checkbox.dataset.action = "bulk-select";
  checkbox.classList.add("checkbox", "is-invisible");

  return checkbox;
};
const geTodoContent = function (todo) {
  const todoContentInnerHTML = `
    <span class="todo-text">${todo.text}</span>
    <span class="todo-meta">
      <p class="todo-time">${getFullDateString(todo.dueDate)}</p>
      <p class="priority-${todo.priority.toLowerCase()}">
        ${TODO_PRIORITY[todo.priority].label}
      </p>
    </span>`;

  const todoContent = document.createElement("div");
  todoContent.classList.add("todo-content");

  todoContent.innerHTML = todoContentInnerHTML;
  return todoContent;
};
const getTodoSpan = function (todo) {
  const span = document.createElement("span");
  span.classList.add("todo-text");
  span.textContent = todo.text;
  return span;
};
const getTodoCompleteBtn = function (todo) {
  const completeBtn = document.createElement("button");
  completeBtn.type = "button";
  completeBtn.textContent = todo.isCompleted ? "✔" : "◯";
  completeBtn.dataset.action = "complete";
  completeBtn.classList.add("btn", "btn-icon", "btn-ghost");
  return completeBtn;
};
const getTodoEditBtn = function (todo, editingTodoId) {
  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.textContent = "✏️";
  editBtn.dataset.action = "edit";
  editBtn.classList.add("btn", "btn-icon", "btn-ghost");
  if (todo.id === editingTodoId) editBtn.classList.add("is-invisible");
  return editBtn;
};
const getTodoDeleteBtn = function () {
  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.textContent = "🗑️";
  deleteBtn.dataset.action = "delete";
  deleteBtn.classList.add("btn", "btn-icon", "btn-ghost", "danger");
  return deleteBtn;
};

const getStatusDiv = function (todo) {
  const statusDiv = document.createElement("div");

  const text = isTodoCompleted(todo)
    ? "Completed"
    : isTodoActive(todo)
      ? "Active"
      : "Overdue";

  statusDiv.textContent = text;

  const cssClass = `status-${text.toLowerCase()}`;
  statusDiv.classList.add(cssClass);

  return statusDiv;
};

const getTodoActionDiv = function (todo, editingTodoId) {
  const actionDiv = document.createElement("div");
  actionDiv.classList.add("todo-actions");

  const completeBtn = getTodoCompleteBtn(todo);
  actionDiv.appendChild(completeBtn);

  const editBtn = getTodoEditBtn(todo, editingTodoId);
  actionDiv.appendChild(editBtn);

  const deleteBtn = getTodoDeleteBtn();
  actionDiv.appendChild(deleteBtn);

  return actionDiv;
};

const setUpAddTodoEvent = function (state, render) {
  const handleDraftChange = function (event) {
    const input = event.target;

    switch (input.name) {
      case "todo-input":
        state.todo.ui.draft.text = input.value;
        persistTodoState(state);
        break;
      case "todo-date":
        state.todo.ui.draft.dueDate = input.value;
        persistTodoState(state);
        break;
      case "todo-priority":
        state.todo.ui.draft.priority = input.value;
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
      todo.dueDate = state.todo.ui.draft.dueDate;
      todo.priority = state.todo.ui.draft.priority;
      todo.updatedAt = Date.now();
    } else {
      const todo = {
        id: Date.now(),
        text: state.todo.ui.draft.text.trim(),
        dueDate: state.todo.ui.draft.dueDate,
        priority: state.todo.ui.draft.priority,
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
    state.todo.ui.draft.dueDate = todo.dueDate;
    state.todo.ui.draft.priority = todo.priority;
  };

  const deleteTodo = function (state, todoId) {
    state.todo.data = state.todo.data.filter((t) => t.id !== todoId);
    state.todo.ui.selectedIds.delete(todoId);

    if (state.todo.ui.editingId === todoId) {
      clearEditingState(state);
    }
  };

  const completeTodo = function (state, todoId) {
    const todo = getTodoById(state.todo.data, todoId);
    if (!todo) return;

    setTodoCompletionState(todo, !todo.isCompleted);
  };

  const handleTodoClick = function (event) {
    const button = event.target.closest("button");
    if (!button) return;

    switch (button.dataset.action) {
      case "complete": {
        const todoId = getTodoIdFromEvent(event);
        completeTodo(state, todoId);
        persistTodoState(state);
        render();
        break;
      }

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

  const selectUnselectTodo = function (state, todoId) {
    const selectedIds = state.todo.ui.selectedIds;

    selectedIds.has(todoId)
      ? selectedIds.delete(todoId)
      : selectedIds.add(todoId);
  };

  const handleTodoChange = function (event) {
    const input = event.target.closest("input");
    if (!input) return;

    switch (input.dataset.action) {
      case "bulk-select": {
        const todoId = getTodoIdFromEvent(event);
        selectUnselectTodo(state, todoId);
        persistTodoState(state);
        render();
      }
    }
  };

  const todoListDiv = document.querySelector("[data-role='todo-list']");

  if (todoListDiv) {
    todoListDiv.addEventListener("click", handleTodoClick);
    todoListDiv.addEventListener("change", handleTodoChange);
  }
};

export const setUpBulkActionsEvent = function (state, render) {
  const handleBulkActions = function (event) {
    const btnEle = event.target.closest("button");
    if (!btnEle) return;

    switch (btnEle.dataset.action) {
      case "bulk-complete": {
        setMultipleTodoCompletionState(state, state.todo.ui.selectedIds, true);
        state.todo.ui.selectedIds.clear();
        persistTodoState(state);
        render();
        break;
      }

      case "bulk-incomplete": {
        setMultipleTodoCompletionState(state, state.todo.ui.selectedIds, false);
        state.todo.ui.selectedIds.clear();
        persistTodoState(state);
        render();
        break;
      }

      case "bulk-delete": {
        deleteSelected(state);
        persistTodoState(state);
        render();
        break;
      }
    }
  };

  const handleBulkChange = function (event) {
    const inputEle = event.target.closest("input");
    if (!inputEle) return;

    switch (inputEle.dataset.action) {
      case "bulk-toggle-all": {
        toggleAll(state);
        persistTodoState(state);
        render();
        break;
      }
    }
  };

  const bulkTodoEle = document.querySelector("[data-role='bulk-actions'");
  if (!bulkTodoEle) return;

  bulkTodoEle.addEventListener("click", handleBulkActions);
  bulkTodoEle.addEventListener("change", handleBulkChange);
};

const setUpTabChangeEvent = function (state, render) {
  const handleTabChange = function (event) {
    const todoFilterEle = event.target.closest(".tab");
    if (!todoFilterEle) return;

    const filterBy = todoFilterEle.dataset.filter;
    if (!filterBy) return;

    state.todo.ui.filterBy = filterBy;

    persistTodoState(state);

    render();
  };

  const todoFilters = document.querySelector("#todo-filters");

  if (todoFilters) todoFilters.addEventListener("click", handleTabChange);
};

const setUpSearchEvent = function (state, render) {
  const handleSearchInput = function (event) {
    state.todo.ui.searchText = event.target.value;

    persistTodoState(state);

    render();
  };

  const handleSearchClick = function (event) {
    const actionEle = event.target.closest("[data-action]");
    if (!actionEle) return;

    switch (actionEle.dataset.action) {
      case "todo-clear-search": {
        clearSearchInput(state);
        persistTodoState(state);
        render();
        break;
      }
    }

    persistTodoState(state);

    render();
  };

  const searchWrapEle = document.querySelector("[data-role='todo-search']");
  if (!searchWrapEle) return;
  searchWrapEle.addEventListener("click", handleSearchClick);

  const searchInputEle = searchWrapEle.querySelector(
    "[data-action='todo-search-input']",
  );
  if (!searchInputEle) return;
  searchInputEle.addEventListener("input", handleSearchInput);
};

export const setupTodoEvents = (state, render) => {
  setUpAddTodoEvent(state, render);
  setUpTodoActionsEvent(state, render);
  setUpTabChangeEvent(state, render);
  setUpSearchEvent(state, render);
};

export const filterTodoList = function (state) {
  const { filterBy, searchText } = state.todo.ui;

  let todos = [...state.todo.data];

  switch (filterBy) {
    case "active": {
      todos = todos.filter((t) => isTodoActive(t));
      break;
    }
    case "completed": {
      todos = todos.filter((t) => isTodoCompleted(t));
      break;
    }
    case "overdue": {
      todos = todos.filter((t) => isTodoOverdue(t));
      break;
    }
  }

  if (searchText.trim()) {
    todos = todos.filter((todo) =>
      todo.text.toLowerCase().includes(searchText.toLowerCase()),
    );
  }

  return todos;
};

export const renderTodoList = (
  todoList,
  editingTodoId,
  selectedIds,
  filterBy,
  hasTodos,
  searchText,
) => {
  const todoListEle = document.querySelector("[data-role='todo-list']");
  if (!todoListEle) return;

  todoListEle.innerHTML = "";

  if (!todoList.length) {
    todoListEle.innerHTML = getEmptyState(filterBy, hasTodos, searchText);
    return;
  }

  for (let todo of todoList) {
    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");
    todoDiv.dataset.id = todo.id;

    const checkbox = getTodoCheckbox(todo, selectedIds);
    todoDiv.appendChild(checkbox);

    const todoContent = geTodoContent(todo);

    todoDiv.appendChild(todoContent);

    if (todo.id === editingTodoId) {
      todoDiv.classList.add("active");
    }

    const todoStatusDiv = getStatusDiv(todo);
    todoDiv.appendChild(todoStatusDiv);

    const todoActionDiv = getTodoActionDiv(todo, editingTodoId);
    todoDiv.appendChild(todoActionDiv);

    if (todo.isCompleted) todoDiv.classList.add("completed");
    todoListEle.appendChild(todoDiv);
  }
};

export const renderTodoFiltersTab = function (state) {
  const items = document.querySelectorAll("#todo-filters .tab");
  if (!items.length) return;

  for (let item of items) {
    const isActive = item.dataset.filter === state.todo.ui.filterBy;
    item.classList.toggle("active", isActive);
  }
};

export const renderTodoFormFromDraft = function (state) {
  const todoForm = document.querySelector(".todo-form");
  if (!todoForm) return;

  const submitBtn = todoForm.querySelector('[name="add-todo"]');
  if (!submitBtn) return;

  todoForm.elements["todo-input"].value = state.todo.ui.draft.text;
  todoForm.elements["todo-date"].value = state.todo.ui.draft.dueDate;
  todoForm.elements["todo-priority"].value = state.todo.ui.draft.priority;
  todoForm.dataset.mode = state.todo.ui.editingId ? "edit" : "create";
  submitBtn.textContent = state.todo.ui.editingId ? "Update" : "Add";
};

export const renderTodoPriorityOptions = function (state) {
  const todoForm = document.querySelector(".todo-form");
  if (!todoForm) return;

  const select = todoForm.querySelector('[name="todo-priority"]');

  const selectedOption = `
      <option value="" selected disabled>
        Select priority
      </option>
    `;

  const optionsHTML = Object.values(TODO_PRIORITY).map(
    (priority) => `
      <option value="${priority.value}">
        ${priority.label}
      </option>
    `,
  );

  select.innerHTML = selectedOption + optionsHTML.join("");
};

export const renderTodoBulkEditing = function (state) {
  const todoSection = document.querySelector(
    ".page-section[data-section='todo']",
  );
  if (!todoSection) return;

  const bulkActionCountEle = document.querySelector(
    "[data-role='selected-count']",
  );
  if (!bulkActionCountEle) return;

  const selectedIds = state.todo.ui.selectedIds;

  todoSection.classList.toggle("is-selecting", selectedIds.size > 0);
  bulkActionCountEle.textContent = `${selectedIds.size} Selected`;

  const selectAllCheckbox = todoSection.querySelector(
    "[data-action='bulk-toggle-all']",
  );
  if (!selectAllCheckbox) return;

  const areAllSelected = areAllTodoSelected(state);

  selectAllCheckbox.checked = areAllSelected;

  selectAllCheckbox.indeterminate = selectedIds.size > 0 && !areAllSelected;
};

export const renderTodoSearch = function (state) {
  const { searchText } = state.todo.ui;

  const searchWrapEle = document.querySelector("[data-role='todo-search']");
  if (!searchWrapEle) return;

  const searchInputEle = searchWrapEle.querySelector(
    "[data-action='todo-search-input']",
  );
  if (!searchInputEle) return;

  searchWrapEle.classList.toggle("has-value", searchText.trim());
  searchInputEle.value = searchText;
};
