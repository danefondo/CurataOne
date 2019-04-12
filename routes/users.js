const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring in User Model
let User = require('../models/user');

// Register
router.post('/register', function(req, res) {
	console.log("Made it to users.js.")
	const firstname = req.body.firstname;
	const lastname = req.body.lastname;
	const username = req.body.username;
	const password = req.body.password;
	const passcheck = req.body.passcheck;

	/*
	if (password == passcheck) {
		create new user
	} else {
		console.log("Passwords don't match");
	}

	*/

	// Form check is with AJAX
	let newUser = new User({
		firstname:firstname,
		lastname:lastname,
		username:username,
		password:password
	})
	console.log("Stored user in variable.")

	bcrypt.genSalt(10, function(err, salt) {
		console.log("Inside bcrypt function.")
		bcrypt.hash(newUser.password, salt, function(err, hash) {
			if(err) {
				console.log(err);
			}
			console.log("Hasing password.")
			newUser.password = hash;
			console.log("About to create user.")
			newUser.save(function(err, user) {
				console.log('Not stuck yet.')
				if(err) {
					console.log('Not stuck yet 2.')
					console.log(err);
					return;
				} else {
					console.log('Not stuck yet 3.')
					console.log('You are now registered and can log in');
					req.login(user, function (err) {
                		if ( ! err ){
                    		res.redirect('/successful-registration');
                		} else {
                    		//handle error
                		}
            		});
				}
			});
		});
	});
});

// Login
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/'
    // failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', function(req, res) {
	req.logout();
	console.log('You are logged out');
	res.redirect('/');
});

module.exports = router;