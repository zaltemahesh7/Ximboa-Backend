const express = require('express');
const { categoriesDataFooter, coursesDataFooter } = require('../../controllers/Footer/footer.controller');
const router = express.Router();

router.get('/', categoriesDataFooter, coursesDataFooter);

module.exports = router;