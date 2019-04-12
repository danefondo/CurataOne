const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let entryListSchema = require('./entryList.js').model('EntryList').schema;

// one component contents
const entryComponentSchema = new mongoose.Schema({
	// can also be used as placeholder for images
	componentTitle: {
		type: String,
		size: Number
	},
	// can also be used for image storage
	componentContent: String,
	// store lists, checklists, image galleries, files
	componentList: [entryListSchema],
	componentType: String,
	// initially initiated through template component order
	componentOrder: Number,
	// Meta data, for side section
	// The equivalent id of the component in the template, so that when I change order of component in the template, I can update order of component here through accessing equivalent component in template components and getting its order number
	templateComponentId: String,
	entryId: String
});

const EntryComponent = module.exports = mongoose.model('EntryComponent', entryComponentSchema);

/*
future upcoming:
- data grid
- calendar
- modal box
- modal box grid
- warning box
- note box (or color scheme options for info box to turn into note or warning or example)
- link box
- CODE block
*/