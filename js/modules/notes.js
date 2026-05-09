import { getTimestamps } from "../helpers/utils.js";
import { STORAGE_KEYS } from "../helpers/constants.js";

const persistNotesState = function (state) {
  localStorage.setItem(
    STORAGE_KEYS.NOTES_LIST,
    JSON.stringify(state.notes.data),
  );
  localStorage.setItem(
    STORAGE_KEYS.NOTES_DRAFT,
    JSON.stringify(state.notes.ui.draft),
  );
  localStorage.setItem(STORAGE_KEYS.NOTES_SORT, state.notes.ui.sortDirection);
  if (state.notes.ui.editingId) {
    localStorage.setItem(
      STORAGE_KEYS.NOTES_EDITING_ID,
      state.notes.ui.editingId,
    );
  } else {
    localStorage.removeItem(STORAGE_KEYS.NOTES_EDITING_ID);
  }
};

const getNoteById = function (notesList, id) {
  return notesList.find((n) => n.id === +id);
};

const clearEditingState = function (state) {
  state.notes.ui.editingId = null;
  state.notes.ui.draft.title = "";
  state.notes.ui.draft.desc = "";
};

const setUpFormActionEvents = function (state, render) {
  const saveNotes = function (event) {
    event.preventDefault();

    const title = state.notes.ui.draft.title;
    const desc = state.notes.ui.draft.desc;

    if (!title) return;

    // editing
    if (state.notes.ui.editingId) {
      const note = getNoteById(state.notes.data, state.notes.ui.editingId);
      if (!note) return;

      note.title = title;
      note.desc = desc;
      note.updatedAt = Date.now();
    } else {
      const note = {
        id: Date.now(),
        title: title,
        desc: desc,
        updatedAt: Date.now(),
        createdAt: Date.now(),
      };

      state.notes.data.push(note);
    }

    event.target.reset();
    clearEditingState(state);
    persistNotesState(state);

    render();
  };

  const cancelNotes = function (event) {
    clearEditingState(state);
    persistNotesState(state);

    render();
  };

  const handleDraftChange = function (event) {
    const input = event.target;

    switch (input.name) {
      case "notes-title":
        state.notes.ui.draft.title = input.value;
        break;

      case "notes-desc":
        state.notes.ui.draft.desc = input.value;
        break;
    }

    persistNotesState(state);
  };

  const formEle = document.querySelector(".notes-form");
  if (!formEle) return;

  formEle.addEventListener("input", handleDraftChange);
  formEle.addEventListener("submit", saveNotes);
  formEle.addEventListener("reset", cancelNotes);
};

// like edit, delete
const setUpNotesActionEvents = function (state, render) {
  const notesEle = document.querySelector(".notes");

  const editNotes = function (event) {
    const noteEle = event.target.closest(".card");
    if (!noteEle) return;

    const noteId = +noteEle.dataset.id;

    const note = getNoteById(state.notes.data, noteId);
    state.notes.ui.editingId = noteId;
    state.notes.ui.draft.title = note.title;
    state.notes.ui.draft.desc = note.desc;

    persistNotesState(state);
  };

  const deleteNotes = function (event) {
    const noteEle = event.target.closest(".card");
    if (!noteEle) return;

    const noteId = +noteEle.dataset.id;
    state.notes.data = state.notes.data.filter((n) => n.id !== noteId);

    if (state.notes.ui.editingId === noteId) {
      clearEditingState(state);
      persistNotesState(state);
    }
  };

  const actionEvents = function (event) {
    const button = event.target.closest("button");
    if (!button) return;

    switch (button.dataset.action) {
      case "edit":
        editNotes(event);
        persistNotesState(state);
        render();
        break;

      case "delete":
        deleteNotes(event);
        persistNotesState(state);
        render();
        break;
    }
  };

  notesEle.addEventListener("click", actionEvents);
};

const setUpSortEvent = function (state, render) {
  const sortEvent = function () {
    state.notes.ui.sortDirection =
      state.notes.ui.sortDirection === "desc" ? "asc" : "desc";

    persistNotesState(state);
    render();
  };

  const sortBtn = document.querySelector(".notes-sort");
  if (!sortBtn) return;

  sortBtn.addEventListener("click", sortEvent);
};

export const setUpNotesEvent = function (state, render) {
  setUpFormActionEvents(state, render);
  setUpNotesActionEvents(state, render);
  setUpSortEvent(state, render);
};

const getCardDiv = function (note) {
  const titleH5 = document.createElement("h5");
  titleH5.textContent = note.title;
  titleH5.classList.add("title");

  const descP = document.createElement("p");
  descP.textContent = note.desc;
  descP.classList.add("desc");

  const timestampsP = document.createElement("p");
  timestampsP.textContent = getTimestamps(note.createdAt, note.updatedAt);
  timestampsP.classList.add("notes-time");

  const editButton = document.createElement("button");
  editButton.textContent = "✏️";
  editButton.classList.add("edit");
  editButton.dataset.action = "edit";
  editButton.title = "Edit";

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "🗑️";
  deleteButton.classList.add("delete");
  deleteButton.dataset.action = "delete";
  deleteButton.title = "Delete";

  const actionDiv = document.createElement("div");
  actionDiv.classList.add("card-action");
  actionDiv.appendChild(editButton);
  actionDiv.appendChild(deleteButton);

  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card");
  cardDiv.dataset.id = note.id;

  cardDiv.appendChild(titleH5);
  cardDiv.appendChild(descP);
  cardDiv.appendChild(timestampsP);
  cardDiv.appendChild(actionDiv);

  return cardDiv;
};

const getNoNotesDiv = function () {
  const titleH4 = document.createElement("h4");
  titleH4.textContent = "No notes yet";

  const descP = document.createElement("p");
  descP.textContent = "Create your first note using the editor →";

  const cardDiv = document.createElement("div");
  cardDiv.classList.add("no-notes");

  cardDiv.appendChild(titleH4);
  cardDiv.appendChild(descP);

  return cardDiv;
};

export const renderNotesList = function (notesList, selectedNoteId) {
  const notesDiv = document.querySelector(".notes");
  if (!notesDiv) return;

  notesDiv.innerHTML = "";

  if (!notesList.length) {
    const noNotesDiv = getNoNotesDiv();
    notesDiv.appendChild(noNotesDiv);
    return;
  }

  for (let note of notesList) {
    const cardDiv = getCardDiv(note);
    notesDiv.appendChild(cardDiv);

    if (note.id === selectedNoteId) cardDiv.classList.add("active");
  }
};

export const renderNotesFormFromDraft = function (state) {
  const formEle = document.querySelector(".notes-form");
  if (!formEle) return;

  formEle.elements["notes-title"].value = state.notes.ui.draft.title;
  formEle.elements["notes-desc"].value = state.notes.ui.draft.desc;

  const saveBtn = formEle.querySelector(".save-note");
  if (!saveBtn) return;

  saveBtn.innerHTML = state.notes.ui.editingId ? "Update" : "Save";
};

export const sortNotesList = function (notesList, sortDirection) {
  return [...notesList].sort((n1, n2) =>
    sortDirection === "desc"
      ? n2.updatedAt - n1.updatedAt
      : n1.updatedAt - n2.updatedAt,
  );
};
