/*====== BRING IN MODULES & LIBRARIES ======*/
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const enforce = require('express-sslify');
const passport = require('passport');
const config = require('./config/database');

// Curata -- modularized content


/*====== DATABASE ======*/

// Set up default mongoose connection // var db_uri = 'mongodb://127.0.0.1/my_database';
// var myURL = 'mongodb://127.0.0.1/curata-test-db';
// mongoose.connect(myURL, { useNewUrlParser: true });

// Production database
mongoose.connect(config.db_uri);


// Get default connection
let db = mongoose.connection;

// Get connection
db.once('open', function() {
	console.log('Connected to MongoDB.');
});

// Check for DB errors
db.on('error', function(err) {
	console.log('DB error: ', err);
});



/*====== APP ======*/
// Initializing the app
const app = express();
app.locals.moment = require('moment');

if (process.env.NODE_ENV === 'production') {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

// Bring in models
let User = require('./models/user');


// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));


/*====== AUTHENTICATION ======*/

app.use(function(req, res, next) {
  console.log('handling request for: ' + req.url);
  next();
});

// Express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});



/*====== ROUTES ======*/


// Home route
app.get('/', function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/browse');
  } else {
    res.render('index');
  }
});

app.get('/my-curations', function(req, res) {
	res.render('MyCurations');
});

app.get('/successful-registration', function(req, res) {
	res.render('RegisterSuccess');
});


/*====== ROUTE FILES ======*/
let accounts = require('./routes/accounts');
// let curatas = require('./routes/curatas');
let browse = require('./routes/browse');
let public = require('./routes/public');
let dashboard = require('./routes/dashboard');
app.use('/accounts', accounts);
// app.use('/curatas', curatas);
app.use('/browse', browse);
app.use('/public', public);
app.use('/dashboard', dashboard);
//comment


/*====== Access control  ======*/
function ensureAuthenticated(req, res, next){
	console.log("Req.session ", req.session)
  if(req.isAuthenticated()){
    return next();
  } else {
  	console.log("Sorry, but you gotta be logged in.")
    res.redirect('/');
  }
}


/*====== Server setup  ======*/
let port = process.env.PORT;
if (port == null || port == "") {
	port = 3000;
  // port = 27018;
}




/*====== Start server  ======*/
app.listen(port, function(){
  console.log('Server started on port ' + port);
});

/*http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});*/

