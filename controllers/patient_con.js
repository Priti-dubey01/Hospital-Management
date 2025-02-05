const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/config');
const util = require('util');
const session = require("express-session");
const crypto = require('crypto');
const md5 = require('md5') 
const query = util.promisify(db.query).bind(db);


exports.patient_reg = async (req, res) => {
   return res.render('patient/patient_reg', {
        message: ''
    });
};

exports.patient_store = async (req, res) => {
   
   const { fname, email, password, phone, sex } = req.body;
    
    // console.log('Received data:', { fname, email, password, phone, sex });

    if (!password) {
        return res.render('patient/patient_reg', {
            message: 'Password is required'
        });
    }

    const hash_password = await bcrypt.hash(password, 10);

    const dupMobile = await query('SELECT COUNT(id) as mobileCount FROM tblpatient WHERE MobileNumber = ?', [phone]);
    const dupEmail = await query('SELECT COUNT(id) as Emailcount FROM tblpatient WHERE Email = ?', [email]);

    if (dupMobile[0].mobileCount > 0) {
        return res.render('patient/patient_reg', {
            message: 'That phone number is already in use'
        });
    }

    if (dupEmail[0].Emailcount > 0) {
        return res.render('patient/patient_reg', {
            message: 'That email is already in use'
        });
    }

    await query('INSERT INTO tblpatient SET ?', {
        Name: fname,
        MobileNumber: phone,
        Email: email,
        Gender: sex,
        Password: hash_password
    });
    return res.redirect('/patient/patient_login');
    }

exports.patient_login = async (req, res) => {
        return res.render('patient/patient_login', {});
      }

exports.patientlogin = async (req, res) => {
        const { email, password } = req.body;
        try {

          
           if(!req.session.patient=='' || req.session.patient==undefined){
            
          const users = await query('SELECT ID,Email, Password,Name,MobileNumber FROM tblpatient WHERE Email = ?', [email]);
      
                if (users.length == 0) {
          return res.render('patient/patient_login', {});

                  return res.status(401).send('Invalid email or password');
                }
                  const patient = users[0];
                const isMatch = await bcrypt.compare(password, patient.Password);
        
                if (!isMatch) {
                  return res.status(401).send('Invalid email or password');
                }
                  // session store

                req.session.patient = patient;
                              
                res.redirect('/patient/patient_dashboard');
            }
            else
              {
                return res.render('patient/patient_login', {});
              }
            
          } 
          catch (error) {
           return res.status(500).send('Server error');
          }
        };

        exports.patient_dashboard = async(req, res) => {

          const sqlall = await query('SELECT * FROM tblappointment');
        const sqlcount = await query('SELECT count(ID) as count FROM tblappointment WHERE patient_id=?', [req.session.patient.ID]);
       allPatientAppoinment=sqlcount[0].count;

          res.render('patient/patient_dashboard', {sqlall,allPatientAppoinment});
                
        }

     

       exports.patient_list = async (req, res) => {
     
        //  req.session.patient.ID;
             
        const sqlall = await query('SELECT * FROM tblappointment WHERE patient_id=?', [req.session.patient.ID]);
        return res.render('patient/patient_list', {sqlall});
      };


        exports.book_appo = async (req, res) => {
                const specializations = await query('SELECT * FROM tblspecialization');
              return res.render('patient/book_appoinment', { message: null, data: specializations });
          
        };


      exports.get_doctor = async (req, res) => {
        try {
          
            const speci_id = req.body.speci_id;
            const doctors = await query('SELECT ID, FullName AS Name FROM tbldoctor WHERE Specialization = ?', [speci_id]);
            res.json(doctors);  
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve doctors' });
        }
      };
      
        exports.book_patient_store = async(req,res)=>{
          const { name, email, phone, date ,time,specialization,doctorlist,message} = req.body;

const doctorResult = await query('SELECT FullName FROM tbldoctor WHERE id = ?', [doctorlist]);


          var appoint_no = Math.floor(Math.random() * 1000000000);

         var booked= await query('INSERT INTO tblappointment SET ?', {
          AppointmentNumber:appoint_no,
          Name: name,
          MobileNumber: phone,
          Email: email,
          AppointmentDate: date,
          AppointmentTime: time,
          Specialization:	specialization,
          Doctor:doctorlist,
          Message:message,
          patient_id:req.session.patient.ID
          });

          if (booked) {
            const accountSid = 'AC58ee352b079cfbe56a48f558cae1e034';
            const authToken = 'fda7b05386a5a8a048dee87627610cc2';
            const client = require('twilio')(accountSid, authToken);
    
            client.messages
                .create({
                    body: `Dear ${name},
    
    Your appointment no ${appoint_no} with ${doctorResult[0].FullName} is confirmed for ${date} at ${time}. 
    
    If you need to reschedule or cancel, please contact us at 6352266907.
    
    Thank you!
    
    Sarvajanik College of Engineering and Technology`,
                    from: '+15714411043',
                    to: '+916352266907'
                })
                .then(message => console.log(message.sid))
                .catch(error => console.error(error));  
        }
      return res.redirect('/patient/patient_list');
      }



      exports.logout = (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send("Failed to logout.");
            }
            res.clearCookie('connect.sid');
            res.redirect('/patient/patient_login');
        });
    };
        