const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const User = require('./user.js');
const Template = require('./template.js');


// User Schema
const curataListSchema = new mongoose.Schema({
	listName: String,
	listDescription: String,
	templates: [{type: Schema.Types.ObjectId, ref: 'Template'}],
	// tasks: [{type: Schema.Types.ObjectId, ref: 'Task'}],
	// notes: [{type: Schema.Types.ObjectId, ref: 'Note'}],
	category: String,
	private: Boolean,
	creator: {
		type: String,
		required: true
	},
	owner: {
		type: String,
		required: true
	},
	admins: [{type: Schema.Types.ObjectId, ref: 'User'}],
	curataID: String
});

const curataList = module.exports = mongoose.model('curataList', curataListSchema);