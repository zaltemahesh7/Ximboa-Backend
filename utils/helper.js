function getDayOfWeek(dateString) {
  const date = new Date(dateString);
  const options = { weekday: "long" };
  return date.toLocaleDateString("en-US", options);
}

function getRoleOrInstitute(data) {
  return data === "TRAINER" ? "INSTITUTE" : data;
}

const constructImageUrl = (req, res, imagePath) => {
  return imagePath
    ? `${req.protocol}://${req.get("host")}/${imagePath.replace(/\\/g, "/")}`
    : "";
};

module.exports = { getDayOfWeek, getRoleOrInstitute, constructImageUrl };
