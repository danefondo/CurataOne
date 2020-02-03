const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const imageSchema = new mongoose.Schema({
	entryId: String,
	componentId: String,
	imageKey: String,
	imageURL: String,
	imageName: String,
	curataId: String
});

const image = module.exports = mongoose.model('image', imageSchema);
