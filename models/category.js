const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const User = require('./user.js');

const entryCategorySchema = new mongoose.Schema({

	entryCategoryName: String,
	entryCategoryDescription: String,
	listId: String,
	dateCreated: Date,
	creator: {
		firstName: String,
		lastName: String,
		creator_id: String
	},
	admins: [{type: Schema.Types.ObjectId, ref: 'User'}],
	curataId: String
});

const entryCategory = module.exports = mongoose.model('entryCategory', entryCategorySchema);
