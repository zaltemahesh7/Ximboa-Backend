function getDayOfWeek(dateString) {
  const date = new Date(dateString);
  const options = { weekday: "long" };
  return date.toLocaleDateString("en-US", options);
}

module.exports = { getDayOfWeek };
