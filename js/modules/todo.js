const getTodoCheckbox = function (todo) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.isCompleted;
  checkbox.dataset.action = "complete";
  return checkbox;
};
const getTodoinputText = function (todo) {
  const inputTextEle = document.createElement("input");
  inputTextEle.value = todo.text;
  inputTextEle.classList.add("text");
  inputTextEle.dataset.action = "input-text";
  return inputTextEle;
};
const getTodoUpdateBtn = function () {
  const updateBtn = document.createElement("button");
  updateBtn.type = "button";
  updateBtn.textContent = "✅";
  updateBtn.dataset.action = "update";
  return updateBtn;
};
const getTodoCancelBtn = function () {
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = "❌";
  cancelBtn.dataset.action = "cancel";
  return cancelBtn;
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

const setUpAddTodoEvent = function (state, render) {
  const todoForm = document.querySelector(".todo-form");

  const addTodo = function (event) {
    event.preventDefault();

    if (!todoForm) return;

    const inputEle = todoForm.querySelector('[name="todo-input"]');
    if (!inputEle) return;

    const input = inputEle.value.trim();
    if (!input) return;

    const todo = {
      id: Date.now(),
      text: input.trim(),
      isCompleted: false,
      isEditing: false,
      createdAt: Date.now(),
    };

    state.todo.list.push(todo);
    inputEle.value = "";

    storeTodoListAndCallRender(state.todo.list, render);
  };

  if (todoForm) todoForm.addEventListener("submit", addTodo);
};

const setUpTodoActionsEvent = function (state, render) {
  const getTodoAndTodoDivFromEvent = function (event, state) {
    const todoDiv = event.target.closest(".todo");
    if (!todoDiv) return {};

    const todo = state.todo.list.find((t) => t.id === +todoDiv.dataset.id);
    return { todo, todoDiv };
  };

  const toggleEditCancelTodo = function (event, state) {
    const { todo } = getTodoAndTodoDivFromEvent(event, state);
    if (!todo) return;

    todo.isEditing = !todo.isEditing;
  };

  const updateTodo = function (event, state) {
    const { todo, todoDiv } = getTodoAndTodoDivFromEvent(event, state);
    if (!todo) return;

    const inputTextEle = todoDiv.querySelector("[data-action=input-text]");
    if (!inputTextEle) return;

    const value = inputTextEle.value.trim();
    if (!value) return;

    todo.text = value;
  };

  const deleteTodo = function (event, state) {
    const todoDiv = event.target.closest(".todo");
    if (!todoDiv) return;

    state.todo.list = state.todo.list.filter(
      (t) => t.id !== +todoDiv.dataset.id,
    );
  };

  const completeTodo = function (event, state) {
    const { todo } = getTodoAndTodoDivFromEvent(event, state);
    if (!todo) return;

    todo.isCompleted = !todo.isCompleted;
  };

  const handleTodoClick = function (event) {
    const button = event.target.closest("button");
    if (!button) return;

    switch (button.dataset.action) {
      case "edit": {
        toggleEditCancelTodo(event, state);
        storeTodoListAndCallRender(state.todo.list, render);
        break;
      }

      case "update": {
        updateTodo(event, state);
        toggleEditCancelTodo(event, state);
        storeTodoListAndCallRender(state.todo.list, render);
        break;
      }

      case "delete": {
        deleteTodo(event, state);
        storeTodoListAndCallRender(state.todo.list, render);
        break;
      }

      case "cancel": {
        toggleEditCancelTodo(event, state);
        storeTodoListAndCallRender(state.todo.list, render);
        break;
      }
    }
  };

  const handleTodoChange = function (event) {
    const input = event.target.closest("input");
    if (!input) return;

    switch (input.dataset.action) {
      case "complete": {
        completeTodo(event, state);
        storeTodoListAndCallRender(state.todo.list, render);
        break;
      }

      case "input-text": {
        // do nothing let the user type in input
        break;
      }
    }
  };

  const todoList = document.querySelector(".todo-list");

  if (todoList) {
    todoList.addEventListener("click", handleTodoClick);
    todoList.addEventListener("change", handleTodoChange);
  }
};

const storeTodoListAndCallRender = function (list, render) {
  localStorage.setItem("todoList", JSON.stringify(list));
  render();
};

const setUpTabChangeEvent = function (state, render) {
  const handleTabChange = function (event) {
    const todoFilterEle = event.target.closest("button");

    if (!todoFilterEle) return;

    const filterBy = todoFilterEle.dataset.filter;

    if (!filterBy) return;

    state.todo.filterBy = filterBy;

    localStorage.setItem("todoListFilterBy", filterBy);

    render();
  };

  const todoFilters = document.querySelector(".todo-filters");

  if (todoFilters) todoFilters.addEventListener("click", handleTabChange);
};

const setUpClearCompletedEvent = function (state, render) {
  const handleClearCompleted = function () {
    state.todo.list = state.todo.list.filter((t) => !t.isCompleted);

    storeTodoListAndCallRender(state.todo.list, render);
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
  switch (state.todo.filterBy) {
    case "active": {
      return state.todo.list.filter((t) => !t.isCompleted);
    }
    case "done": {
      return state.todo.list.filter((t) => t.isCompleted);
    }

    default:
      return [...state.todo.list];
  }
};

export const renderTodoList = (todoList) => {
  const todoListEle = document.querySelector(".todo-list");
  if (!todoListEle) return;

  todoListEle.innerHTML = "";

  for (let todo of todoList) {
    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");
    todoDiv.dataset.id = todo.id;

    const checkbox = getTodoCheckbox(todo);
    todoDiv.appendChild(checkbox);

    if (todo.isEditing) {
      const inputTextEle = getTodoinputText(todo);
      todoDiv.appendChild(inputTextEle);

      const updateBtn = getTodoUpdateBtn();
      todoDiv.appendChild(updateBtn);

      const cancelBtn = getTodoCancelBtn();
      todoDiv.appendChild(cancelBtn);
    } else {
      const span = getTodoSpan(todo);
      todoDiv.appendChild(span);

      const editBtn = getTodoEditBtn();
      todoDiv.appendChild(editBtn);
    }

    const deleteBtn = getTodoDeleteBtn();
    todoDiv.appendChild(deleteBtn);

    if (todo.isCompleted) todoDiv.classList.add("completed");
    todoListEle.appendChild(todoDiv);
  }
};

export const renderRemainingTodoCount = function (state) {
  const remainingTodoDiv = document.querySelector(".remaining-todo-count");
  if (!remainingTodoDiv) return;

  const remainingTaskCount = state.todo.list.reduce((count, t) => {
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
    const isActive = item.dataset.filter === state.todo.filterBy;
    item.classList.toggle("active", isActive);
  }
};
