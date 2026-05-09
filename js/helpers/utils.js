export const getTimestamps = function (createdAt, updatedAt) {
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
