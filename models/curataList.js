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

/*
you get list of components as the template

when a template is requested

the list is accessed

for each item in list

its type and its order position are requested

and then the form is generated

as such

no separate model required for a Template

unless I want many templates

*/