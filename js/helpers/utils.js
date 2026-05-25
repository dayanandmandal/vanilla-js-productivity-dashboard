export const getUpdatedCreatedAtTimestamp = function (createdAt, updatedAt) {
  const currentTimestamp = new Date();
  const timestamps = new Date(updatedAt);

  const textStart = createdAt === updatedAt ? "Created at " : "Updated at";
  const date = timestamps.getDate();
  const month = timestamps.toLocaleString("en-IN", { month: "short" });
  const year =
    timestamps.getFullYear() !== currentTimestamp.getFullYear()
      ? timestamps.getFullYear()
      : "";

  return `${textStart} ${date} ${month} ${year}`;
};

export const getFullDateString = function (date) {
  const d = new Date(date);

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
};

export const getYYYYMMDDDateString = function (date) {
  return new Date(date).toISOString().split("T")[0];
};

export const loadString = function (key, fallback) {
  return localStorage.getItem(key) || fallback;
};

export const loadNumber = function (key, fallback) {
  const rawValue = localStorage.getItem(key);
  return rawValue ? +rawValue : fallback;
};

export const loadJSON = function (key, fallback) {
  const rawValue = localStorage.getItem(key);
  return rawValue ? JSON.parse(rawValue) : fallback;
};

export const loadSet = function (key, fallback) {
  const saved = JSON.parse(localStorage.getItem(key) || "[]");

  return saved.length ? new Set(saved) : fallback;
};

export const loadTimestamp = function (key, fallback) {
  const timestamp = localStorage.getItem(key);

  return timestamp ? new Date(timestamp) : fallback;
};

export const isTodoActive = function (todo) {
  const todayDate = getYYYYMMDDDateString(new Date());
  return getYYYYMMDDDateString(todo.dueDate) >= todayDate && !todo.isCompleted;
};

export const isTodoCompleted = function (todo) {
  return todo.isCompleted;
};

export const isTodoOverdue = function (todo) {
  const todayDate = getYYYYMMDDDateString(new Date());
  return getYYYYMMDDDateString(todo.dueDate) < todayDate && !todo.isCompleted;
};

export const persistStorageValue = function (key, value) {
  if (value === null || value === undefined) {
    localStorage.removeItem(key);
    return;
  }

  localStorage.setItem(key, value);
};
