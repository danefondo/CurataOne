const crypto = require('crypto');
const bcrypt = require('bcryptjs');

module.exports = {
	generateToken() {
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
	},

	hashPassword(password) {
		return new Promise((resolve, reject) => {
			bcrypt.genSalt(10, function(err, salt) {
				console.log("Inside bcrypt function.")
				bcrypt.hash(password, salt, function(err, hash) {
					return err ? reject(err) : resolve(hash);
				});
			});
		})
	}
}