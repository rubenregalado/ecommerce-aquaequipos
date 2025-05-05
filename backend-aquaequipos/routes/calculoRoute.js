const express = require('express');
const router = express.Router();
const { asesoriaTecnica } = require('../controllers/calculoController');

router.post('/', asesoriaTecnica);

module.exports = router;
