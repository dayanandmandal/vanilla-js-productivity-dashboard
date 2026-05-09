export const getTimestamps = function (createdAt, updatedAt) {
  const currentTimestamp = new Date();
  const timestamps = new Date(updatedAt);

  const textStart = createdAt === updatedAt ? "Updated" : "Created";
  const date = timestamps.getDate();
  const month = timestamps.toLocaleString("en-IN", { month: "short" });
  const year =
    timestamps.getFullYear() !== currentTimestamp.getFullYear()
      ? createdTimestamp.getFullYear()
      : "";

  return `${textStart} ${date} ${month} ${year}`;
};
