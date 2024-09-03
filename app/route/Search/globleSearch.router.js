const {
  globalSearch,
} = require("../../../controllers/Search/search.controller");
const express = require("express");
const router = express.Router();

router.get("/globle", globalSearch);

module.exports = router;
