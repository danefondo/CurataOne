const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const linklistItemSchema = new mongoose.Schema({
	// can also be used as placeholder for images
	linklistItem: String,
	linklistItemContent: String,
	linklistItemState: String,
	itemDescription: String,
	itemOrder: Number,
	linklistId: String
});

const linklistItem = module.exports = mongoose.model('linklistItem', linklistItemSchema);
