const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

router.post('/login', authController.login);

router.post('/register', authController.register);
router.post('/get_doctor',authController.get_doctor);
//router.post('/new_appoinment', authController.new_appoinment);

module.exports = router;
