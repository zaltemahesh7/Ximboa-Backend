const express = require('express');
const { categoriesDataFooter } = require('../../controllers/Footer/footer.controller');
const router = express.Router();

router.get('/', categoriesDataFooter);

module.exports = router;