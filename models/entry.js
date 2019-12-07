const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// let entryComponentSchema = require('./entryComponent.js').model('EntryComponent').schema;
const EntryComponent = require('./entryComponent.js');


/*
Possible ways to implement schema:

weigh pros/cons, with variables such as querying, changing, deleting in mind

- have components exist standalone and use referencing. 
	- do I want to use component DATA elsewhere?
- have components exist as subdocuments (delete parent and all goes)

www.airbaltic.com/et/maksevoimalused


each or some component(s) need(s):
	component order
	content
	type (to determine design)
	title (for those with a title)
	list schema (for those like questions, lists, checklists, galleries)

			if entry deleted, all its components also get deleted

			there is an entry
			and then there are components (inside the entry?)
			these components are created  in  parallel to the creation of template components
				these components are filled as per modification to the post/entry itself

			if an entry is deleted, all components are deleted
				yet the template would still continue to exist

			what if I change order of something in the template and as such the order of all existing components inside ENTRIES should change
				how  will this be handled?

			and how do the components inside entry get their order?  well they get their order by default, don't they? right.
				so this means I must somehow link up changes in template component order with entry component order
					could be that I give template component equivalent id to the entry component and then upon change i request looking up template component with that id, and take its order and update

					or I could upon change order and then in entry components find item where order number is the old number of the template, and switch it to the new one, but this would make it much harder to switch or change all the other component orders. as such my first proposed solution would make it significantly easier

how do I do supporting?
	e.g. buy me a coffee / donate
		 subscribe

*/


// Entry Schema
const entrySchema = new mongoose.Schema({
	entryTitle: {
		type: String,
		size: Number
	},
	entryText: String,
	entryIconURL: String,
	entryIconKey: String,
	entryLink: String,
	entryImageURL: String,
	entryImageKey: String,
	imageFeaturedState: String,
	//- State to check whether private special access public or public for all
	// entryComponents: [entryComponentSchema],
	entryComponents: [{type: Schema.Types.ObjectId, ref: 'EntryComponent'}],
	archivedComponents: [{type: Schema.Types.ObjectId, ref: 'EntryComponent'}],
	// Meta data, for side section
	design: {
		backgroundColor: String,
		textColor: String,
		border: String,
		borderRadius: String
	},
	entryOrder: Number,
	// draft or published
	entryState: String,
	lastUpdated: Date,
	// serves as category
	entryCategory: String,
	entryTags: [String],
	linkedTemplateId: String,
	curataListId: String,
	curataId: String,
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
	contributors: [{type: Schema.Types.ObjectId, ref: 'Contributor'}],
	collaborators: [{type: Schema.Types.ObjectId, ref: 'User'}]
});

const Entry = module.exports = mongoose.model('Entry', entrySchema);