const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.MAILGUN_TOKEN;
const domain = process.env.MAILGUN_DOMAIN;
const mailgun = require('mailgun-js')({apiKey: apiKey, domain: domain});
 


module.exports = {
	sendVerificationMail(email, link) {
		console.log(link, 'mail js file');
		const data = {
		  from: 'Curatedone <noreply@curateone.com>',
		  to: email,
		  subject: 'Welcome to CurateOne',
		  html: '',
		  text: `Verify your email address to enjoy curateone, click on this link ${link}`
		};
		mailgun.messages().send(data, function (error, body) {
		  console.log(body);
		});
	},


	sendResetMail(email, link) {
		console.log(link, 'mail js file');
		const data = {
		  from: 'Curatedone <noreply@curateone.com>',
		  to: email,
		  subject: 'Password reset to Curataone',
		  html: '',
		  text: `Reset your password on Curataone, click on this link ${link}`
		};
		mailgun.messages().send(data, function (error, body) {
		  console.log(body);
		});
	}

	// sendPasswordResetMail(email, link) {
	// 	console.log(link, 'mail js file');
	// 	const data = {
	// 	  from: 'Curatedone <noreply@curateone.com>',
	// 	  to: email,
	// 	  subject: 'Welcome to CurateOne',
	// 	  html: '',
	// 	  text: `To reset your password, please click this link ${link}`
	// 	};
	// 	mailgun.messages().send(data, function (error, body) {
	// 	  console.log(body);
	// 	});
	// }
}
