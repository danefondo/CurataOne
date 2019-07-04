const express = require('express');
const bodyParser = require('body-parser');
const multer  = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const path = require('path');
const assert = require('assert');
const mongoose = require('mongoose');
mongoose.Promise = Promise;

const config = require('../config/aws');

const router = express.Router();

let Curata = require('../models/curata');
let curataList = require('../models/curataList');
let Template = require('../models/template');
let Component = require('../models/component');
let Entry = require('../models/entry');
let entryComponent = require('../models/entryComponent');
let listItem = require('../models/listItem');
let curataImage = require('../models/image');
let User = require('../models/user');

aws.config.update({
    accessKeyId: "AKIARKLMM5TMEHGOSNJC",
    secretAccessKey: "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",
    region: "us-east-1" 
});

const s3 = new aws.S3();

//  multer resource: https://medium.freecodecamp.org/how-to-set-up-simple-image-upload-with-node-and-aws-s3-84e609248792

// https://www.youtube.com/watch?v=srPXMt1Q0nY
// https://www.youtube.com/watch?v=ASuU4km3VHE
// https://www.youtube.com/watch?v=9Qzmri1WaaE


// const fileFilter = function(req, file, cb) {

// 	// https://www.youtube.com/watch?v=srPXMt1Q0nY
// 	// accept / reject a file
// 	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')  {
// 		cb(null, true); 
// 	} else {
// 		cb(null, false) // ignore the file
// 	}
// }

const fileFilter = function(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

// // Check file type
// function checkFileType(file, cb) {
// 	// Allowed extensions
// 	const filetypes = /jpeg|jpg|png|gif/;
// 	// Check extensions
// 	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
// 	// Check mime
// 	const mimetype = filetypes.test(file.mimetype);

// 	if (mimetype && extname) {
// 		return cb(null, true);
// 	} else {
// 		cb('Error: Images only!');
// 	}
// }

// const imageFilter = function (req, file, cb) {
//     //accept image files only
//     if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
//         return cb(new Error('Only image files are allowed!'), false);
//     }
//     cb(null, true);
// };



/*
1. Upload file on front end
2. Check that it is correct type or decline and send back error 
3. Check that it is correct size or decline and send back error
4. Store file in aws

To then later GET the file from the front end:
	let myImage = req.file.path
*/


// Single image upload
const upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: 'curata',
		acl: 'public-read',
		metadata: function(req, file, cb) {
			cb(null, {fieldName: file.fieldname});
		},
		key: function(req, file, cb) {
			console.log("File: ", file);
			// cb(null, file.originalname); // use Date.now() for unqiue file keys
			 cb(null, Date.now().toString());
			// cb(null, path.basename(file.originalname, path.extname(file.originalname)) + '-' + Date.now() + path.extname(file.originalname))
		}
	}),
	fileFilter: fileFilter
	// limits: {fileSize: 2000000},
	// limits: {fileSize: 1024 * 1024 * 5},
	// fileFilter: fileFilter,
	// fileFilter: function(req, file, cb) {
	// 	checkFileType(file, cb);
	// }
}); // optionally attach .single('image') directly to this

const singleUpload = upload.single('image');

/*
	- Set up file filtering
	- Set up file size limits
	- Set up file proper naming
	- Set up easy access to file?!
	- Set up saving the image url or equivalent to mongodb listItem
	- Change said listItem in DB on inputChange or have it be in one with initial save
	- Upon change, delete the previous image from AWS if not in gallery
	- Add option to remove / delete image --> then also delete from MongoDB & AWS


*/

router.post('/UploadSingleImage', function(req, res) {
	singleUpload(req, res, function(err) {
		if (err) {
			// return res.status(422).send({errors: [{title: 'Image Upload Error', detail: err.message}] });
			console.log('Error: ', err);
			res.json({ err: err });
			// res.render('index', {
			// 	msg:  err
			// })
		} else {
			//  If file not found
			if (req.file == undefined) {
				console.log('Error: No file select!');
				res.json('Error: No file selected!');
				// res.render('index', {
				// 	msg: 'Error: No file selected!'
				// });
			} else {
				// If success
				const imageName = req.file.key;
				const imageLocation = req.file.location; // url of the uploaded image
				console.log("Made it here.");
				let curataId = req.body.curataId;
				let componentId = req.body.componentId;
				let entryId = req.body.entryId;
				console.log("My CUrata: ", curataId);
				console.log("req.body", req.body);
				if (curataId && curataId.length) {
					console.log("YO!", curataId);
					Curata.findById(curataId, function(err, curata) {
						if (err) {
							return console.log("Could not find entry: ", err);
						}

						let image = new curataImage();
						image.entryId = entryId;
						if (componentId && componentId.length && componentId !== null) {
							console.log("componentId exists: ", componentId);
							image.componentId = componentId;
						}
						image.imageKey = imageName;
						image.imageURL = imageLocation;
						image.curataId = curataId;

						image.save(function(err) {
							if (err) {
								return console.log(err);
							}
						});

						curata.curataFiles.images.push(image._id);

						curata.save(function(err) {
							if (err) {
								return console.log(err);
							}
						});
					})

				}
				res.json({
					image: imageName,
					location: imageLocation
				})

				// res.render('index', {
				// 	msg: 'File uploaded!',
				// 	file: 'uploads/${req.file.filename}'
				// });
			}
			console.log(req.file);
		}
		// return res.json({'imageUrl': req.file.location});
		});
})

router.post('/AddImageToCurataFiles', function(req, res) {
	let entryId = req.body.entryId;
	let componentId;
	let imageKey = req.body.imageKey;
	let imageURL = req.body.imageURL;

	if (!imageKey) {
		return console.log("No image key.");
	}

	if (!imageURL) {
		return console.log("No image URL.");
	}

	if (req.body.componentId) {
		console.log("Req has componentId: ", req.body.componentId);
		componentId = req.body.componentId;
	}

	Entry.findById(entryId, function(err, entry) {
		if (err) {
			return console.log("Could not find entry: ", err);
		}
		curataId = entry.curataId;

		Curata.findById(curataId, function(err, curata) {
			if (err) {
				return console.log("Could not find entry: ", err);
			}

			let image = new curataImage();
			image.entryId = entryId;
			if (componentId && componentId.length && componentId !== null) {
				console.log("componentId exists: ", componentId);
				image.componentId = componentId;
			}
			image.imageKey = imageKey;
			image.imageURL = imageURL;
			image.curataId = curataId;

			image.save(function(err) {
				if (err) {
					return console.log(err);
				}
			});

			console.log("Image: ", image);

			curata.curataFiles.images.push(image._id);
			console.log("CurataFiles: ", curata.curataFiles);

			curata.save(function(err) {
				if (err) {
					return console.log(err);
				}
			});
			
		})
	})
	res.status(200).end();
	// set up that if I delete through curata, then it also deletes the image elsewhere
})

router.post('/UpdateImageComponent', function(req, res) {
	
	let ComponentImageKey = req.body.ComponentImageKey; // image name
	let ComponentURL = req.body.ComponentURL // image url
	let componentId = req.body.ComponentId;
	let EntryId = req.body.EntryId;

	// access component by id
	entryComponent.findOneAndUpdate(
		{"_id": componentId},
		// update
		{$set: {"componentImageKey": ComponentImageKey, "componentURL": ComponentURL}},
		function(err, component) {
			if (err) {
				return console.log("Image component update failed: ", err);
			} else {
				component.save(function(err) {
					if (err) {
						return console.log("Image component save failed: ", err);
					} else {
						console.log("Image component successfully updated: ", component);
						res.json({component: component});
					}
				});
			}
		}
	)
});

router.post('/UpdateEntryMainImage', function(req, res) {
	
	let entryImageKey = req.body.ComponentImageKey; // image name
	let entryImageURL = req.body.ComponentURL // image url
	let entryId = req.body.entryId;

	// access entry by id
	Entry.findOneAndUpdate(
		{"_id": entryId},
		// update
		{$set: {"entryImageKey": entryImageKey, "entryImageURL": entryImageURL}},
		{new: true},
		function(err, entry) {
			if (err) {
				return console.log("Entry image update failed: ", err);
			} else {
				entry.save(function(err) {
					if (err) {
						return console.log("Entry image save failed: ", err);
					} else {
						console.log("Entry image successfully updated: ", entry);
						res.json({entry: entry});
					}
				});
			}
		}
	)
});


// I'm using aws and multer s3 for my custom storage engine
// // Set storage engine -- adjust how files get stored
// const storage = multer.diskStorage({
// 	destination:  function(req, file, cb) {
// 		cb(null, './public/uploads/');
// 	},
// 	filename: function(req, file, cb) {
// 		cb(null, file.fieldname + '-' + Date.now() + 
// 			path.extname(file.originalname));
// 		cb(null, new Date().toISOString() + file.originalname)
// 	}
// });

/*

What is the difference between loading entries from
What does it matter?

curataList versus through templateId

Currently they are all entries inside a Curata essentially

*/


// Take to Curate page
router.get('/:username/curatas/curate', ensureAuthenticated, function(req, res) {
	res.render('curate');
})

// Take to Curate page
router.get('/dashboard', ensureAuthenticated, function(req, res) {
	// either always switch the 'currentCurata'
	// or have a 'default curata' and an option to set any curata as the 'default'

	// this is a question of where does the 'dashboard' button take you
	// you can always set a curata as the 'default' and then still keep open the option to switch or visit other curatas, clicking those buttons is essentially just going to some specific curata

	// should these take you to another curata?


	res.render('curate');
})



// Create new curata with list and template
router.post('/createNewCurata', ensureAuthenticated, function(req, res){

	let curata = new Curata();
	curata.creator = req.user._id;
	curata.owner = req.user._id;
	curata.curataName = req.body.curataName;
	curata.curataDescription = req.body.curataDescription;
	curata.curataAddress = req.body.curataAddress;

	let defaultCurata = req.user.defaultCurataId;

	if ((!defaultCurata) || defaultCurata == "N/A") {

			User.findOneAndUpdate(
				{_id: req.user._id},
				{$set: {defaultCurataId: curata._id}},
				{new: true},
				function(err, user) {
					if (err) {
						return console.log(err);
					}
					user.save(function(err) {
						if (err) {
							return console.log(err);
						}
						console.log("Default Curata added: ", user.defaultCurataId);
					})
				}
			)
	}

	let list = new curataList();
	list.creator = req.user._id;
	list.owner = req.user._id;
	list.listName = req.body.curataName;
	list.listDescription = req.body.curataDescription;
	list.curataId = curata._id;

	let template = new Template();
	template.name = req.body.curataName;
	template.curataListId = list._id;
	template.curataId = curata._id;
	template.creator = req.user._id;
	template.save(function(err) {
		if (err) {
			return console.log(err);
		}
	});

	// list.templates = template._id;
	// list.admins = req.user._id;
	list.defaultTemplate = template._id;
	list.templates.push(template._id);
	list.admins.push(req.user._id);
	list.save(function(err) {
		if (err) {
			return console.log(err);
		}
	});

	// not creating ref to curata inside user because curata already has owner, creator to query by
	// curata.curataList = list._id;
	// curata.admins = req.user._id;
	curata.curataList.push(list._id);
	curata.admins.push(req.user._id);
	curata.templates.push(template._id);
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

router.post('/updateTemplateComponent', function(req, res) {
	let componentOrder = req.body.componentOrder;
	let componentType = req.body.componentType;
	let TemplateId = req.body.TemplateId;
	let entryId = req.body.entryId;

	let component = new Component({
		componentOrder: componentOrder,
		componentType: componentType
	})

	Template.findOneAndUpdate(
		{_id: TemplateId},
		{$push: {components: component}},
		function(err, template) {
	        if (err) {
				return console.log(err);
	        } 
        	template.save(function(err) {
        		if (err) {
        			return console.log(err);
        		} 
    			console.log("Component created in template!");

				// if editing existing entry, add component to entry as well
				if (entryId && entryId !== 'N/A') {
					let entryComp = new entryComponent({
						componentOrder: componentOrder,
						componentType: componentType,
						templateComponentId: component._id,
						entryId: entryId,
						curataId: template.curataId
					})

					entryComp.save(function(err){
						if (err) { 
							return console.log("Entry saving error: ", err);
						}

						Entry.findOneAndUpdate(
							{_id: entryId},
							{$push: {entryComponents: entryComp._id}},
							function(err, entry) {
								if (err) {
									return console.log(err);
								}

								entry.save(function(err) {
									if (err) {
										return console.log(err);
									} 
									console.log("Component id added to entry");

					    			data = {
					    				template: template,
					    				component: component,
					    				entry: entry,
					    			}
					    			res.json(data);
								})
							}
						)
					});
				} else {
	    			data = {
	    				template: template,
	    				component: component,
	    			}
	    			res.json(data);
				}
        	});
		}
	)
})

router.post('/UpdateComponentPosition', function(req, res) {
	console.log("req body array: ", req.body.indexArray);
	let indexArray = JSON.parse(req.body.indexArray);
	let TemplateId = req.body.TemplateId;
	let entryId = req.body.entryId;

	// could I make a change where I first query the Template and then do the forEach loop on indexArray and then do the updates and then do the save after the loop? This way I could avoid querying and saving so many times

	console.log("indexArray: ", indexArray);
	indexArray.forEach(function(obj) {
	    Template.findOneAndUpdate(
	    	{"_id": TemplateId, "components._id": obj.component_id}, 
	    	{"$set": {"components.$.componentOrder": obj.new_position }},
	    	{ new: true},
	    	function(err, template) {
				if (err) {
					return console.log("Did not work: ", err);
		        } 

	        	template.save(function(err) {
	        		if (err) {
	        			return console.log(err);
	        		} 

	        		console.log("Component order successfully updated.");

					// if editing existing entry or entries template, push order change to entry or entires as well
					if (entryId && entryId.length && entryId !== "N/A") {

						console.log("Entry id exists: ", entryId);
						entryComponent.findOneAndUpdate(
							{"templateComponentId": obj.component_id},
							{"$set": {"componentOrder": obj.new_position}}, 
							{ new: true},
							function(err, entryComponent) {
								if (err) {
									return console.log(err);
								}
								console.log("entryComponent")
								entryComponent.save(function(err) {
									if (err) {
										return console.log(err);
									}
								})
							}
						)
					}

	        	})
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

/* Non-template components begin */

router.post('/UpdateListItemOrder', function(req, res) {
	console.log("Ayy, here's the array! ", req.body.indexArray);
	let indexArray = JSON.parse(req.body.indexArray);
	console.log("Arrgh, a parsed array! ", indexArray);
	let componentId = req.body.componentId;

	// could I make a change where I first query the Component and then do the forEach loop on indexArray and then do the updates and then do the save after the loop? This way I could avoid querying and saving so many times
	indexArray.forEach(function(obj) {
	    entryComponent.findOneAndUpdate(
	    	{"_id": componentId, "componentList._id": obj.itemId}, 
	    	{"$set": {"componentList.$.itemOrder": obj.newPosition }},
	    	function(err, component) {
				if (err) {
					return console.log("Argh! We screwed up, bring more rum! ", err);
		        } else {
		        	component.save(function(err) {
		        		if (err) {
		        			return console.log(err);
		        		} else {
		        			console.log("Ayy! List items order successfully updated.");
		        		}
		        	})
		        }
	    	}
	    );
	});

	res.status(200).end();
});

router.post('/UpdateEntryLink', function(req, res) {
	
	let entryLink = req.body.entryLink;
	let entryId = req.body.entryId;

	// access component by id
	Entry.findOneAndUpdate(
		{"_id": entryId},
		// update
		{$set: {"entryLink": entryLink}},
		function(err, entry) {
			if (err) {
				return console.log("Entry link update failed: ", err);
			} else {
				entry.save(function(err) {
					if (err) {
						return console.log("Entry save failed: ", err);
					} else {
						console.log("Entry link successfully updated: ", entry);
					}
				});
			}
		}
	)

	res.status(200).end();
});

router.post('/UpdateTemplateComponentDescription', function(req, res) {
	
	let templateId = req.body.templateId;
	let templateComponentId = req.body.templateComponentId;
	let componentDescription = req.body.componentDescription;

	// access component by id
	Template.findOneAndUpdate(
		{"_id": templateId, "components._id": templateComponentId},
		{"$set": {"components.$.componentDescription": componentDescription}},
		{ new: true },
		function(err, template) {
			if (err) {
				return console.log("Template component description update failed: ", err);
			} else {
				template.save(function(err) {
					if (err) {
						return console.log("Template component description save failed: ", err);
					} else {
						console.log("Template component description successfully updated: ", template);
					}
				});
			}
		}
	)

	res.status(200).end();
});

router.post('/UpdateTemplateComponentTitle', function(req, res) {
	
	let templateId = req.body.templateId;
	let templateComponentId = req.body.templateComponentId;
	let componentTitle = req.body.componentTitle

	// access component by id
	Template.findOneAndUpdate(
		{"_id": templateId, "components._id": templateComponentId},
		{"$set": {"components.$.componentTitle": componentTitle}},
		{ new: true },
		function(err, template) {
			if (err) {
				return console.log("Template component title update failed: ", err);
			} else {
				template.save(function(err) {
					if (err) {
						return console.log("Template component title save failed: ", err);
					} else {
						console.log("Template component title successfully updated: ", template);
					}
				});
			}
		}
	)

	res.status(200).end();
});

router.post('/removeTemplateComponentDescription', function(req, res) {
	
	let templateId = req.body.templateId;
	let templateComponentId = req.body.templateComponentId;

	// access component by id
	Template.findOneAndUpdate(
		{"_id": templateId, "components._id": templateComponentId},
		// update
		{$set: {"components.$.componentDescription": undefined}},
		function(err, template) {
			if (err) {
				return console.log("Template component description remove failed: ", err);
			} else {
				template.save(function(err) {
					if (err) {
						return console.log("Template save failed: ", err);
					} else {
						console.log("Template component description successfully removed: ", template);
					}
				});
			}
		}
	)

	res.status(200).end();
});

/*
===========================
== Curata Settings
===========================
*/


// Update Curata Name
router.post('/UpdateCurataName', function(req, res) {
	
	let curataName = req.body.curataName;
	let curataId = req.body.curataId;

	// access curata by id
	Curata.findOneAndUpdate(
		{"_id": curataId},
		// update
		{$set: {"curataName": curataName}},
		function(err, curata) {
			if (err) {
				return console.log("Curata name update failed: ", err);
			} else {
				curata.save(function(err) {
					if (err) {
						return console.log("Curata save failed: ", err);
					} else {
						console.log("Curata name successfully updated: ", curata);
					}
				});
			}
		}
	)

	res.status(200).end();
});

// Update Curata Name
router.post('/UpdateCurataDescription', function(req, res) {
	
	let curataDescription = req.body.curataDescription;
	let curataId = req.body.curataId;

	// access curata by id
	Curata.findOneAndUpdate(
		{"_id": curataId},
		// update
		{$set: {"curataDescription": curataDescription}},
		function(err, curata) {
			if (err) {
				return console.log("Curata description update failed: ", err);
			} else {
				curata.save(function(err) {
					if (err) {
						return console.log("Curata save failed: ", err);
					} else {
						console.log("Curata description successfully updated: ", curata);
					}
				});
			}
		}
	)

	res.status(200).end();
});

// Update Curata Name
router.post('/UpdateCurataAddress', function(req, res) {
	
	let curataAddress = req.body.curataAddress;
	let curataId = req.body.curataId;

	// access curata by id
	Curata.findOneAndUpdate(
		{"_id": curataId},
		// update
		{$set: {"curataAddress": curataAddress}},
		function(err, curata) {
			if (err) {
				return console.log("Curata address update failed: ", err);
			} else {
				curata.save(function(err) {
					if (err) {
						return console.log("Curata save failed: ", err);
					} else {
						console.log("Curata address successfully updated: ", curata);
					}
				});
			}
		}
	)

	res.status(200).end();
});



router.post('/UpdateEntryTitle', function(req, res) {
	
	let entryTitle = req.body.entryTitle;
	let entryId = req.body.entryId;

	// access component by id
	Entry.findOneAndUpdate(
		{"_id": entryId},
		// update
		{$set: {"entryTitle": entryTitle}},
		function(err, entry) {
			if (err) {
				return console.log("Entry title update failed: ", err);
			} else {
				entry.save(function(err) {
					if (err) {
						return console.log("Entry save failed: ", err);
					} else {
						console.log("Entry title successfully updated: ", entry);
					}
				});
			}
		}
	)

	res.status(200).end();
});

router.post('/markComponentRequired', function(req, res) {
	
	let templateId = req.body.templateId;
	let templateComponentId = req.body.templateComponentId;
	let requiredState = req.body.requiredState;
	let entryId = req.body.entryId;

	Template.findOneAndUpdate(
		{"_id": templateId, "components._id": templateComponentId},
		{"$set": {"components.$.requiredState": requiredState}},
		{ new: true },
		function(err, template) {
	        if (err) {
				return console.log(err);
	        } 
        	template.save(function(err) {
        		if (err) {
        			return console.log(err);
        		} 
        		console.log("Component requiredState updated: ", template.components);

				if (entryId && entryId.length && entryId !== "N/A") {
					// access component by id
					entryComponent.findOneAndUpdate(
						{"templateComponentId": templateComponentId},
						// update
						{$set: {"requiredState": requiredState}},
						{new: true},
						function(err, component) {
							if (err) {
								return console.log("Component requiredState update failed: ", err);
							} else {
								component.save(function(err) {
									if (err) {
										return console.log("Component save failed: ", err);
									} else {
										console.log("Component requiredState successfully updated: ", component);
									}
								});
							}
						}
					)
				}
        	});
		}
	)
	res.status(200).end();
});

router.post('/checkIfRequired', function(req, res) {
	
	let templateId = req.body.templateId;
	let templateComponentId = req.body.templateComponentId;

	Template.findById(templateId, function(err, template) {
		if (err) {
			return console.log("Couldn't find template: ", err);
		}
		let component = template.components.id(templateComponentId);

		res.json({
			component: component
		})
	})
});


router.post('/UpdateComponentTitle', function(req, res) {
	
	let ComponentTitle = req.body.ComponentTitle;
	let componentId = req.body.ComponentId;
	let entryId = req.body.entryId;

	// access component by id
	entryComponent.findOneAndUpdate(
		{"_id": componentId},
		// update
		{$set: {"componentTitle": ComponentTitle}},
		function(err, component) {
			if (err) {
				return console.log("Component title update failed: ", err);
			} else {
				component.save(function(err) {
					if (err) {
						return console.log("Component save failed: ", err);
					} else {
						console.log("Component title successfully updated: ", component);
					}
				});
			}
		}
	)

	res.status(200).end();
});

router.post('/UpdateQuestionTitle', function(req, res) {
	
	let QuestionId = req.body.QuestionId;
	let componentId = req.body.ComponentId;
	let EntryId = req.body.EntryId;
	let QuestionTitle = req.body.QuestionTitle;


	// access component by id
	entryComponent.findOneAndUpdate(
		{"_id": componentId, "componentList._id": QuestionId},
		// update
		{$set: {"componentList.$.listItem": QuestionTitle}},
		function(err, component) {
			if (err) {
				return console.log("Question title update failed: ", err);
			} else {
				component.save(function(err) {
					if (err) {
						return console.log("Component save failed: ", err);
					} else {
						console.log("Question title successfully updated: ", component);
					}
				});
			}
		}
	)

	res.status(200).end();
});

router.post('/UpdateQuestionContent', function(req, res) {
	
	let QuestionId = req.body.QuestionId;
	let componentId = req.body.ComponentId;
	let EntryId = req.body.EntryId;
	let QuestionContent = req.body.QuestionContent;


	// access component by id
	entryComponent.findOneAndUpdate(
		{"_id": componentId, "componentList._id": QuestionId},
		// update
		{$set: {"componentList.$.listItemContent": QuestionContent}},
		function(err, component) {
			if (err) {
				return console.log("Question content update failed: ", err);
			} else {
				component.save(function(err) {
					if (err) {
						return console.log("Component save failed: ", err);
					} else {
						console.log("Question content successfully updated: ", component);
					}
				});
			}
		}
	)

	res.status(200).end();
});

router.post('/UpdateListItem', function(req, res) {
	
	let listItemId = req.body.listItemId;
	let componentId = req.body.ComponentId;
	let EntryId = req.body.EntryId;
	let listItem = req.body.listItem;


	// access component by id
	entryComponent.findOneAndUpdate(
		{"_id": componentId, "componentList._id": listItemId},
		// update
		{$set: {"componentList.$.listItem": listItem}},
		function(err, component) {
			if (err) {
				return console.log("Component content update failed: ", err);
			} else {
				component.save(function(err) {
					if (err) {
						return console.log("Component save failed: ", err);
					} else {
						console.log("Component content successfully updated: ", component);
					}
				});
			}
		}
	)

	res.status(200).end();
});


router.post('/UpdateComponentContent', function(req, res) {
	
	let ComponentContent = req.body.ComponentContent;
	let componentId = req.body.ComponentId;
	let entryId = req.body.entryId;

	// access component by id
	entryComponent.findOneAndUpdate(
		{"_id": componentId},
		// update
		{$set: {"componentContent": ComponentContent}},
		function(err, component) {
			if (err) {
				return console.log("Component content update failed: ", err);
			} else {
				component.save(function(err) {
					if (err) {
						return console.log("Component save failed: ", err);
					} else {
						console.log("Component content successfully updated: ", component);
					}
				});
			}
		}
	)

	res.status(200).end();
});


router.post('/UpdateEntryText', function(req, res) {
	
	let entryText = req.body.entryText;
	let entryId = req.body.entryId;

	// access component by id
	Entry.findOneAndUpdate(
		{"_id": entryId},
		// update
		{$set: {"entryText": entryText}},
		function(err, entry) {
			if (err) {
				return console.log("Entry content update failed: ", err);
			} else {
				entry.save(function(err) {
					if (err) {
						return console.log("Entry save failed: ", err);
					} else {
						console.log("Entry content successfully updated: ", entry);
					}
				});
			}
		}
	)

	res.status(200).end();
});


/* == Create new list item */

router.post('/UpdateChecklist', function(req, res) {
	let checkboxValue = req.body.checkboxValue;
	let componentId = req.body.componentId;
	let listItemId = req.body.listItemId;

	// access component by id
	entryComponent.findOneAndUpdate(
		{"_id": componentId, "componentList._id": listItemId},
		// update
		{$set: {"componentList.$.listItemState": checkboxValue}},
		function(err, component) {
			if (err) {
				return console.log("Component checklist update failed: ", err);
			} else {
				component.save(function(err) {
					if (err) {
						return console.log("Component save failed: ", err);
					} else {
						console.log("Component checklist successfully updated: ", component);
					}
				});
			}
		}
	)

	res.status(200).end();

})

router.post('/CreateNewListItem', function(req, res) {

	let entryId = req.body.entryId;
	let componentId = req.body.componentId;
	let itemOrder = req.body.itemOrder;
	let componentType = req.body.componentType;

	let item;

	if (req.body.listItem) {
		let listObj = req.body.listItem;
		if (listObj == "N/A") {
			if (componentType == "checklist") {
				item = new listItem({
					itemOrder: itemOrder,
					listId: componentId,
					listItemState: "Unchecked"
				})
			} else {
				item = new listItem({
					itemOrder: itemOrder,
					listId: componentId
				})
			}
		} else {
			if (componentType == "checklist") {
				item = new listItem({
					itemOrder: itemOrder,
					listId: componentId,
					listItemState: "Unchecked",
					listItem: listObj
				})
			} else {
				item = new listItem({
					itemOrder: itemOrder,
					listId: componentId,
					listItem: listObj
				})
			}
		}
	} else {
		if (componentType == "checklist") {
			item = new listItem({
				itemOrder: itemOrder,
				listId: componentId,
				listItemState: "Unchecked"
			})
		} else {
			item = new listItem({
				itemOrder: itemOrder,
				listId: componentId
			})
		}
	}

	// access component by id
	entryComponent.findOneAndUpdate(
		{"_id": componentId},
		// create new item
		{$push: {"componentList": item}},
		function(err, component) {
			if (err) {
				return console.log("Component insert failed: ", err);
			} else {
				component.save(function(err) {
					if (err) {
						return console.log("Component save failed: ", err);
					} else {
						console.log("List item created: ", item);
						res.json(item);
					}
				});
			}
		}
	)

});

/* == Create new list question */

router.post('/CreateNewQuestion', function(req, res) {

	let entryId = req.body.entryId;
	let componentId = req.body.componentId;
	let itemOrder = req.body.itemOrder;

	let item = new listItem({
		itemOrder: itemOrder,
		listId: componentId
	})

	// access component by id
	entryComponent.findOneAndUpdate(
		{"_id": componentId},
		// create new question
		{$push: {"componentList": item}},
		function(err, component) {
			if (err) {
				return console.log("Component insert failed: ", err);
			} else {
				component.save(function(err) {
					if (err) {
						return console.log("Component save failed: ", err);
					} else {
						console.log("Question created: ", item);
						res.json(item);
					}
				});
			}
		}
	)

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

// later for preview, if something has no content, it's just not shown

router.post('/makeDefaultCurata', function(req, res) {

	let curataId = req.body.curataId;

	User.findOneAndUpdate(
		{"_id": req.user._id},
		{$set: {"defaultCurataId": curataId}},
		{new: true},
		function(err, user) {
			if (err) {
				return console.log("User default Curata update failed: ", err);
			} else {
				user.save(function(err) {
					if (err) {
						return console.log("User save failed: ", err);
					} else {
						console.log("User default Curata successfully updated: ", user);
					}

					res.json(user);

				});
			}
		}
	)
})

router.post('/RevertEntryToDraft', function(req, res) {

	let entryId = req.body.entryId;

	Entry.findById(entryId, function(err, entry) {
		if (err) {
			return console.log("Could not find entry: ", err);
		}

		entry.entryState = "Draft";

		entry.save(function(err){
			if (err) { 
				return console.log("Entry save failed: ", err);
			}
		});

		res.json({
			entry: entry
		});
	})
})

router.post('/PublishEntry', function(req, res) {

	let entryId = req.body.entryId;
	let username = req.user.username

	Entry.findById(entryId, function(err, entry) {
		if (err) {
			return console.log("Could not find entry: ", err);
		}

		entry.entryState = "Published";

		entry.save(function(err){
			if (err) { 
				return console.log("Entry save failed: ", err);
			}
		});

		let entryId = entry._id;
		let curataId = entry.curataId;
		let listId = entry.curataListId;
		res.json({
			entry: entry,
			redirectTo: '/curatas/' + username + '/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId
		});
	})
})

router.post('/:username/curatas/:curataId/lists/:listId/createNewEntry', ensureAuthenticated, function(req, res) {

	let listId = req.params.listId;
	let username = req.params.username;

	// get id for template
	let templateId = req.body.TemplateId;
	let userId = req.user._id;
	let creationTime = req.body.creationTime;

		// next step is setting up questions
	Template.findById(templateId, function (err, template) {
		if (err) {
			return console.log(err);
		}

		let entry = new Entry();
		entry.entryState = "Draft";
		entry.linkedTemplateId = template._id;
		entry.curataListId = template.curataListId;
		entry.curataId = template.curataId;
		entry.dateCreated = creationTime;
		entry.creator = userId;
		entry.owner = userId;
		entry.contributors.push(userId);

		var createComponentsAndSaveEntry = function(i) {
			if (i < template.components.length) {
				let component = template.components[i]
				let entryComp;

				entryComp = new entryComponent({
					componentOrder: component.componentOrder,
					componentType: component.componentType,
					templateComponentId: component._id,
					entryId: entry._id,
					curataId: template.curataId
				})


				// if (component.componentType == "list") {
				// 	let listObj = new listItem({
				// 		itemOrder: 0,
				// 		listId: entryComp._id
				// 	})

				// 	entryComp.componentList.push(listObj);
				// }

				if (component.componentType == "question-answer") {
					let listObj = new listItem({
						itemOrder: 0,
						listId: entryComp._id
					})

					entryComp.componentList.push(listObj);
				}

				entryComp.save(function(err){
					if (err) { 
						return console.log("Entry saving error: ", err);
					}

					console.log("entryComp id: ", entryComp._id);
					entry.entryComponents.push(entryComp._id);
					console.log("entry.entryComp: ", entry.entryComponents);
					console.log("entry: ", entry);
					createComponentsAndSaveEntry(i+1);
				});

			} else {
				entry.save(function(err){
					if (err) { 
						return console.log("Entry saving error: ", err);
					}

					let curataListId = template.curataListId;

					curataList.findById(curataListId, function(err, list) {
						list.entries.push(entry._id);

						list.save(function(err) {
							if (err) {
								return console.log("curataList save failed: ", err);
							}
						});
					});
				});

				console.log("Did entry save: ", entry);

				let entryId = entry._id;
				let curataId = template.curataId;
				res.json({
					entry: entry,
					redirectTo: '/curatas/' + username + '/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId + '/editing'
				});
			}
		}

		createComponentsAndSaveEntry(0);
	})


})

router.post('/curataLists/CreateNewEntry', function(req, res) {


	if (!req.user._id) {
		res.status(500).send();
	}
	// get id for template
	let templateId = req.body.TemplateId;
	let userId = req.user._id;
	let creationTime = req.body.creationTime;

		// next step is setting up questions
	Template.findById(templateId, function (err, template) {
		if (err) {
			return console.log(err);
		}

		let entry = new Entry();
		entry.entryState = "Draft";
		entry.linkedTemplateId = template._id;
		entry.curataListId = template.curataListId;
		entry.curataId = template.curataId;
		entry.dateCreated = creationTime;
		entry.creator = userId;
		entry.owner = userId;
		entry.contributors.push(userId);

		var createComponentsAndSaveEntry = function(i) {
			if (i < template.components.length) {
				let component = template.components[i]

				if (component.requiredState) {
					console.log("template component state: ", component.requiredState);
					entryComp = new entryComponent({
						componentOrder: component.componentOrder,
						componentType: component.componentType,
						templateComponentId: component._id,
						entryId: entry._id,
						requiredState: component.requiredState,
						curataId: template.curataId
					})
				} else {
					entryComp = new entryComponent({
						componentOrder: component.componentOrder,
						componentType: component.componentType,
						templateComponentId: component._id,
						entryId: entry._id,
						curataId: template.curataId
					})
				}

				// if (component.componentType == "list") {
				// 	let listObj = new listItem({
				// 		itemOrder: 0,
				// 		listId: entryComp._id
				// 	})

				// 	entryComp.componentList.push(listObj);
				// }

				if (component.componentType == "question-answer") {
					let listObj = new listItem({
						itemOrder: 0,
						listId: entryComp._id
					})

					entryComp.componentList.push(listObj);
				}

				entryComp.save(function(err){
					if (err) { 
						return console.log("Entry saving error: ", err);
					}

					console.log("entryComp id: ", entryComp._id);
					entry.entryComponents.push(entryComp._id);
					console.log("entry.entryComp: ", entry.entryComponents);
					console.log("entry: ", entry);
					createComponentsAndSaveEntry(i+1);
				});

			} else {
				entry.save(function(err){
					if (err) { 
						return console.log("Entry saving error: ", err);
					}

					let curataListId = template.curataListId;

					curataList.findById(curataListId, function(err, list) {
						list.entries.push(entry._id);

						list.save(function(err) {
							if (err) {
								return console.log("curataList save failed: ", err);
							}
						});
					});
				});

				console.log("Did entry save: ", entry);

				let entryId = entry._id;
				let username = req.user.username;
				let curataId = template.curataId;
				let listId = template.curataListId;
				res.json({
					entry: entry,
					redirectTo: '/curatas/' + username + '/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId + '/editing'
				});
			}
		}

		createComponentsAndSaveEntry(0);
	})

});

router.get('/:username/curatas/:curataId/lists/:listId/entries/:id/editing', ensureAuthenticated, function(req, res) {

	// get id for template
	let entryId = req.params.id;
	console.log("Inside entry, entryId: ", entryId);

		// next step is setting up questions
	Entry.findById(entryId).populate('entryComponents').exec(function (err, entry) {
		
		if (err) {
			return console.log("1 Could not get entry: ", err);
		}

		if (!err && entry) {
			console.log("Received entry: ", entry);

			entry.entryComponents.sort(function(a, b) {
				return a.componentOrder - b.componentOrder;
			});

			for (var i = 0; i < entry.entryComponents.length; i++) {
				let component = entry.entryComponents[i];

				if (component.componentList.length) {
					console.log('Yes, yes, got a list here. Let us... sort it, now, arrgh');
					component.componentList.sort(function(a, b) {
						return a.itemOrder - b.itemOrder;
					});
				}
			}

			let templateId = entry.linkedTemplateId;

			Template.findById(templateId, function(err, template) {
				if (err) {
					return console.log("Could not get template: ", err);
				}

				res.render('editingEntry', {
					entry: entry,
					template: template
				})

			})
		} else {
			console.log("Entry not found.");
			res.redirect('/');
		}

	});
})

// Delete component from template
router.delete('/deleteTemplateComponent', ensureAuthenticated, function(req, res) {

	let templateId = req.body.templateId;
	let templateComponentId = req.body.templateComponentId;

	Template.findOneAndUpdate(
		{ _id: templateId },
		{ $pull: { components: { _id: templateComponentId} } },
		{ new: true },
		function(err, removed) {
			if (err) { console.log(err) }
			res.status(200).send(removed);
		}
	)

});

// Archive component in template and all entries that use said component
router.delete('/archiveComponent', ensureAuthenticated, function(req, res) {

	let templateId = req.body.templateId;
	let templateComponentId = req.body.templateComponentId;

	Template.findOne({_id: templateId}, function(err, template) {
		let templateComponent = template.components.id(templateComponentId);
		template.archivedComponents.push(templateComponent);
		template.components.pull(templateComponent);
		template.save(function(err) {
			if (err) {
				return console.log("Failed to archive template component: ", err);
			}
			console.log("Successfully archived template component.");

			Entry.find({"linkedTemplateId": templateId}).populate('entryComponents').exec(function(err, data) {

				// for each entry
				// there can be one component with the templateComponentId
					// but when i archive the templateComponent
					// I must archive every single component in every single entry that sues that component

				entryComponent.find({"templateComponentId": templateComponentId}, function(err, component) {
					if (err) {
						return console.log("Couldn't get entry component: ", err);
					}
					entryComp = component;
				})

				data.forEach(function(entry) {

					// let us find the proper component of THIS particular entry
					let entryComponentId;
					for (var i=0; i<entry.entryComponents.length; i++) {
						let oneComponent = entry.entryComponents[i];
						if (oneComponent.templateComponentId == templateComponentId) {
							console.log("Correct one: ", oneComponent);
							entryComponentId = oneComponent._id;
						}
					}

					entry.archivedComponents.push(entryComponentId);
					entry.entryComponents.pull(entryComponentId);
					entry.save(function(err) {
						if (err) {
							return console.log("Failed to archive component: ", err);
						}
						console.log("Successfully archived component.");
					})
				});
			})
		});
	})
	res.status(200).end();
});

// Archive component in template and all entries that use said component
router.post('/unarchiveComponent', ensureAuthenticated, function(req, res) {

	let templateId = req.body.templateId;
	let templateComponentId = req.body.templateComponentId;

	Template.findOne({_id: templateId}, function(err, template) {
		let templateComponent = template.archivedComponents.id(templateComponentId);
		template.components.push(templateComponent);
		template.archivedComponents.pull(templateComponent);
		template.save(function(err) {
			if (err) {
				return console.log("Failed to unarchive template component: ", err);
			}
			console.log("Successfully unarchived template component.");

			Entry.find({"linkedTemplateId": templateId}).populate('archivedComponents').exec(function(err, data) {

				data.forEach(function(entry) {
					console.log("Entry before unarchiving: ", entry);
					// let us find the proper component of THIS particular entry
					let entryComponentId;
					for (var i=0; i<entry.archivedComponents.length; i++) {
						let oneComponent = entry.archivedComponents[i];
						console.log("Before check one component: ", oneComponent);
						if (oneComponent.templateComponentId == templateComponentId) {
							console.log("Correct one: ", oneComponent);
							entryComponentId = oneComponent._id;
						}
					}
					entry.archivedComponents.pull(entryComponentId);
					entry.entryComponents.push(entryComponentId);
					entry.save(function(err) {
						if (err) {
							return console.log("Failed to unarchive component: ", err);
						}
						console.log("Successfully unarchived component.");
					})
				});

				res.json({
					templateComponent: templateComponent
				})
			})
		});
	})
});

// Delete archived component
router.delete('/permaDeleteComponent', ensureAuthenticated, function(req, res) {

	let templateId = req.body.templateId;
	let templateComponentId = req.body.templateComponentId;

	Template.findOne({_id: templateId}, function(err, template) {
		let templateComponent = template.archivedComponents.id(templateComponentId);
		template.archivedComponents.pull(templateComponent);
		template.save(function(err) {
			if (err) {
				return console.log("Failed to remove template component: ", err);
			}
			console.log("Successfully removed template component.");

			Entry.find({"linkedTemplateId": templateId}).populate('archivedComponents').exec(function(err, data) {

				data.forEach(function(entry) {

					// let us find the proper component of THIS particular entry
					let entryComponentId;
					for (var i=0; i<entry.entryComponents.length; i++) {
						let oneComponent = entry.entryComponents[i];
						if (oneComponent.templateComponentId == templateComponentId) {
							console.log("Correct one: ", oneComponent);
							entryComponentId = oneComponent._id;
						}
					}

					entry.archivedComponents.pull(entryComponentId);
					entry.save(function(err) {
						if (err) {
							return console.log("Failed to remove component: ", err);
						}
						console.log("Successfully removed component.");
					})
				});

				entryComponent.deleteMany({templateComponentId: templateComponentId}).exec(function(err, results) {

					if (err) {
						return console.log(err);
					} else {
						console.log("Related entryComponents successfully removed.", results);
						res.status(200).send(results);
					}

				});
			})
		});
	})
});

// Archive Curata and all the curataLists, entries, entryComponents, listItems, images linked to it

/** @return {Promise} */
function findCurata(curataId) {
	return Curata.findOne({_id: curataId}).exec()
}

/** @return {Promise} */
function findImages(curataId) {
	return curataImage.find({"curataId": curataId}).exec()
}

// Delete curata
router.delete('/permaDeleteCurata', ensureAuthenticated, function(req, res) {

	let curataId = req.body.curataId;

	return findCurata(curataId).then(function(curata) {
		console.log("Made it here, curata: ", curata);
		findImages(curataId)
	}).then(function(images) {
		if (images && images.length) {
			var deleteCurataImages = function(i) {
				if (i < images.length) {
					images.forEach(function(image) {
						let imageKey = image.imageKey;

						s3.deleteObject({
						  Bucket: 'curata',
						  Key: '' + imageKey
						}, function (err, data) {
							if (err) {
								console.log("Error: ", err);
							}
						})
					})
					deleteCurataImages(i+1);
				} else {

					curataImage.deleteMany({ "curataId": curataId}).exec(function(err) {
						if (err) {
							return console.log(err);
						} else {
							console.log("Curata images successfully removed.");
						}
					});
				}
			}
			deleteCurataImages(0);
		}
	}).then(function() {
		curataList.deleteMany({ "curataId": curataId}).exec(function(err) {
			if (err) {
				return console.log(err);
			} else {
				console.log("Curata lists successfully removed.");
			}

			Entry.deleteMany({ "curataId": curataId}).exec(function(err) {
				if (err) {
					return console.log(err);
				} else {
					console.log("Curata entries successfully removed.");
				}

				entryComponent.deleteMany({ "curataId": curataId}).exec(function(err) {
					if (err) {
						return console.log(err);
					} else {
						console.log("Curata entry components successfully removed.");
					}

					Curata.deleteOne({ _id: curataId }).exec(function (err, removed) {
						if (err)  {
							return console.log(err);
						}

						let defaultCurata = req.user.defaultCurataId;
						console.log("User default Curata: ", defaultCurata);

						if (defaultCurata == curataId) {
							User.findOneAndUpdate(
								{"_id": req.user._id},
								{$set: {"defaultCurataId": undefined}},
								{new: true},
								function(err, user) {
									if (err) {
										return console.log("User default Curata remove failed: ", err);
									} else {
										user.save(function(err) {
											if (err) {
												return console.log("User save failed: ", err);
											} else {
												console.log("User default Curata successfully removed: ", user);
											}
										});
									}
								}
							)
						}
						console.log("Successfully removed Curata.");
						res.status(200).send(removed);
						// res.redirect('/');
					});

				});
			});
		});
	}).catch(function(err) {
		res.status(500).json(null);
	})
});


// Delete list item from component
router.delete('/DeleteListItem', ensureAuthenticated, function(req, res) {

	// if (!req.user._id) {
	// 	res.status(500).send();
	// }

	let listItemId = req.body.listItemId;
	let componentId = req.body.componentId;

	entryComponent.findOneAndUpdate(
		{ _id: componentId },
		{ $pull: { componentList: { _id: listItemId} } },
		{ new: true },
		function(err, removed) {
			if (err) { console.log(err) }
			res.status(200).send(removed);
		}
	)

});

// Delete question from component
router.delete('/DeleteQuestion', function(req, res) {

	// if (!req.user._id) {
	// 	res.status(500).send();
	// }

	let QuestionId = req.body.QuestionId;
	let componentId = req.body.componentId;

	entryComponent.findOneAndUpdate(
		{ _id: componentId },
		{ $pull: { componentList: { _id: QuestionId} } },
		{ new: true },
		function(err, removed) {
			if (err) { console.log(err) }
			res.status(200).send(removed);
		}
	)

});

// Delete previous image
router.delete('/DeletePreviousImage', function(req, res) {

	let imageKey = req.body.oldImageKey;
	// let componentId = req.body.componentId;

	curataImage.find({"imageKey": imageKey}, function(err, image) {
		if (err) {
			console.log("Could not find image to delete.");
		}

		Curata.findOneAndUpdate(
			{ _id: image.curataId },
			{ $pull: {"curataFiles.images": image._id} },
			{ new: true },
			function(err, removed) {
				if (err) { console.log(err) }
				console.log("Image reference deleted.");
			}
		);

		curataImage.deleteOne({ _id: image._id }, function (err) {
		  if (err) return console.log(err);
		  console.log("Successfully removed image.");
		});

		s3.deleteObject({
		  Bucket: 'curata',
		  Key: '' + imageKey
		}, function (err, data) {
			if (err) {
				console.log("Error: ", err);
			}
		})

	});

	res.status(200).end();

});

router.post('/saveListItemLink', function(req, res) {
	
	let listItemId = req.body.listItemId;
	let componentId = req.body.componentId;
	let listItemLink = req.body.listItemLink;

	// access component by id
	entryComponent.findOneAndUpdate(
		{"_id": componentId, "componentList._id": listItemId},
		// update
		{$set: {"componentList.$.listItemURL": listItemLink}},
		function(err, component) {
			if (err) {
				return console.log("List item URL remove failed: ", err);
			} else {
				component.save(function(err) {
					if (err) {
						return console.log("List item URL save failed: ", err);
					} else {
						console.log("List item URL successfully removed: ", component);
					}
				});
			}
		}
	)

	res.status(200).end();
});

router.post('/removeListItemLink', function(req, res) {
	
	let listItemId = req.body.listItemId;
	let componentId = req.body.componentId;

	// access component by id
	entryComponent.findOneAndUpdate(
		{"_id": componentId, "componentList._id": listItemId},
		// update
		{$set: {"componentList.$.listItemURL": undefined}},
		function(err, component) {
			if (err) {
				return console.log("List item URL remove failed: ", err);
			} else {
				component.save(function(err) {
					if (err) {
						return console.log("List item URL save failed: ", err);
					} else {
						console.log("List item URL successfully removed: ", component);
					}
				});
			}
		}
	)

	res.status(200).end();
});


// Delete image
router.delete('/DeleteImage', function(req, res) {

	let imageKey = req.body.imageKey;
	let componentId;
	let entryId;

	if (req.body.componentId) {
		componentId = req.body.componentId;
		entryComponent.findById(componentId,
			function(err, component) {
				if (err) { 
					console.log(err) 
				} else {
					console.log('Component: ', component);
					component.componentImageKey = undefined;
					component.componentURL = undefined;
					component.save(function(err) {
						if (err) console.log(err);
					})
				}
			}
		)
	} else if (req.body.entryId) {
		entryId = req.body.entryId;
		Entry.findById(entryId,
			function(err, entry) {
				if (err) { 
					console.log(err) 
				} else {
					console.log('Entry: ', entry);
					entry.entryImageKey = undefined;
					entry.entryImageURL = undefined;
					entry.save(function(err) {
						if (err) console.log(err);
					})
				}
			}
		)
	}

	curataImage.find({"imageKey": imageKey}, function(err, image) {
		if (err) {
			console.log("Could not find image to delete.");
		}

		Curata.findOneAndUpdate(
			{ _id: image.curataId },
			{ $pull: {"curataFiles.images": image._id} },
			{ new: true },
			function(err, removed) {
				if (err) { console.log(err) }
				console.log("Image reference deleted.");
			}
		);

		s3.deleteObject({
		  Bucket: 'curata',
		  Key: '' + imageKey
		}, function (err, data) {
			if (err) {
				console.log("Error: ", err);
			}
		})

		curataImage.deleteOne({ _id: image._id }, function (err) {
		  if (err) return console.log(err);
		  console.log("Successfully removed image.");
		});

	});

	res.status(200).end();

});

// Delete image title
router.delete('/DeleteImageTitle', function(req, res) {

	let componentId = req.body.componentId;

	entryComponent.findById(componentId,
		function(err, component) {
			if (err) { 
				console.log(err) 
			} else {
				console.log('Component: ', component);
				component.componentTitle = undefined;
				component.save(function(err) {
					if (err) console.log(err);
				})
			}
		}
	)

	res.status(200).end();

});

// Delete image title
router.delete('/DeleteImageDescription', function(req, res) {

	let componentId = req.body.componentId;

	entryComponent.findById(componentId,
		function(err, component) {
			if (err) { 
				console.log(err) 
			} else {
				console.log('Component: ', component);
				component.componentContent = undefined;
				component.save(function(err) {
					if (err) console.log(err);
				})
			}
		}
	)

	res.status(200).end();

});

// Delete image title
router.delete('/RemoveEntryLink', function(req, res) {

	let entryId = req.body.entryId;

	Entry.findById(entryId,
		function(err, entry) {
			if (err) { 
				console.log(err) 
			} else {
				console.log('Entry: ', entry);
				entry.entryLink = undefined;
				entry.save(function(err) {
					if (err) console.log(err);
				})
			}
		}
	)

	res.status(200).end();

});

// Delete image title
router.delete('/CancelAndDeleteEntry', function(req, res) {

	let entryId = req.body.entryId;

	Entry.findByIdAndRemove(entryId, function(err, entry) {
		if (err) {
			console.log("Entry delete failed.");
		}

		let curataId = entry.curataId;

		// delete all items where id == component id
		entryComponent.deleteMany({ "entryId": entryId}).exec(function(err) {
			if (err) {
				return console.log(err);
			} else {
				console.log("Entry components successfully removed.");
			}
		});

		curataImage.find({"entryId": entryId}, function(err, data) {
			data.forEach(function(image) {
				// Pull image reference from curataFiles
				console.log("One imageId to remove: ", image);
				Curata.findOneAndUpdate(
					{ _id: curataId },
					{ $pull: {"curataFiles.images": image._id} },
					{ new: true },
					function(err, removed) {
						if (err) { console.log(err) }
					}
				);

				s3.deleteObject({
				  Bucket: 'curata',
				  Key: '' + image.imageKey
				}, function (err, data) {
					if (err) {
						console.log("Error: ", err);
					}
					console.log("Successfully deleted image from AWS.");
				})
			});
		})

		curataImage.deleteMany({ "entryId": entryId}).exec(function(err) {
			if (err) {
				return console.log(err);
			} else {
				console.log("Associated images successfully removed.");
			}
		});

		let curataListId = entry.curataListId;

		curataList.findOneAndUpdate(
			{ _id: curataListId },
			{ $pull: {entries: entry._id} },
			{ new: true },
			function(err, removed) {
				if (err) { console.log(err) }
			});

		res.json({
			msg: "Entry delete successful.",
			redirectTo: '/'
		});
	})

});

router.get('/:username/curatas/:curataId/lists/:listId/entries/:entryId/template/:templateId', ensureAuthenticated, function(req, res) {

	// get id for template
	let templateId = req.params.templateId;
	let listId = req.params.listId;
	let entryId = req.params.entryId;
	let template;
	let componentTypes = [];

	Template.findById(templateId, function(err, temp) {
		if (err) {
			return console.log("Could not get template", err);
		}
		template = temp;

		template.components.sort(function(a, b) {
			return a.componentOrder - b.componentOrder;
		});

		if (template.archivedComponents.length) {
			template.archivedComponents.forEach(function(component) {

				let status = false;

				for (var i=0; i<componentTypes.length; i++) {
					let arrayItem = componentTypes[i];
					if (arrayItem == component.componentType) {
						console.log("Type already exists!");
						status = true;
						break;
					}
				}

				if (status == false) {
					componentTypes.push(component.componentType);
				}
			})
		}

		Entry.findById(entryId).populate('entryComponents').populate('archivedComponents').exec(function(err, entry) {
			if (err) {
				return console.log("3 Could not get entry: ", err);
			}

			entry.entryComponents.sort(function(a, b) {
				return a.componentOrder - b.componentOrder;
			});

			res.render('template', {
				template: template,
				listId: listId,
				entry: entry,
				componentTypes: componentTypes
			})
		})

	})
})

		// next step is setting up questions
	// Template.findById(templateId, function (err, template) {
		
	// 	if (err) {
	// 		return console.log("4 Could not get entry: ", err);
	// 	}


	// 	template.components.sort(function(a, b) {
	// 		return a.componentOrder - b.componentOrder;
	// 	});

	// 	if (template === undefined) {
	// 		return console.log("Template undefined.");
	// 	} else {
	// 		console.log("Proceeding.");
	// 	}

	// 	res.render('template', {
	// 		template: template,
	// 		listId: listId,
	// 		entryId: entryId
	// 	})

	// });

router.post('/checkTemplateArchives', ensureAuthenticated, function(req, res) {

	// get id for template
	let templateId = req.body.templateId;
	// let archivedTemplateComponents = [];
	let archivedTemplateComponents = [];

	console.log("tempId", templateId);

	Template.findById(templateId, function(err, template) {
		if (err) {
			return console.log("Could not get template", err);
		}
		console.log("Template: ", template);

		if (template.archivedComponents.length) {
			var createArchivesList = function(i) {
				if (i < template.archivedComponents.length) {
					let component = template.archivedComponents[i]
					archivedTemplateComponents.push(component);
					createArchivesList(i+1);
				} else {
					let componentTypes = [];
					template.archivedComponents.forEach(function(component) {

						let status = false;

						for (var i=0; i<componentTypes.length; i++) {
							let arrayItem = componentTypes[i];
							if (arrayItem == component.componentType) {
								console.log("Type already exists!");
								status = true;
								break;
							}
						}

						if (status == false) {
							componentTypes.push(component.componentType);
						}
					})
					res.json({
						archivedTemplateComponents: archivedTemplateComponents,
						componentTypes: componentTypes
					})
				}
			}
			createArchivesList(0);
		} else {
			console.log("Template has no archived components.");
			res.json({
				message: "Template has no archived components."
			})
		}
	})
})


router.get('/drafts/:id', function(req, res) {

	// get id for template
	let entryId = req.params.id;

		// next step is setting up questions
	Entry.findById(entryId).populate('entryComponents').exec(function (err, entry) {
		
		if (err) {
			return console.log("5 Could not get entry: ", err);
		}

		if (!err && entry) {
			console.log("Received entry: ", entry);

			entry.entryComponents.sort(function(a, b) {
				return a.componentOrder - b.componentOrder;
			});

			for (var i = 0; i < entry.entryComponents.length; i++) {
				let component = entry.entryComponents[i];

				if (component.componentList.length) {
					console.log('Yes, yes, got a list here. Let us... sort it, now, arrgh');
					component.componentList.sort(function(a, b) {
						return a.itemOrder - b.itemOrder;
					});
				}
			}

			let templateId = entry.linkedTemplateId;

			Template.findById(templateId, function(err, template) {
				if (err) {
					return console.log("Could not get template: ", err);
				}

				res.render('draftEntry', {
					entry: entry,
					template: template
				})
			})

		} else {
			console.log("Entry not found.");
			res.redirect('/');
		}
	});
})

router.get('/:username/curatas/:curataId/lists/:listId/entries/:entryId', function(req, res) {

	// get id for template
	let entryId = req.params.entryId;

		// next step is setting up questions
	Entry.findById(entryId).populate('entryComponents').exec(function (err, entry) {
		
		if (err) {
			return console.log("6 Could not get entry: ", err);
		}

		if (!err && entry) {
			console.log("Received entry: ", entry);

			entry.entryComponents.sort(function(a, b) {
				return a.componentOrder - b.componentOrder;
			});

			for (var i = 0; i < entry.entryComponents.length; i++) {
				let component = entry.entryComponents[i];

				if (component.componentList.length) {
					console.log('Yes, yes, got a list here. Let us... sort it, now, arrgh');
					component.componentList.sort(function(a, b) {
						return a.itemOrder - b.itemOrder;
					});
				}
			}

			let templateId = entry.linkedTemplateId;

			Template.findById(templateId, function(err, template) {
				if (err) {
					return console.log("Could not get template: ", err);
				}

				res.render('publishedEntry', {
					entry: entry,
					template: template
				})
			})

		} else {
			console.log("Entry not found.");
			res.redirect('/');
		}
	});
})


// Get all Curatas by user (later by joint users)
router.get('/:username/curatas', ensureAuthenticated, function(req, res) {

	// Ensure only owner has access, else render error message
	if (req.user.username !== req.params.username) {

		res.render('curatas', {
			error: "error"
		})
	}

	let userId =  req.user._id;

		// next step is setting up questions
	Curata.find({"owner": userId}, function (err, curatas) {
		
		if (err) {
			return console.log("Could not get curatas: ", err);
		}

		if (!err && curatas) {
			console.log("Received all user's curatas: ", curatas);

			// entry.entryComponents.sort(function(a, b) {
			// 	return a.componentOrder - b.componentOrder;
			// });

			// for (var i = 0; i < entry.entryComponents.length; i++) {
			// 	let component = entry.entryComponents[i];

			// 	if (component.componentList.length) {
			// 		console.log('Yes, yes, got a list here. Let us... sort it, now, arrgh');
			// 		component.componentList.sort(function(a, b) {
			// 			return a.itemOrder - b.itemOrder;
			// 		});
			// 	}
			// }

			// let templateId = entry.linkedTemplateId;

			// Template.findById(templateId, function(err, template) {
			// 	if (err) {
			// 		return console.log("Could not get template: ", err);
			// 	}


			// })

			res.render('curatas', {
				curatas: curatas
			})

		} else {
			console.log("Curatas not found.");
			res.redirect('/');
		}
	});
})

// Get the contents of a specific, single Curata of a user  (all the lists)
router.get('/:username/curatas/:curataId', ensureAuthenticated, function(req, res) {

	// get id for template
	let username = req.params.username;
	let curataId = req.params.curataId;

		// next step is setting up questions
	Curata.findById(curataId).populate('curataList').exec(function (err, curata) {
		
		if (err) {
			return console.log("Could not get curata: ", err);
		}

		if (!err && curata) {
			console.log("Received curata: ", curata);

			// entry.entryComponents.sort(function(a, b) {
			// 	return a.componentOrder - b.componentOrder;
			// });

			// for (var i = 0; i < entry.entryComponents.length; i++) {
			// 	let component = entry.entryComponents[i];

			// 	if (component.componentList.length) {
			// 		console.log('Yes, yes, got a list here. Let us... sort it, now, arrgh');
			// 		component.componentList.sort(function(a, b) {
			// 			return a.itemOrder - b.itemOrder;
			// 		});
			// 	}
			// }

			// let templateId = entry.linkedTemplateId;

			Curata.find({"owner": req.user._id}, function (err, curatas) {
				
				if (err) {
					return console.log("Could not get curatas: ", err);
				}

				Template.find({"curataId": curataId}, function(err, templates) {
					if (err) {
						 return console.log("Could not get templates", err);
					}

					res.render('curata', {
						curata: curata,
						templates: templates,
						curatas: curatas
					})

				})

			});

		} else {
			console.log("Curata not found.");
			res.redirect('/');
		}
	});
})


// Get all the content of a specific Curata list (all the entries of a list)
router.get('/:username/curatas/:curataId/lists/:listId', ensureAuthenticated, function(req, res) {

	// get id for template
	let username = req.params.username;
	let curataId = req.params.curataId;
	let listId = req.params.listId;

		// next step is setting up questions
	curataList.findById(listId).populate('entries').exec(function (err, entries) {
		
		if (err) {
			return console.log("Could not get entries: ", err);
		}

		if (!err && entries) {
			console.log("Received entry lists: ", entries);

			entries.entries.sort(function(a, b) {
				return a.dateCreated - b.dateCreated;
			});

			Curata.findById(curataId, function(err, curata) {
				if (err) {
					return console.log("Could not get Curata", err);
				}

				Curata.find({"owner": req.user._id}, function (err, curatas) {
					
					if (err) {
						return console.log("Could not get curatas: ", err);
					}

					res.render('entries', {
						curata: curata,
						entries: entries,
						curatas: curatas
					})
					
				});
			})


		} else {
			console.log("Entries not found.");
			res.redirect('/');
		}
	});
})

// Get all the entries of all lists of a Curata
router.get('/:username/curatas/:curataId/entries', ensureAuthenticated, function(req, res) {

	let username = req.params.username;
	let curataId = req.params.curataId;

	Curata.findById(curataId, function(err, curata) {
		if (err) {
			return console.log("Could not get curata: ", err);
		}

			// next step is setting up questions
		Entry.find({"curataId": curataId}, function (err, entries) {
			
			if (err) {
				return console.log("Could not get entries: ", err);
			}

			if (!err && entries && entries.length) {
				console.log("Received entry lists: ", entries);

				entries.sort(function(a, b) {
					return a.dateCreated - b.dateCreated;
				});

				let entry = entries[0];
				console.log('entry:', entry);
				let listId = entry.curataListId;
				console.log("My list id: ", listId);
				console.log('entry:', entry.curataListId);

				curataList.findById(listId, function(err, list) {
					if (err) {
						return console.log("Could not get curata: ", err);
					}

					console.log("My entries: ", entries);
					console.log("My curata: ", curata);
					console.log("My list: ", list);

					res.render('curataEntries', {
						entries: entries,
						curata: curata,
						list: list
					})
				});

			} else {
				console.log("Entries not found.");
				res.render('curataEntries', {
					curata: curata
				})
			}
		});
	})
})

// Get all the entries of all lists of a Curata
router.get('/:username/curatas/:curataId/templates', ensureAuthenticated, function(req, res) {

	// get id for template
	let username = req.params.username;
	let curataId = req.params.curataId;
	let listId = req.params.listId;


		// next step is setting up questions
	Template.find({"curataId": curataId}, function (err, templates) {
		
		if (err) {
			return console.log("Could not get templates: ", err);
		}

		if (!err && templates) {
			// templates.sort(function(a, b) {
			// 	return a.dateCreated - b.dateCreated;
			// });
			Curata.findById(curataId, function (err, curata) {
				
				if (err) {
					return console.log("Could not get curata: ", err);
				}

				if (!err && curata) {

					Curata.find({"owner": req.user._id}, function (err, curatas) {
						
						if (err) {
							return console.log("Could not get curatas: ", err);
						}

						res.render('curataTemplates', {
							curata: curata,
							templates: templates,
							curatas: curatas
						})
						
					});

				} else {
					console.log("Curata not found.");
					res.redirect('/');
				}
			});

		} else {
			console.log("Templates not found.");
			res.redirect('/');
		}
	});
})

router.post('/createNewTemplate', function(req, res) {

	let userId = req.user._id;
	let curataId = req.body.curataId;
	let templateTitle = req.body.templateTitle;

	let template = new Template({
		name: templateTitle,
		curataId: curataId,
		creator: userId
	});
	template.save(function(err) {
		if (err) {
			return console.log(err);
		}
	});

	Curata.findById(curataId, function(err, curata) {
		if (err) {
			return console.log("Could not find entry: ", err);
		}

		curata.templates.push(template._id);

		curata.save(function(err) {
			if (err) {
				return console.log(err);
			}

			res.json(template);

		});
	})
})

router.post('/createNewList', function(req, res) {

	let listName = req.body.listTitle;
	let listDescription = req.body.listDescription;
	let curataId = req.body.curataId;
	let templateId = req.body.templateId;
	let userId = req.user._id;

	let list = new curataList();
	list.creator = userId;
	list.owner = userId;
	list.listName = listName;
	list.listDescription = listDescription;
	list.curataId = curataId;
	list.defaultTemplate = templateId;
	list.admins.push(userId);
	list.save(function(err) {
		if (err) {
			return console.log(err);
		}
	});

	Template.findById(templateId, function(err, template) {
		if (err) {
			return console.log("Could not find template: ", err);
		}

		template.curataListId = list._id;
		template.save(function(err) {
			if (err) {
				return console.log(err);
			}

			Curata.findById(curataId, function(err, curata) {
				if (err) {
					return console.log("Could not find curata: ", err);
				}

				curata.curataList.push(list._id);

				curata.save(function(err) {
					if (err) {
						return console.log(err);
					}

					res.json(list);

				});
			})

		})
	})
})

router.post('/createNewTemplateWithComponent', function(req, res) {

	let componentOrder = req.body.componentOrder;
	let componentType = req.body.componentType;
	let curataId = req.body.curataId;
	let userId = req.user._id;
	let entryId = req.body.entryId;

	let component = new Component({
		componentOrder: componentOrder,
		componentType: componentType
	})

	let template = new Template({
		curataId: curataId,
		creator: userId
	})
	template.components.push(component);
	template.save(function(err) {
		if (err) {
			return console.log(err);
		}
	});

	if (entryId && entryId !== 'N/A') {
		let entryComp = new entryComponent({
			componentOrder: componentOrder,
			componentType: componentType,
			templateComponentId: component._id,
			entryId: entryId,
			curataId: curataId
		})

		entryComp.save(function(err){
			if (err) { 
				return console.log("Entry saving error: ", err);
			}

			Entry.findOneAndUpdate(
				{_id: entryId},
				{$push: {entryComponents: entryComp._id}},
				function(err, entry) {
					if (err) {
						return console.log(err);
					}

					entry.save(function(err) {
						if (err) {
							return console.log(err);
						} 
						console.log("Component id added to entry");

						Curata.findById(curataId, function(err, curata) {
							if (err) {
								return console.log("Could not find entry: ", err);
							}

							curata.templates.push(template._id);

							curata.save(function(err) {
								if (err) {
									return console.log(err);
								}

								data = {
									template: template,
									component: component,
								}

								res.json(data);
							});
						})
					})
				}
			)
		});
	} else {
		Curata.findById(curataId, function(err, curata) {
			if (err) {
				return console.log("Could not find entry: ", err);
			}

			curata.templates.push(template._id);

			curata.save(function(err) {
				if (err) {
					return console.log(err);
				}

				data = {
					template: template,
					component: component
				}

				res.json(data);
			});
		})
	}
})


router.get('/:username/curatas/:curataId/templates/newTemplateWithList', ensureAuthenticated, function(req, res) {

	let username = req.params.username;
	let curataId = req.params.curataId;


	res.render('template-list', {
		curataId: curataId
	})
})

// Get all the entries of all lists of a Curata
router.get('/:username/curatas/:curataId/collaborators', ensureAuthenticated, function(req, res) {

	let curataId = req.params.curataId;

	Curata.findById(curataId, function (err, curata) {
		
		if (err) {
			return console.log("Could not get curata: ", err);
		}

		if (!err && curata) {

			Curata.find({"owner": req.user._id}, function (err, curatas) {
				
				if (err) {
					return console.log("Could not get curatas: ", err);
				}

				res.render('curataCollaborators', {
					curata: curata,
					curatas: curatas
				})
				
			});

		} else {
			console.log("Curata not found.");
			res.redirect('/');
		}
	});
})

// Get all the entries of all lists of a Curata
router.get('/:username/curatas/:curataId/settings', ensureAuthenticated, function(req, res) {

	let curataId = req.params.curataId;

	Curata.findById(curataId, function (err, curata) {
		
		if (err) {
			return console.log("Could not get curata: ", err);
		}

		if (!err && curata) {

			Curata.find({"owner": req.user._id}, function (err, curatas) {
				
				if (err) {
					return console.log("Could not get curatas: ", err);
				}

				res.render('curataSettings', {
					curata: curata,
					curatas: curatas
				})
				
			});

		} else {
			console.log("Curata not found.");
			res.redirect('/');
		}
	});
})


// Get all the entries of all lists of a Curata
router.get('/:username/curatas/:curataId/files', ensureAuthenticated, function(req, res) {

	let curataId = req.params.curataId;

	Curata.findById(curataId, function (err, curata) {
		
		if (err) {
			return console.log("Could not get curata: ", err);
		}

		if (!err && curata) {

			curataImage.find({"curataId": curata._id}, function(err, images) {
				if (err) {
					return console.log("Couldn't get images: ", err);
				}

				console.log("Images", images);

				Curata.find({"owner": req.user._id}, function (err, curatas) {
					
					if (err) {
						return console.log("Could not get curatas: ", err);
					}

					res.render('curataFiles', {
						curata: curata,
						images: images,
						curatas: curatas
					})
					
				});
			})

		} else {
			console.log("Curata not found.");
			res.redirect('/');
		}
	});
})

// Get all the entries of all lists of a Curata
router.get('/:username/curatas/:curataId/appearance', ensureAuthenticated, function(req, res) {

	let curataId = req.params.curataId;

	Curata.findById(curataId, function (err, curata) {
		
		if (err) {
			return console.log("Could not get curata: ", err);
		}

		if (!err && curata) {

			Curata.find({"owner": req.user._id}, function (err, curatas) {
				
				if (err) {
					return console.log("Could not get curatas: ", err);
				}

				res.render('curataAppearance', {
					curata: curata,
					curatas: curatas
				})

			});

		} else {
			console.log("Curata not found.");
			res.redirect('/');
		}
	});
})





/*====== Access control  ======*/
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
  	console.log("Authentication successful.");
    return next();
  } else {
  	console.log("Authentication failed.");
    res.redirect(301, '/');
  }
}

module.exports = router;