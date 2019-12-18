const { check } = require('express-validator');

module.exports = {
	register: [
		 check('email').isEmail(),
		 // password must be at least 5 chars long
		 check('password').isLength({ min: 5 })
		 	.withMessage('Password must be at least 5 chars long')
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

	login: [
		check('email').isEmail(),
		 // password must be at least 5 chars long
		 check('password').isLength({ min: 5 })
	]
}