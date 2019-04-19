const express = require('express');
const router = express.Router();

let Curata = require('../models/curata');
let curataList = require('../models/curataList');
let Template = require('../models/template');
let Component = require('../models/component');
let Entry = require('../models/entry');
let entryComponent = require('../models/entryComponent');
let listItem = require('../models/listItem');



// Create new curata with list and template
router.post('/createNewCurata', function(req, res){

	let curata = new Curata();
	curata.creator = req.user._id;
	curata.owner = req.user._id;
	curata.curataName = req.body.curataName;
	curata.curataDescription = req.body.curataDescription;
	curata.curataAddress = req.body.curataAddress;

	let list = new curataList();
	list.creator = req.user._id;
	list.owner = req.user._id;
	list.listName = req.body.curataName;
	list.listDescription = req.body.curataDescription;

	let template = new Template();
	template.name = req.body.curataName;
	template.curataListId = curata._id;
	template.creator = req.user._id;
	template.save(function(err) {
		if (err) {
			console.log(err);
			return;
		}
	});

	list.templates = template._id;
	list.admins = req.user._id;
	list.save(function(err) {
		if (err) {
			console.log(err);
			return;
		}

	});

	// not creating ref to curata inside user because curata already has owner, creator to query by
	curata.curataList = list._id;
	curata.admins = req.user._id;
	curata.save(function(err){
		if(err) {
			console.log(err);
			return;
		} else {
			curata_id = curata._id;
			res.json({
				curata: curata,
				template: template
			});
		}
	});
});

router.post('/CreateTemplateWithComponents', function(req, res) {
	let componentOrder = req.body.componentOrder;
	let componentType = req.body.componentType;
	let TemplateId = req.body.TemplateId;

	// let component = {
	// 	componentOrder: componentOrder,
	// 	componentType: componentType
	// }

	let component = new Component({
		componentOrder: componentOrder,
		componentType: componentType
	})

	Template.findOneAndUpdate(
		{_id: TemplateId},
		{$push: {components: component}},
		function(err, template) {
	        if (err) {
				console.log(err);
				return;
	        } else {
	        	template.save(function(err) {
	        		if (err) {
	        			return console.log(err);
	        		} else {
	        			console.log("Component created in template!");
	        			data = {
	        				template: template,
	        				component: component
	        			}
	        			res.json(data);
	        		}
	        	});
			}
		})
})

router.post('/UpdateComponentPosition', function(req, res) {
	console.log("req body array: ", req.body.indexArray);
	let indexArray = JSON.parse(req.body.indexArray);
	let TemplateId = req.body.TemplateId;

	console.log("indexArray: ", indexArray);
	indexArray.forEach(function(obj) {
	    Template.findOneAndUpdate(
	    	{"_id": TemplateId, "components._id": obj.component_id}, 
	    	{"$set": {"components.$.componentOrder": obj.new_position }},
	    	function(err, template) {
				if (err) {
					return console.log("Did not work: ", err);
		        } else {
		        	template.save(function(err) {
		        		if (err) {
		        			return console.log(err);
		        		} else {
		        			console.log("Component order successfully updated.");
		        		}
		        	})
		        }
	    	}
	    );
	});

	res.status(200).end();
});


router.post('/UpdateTemplateTitle', function(req, res) {
	
	let TemplateTitle = req.body.TemplateTitle;
	let TemplateId = req.body.TemplateId;


    Template.update({"_id": TemplateId}, {"$set": {"name": TemplateTitle }}, function(err, template) {
			if (err) {
				return console.log("Did not work: ", err);
	        }
    });

	res.status(200).end();
});

router.post('/UpdateComponentTitle', function(req, res) {
	
	let ComponentTitle = req.body.ComponentTitle;
	let ComponentId = req.body.ComponentId;
	let EntryId = req.body.EntryId;


    Entry.findOneAndUpdate(
    	{"_id": EntryId, "entryComponents._id": ComponentId}, 
    	{"$set": {"entryComponents.$.componentTitle": ComponentTitle }},
    	function(err, entry) {
			if (err) {
				console.log("Title update did not work: ", err);
				return;
	        } else {
	        	entry.save(function(err) {
	        		if (err) {
	        			return console.log(err);
	        		} else {
	        			console.log("Component title successfully updated.");
	        		}
	        	})
	        }
    	}
    );

	res.status(200).end();
});


/* == Create new list item */

router.post('/CreateNewListItem', function(req, res) {

	let entryId = req.body.entryId;
	let componentId = req.body.componentId;
	let itemOrder = req.body.itemOrder;

	let item = new listItem({
		itemOrder: itemOrder,
		listId: componentId
	})

	// access entry by id
	Entry.findOneAndUpdate(
		// access entryComponent by id
		{"_id": entryId, "entryComponents._id": componentId},
		// create new listItem
		{$push: {"entryComponents.$.componentList": item}},
		{upsert: true},
		function(err, entry) {
	        if (err) {
				return console.log(err);
	        } else {
	        	entry.save(function(err) {
	        		if (err) {
	        			return console.log(err);
	        		} else {
	        			console.log("New list item created!", item);
	        			res.json(item);
	        			// return id of created entryListItem
	        			// data = {
	        			// 	template: template,
	        			// 	component: component
	        			// }
	        		}
	        });
		}
	})

})


/*
===========================
==== GETTING DATA
===========================
*/


// // Get single template
// router.get('/curate/templates/:id', function(req, res) {
// 	// Check if logged in
// 	if(req.isAuthenticated()) {;

// 		// Find template
// 		Template.findById(req.params.id, function(err, template) {
// 			console.log('template: ', template);
// 			if (err) {
// 				console.log("Error getting template: ", err);
// 			} else {
// 				res.json(template);
// 			}
// 		});

// 	} else {
// 		// Not logged in
// 		res.render('index');
// 	}
// });


router.post('/curataLists/CreateNewEntry', function(req, res) {

	// get id for template
	let templateId = req.body.TemplateId;

		// next step is setting up questions
	Template.findById(templateId, function (err, template) {
		
		if (err) {
			return console.log(err);
		}

		let entry = new Entry();
		entry.entryState = "Draft";
		entry.linkedTemplateId = template._id;
		entry.curataListId = template.curataListId;

		for (var i = 0; i < template.components.length; i++) {

			let component = template.components[i]

			let entryComp = new entryComponent({
				componentOrder: component.componentOrder,
				componentType: component.componentType,
				templateComponentId: component._id
			})

			entry.entryComponents.push(entryComp);

			if (component.componentType == "list") {
				let listItem = new listItem({})
			}
		}

		console.log("Did entry creation setup");

		entry.save(function(err){
			if(err) {
				return console.log("Entry saving error: ", err);
			}
		});

		console.log("Did entry save");

		entryId = entry._id;
		res.json({
			entry: entry,
			redirectTo: '/curatas/newEntry/' + entryId
			// redirectTo: '/' + req.body.type + 's/' + space_id + '/editing'
		});

		// res.redirect('/curatas/newEntry/' + entry._id);
	})

});

router.get('/newEntry/:id', function(req, res) {

	// get id for template
	let entryId = req.params.id;
	console.log("Inside entry, entryId: ", entryId);

		// next step is setting up questions
	Entry.findById(entryId, function (err, entry) {
		
		if (err) {
			return console.log("Could not get entry: ", err);
		}

		console.log("Received entry: ", entry);

		let templateId = entry.linkedTemplateId;
		let template = {};


		Template.findById(templateId, function(err, temp) {
			if (err) {
				return console.log("Could not get template: ", err);
			}

			template = temp;
			console.log("The Template: ", template);
		})

		entry.entryComponents.sort(function(a, b) {
			return a.componentOrder - b.componentOrder;
		});

		if (template === undefined) {
			return console.log("Template undefined.");
		} else {
			console.log("Proceeding.");
		}


		res.render('CurateNew', {
			entry: entry,
			template: template
		})

	});
})



/*====== Access control  ======*/
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    res.redirect('/');
  }
}

module.exports = router;