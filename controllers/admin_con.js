const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/config');
const util = require('util');
const session = require("express-session");
const multer = require("multer");
const crypto = require('crypto');
const md5 = require('md5') 
const query = util.promisify(db.query).bind(db);




exports.admin_login = async (req, res) => {
    return res.render('admin/admin_login', {});
};

exports.adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // if(req.session.user=='' || req.session.user==undefined){
      
    const users = await query('SELECT Email, Password,FullName FROM tbldoctor WHERE is_admin = 1 AND Email = ?', [email]);

          if (users.length == 0) {
            return res.status(401).send('Invalid email or password');
          }
            const user = users[0];
          const isMatch = await bcrypt.compare(password, user.Password);
  
          if (!isMatch) {
            return res.status(401).send('Invalid email or password');
          }
          
          req.session.user = user;

         
          res.redirect('/admin/admin_dashboard');

      
    } catch (error) {
     
      return res.status(500).send('Server error');
    }
  };

  exports.dashboard = async(req, res) => {

    const sqlall = await query('SELECT COUNT(id) as allcount FROM tbldoctor WHERE is_admin=0');
    const sqlPatient = await query('SELECT COUNT(id) as allpat FROM tblpatient');

    const sqllactive = await query('SELECT COUNT(id) as activecount FROM tbldoctor WHERE is_active=1 AND is_admin=0');
    const sql2inactive = await query('SELECT COUNT(id) as deactivecount FROM tbldoctor WHERE is_active=0');
    
    const allcount = sqlall[0].allcount;
    const activecount = sqllactive[0].activecount;
    const deactivecount=sql2inactive[0].deactivecount;
    const allPatient=sqlPatient[0].allpat;


        res.render('admin/admin_dashboard', {allcount ,activecount,  deactivecount,allPatient});
      

}

exports.doctor_list = async (req, res) => {

  const sqlall = await query(`
    SELECT tbldoctor.*, tblspecialization.Specialization AS specialization_name
    FROM tbldoctor
    LEFT JOIN tblspecialization ON tbldoctor.Specialization = tblspecialization.ID
    WHERE tbldoctor.is_admin = 0
    ORDER BY tblspecialization.Specialization;
  `);
  
  return res.render('admin/doctor_list/doctor_list', { sqlall, user: req.session.user });
};



exports.add_doctor = async (req, res) => {
  const specializations = await query('SELECT * FROM tblspecialization');
  return res.render('admin/doctor_list/create', {
    specializations: specializations, 
    message: '' 
  });
};


exports.store_doctor = async (req, res) => {
  const { fname, email, password, phone, specializations } = req.body;
  const profileImage = req.file ? req.file.filename : null;
  const hash_password = await bcrypt.hash(password, 10);
  const dupMobile = await query('SELECT COUNT(id) as mobileCount FROM tbldoctor WHERE MobileNumber = ?', [phone]);
  const dupEmail = await query('SELECT COUNT(id) as Emailcount FROM tbldoctor WHERE Email = ?', [email]);
  const specializationsList = await query('SELECT * FROM tblspecialization');

  if (dupMobile[0].mobileCount > 0) {
    return res.render('admin/doctor_list/create', {
      specializations: specializationsList,
      message: 'That phone number is already in use'
    });
  }

  if (dupEmail[0].Emailcount > 0) {
    return res.render('admin/doctor_list/create', {
      specializations: specializationsList,
      message: 'That email is already in use'
    });
  }
  await query('INSERT INTO tbldoctor SET ?', {
    FullName: fname,
    MobileNumber: phone,
    Email: email,
    Specialization: specializations,
    Password: hash_password, 
    Image: profileImage
  });

  res.redirect('/admin/doctor_list');
};


exports.edit_doctor = async (req, res) => {

const doctorId = req.params.id;

const existingDoctor = await query('SELECT * FROM tbldoctor WHERE ID = ?', [doctorId]);
const specializations = await query('SELECT * FROM tblspecialization');

return res.render('admin/doctor_list/edit', {existingDoctor,specializations,doctorId,message: '', user: req.session.user});
};


exports.doctor_update = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { fname, phone, email, specializations } = req.body;
    const profileImage = req.file ? req.file.filename : null;
    const existingDoctor = await query('SELECT * FROM tbldoctor WHERE ID = ?', [doctorId]);
    if (existingDoctor.length === 0) {
      return res.status(404).send("Doctor not found.");
    }
    const currentData = existingDoctor[0];
    
    const updateFields = {
      FullName: fname || currentData.FullName,
      MobileNumber: phone || currentData.MobileNumber,
      Email: email || currentData.Email,
      Specialization: specializations || currentData.Specialization,
      Image: profileImage !== null ? profileImage : currentData.Image,
      
    };
    
    const updDoc = await query('UPDATE tbldoctor SET ? WHERE ID = ?', [updateFields, doctorId]);

    if (updDoc.affectedRows === 0) {
      return res.status(400).send("No rows were updated. Check if the data being updated is different from the current data.");
    }

    return res.redirect('/admin/doctor_list');
  } catch (error) {
    console.error("Error updating doctor:", error);
    return res.status(500).send("Failed to update doctor. Please try again.");
  }
};




exports.delete_doctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const deleteDoc = await query('DELETE FROM tbldoctor WHERE ID = ?', [doctorId]);

    if (deleteDoc.affectedRows > 0) {
      console.log("Doctor deleted successfully");
    } else {
      console.log("No doctor found with the provided ID.");
    }

    return res.redirect('/admin/doctor_list');
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return res.status(500).send("Failed to delete doctor. Please try again.");
  }
};

exports.speci_list = async (req, res) => {

  const sqlall = await query(`SELECT * FROM tblspecialization ORDER BY ID DESC;`);
 
  
  return res.render('admin/specialization_list/speci_list', {sqlall});
};

exports.add_speci = async (req, res) => {
  return res.render('admin/specialization_list/create', {
    message: '' 
  });
};


exports.store_speci = async (req, res) => {
  const { specialization } = req.body;
  
  const existingspecialization = await query('SELECT * FROM tblspecialization WHERE Specialization = ?', [specialization]);

  if (existingspecialization.length > 0) {
    return res.render('admin/specialization_list/create', {
      specialization: specialization,
      message: 'That specialization is already Exist!!!'
    });
  }

  await query('INSERT INTO tblspecialization SET ?', {
    Specialization: specialization,
  });

  res.redirect('/admin/speci_list');
 
};



exports.edit_speci = async (req, res) => {
  const spieId = req.params.id;
  const specializations = await query('SELECT * FROM tblspecialization WHERE ID = ?', [spieId]);
 
  return res.render('admin/specialization_list/edit_speci', {specializations,spieId,message: ''});
  };


  exports.speci_update = async (req, res) => {

    try {
      const speciId = req.params.id;
  
      const { specialization } = req.body;
  
      const existingspecialization = await query('SELECT * FROM tblspecialization WHERE Specialization = ?', [specialization]);

      if (existingspecialization.length > 0) {
        return res.render('admin/specialization_list/create', {
          specialization: specialization,
          message: 'That specialization is already Exist!!!'
        });
      }

      const updSpeci = await query(
        'UPDATE tblspecialization SET Specialization = ? WHERE ID = ?',
        [ specialization, speciId]
      );
  
      return res.redirect('/admin/speci_list');
    } catch (error) {
      console.error("Error updating doctor:", error);
      return res.status(500).send("Failed to update doctor. Please try again.");
    }
  };

  exports.delete_speci = async (req, res) => {
    try {

      const speciId = req.params.id;
      const deletespe = await query('DELETE FROM tblspecialization WHERE ID = ?', [speciId]);
  
      if (deletespe.affectedRows > 0) {
        console.log(" deleted successfully");
      } else {
        console.log("No Specialization found with the provided ID.");
      }
  
      return res.redirect('/admin/speci_list');
    } catch (error) {
      console.error("Error deleting doctor:", error);
      return res.status(500).send("Failed to delete Specialization. Please try again.");
    }
  };
  
exports.patient_details=async(req,res)=>{
const patient_info = await query("SELECT * FROM tblappointment");
const doctor_info = await query("SELECT * FROM tbldoctor WHERE is_admin=0")
const doctor_id= 0;
return res.render('admin/Patient/patient_list',{patient_info,doctor_info,doctor_id})
}

exports.filter_patient=async(req,res)=>{


  const doctor_info = await query("SELECT * FROM tbldoctor WHERE is_admin=0")
  const doctorId = req.body.doctor;
  const patient_info = await query(
      "SELECT * FROM tblappointment WHERE (? = 0 OR Doctor = ?)",
      [doctorId, doctorId]
  );
  const doctor_id= req.body.doctor;
  return res.render('admin/Patient/patient_list',{patient_info,doctor_info,doctor_id})


}





  
