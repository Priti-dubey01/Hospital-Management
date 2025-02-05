
const express = require('express');
const db = require('../config/config'); 

const patientController = require('../controllers/patient_con');

const router = express.Router();


router.get('/patient_reg', patientController.patient_reg);
router.post('/patient_reg', patientController.patient_store);

router.get('/patient_login', patientController.patient_login);
router.post('/patient_login', patientController.patientlogin);
router.get('/patient_dashboard', patientController.patient_dashboard);

router.get('/patient_list', patientController.patient_list);
router.get('/book_appo',patientController.book_appo);
router.post('/get_doctor',patientController.get_doctor);
router.post('/patient_store',patientController.book_patient_store);
//router.get('/patient_count',patientController.patient_count);
router.get('/logout',patientController.logout);


router.post("/fetch_appointment", (req, res) => {
    const { appointment_id } = req.body;
if (!appointment_id) {
        return res.status(400).json({ success: false, message: "Please enter a valid Appointment ID." });
    }

    const query = "SELECT * FROM tblappointment WHERE AppointmentNumber = ?";
    db.query(query, [appointment_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Error fetching appointment details." });
        }

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "No appointment found with this ID." });
        }

        return res.json({
            success: true,
            name: result[0].Name,
            doctor: result[0].Doctor,
            date: result[0].AppointmentDate,
            status: result[0].Status
            
        });
    });
});

module.exports = router;