 const  express = require('express');
 const session = require("express-session");
 const cookieParser = require("cookie-parser");
 const  path =require('path');
 const  mysql = require('mysql'); 
 const dotenv =require('dotenv');
 const methodOverride = require('method-override');
 const app = express();
 const port = 3000;
 const db = require('./config/config')

 dotenv.config({ path: './.env'});
 

 const publicDirectory=path.join(__dirname,'./public' )
 app.use(express.static(publicDirectory));

 app.use(express.urlencoded({
  extended: true
 }));
 app.use(methodOverride('_method')); 
 
 app.use(session({
    secret: 'priti',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 60000 }
}));

  
   app.use(express.json());
  app.set('view engine','ejs');

  app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.patient = req.session.patient;
    next();
  });



  app.use(express.static(path.join(__dirname, 'public')));

app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));
app.use('/doctor',require('./routes/doctor'));
app.use('/admin', require('./routes/admin'));
app.use('/patient',require('./routes/patient'));


app.listen(port, () => console.log(`Example app listening on port ${port}!`));


