const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const entryListSchema = new mongoose.Schema({
	// can also be used as placeholder for images
	listItem: String,
	listItemState: String,
	itemDescription: String,
	itemOrder: Number,
	listId: String
});

const EntryList = module.exports = mongoose.model('EntryList', entryListSchema);