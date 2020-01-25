const { validationResult } = require('express-validator');
let User = require('../models/user');
const accountUtil = require('../utils/account')
const mail = require('../utils/mail');

const accountController = {
	checkIfUserWithValueExists(field, value) {
		// for checking whether various information, such as username or email give results to detect whether the email is already used or not
		return new Promise((resolve, reject) => {
			User.findOne({[field]: value}, function(err, user) {
				if (err) {
					return reject(err);
				}
				return user ? resolve(true) : resolve(false);
			})
		})
	},

	async checkUnique (req, res) {
		let value = req.body.value;
		let field = req.body.field;
		console.log('value', value, field);
		let message = '';
		try {
			let fail = await accountController.checkIfUserWithValueExists(field, value);

			field = field[0].toUpperCase() + field.substring(1)
			if (fail) {
				message = `${field} already taken.`;
			} else {
				message = `${field} available.`;
			}
			res.json({
				fail: fail,
				message: message
			});
		} catch(error) {
			console.log(error);
			res.json({
				message: "An error occurred, we're fixing this now"
			});
		}
	},

	async register(req, res) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log('errors')
		    return res.status(422).json({ errors: errors.array() });
		}
		const email = req.body.email;
		const username = req.body.username;
		const password = req.body.password;
		const passcheck = req.body.passcheck;
		const dateCreated = new Date();
		// code change


		try {
			const verificationToken = await accountUtil.generateToken();
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

			const hash = await accountUtil.hashPassword(newUser.password);
			console.log("Hashing password.")
			newUser.password = hash;
			console.log("About to create user.")
			await newUser.save();
			console.log('Not stuck yet 3.')
			console.log('You are now registered and can log in', verificationToken);
			mail.sendVerificationMail(email, link);
			req.login(newUser, function (err) {
        		if ( ! err ){
            		res.json({
            			redirectURL: '/successful-registration'
            		})
        		} else {
            		//handle error
        		}
    		});
		} catch(err) {
			console.log(err);
		}
	},

	async resetPassword(req, res) {
		const { body: { token, password } } = req;
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log('errors')
		    return res.status(422).json({ err: errors.array()[0].msg });
		}
		try {
			const user = await User.findOne({
				resetToken: token
			});

			if (!user || Date.now() > user.resetTokenExpires) {
				return res.status(400).json({
					err: 'Invalid password reset link'
				});
			}

			user.password = await accountUtil.hashPassword(password)
			user.resetToken = null;
			user.resetTokenExpires = null;

			await user.save();
			res.status(200).json({
				message: 'Password reset was successful, please login'
			});
		} catch(error) {
			console.log(error);
			res.status(500).json({
				message: 'An error occurred'
			});
		}
	},

	async sendResetPass(req, res) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log('errors')
		    return res.status(422).json({ message: errors.array()[0].msg });
		}

		try {
			console.log(req.body.email);
			const token = await accountUtil.generateToken();
			console.log("veriftok: ", token);

			const user = await User.findOne({
				email: req.body.email
			});

			user.resetToken = token;
			user.resetTokenExpires = Date.now() + 1800000;

			await user.save();

			const link = `${req.protocol}://${req.get('host')}/accounts/reset/${token}`;
			console.log(link);
			mail.sendResetMail(req.body.email, link);
			res.status(200).json({
				message: 'A password reset link has been sent to the email address you entered.'
			})
		} catch(err) {
			console.log(err);
			res.status(500).json({
				message: 'An error occurred, please try again later.'
			});
		}
	}

};

module.exports = accountController;
