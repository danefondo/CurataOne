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



I can make a feature of 'Curata feature requests' where people can see public features, people can upvote/downvote these features, to choose what is in active development but to also see what is currently in the making and progress and estimations, deadlines
*/