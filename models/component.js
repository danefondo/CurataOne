const mongoose = require('mongoose');
let Schema = mongoose.Schema;


// Just the component for templates, no content
const componentSchema = new mongoose.Schema({
	componentType: {
		type: String,
		required: true
	},
	requiredState: Boolean,
	componentTitle: String,
	placeholder: String,
	componentOrder: Number,
});

const Component = module.exports = mongoose.model('Component', componentSchema);