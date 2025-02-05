const express=require('express');
const db = require('../config/config');
const router=express.Router();

const adminController = require('../controllers/admin_con');
const multer = require("multer");

const path = require("path");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/upload/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage}); 

router.post('/add_doctor', upload.single('profileImage'), adminController.store_doctor);


router.get('/', adminController.admin_login);
router.post('/', adminController.adminlogin);
router.get('/admin_dashboard', adminController.dashboard);
router.get('/doctor_list', adminController.doctor_list);
router.get('/add_doctor', adminController.add_doctor);
// router.post('/add_doctor', adminController.store_doctor);
router.get('/edit_doctor/:id',adminController.edit_doctor);

 //router.post('/doctor_update', adminController.doctor_update);
 router.post('/doctor_update/:id', adminController.doctor_update);
 // Delete doctor route
router.get('/delete_doctor/:id', adminController.delete_doctor);

router.get('/speci_list', adminController.speci_list);
router.get('/add_speci', adminController.add_speci);
router.post('/add_speci', adminController.store_speci);

router.get('/edit_speci/:id',adminController.edit_speci);
router.post('/speci_update/:id', adminController.speci_update);
router.get('/delete_speci/:id', adminController.delete_speci);

router.get('/patient_details',adminController.patient_details);
router.post('/filter_patient',adminController.filter_patient);


module.exports = router; 
