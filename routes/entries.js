const express = require('express');
const router = express.Router();

let Template = require('./models/template');
let Entry = require('./models/entry');
let entryComponent = require('./models/entryComponent');


// there is first creation with loading just template

// there is second creation with loading template + content?

// then there is every other load

	// do I need template?
	// could entry just be loaded?

	// from template components I need to load 
		// placeholder
		//

	// generally it should load the content (with template)
		// just in the beginning there is no content

		// /id/

	// perhaps the button creates the entry?
		// and then it loads the template AND the entry?

router.post('/:CurataId/:CurataListId/CreateNewEntry/', function(req, res) {

	// get id for template

	// get template by id
		// create entry with the help of template

});

// router.post('/curatas/curataLists/CreateNewEntry', function(req, res) {

// 	// get id for template
// 	let templateId = req.body.TemplateId;

// 		// next step is setting up questions
// 	Template.findById(templateId, function (err, template) {
		
// 		if (err) {
// 			return console.log(err);
// 		}

// 		let entry = new Entry();
// 		entry.entryState = "Draft";
// 		entry.linkedTemplateId = template._id;
// 		entry.curataListId = template.curataListId;

// 		for (var i = 0; i < template.components.length; i++) {

// 			let component = template.components[i]

// 			let entryComp = new entryComponent({
// 				componentOrder: component.componentOrder,
// 				componentType: component.componentType,
// 				templateComponentId: component._id
// 			})

// 			entry.entryComponents.push(entryComp);
// 		}

// 		entry.save(function(err){
// 			if(err) {
// 				return console.log("Entry saving error: ", err);
// 			}
// 		});
// 	})

// });



// router.get('/curatas/curate/templates/:id', ensureAuthenticated, function(req, res) {

// 	// except now the problem is that this will create a new entry EACH TIME it is pulled, whereas it should only happen ONCE
		
// 		// next step is setting up questions
// 	Template.findById(req.params.id, function (err, template) {
		
// 		if (err) {
// 			console.log(err);
// 			return;
// 		}

// 		if (template.components.length) {

// 			template.components.sort(function(a, b) {
// 				return a.componentOrder - b.componentOrder;
// 			});

// 			for (var i = 0; i < template.components.length; i++) {
// 				let type = template.components[i].componentType;
// 				console.log("Component type: ", type);

// 			};
// 		}

// 		res.render('CurateNew', {
// 			template: template
// 		})
// 	})
// })





/*====== Access control  ======*/
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    res.redirect('/');
  }
}

module.exports = router;