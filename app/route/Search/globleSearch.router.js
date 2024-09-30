const {
  globalSearch,
  searchCourseByName,
  searchProductByName,
  searchEventByName,
  searchTrainerByName,
} = require("../../../controllers/Search/search.controller");
const express = require("express");
const router = express.Router();

router.get("/global", globalSearch);
router.get("/courses", searchCourseByName);
router.get("/products", searchProductByName);
router.get("/events", searchEventByName);
router.get("/trainer", searchTrainerByName);

module.exports = router;
