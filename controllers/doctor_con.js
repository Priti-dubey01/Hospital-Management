const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/config');

const util = require('util');
const session = require("express-session");
const cookieParser = require("cookie-parser");
const query = util.promisify(db.query).bind(db);


exports.dashboard = async(req, res) => {

    let dr_id = await query('SELECT * FROM tbldoctor WHERE email = ?',[req.session.user.Email]);
    const sql = await query('SELECT COUNT(id) as count FROM tblappointment WHERE Status="Approved" AND Doctor = ?',[dr_id[0].ID]);
    const sqll = await query('SELECT COUNT(id) as cancelcount FROM tblappointment WHERE Status="Cancelled" AND Doctor = ?',[dr_id[0].ID]);
    const sql2 = await query('SELECT COUNT(id) as total FROM tblappointment where Doctor = ?',[dr_id[0].ID]);
    const new_app=await query('SELECT COUNT(id) as new from tblappointment where Status is Null',[dr_id[0].ID])
    const count = sql[0].count;
    const cancelcount = sqll[0].cancelcount;
    const total=sql2[0].total;
    const newapponment=new_app[0].new;
        res.render('doctor/dashboard', {count ,cancelcount,  total,newapponment});
}
   
exports.logout = (req, res) => {
   req.session.destroy((err) => {
    res.redirect('/login') 
  })
}

exports.newAppoinment=async(req,res)=>{
var dr_id = await query('SELECT * FROM tbldoctor WHERE email = ?',[req.session.user.Email]);
const panding_app=await query('SELECT * from tblappointment where Status is Null',[dr_id.ID])
  res.render('doctor/new_appoinment', {panding_app});
}


exports.appoinment_detail = async (req, res) => {
  var dr_id = await query('SELECT * FROM tbldoctor WHERE email = ? ',[req.session.user.Email]);
  const view_detail=await query('SELECT * from tblappointment where AppointmentNumber= ?',req.params.app_no);
    var app_details=view_detail[0];
    res.render('doctor/view_appoinment_details', {app_details});
}

exports.fetch_appoinment_detail=async (req,res)=>{
  const { remark, status } = req.body;  
  const updated_detail=await query('UPDATE tblappointment SET Remark =?, Status =? WHERE ID = ?', [remark, status, req.params.id]);
return res.redirect('/doctor/new_appoinment');
}

  exports.cancel_appoinment=async(req,res)=>{
    var dr_id = await query('SELECT * FROM tbldoctor  WHERE email = ?',[req.session.user.Email]);
    const cancel_app=await query('SELECT * from tblappointment where Status="Cancelled" AND Doctor = ?',[dr_id[0].ID])
    res.render('doctor/cancel_appoinment', {cancel_app});
  }

    exports.approved_appoinment=async(req,res)=>{

      var dr_id = await query('SELECT * FROM tbldoctor  WHERE email = ?',[req.session.user.Email]);
      const approve_app=await query('SELECT * from tblappointment where Status="Approved" AND Doctor = ?',[dr_id[0].ID])
      res.render('doctor/approved_appoinment', {approve_app});
  
    }


    exports.all_appoinment = async (req, res) => {
     
      var dr_id = await query('SELECT * FROM tbldoctor  WHERE email = ?',[req.session.user.Email]);
      const all_appoin=await query('SELECT * from tblappointment WHERE Doctor = ?',[dr_id[0].ID])
      res.render('doctor/all_appoinment', {all_appoin});
    }
    
    exports.search = async (req, res) => {
        var find=[];
        res.render('doctor/search',{find});
    }

    exports.search = async (req, res) => {
      let find = [];
  
      if (req.method == 'POST') {
          const searchdata = '%' + req.body.searchdata + '%';
          var dr_id = await query('SELECT * FROM tbldoctor  WHERE email = ?',[req.session.user.Email]);
          const doctorId = dr_id[0].ID;  
          find = await query(
              `SELECT * FROM tblappointment 
               WHERE (AppointmentNumber LIKE ? OR Name LIKE ? OR MobileNumber LIKE ?) AND Doctor = ?`,
              [searchdata, searchdata, searchdata, doctorId]
          );
          
      }
  
      res.render('doctor/search', { find });
  };
  

exports.report=async(req,res)=>{
      res.render('doctor/report');
}

exports.reportData=async(req,res)=>{
    var dr_id = await query('SELECT * FROM tbldoctor  WHERE email = ?',[req.session.user.Email]);
    var check = await query("SELECT * FROM tblappointment WHERE AppointmentDate BETWEEN ? AND ? AND Doctor = ?", 
    [req.body.fromdate, req.body.todate, dr_id[0].ID]);
    res.render('doctor/report_detail',{check});
}


exports.profile=async (req,res)=>{
  var profileData = await query('SELECT * FROM tbldoctor  WHERE email = ?',[req.session.user.Email]);
  var special = await query('SELECT * FROM tblspecialization');
  res.render('doctor/profile',{profileData,special});
}

exports.profile_update = async (req, res) => {
  try {
      var dr_id = await query('SELECT * FROM tbldoctor WHERE email = ?', [req.session.user.Email]);

      if (!dr_id.length) {
          return res.status(400).send('Doctor not found');
      }

      const { fname, mobilenumber, email } = req.body;

      console.log("Updating Doctor Profile:", fname, mobilenumber, email);

      const result = await query(
          'UPDATE tbldoctor SET FullName = ?, MobileNumber = ?, Email = ? WHERE ID = ?',
          [fname, mobilenumber, email, dr_id[0].ID]
      );

      console.log("Update Result:", result);

      return res.redirect('/doctor/profile');
  } catch (error) {
      console.log("Error:", error);
      res.status(500).send('Server Error');
  }
};


exports.change_password=async (req,res)=>{
  //var dr_id = await query('SELECT * FROM tbldoctor  WHERE email = ?',[req.session.user.Email]);
    const { password} = req.body.currentpassword; 
  //console.log("vgfgf",req.body);
    // const updated_profile =await query('UPDATE tbldoctor SET FullName =?, MobileNumber =? ,Email =?,Specialization=? WHERE ID = ?', [fname,mobilenumber,email,specializationid,[dr_id[0].ID]]);
    // return res.redirect('/profile');


  res.render('change_password')
}




