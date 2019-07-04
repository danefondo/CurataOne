const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let listItemSchema = require('./listItem.js').model('listItem').schema;

// one component contents
const entryComponentSchema = new mongoose.Schema({
	// can also be used as placeholder for images
	componentTitle: {
		type: String,
		size: Number
	},
	componentContent: String,
		// store links, image url's, etc.
	componentImageKey: String,
	componentURL: String, 
	// store lists, checklists, image galleries, files
	componentList: [listItemSchema],
	componentLink: String,
	componentType: String,
	// initially initiated through template component order
	componentOrder: Number,
	// Meta data, for side section
	requiredState: Boolean,
	// The equivalent id of the component in the template, so that when I change order of component in the template, I can update order of component here through accessing equivalent component in template components and getting its order number
	templateComponentId: String,
	entryId: String,
	curataId: String
});

const EntryComponent = module.exports = mongoose.model('EntryComponent', entryComponentSchema);