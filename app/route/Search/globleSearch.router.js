const {
  globalSearch,
  searchCourseByName,
  searchProductByName,
  searchEventByName,
  searchTrainerByName,
  searchTrainers,
} = require("../../../controllers/Search/search.controller");
const express = require("express");
const router = express.Router();

router.get("/global", globalSearch);
router.get("/courses", searchCourseByName);
router.get("/products", searchProductByName);
router.get("/events", searchEventByName);
router.get("/trainers", searchTrainerByName);
router.get("/trainer", searchTrainers);

module.exports = router;
