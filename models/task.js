const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const User = require('./user.js');

const taskSchema = new mongoose.Schema({
	taskName: String,
	taskDescription: String,
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

const Task = module.exports = mongoose.model('Task', taskSchema);