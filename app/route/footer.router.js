const express = require("express");
const { Footer } = require("../../controllers/Footer/footer.controller");
const router = express.Router();

router.get("/", Footer);

module.exports = router;
