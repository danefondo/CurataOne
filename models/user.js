const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// User Schema
const UserSchema = new mongoose.Schema({
	firstname: String,
	lastname: String,
	username: String,
	email: String,
	password: {
		type: String,
		required: true
	},
	lastLogin: Date,
	verificationToken: String,
	resetToken: String,
	resetTokenExpires: Number,
	verifiedStatus: Boolean,
	defaultCurataId: String,
	likedSpaces: [String],
	oldUserId: String,
	dateCreated: Date
});

const User = module.exports = mongoose.model('User', UserSchema);