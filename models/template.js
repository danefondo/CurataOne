const mongoose = require('mongoose');
let Schema = mongoose.Schema;


// importing Schema from another file (rather than model)
let componentSchema = require('./component.js').model('Component').schema;


// // Just the component for templates, no content
// const componentSchema = new mongoose.Schema({
// 	componentType: {
// 		type: String,
// 		required: true
// 	},
// 	requiredState: Boolean,
// 	placeholder: String,
// 	componentOrder: Number,
// });


// Template schema uses an array of components to construct a template
const templateSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	components: [componentSchema],
	curataListId: String,
	creator: String,
	category: String
});

const Template = module.exports = mongoose.model('Template', templateSchema);