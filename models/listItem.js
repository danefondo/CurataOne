const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const listItemSchema = new mongoose.Schema({
	// can also be used as placeholder for images
	listItem: String,
	listItemState: String,
	itemDescription: String,
	itemOrder: Number,
	listId: String
});

const listItem = module.exports = mongoose.model('listItem', listItemSchema);