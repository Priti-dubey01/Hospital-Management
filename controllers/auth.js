const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/config');
const util = require('util');
const session = require("express-session");
const crypto = require('crypto');

const md5 = require('md5'); 
//const { param } = require('../routes/auth');

const query = util.promisify(db.query).bind(db);


exports.register = async (req, res) => {
  const { name, email, password, phone, specilization } = req.body;

  try {
    const existingUser = await query('SELECT Email FROM tbldoctor WHERE Email = ?', [email]);

    if (existingUser.length > 0) {
      const specializations = await query('SELECT * FROM tblspecialization');
      req.flash('error', 'That email is already in use');  
      return res.render('doctor/register', { message: req.flash('error'), data: specializations });
    }

    const specializations = await query('SELECT * FROM tblspecialization');
    const hash_password = await bcrypt.hash(password, 10);

    const results = await query('INSERT INTO tbldoctor SET ?', {
      FullName: name,
      MobileNumber: phone,
      Email: email,
      Specialization: specilization,
      Password: hash_password
    });
    return res.redirect('/doctor/login');  
  } catch (error) {
    return res.status(500).send('Server error');
  }
};


exports.doctor_login = async (req, res) => {
  return res.render('doctor/login', {});
}




exports.login = async (req, res) => {
  
  const { email, password } = req.body;
  
  
  try {
    
    if(req.session.user=='' || req.session.user==undefined){
      
          const users = await query('SELECT Email, Password,FullName,Image FROM tbldoctor WHERE is_admin=0 AND Email = ?', [email]);

        if (users.length == 0) {
          return res.render('doctor/login', {});
          return res.status(401).send('Invalid email or password');
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.Password);

        if (!isMatch) {
          return res.status(401).send('Invalid email or password');
        }
        // session store

        req.session.user = user;
        res.redirect('/doctor/dashboard');
    }else{
      return res.render('doctor/login', {});
    }
  } catch (error) {
   
    return res.status(500).send('Server error');
  }
};

exports.home = async (req, res) => {
  
  const specializations = await query('SELECT * FROM tblspecialization');
  const aboutus = await query('SELECT * from tblpage where PageType="aboutus"');
  const contactus = await query('SELECT * from tblpage where PageType="contactus"');


  res.render('home', { message: null, data: specializations,aboutus:aboutus,contactus:contactus });
  
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







