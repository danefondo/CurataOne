const { check } = require('express-validator');
const accountController = require('./accounts');

module.exports = {
	register: [
		 check('email').isEmail()
		 	.custom(value => {
		 		return accountController.checkIfUserWithValueExists('email', value).then(exists => {
		 			if (exists) {
		 				return Promise.reject("Email already exists");
		 			}
		 		});
		 	}),
		 // password must be at least 5 chars long
		 check('password').isLength({ min: 8 })
		 	.withMessage('Password must be at least 8 chars long')
		 	.custom((value, { req }) => {
	            if (value === req.body.email) {
	                throw new Error("Password can't equal email");
	            } else {
                	return value;
	            }
	       }),
		 check('passcheck').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords don't match");
            } else {
                return value;
            }
        }),

	],

	reset: [
		 check('password').isLength({ min: 8 })
		 	.withMessage('Password must be at least 8 chars long'),
		 check('passcheck').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords don't match");
            } else {
                return value;
            }
        }),
	]
}