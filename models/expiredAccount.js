const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// User Schema
const ExpiredUserSchema = new mongoose.Schema({
	firstname: {
		type: String
	},
	lastname: {
		type: String
	},
	username: {
		type: String
	},
	email: {
		type: String
	},
	password: {
		type: String
	},
	createdAt: {
		type: Date,
		expires: 2592000,
		default: Date.now
	}
});

const ExpiredUser = module.exports = mongoose.model('ExpiredUser', ExpiredUserSchema);