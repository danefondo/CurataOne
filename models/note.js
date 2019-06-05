const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const User = require('./user.js');

const noteSchema = new mongoose.Schema({
	noteName: String,
	noteDescription: String,
	category: String,
	private: Boolean,
	dateCreated: Date,
	creator: {
		type: String,
		required: true
	},
	owner: {
		type: String,
		required: true
	},
	admins: [{type: Schema.Types.ObjectId, ref: 'User'}],
	curataListId: String,
	curataID: String
});

const Note = module.exports = mongoose.model('Note', noteSchema);