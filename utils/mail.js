const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.MAILGUN_TOKEN;
const domain = process.env.MAILGUN_DOMAIN;
const mailgun = require('mailgun-js')({apiKey: apiKey, domain: domain});
 

module.exports = {
	sendVerificationMail(email, link) {
		console.log(link, 'mail js file');
		const data = {
		  from: 'Curata One <noreply@curata.one>',
		  to: email,
		  subject: 'Welcome to Curata One',
		  html: '',
		  text: `Verify your email address to get the most of Curata One by clicking this link ${link}`
		};
		mailgun.messages().send(data, function (error, body) {
		  console.log(body);
		});
	},


	sendResetMail(email, link) {
		console.log(link, 'mail js file');
		const data = {
		  from: 'Curata One <noreply@curata.one>',
		  to: email,
		  subject: 'Password reset to Curata One',
		  html: '',
		  text: `To reset your Curata One password, click on this link ${link}`
		};
		mailgun.messages().send(data, function (error, body) {
		  console.log(body);
		});
	}
}
