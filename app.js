/*====== BRING IN MODULES & LIBRARIES ======*/
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');


// Curata -- modularized content


/*====== DATABASE ======*/

// Set up default mongoose connection // var db_uri = 'mongodb://127.0.0.1/my_database';
mongoose.connect(config.db_uri);

// Get default connection
let db = mongoose.connection

// Get connection
db.once('open', function() {
	console.log('Connected to MongoDB.')
});

// Check for DB errors
db.on('error', function(err) {
	console.log('DB error: ', err);
});



/*====== APP ======*/
// Initializing the app
const app = express();

// Bring in models
let User = require('./models/user');
let Curata = require('./models/curata');
let curataList = require('./models/curataList');
let Template = require('./models/template');
let Entry = require('./models/entry');
let entryComponent = require('./models/entryComponent');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));



/*====== AUTHENTICATION ======*/

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
	res.render('index');
});

app.get('/my-curations', function(req, res) {
	res.render('MyCurations');
});

app.get('/successful-registration', function(req, res) {
	res.render('RegisterSuccess');
});


app.get('/curatas/curate/templates/:id', ensureAuthenticated, function(req, res) {

	// except now the problem is that this will create a new entry EACH TIME it is pulled, whereas it should only happen ONCE
		// next step is setting up questions
	Template.findById(req.params.id, function (err, template) {
		
		if (err) {
			console.log(err);
			return;
		}

		if (template.components.length) {

			template.components.sort(function(a, b) {
				return a.componentOrder - b.componentOrder;
			});

			for (var i = 0; i < template.components.length; i++) {
				let type = template.components[i].componentType;
				console.log("Component type: ", type);

			};
		}

		// let entry = new Entry();
		// entry.entryState = "Draft";
		// entry.linkedTemplateId = template._id;
		// entry.curataListId = template.curataListId;

		// for (var i = 0; i < template.components.length; i++) {

		// 	let component = template.components[i]

		// 	let entryComp = new entryComponent({
		// 		componentOrder: component.componentOrder,
		// 		componentType: component.componentType,
		// 		templateComponentId: component._id
		// 	})

		// 	entry.entryComponents.push(entryComp);
		// }

		// entry.save(function(err){
		// 	if(err) {
		// 		return console.log("Entry saving error: ", err);
		// 	}
		// });

		res.render('CurateNew', {
			template: template
		})
	})
})



/*====== ROUTE FILES ======*/
let users = require('./routes/users');
let curatas = require('./routes/curatas');
app.use('/users', users);
app.use('/curatas', curatas);


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
}



/*====== Start server  ======*/
app.listen(port, function(){
  console.log('Server started on port ' + port);
});


