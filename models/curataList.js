const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const User = require('./user.js');
const Template = require('./template.js');
const Entry = require('./entry.js');

// A curata list is used to work with entries, rather than just querying all entries with x templateId, because curataList also enables other data such as notes and tasks associated with the entity serving as list.

// User Schema
const curataListSchema = new mongoose.Schema({
	listName: String,
	listDescription: String,
	entries: [{type: Schema.Types.ObjectId, ref: 'Entry'}],
	templates: [{type: Schema.Types.ObjectId, ref: 'Template'}],
	tasks: [{type: Schema.Types.ObjectId, ref: 'Task'}],
	notes: [{type: Schema.Types.ObjectId, ref: 'Note'}],
	defaultTemplate: String,
	category: String,
	private: Boolean,
	dateCreated: Date,
	creator: {
		firstName: String,
		lastName: String,
		creator_id: String
	},
	owner: {
		firstName: String,
		lastName: String,
		owner_id: String
	},
	admins: [{type: Schema.Types.ObjectId, ref: 'User'}],
	curataId: String
});

const curataList = module.exports = mongoose.model('curataList', curataListSchema);