const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const User = require('./user.js');
const curataList = require('./curataList.js');

// User Schema
const CurataSchema = new mongoose.Schema({
	curataName: {
		type: String,
		required: true
	},
	curataDescription: String,
	curataAddress: String,
	curataList: [{type: Schema.Types.ObjectId, ref: 'curataList'}],
	category: String,
	private: Boolean,
	purpose: String,
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

load curata
pull list(s)
load list items



modify / change template -> update template

-> go to create entry (load template)
write entry (save as draft)
submit entry (remove draft status)

*/