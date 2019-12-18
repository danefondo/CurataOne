const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// User Schema
const UserSchema = new mongoose.Schema({
	firstname: String,
	lastname: String,
	username: String,
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	lastLogin: Date,
	verificationToken: String,
	resetToken: String,
	verifiedStatus: Boolean,
	defaultCurataId: String,
	likedSpaces: [String],
	oldUserId: String,
	dateCreated: Date
});

const User = module.exports = mongoose.model('User', UserSchema);