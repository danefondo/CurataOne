const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');
const passport = require('passport');
// Bring in User Model
let User = require('../models/user');
const mail = require('../utils/mail');
const accountController = require('../controller/accounts');
const accountUtil = require('../utils/account')
const validator = require('../controller/validator');

// Generate token
// const generateToken = (username) => {
// 	return crypto.createHmac('sha256', process.env.SIGN_SECRET).update(username).digest('hex');
// };

// this resource suggest using async for crypto.randomBytes
// https://github.com/nodejs/help/issues/457


router.post('/checkUnique', accountController.checkUnique);

router.post('/register', validator.register, accountController.register);



//token verification
router.get('/verify/:verificationToken', function(req, res, next) {
	const { verificationToken } = req.params;
	User.findOne({ verificationToken }, (verifyError, theUser) => {
		if (verifyError) {
			console.log('DB error', verifyError);
			return res.status(500).send({ message: "An error occurred" });
		}
		if (!theUser) {
			console.log('Please ensure you have created an account');
			return res.status(401).send({ message: "Please ensure you have an account" });
		}
		theUser.verifiedStatus = true;
		theUser.save((err, savedUser) => {
			console.log('user verified');
			req.login(savedUser, function (err) {
        		if ( ! err ){
            		res.redirect('/successful-registration');
        		} else {
            		//handle error
        		}
    		});
		})
	});
});

// Login
router.post('/login', function(req, res, next){
  passport.authenticate('local', function(err, user, info) {
  	if (err) { return next(err) }
  	if (!user) { 
  		return res.status(401).send({ error: "Your username and/or password is incorrect." });
  		// return res.json({ error: "Your username and/or password is incorrect."});
  	}
  	req.logIn(user, function(err) {
  		if (err) { return next(err) }
  		return res.status(200).send({ redirectURL: '/'});
  		// return res.redirect('/');
  	});
  })(req, res, next);
});

// Logout
router.get('/logout', function(req, res) {
	req.logout();
	console.log('You are logged out');
	res.redirect('/');
});

router.post('/changePassword', function(req, res) {
	const newPassword = req.body.newPassword;
	const oldPassword = req.body.oldPassword;

	let success = "Password successfully changed.";
	let fail = "Wrong password.";
	let samePassFail = "New password must be different.";

	const hashedPass = req.user.password;

	let match = bcrypt.compareSync(oldPassword, hashedPass);

	if (match == true) {
		// check that new pass is not the same as old pass
		if (oldPassword !== newPassword) {
			// hash newPassword
			bcrypt.genSalt(10, function(err, salt) {
				console.log("Inside bcrypt function.")
				bcrypt.hash(newPassword, salt, function(err, hash) {
					if(err) {
						console.log(err);
					}
					console.log("Hashing password.")
					User.findById(req.user._id, function(err, user) {
						user.password = hash;

						user.save(function(err, updatedUser) {
							if(err) {
								return console.log("Password change failed: ", err);
							} else {
								console.log('Password successfully changed.');
								res.json({success: success});
							}
						});
					})
				});
			});
		} else {
			res.json({samePassFail: samePassFail});
		}
	} else {
		// Passwords did not match
		res.json({fail: fail});
	}
})

// Login page
router.get('/loginForm', function(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('login');
  }
});

// Register page
router.get('/registerForm', function(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('register');
  }
});

// Reigster page
router.get('/forgotPass', function(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('pass__forgot');
  }
});

router.post('/sendResetPass', validator.forgotPass, accountController.sendResetPass);

router.get('/reset/:token', async function(req, res) {
	if (req.isAuthenticated()) {
	    res.redirect('/');
	 } else {
	 	const user = await User.findOne({
			resetToken: req.params.token
		});

    	res.render('pass__reset', {
    		valid: !!user && Date.now() < user.resetTokenExpires
    	});
	 }
})


router.post('/reset/', validator.reset, accountController.resetPassword)

module.exports = router;