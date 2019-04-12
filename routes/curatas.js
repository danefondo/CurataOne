const express = require('express');
const router = express.Router();

let Curata = require('../models/curata');
let curataList = require('../models/curataList');
let Template = require('../models/template');
let Component = require('../models/component');
let Entry = require('../models/entry');
let entryComponent = require('../models/entryComponent');



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
	        			console.log(err);
	        			return;
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
	    	function(err, space) {
				if (err) {
					console.log("Did not work: ", err);
					return;
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
				console.log("Did not work: ", err);
				return;
	        }
    });

	res.status(200).end();
});

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
		}

		entry.save(function(err){
			if(err) {
				return console.log("Entry saving error: ", err);
			}
		});
	})

});



/*====== Access control  ======*/
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    res.redirect('/');
  }
}

module.exports = router;