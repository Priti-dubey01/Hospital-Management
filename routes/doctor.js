
const express = require('express');
const db = require('../config/config');
const doctorController = require('../controllers/doctor_con');
const authController = require('../controllers/auth'); 

const router = express.Router();

router.get('/login', authController.doctor_login);
router.post('/login', authController.login);
router.get('/register', (req, res) => {
    db.query('SELECT * FROM tblspecialization', (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Server error');
        }
        res.render('doctor/register', { message: null, data: results });
    });
});
router.post('/register', authController.register);

router.get('/dashboard', doctorController.dashboard);
router.get('/logout',doctorController.logout);
// router.get('/appoinment_detail',doctorController.appoinment_detail)
router.get('/new_appoinment', doctorController.newAppoinment);

router.get('/appoinment_detail/:id', doctorController.appoinment_detail);
router.get('/fetch_appoinment_detail/:id',doctorController.fetch_appoinment_detail)
router.get('/cancel_appoinment', doctorController.cancel_appoinment);
// router.get('/approved_appoiment', doctorController.approv_appoinment);
router.get('/approved_appoiment',doctorController.approved_appoinment);
router.get('/all_appoinment',doctorController.all_appoinment);
router.get('/search', doctorController.search);
router.post('/search', doctorController.search);
router.get('/report', doctorController.report);
router.get('/profile',doctorController.profile);
router.post('/profile_update',doctorController.profile_update);
router.post('/change_password',doctorController.change_password);

module.exports = router;

