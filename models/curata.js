const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const User = require('./user.js');
const curataList = require('./curataList.js');
const Template = require('./template.js');

// User Schema
const CurataSchema = new mongoose.Schema({
	curataName: {
		type: String,
		required: true
	},
	curataDescription: String,
	curataAddress: String,
	templates: [{type: Schema.Types.ObjectId, ref: 'Template'}],
	curataList: [{type: Schema.Types.ObjectId, ref: 'curataList'}],
	curataFiles: {
		images: [{type: Schema.Types.ObjectId, ref: 'image'}]
	},
	category: String,
	private: Boolean,
	purpose: String,
	dateCreated: Date,
	creator: {
		type: String,
		required: true
	},
	owner: {
		type: String,
		required: true
	},
	admins: [{type: Schema.Types.ObjectId, ref: 'User'}]
});

const Curata = module.exports = mongoose.model('Curata', CurataSchema);

/*


*/