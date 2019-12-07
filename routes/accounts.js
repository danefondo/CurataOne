const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');
const passport = require('passport');
const crypto = require('crypto');
// Bring in User Model
let User = require('../models/user');
const mail = require('../utils/mail');

// Generate token
// const generateToken = (username) => {
// 	return crypto.createHmac('sha256', process.env.SIGN_SECRET).update(username).digest('hex');
// };

// this resource suggest using async for crypto.randomBytes
// https://github.com/nodejs/help/issues/457
function generateToken() {
	return new Promise(function(resolve, reject) {
		crypto.randomBytes(32, function(ex, buf) {
			if (ex) {
				reject();
			}
	 		const token = buf.toString('hex');
	 		console.log("tok", token);
	 		resolve(token);
		})
	})
}

router.post('/register', function(req, res) {
	const email = req.body.email;
	const username = req.body.username;
	const password = req.body.password;
	const passcheck = req.body.passcheck;
	const dateCreated = new Date();
	// code change

	// // check if username already exists
	// User.find({"username": username}, function(err, docs) {
	// 	if (docs.length) {
	// 		//  username  already exists
	// 	}
	// })

	/*
	if (password !== passcheck) {
		return console.log("Passwords don't match");
	}

	*/
	// Form check is with AJAX
	// const verificationToken =generateToken(username)

	async function getVerificationToken() {
		try {
			const verificationToken = await generateToken();
			console.log("veriftok: ", verificationToken);

			let newUser = new User({
				email,
				verifiedStatus: false,
				verificationToken,
				username,
				password,
				dateCreated
			});
			console.log("Stored user in variable.")
			const link = `${req.protocol}://${req.get('host')}/accounts/verify/${verificationToken}`;

			bcrypt.genSalt(10, function(err, salt) {
				console.log("Inside bcrypt function.")
				bcrypt.hash(newUser.password, salt, function(err, hash) {
					if(err) {
						console.log(err);
					}
					console.log("Hashing password.")
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
							console.log('You are now registered and can log in', verificationToken);
							mail.sendVerificationMail(email, link);
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
		} catch(err) {
			console.log(err);
		}
	}
	getVerificationToken();
});

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
    res.render('forgotPass');
  }
});

module.exports = router;