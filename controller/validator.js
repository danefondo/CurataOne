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
        })

	],

	forgotPass: [
		 check('email').isEmail().withMessage('Email empty or in incorrect format')
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
        })
	],

	imageValidate: [
		 check('fileName').not().isEmpty()
		 	.withMessage('File name is required'),
		 check('fileURL').not().isEmpty()
		 	.withMessage('File url is required'),
		 check('dateUpdated').not().isEmpty()
		 	.withMessage('Date is required'),
		 check('entryId').not().isEmpty()
		 	.withMessage('Entry ID is missing'),
		 check('curataId').not().isEmpty()
		 	.withMessage('Curata ID is missing')
	],
}