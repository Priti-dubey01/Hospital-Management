const express=require('express');
const db = require('../config/config');
const router=express.Router();
const authController = require('../controllers/auth');
const doctorController = require('../controllers/doctor_con');



router.get('/', authController.home);



router.get('/login',(req,res)=>{
    res.render('doctor/login');
});

router.post('/', authController.login);
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

router.get('/logout', doctorController.logout);



router.get('/new_appoinment', doctorController.newAppoinment);
router.get('/appointment_detail/:id/:app_no', doctorController.appoinment_detail);
router.post('/fetch_appoinment_detail/:id', doctorController.fetch_appoinment_detail);
router.get('/approved_appoiment',doctorController.approved_appoinment);

router.get('/cancel_appoinment', doctorController.cancel_appoinment);
router.get('/all_appoinment', doctorController.all_appoinment);
router.get('/search', doctorController.search);
router.post('/search', doctorController.search);
router.get('/report', doctorController.report);
router.post('/report_detail', doctorController.reportData);
router.get('/profile',doctorController.profile);
router.post('/profile_update',doctorController.profile_update);
router.get('/change_password',doctorController.change_password);

module.exports=router;