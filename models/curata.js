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
	curataCustomDomain: String,
	templates: [{type: Schema.Types.ObjectId, ref: 'Template'}],
	curataList: [{type: Schema.Types.ObjectId, ref: 'curataList'}],
	curataFiles: {
		images: [{type: Schema.Types.ObjectId, ref: 'image'}]
	},
	category: String,
	private: Boolean,
	purpose: String,
	likeCount: Number,
	specialStatus: String,
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
	ownerName: String,
	admins: [{type: Schema.Types.ObjectId, ref: 'User'}],
	collaborators: [{type: Schema.Types.ObjectId, ref: 'User'}]
});

const Curata = module.exports = mongoose.model('Curata', CurataSchema);

/*

specialStatus exists for cases where a particular curata is currently at the top and receives something like

*/