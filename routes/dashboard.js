const express = require('express');
const bodyParser = require('body-parser');
// const multer  = require('multer');
// const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const path = require('path');
const assert = require('assert');
const mongoose = require('mongoose');
const passport = require('passport');
const { validationResult } = require('express-validator');
mongoose.Promise = Promise;

const config = require('../config/aws');

const router = express.Router();

let Curata = require('../models/curata');
let curataList = require('../models/curataList');
let Template = require('../models/template');
let Component = require('../models/component');
let Entry = require('../models/entry');
let entryCategory = require('../models/category');
let entryComponent = require('../models/entryComponent');
let listItem = require('../models/listItem');
let curataImage = require('../models/image');
let User = require('../models/user');
let ExpiredUser = require('../models/expiredAccount');
const validator = require('../controller/validator')

const dashboardController = require('../controller/dashboard');
const entryController = require('../controller/entry');

aws.config.update({
    accessKeyId: "AKIARKLMM5TMEHGOSNJC",
    secretAccessKey: "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",
    region: "us-east-1" 
});

const s3 = new aws.S3();
const S3_BUCKET = 'curata';

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

// const fileFilter = function(req, file, cb) {
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//         cb(null, true)
//     } else {
//         cb(null, false)
//     }
// }

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

// let multerStorage = multerS3({
// 		s3: s3,
// 		bucket: 'curata',
// 		acl: 'public-read',
// 		metadata: function(req, file, cb) {
// 			cb(null, {fieldName: file.fieldname});
// 		},
// 		key: function(req, file, cb) {
// 			console.log("File: ", file);
// 			// cb(null, file.originalname); // use Date.now() for unqiue file keys
// 			 cb(null, Date.now().toString());
// 			// cb(null, path.basename(file.originalname, path.extname(file.originalname)) + '-' + Date.now() + path.extname(file.originalname))
// 		}
// 	})


// Single image upload
// const upload = multer({
// 	storage: multerStorage,
// 	fileFilter: fileFilter
// 	// limits: {fileSize: 2000000},
// 	// limits: {fileSize: 1024 * 1024 * 5},
// 	// fileFilter: fileFilter,
// 	// fileFilter: function(req, file, cb) {
// 	// 	checkFileType(file, cb);
// 	// }
// }); // optionally attach .single('image') directly to this

// const singleUpload = upload.single('image');

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

router.post('/saveFileReference', validator.imageValidate, async function(req, res) {
	// when you have an uncaught exception your app will crash
	// so you need to know js errors that throw exception
	// most errors in js don't exception
	// but the few ones that do can be easily fixed, e.g variable not declared
	// most third party packages like mongoose handle errors perfectly and they don't usually
	// make your app crash
	// so anytime you're not sure about an error, just wrap it with a try catch block
	// so that it doesn't crash the whole app
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log('errors')
	    return res.status(422).json({ errors: errors.array()[0] });
	}
	let imageKey = req.body.fileName;
	let imageURL = req.body.fileURL;
	let imageName = req.body.imageName;
	let dateUpdated = req.body.dateUpdated;
	let entryId = req.body.entryId;
	let curataId = req.body.curataId;

	try {
		const curata = await Curata.findById(curataId);
		if (!curata) {
			return res.status(404).json({
				errors: "Space not found"
			});
		}

		let image = new curataImage();
		image.entryId = entryId;
		image.imageKey = imageKey;
		image.imageURL = imageURL;
		image.imageName = imageName;
		image.curataId = curataId;

		await image.save();
		curata.curataFiles.images.push(image._id);

		await curata.save();
		const entry = await Entry.findById(entryId);
		console.log('Entry: ', entry);
		entry.lastUpdated = dateUpdated;
		entry.entryImageKey = imageKey;
		entry.entryImageURL = imageURL;
		entry.entryImageName = imageName;
		await entry.save();
		res.json({
			imageKey: imageKey,
			imageURL: imageURL
		})
	} catch(error) {
		console.log(error);
		res.status(500).json({
			errors: "An unknown error occurred"
		});
	}

})

// Delete entry
router.delete('/curatas/:curataId/lists/:listId/entries/:entryId/deleteEntry', ensureAuthenticated, async function(req, res) {

	let entryId = req.body.entryId;
	let listId = req.body.listId;
	let curataId = req.params.curataID;

	try {
		const entry = await Entry.findByIdAndDelete(entryId);
		if (!entry) {
			return res.status(404).json({
				errors: "Entry not found"
			});
		}

		// delete all items where id == component id
		await entryComponent.deleteMany({ "entryId": entryId});
		console.log("Entry components successfully deleted.");

		let images = await curataImage.find({"entryId": entryId});
		const imageKeys = [];
		images.forEach(function(image) {
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

			imageKeys.push({
				Key: '' + image.imageKey
			})
		});
		if (imageKeys.length) {
			s3.deleteObjects({
			  Bucket: 'curata',
			  Delete: {
			  	Objects: imageKeys
			  }
			}, function (err, data) {
				if (err) {
					console.log("Error: ", err);
				} else {
					console.log("Successfully deleted image from AWS.");
				}
			})
		}
		

		await curataImage.deleteMany({ "entryId": entryId});
		console.log("Associated images successfully removed.");

		curataList.findOneAndUpdate(
			{ _id: listId },
			{ $pull: {entries: entry._id} },
			{ new: true },
			function(err, removed) {
				if (err) { console.log(err) }
			});

		res.json({
			message: "Entry delete successful.",
		});

	} catch(error) {
		console.log(error);
		res.status(500).json({
			errors: "An unknown error occurred"
		});
	}

});



router.get('/sign-s3', function(req, res) {
	// const fileName = req.body.fileName;
	// const fileName = req.body.fileName + '-' + Date.now().toString();
	// const fileName = "einsteinlessons.jpg";
	// const fileType = req.body.fileType;

  const fileName = req.query['file-name'];
  const fileType = req.query['file-type'];


	const s3Params = {
		Bucket: S3_BUCKET,
		Key: fileName,
		Expires: 60,
		ContentType: fileType,
		ACL: 'public-read'
	};

	s3.getSignedUrl('putObject', s3Params, function(err, data) {
		if (err) {
			console.log(err);
			return res.end();
		}

		const returnData = {
			signedRequest: data,
			url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
		};
		// res.write(returnData);
		// res.write(JSON.stringify(returnData));
		res.json({
			returnData: returnData,
			fileName: fileName
		});
		res.end();
	})
})


// router.get('/sign-s3', (req, res) => {
//   const s3 = new aws.S3();
//   const fileName = req.query['file-name'];
//   const fileType = req.query['file-type'];
//   const s3Params = {
//     Bucket: S3_BUCKET,
//     Key: fileName,
//     Expires: 60,
//     ContentType: fileType,
//     ACL: 'public-read'
//   };

//   s3.getSignedUrl('putObject', s3Params, (err, data) => {
//     if(err){
//       console.log(err);
//       return res.end();
//     }
//     const returnData = {
//       signedRequest: data,
//       url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
//     };
//     res.write(JSON.stringify(returnData));
//     res.end();
//   });
// });

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
				let dateUpdated = req.body.dateUpdated;
				console.log("My Curata: ", curataId);
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

							if (entryId) {
								Entry.findById(entryId,
									function(err, entry) {
										if (err) { 
											console.log(err) 
										} else {
											console.log('Entry: ', entry);
											entry.lastUpdated = dateUpdated;
											entry.save(function(err) {
												if (err) console.log(err);
											})
										}
									}
								)
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

				console.log("Image: ", image);

				curata.curataFiles.images.push(image._id);
				console.log("CurataFiles: ", curata.curataFiles);

				curata.save(function(err) {
					if (err) {
						return console.log(err);
					}
					res.status(200).end();
				});
			});
			
		})
	})
	// set up that if I delete through curata, then it also deletes the image elsewhere
})

router.post('/UpdateImageComponent', function(req, res) {
	
	let ComponentImageKey = req.body.ComponentImageKey; // image name
	let ComponentURL = req.body.ComponentURL // image url
	let componentId = req.body.ComponentId;
	let entryId = req.body.EntryId;
	let dateUpdated = req.body.dateUpdated;

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

						if (entryId) {
							Entry.findById(entryId,
								function(err, entry) {
									if (err) { 
										console.log(err) 
									} else {
										console.log('Entry: ', entry);
										entry.lastUpdated = dateUpdated;
										entry.save(function(err) {
											if (err) console.log(err);
										})
									}
								}
							)
						}

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
router.get('/curatas/curate', ensureAuthenticated, function(req, res) {
	res.render('curate');
})

router.get('/curatas/:curataId', ensureAuthenticated, dashboardController.canUserViewCurata, dashboardController.getCurata);

router.get('/curatas/:curataId/lists/:listId/entries/:id/editing', ensureAuthenticated, dashboardController.editCurata);

router.get('/curatas/:curataId/lists/:listId/entries/new', ensureAuthenticated, dashboardController.newCurata);


// ==== ENTRIES: Creating, updating, trashing, deleting. ==== //

router.post('/curatas/:curataId/lists/:listId/entries/newDraft', ensureAuthenticated, entryController.createNewDraft);

router.post('/curatas/:curataId/lists/:listId/entries/:entryId/updateEntry', ensureAuthenticated, entryController.updateEntry);

router.post('/UpdateEntryText', ensureAuthenticated, entryController.updateEntryText);



// Create new curata with list and template
router.post('/createNewCurata', ensureAuthenticated, function(req, res){

	let curata = new Curata();
	curata.creator.creator_id = req.user._id;
	curata.owner.owner_id = req.user._id;

	curata.curataName = req.body.curataName;
	curata.curataDescription = req.body.curataDescription;
	curata.curataAddress = req.body.curataAddress;
	curata.dateCreated = req.body.dateCreated;

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
	list.creator.creator_id = req.user._id;
	list.owner.owner_id = req.user._id;
	list.listName = req.body.curataName;
	list.listDescription = req.body.curataDescription;
	list.curataId = curata._id;

	// let template = new Template();
	// template.name = req.body.curataName; 
	// template.curataListId = list._id;
	// template.curataId = curata._id;
	// template.creator = req.user._id;
	// template.save(function(err) {
	// 	if (err) {
	// 		return console.log(err);
	// 	}
	// });

	// list.templates = template._id;
	// list.admins = req.user._id;
	// list.defaultTemplate = template._id;
	// list.templates.push(template._id);
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
	// curata.templates.push(template._id);
	curata.save(function(err){
		if(err) {
			return console.log(err);
		} else {
			curata_id = curata._id;
			list_id = list._id
			res.json({
				curata: curata,
				curataId: curata_id,
				// template: template,
				listId: list_id
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
									res.status(200).end();
								})
							}
						)
					}

	        	})
	    	}
	    );
	});
});


router.post('/UpdateTemplateTitle', function(req, res) {
	
	let TemplateTitle = req.body.TemplateTitle;
	let TemplateId = req.body.TemplateId;


    Template.update({"_id": TemplateId}, {"$set": {"name": TemplateTitle }}, function(err, template) {
			if (err) {
				return console.log("Did not work: ", err);
	        }

	        res.status(200).end();
    });

});

/* Non-template components begin */

router.post('/UpdateListItemOrder', function(req, res) {
	console.log("Ayy, here's the array! ", req.body.indexArray);
	let indexArray = JSON.parse(req.body.indexArray);
	console.log("Arrgh, a parsed array! ", indexArray);
	let componentId = req.body.componentId;
	let dateUpdated = req.body.dateUpdated;
	let entryId = req.body.entryId;;

	// could I make a change where I first query the Component and then do the forEach loop on indexArray and then do the updates and then do the save after the loop? This way I could avoid querying and saving so many times
	Entry.findById(entryId,
		function(err, entry) {
			if (err) { 
				console.log(err) 
			} else {
				console.log('Entry: ', entry);
				entry.lastUpdated = dateUpdated;
				entry.save(function(err) {
					if (err) console.log(err);

					// This is nested in here to avoid callbacks getting mixed up
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
						        			res.status(200).end();
						        		}
						        	})
						        }
					    	}
					    );
					});
				})
			}
		}
	)
});

router.post('/UpdateEntryLink', function(req, res) {
	
	let entryLink = req.body.entryLink;
	let entryId = req.body.entryId;
	let dateUpdated = req.body.dateUpdated;

	Entry.findById(entryId,
		function(err, entry) {
			if (err) { 
				console.log("Entry link update failed: ", err) 
			} else {
				console.log('Entry: ', entry);
				entry.entryLink = entryLink;
				entry.lastUpdated = dateUpdated;
				entry.save(function(err) {
					if (err) console.log("Entry save failed: ", err);
					res.status(200).end();
				})
			}
		}
	)
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
						res.status(200).end();
					}
				});
			}
		}
	)
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
						res.status(200).end();
					}
				});
			}
		}
	)
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
						res.status(200).end();
					}
				});
			}
		}
	)
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
						res.status(200).end();
					}
				});
			}
		}
	)
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
						res.status(200).end();
					}
				});
			}
		}
	)
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
						res.status(200).end();
					}
				});
			}
		}
	)
});



router.post('/updateEntryTitle', function(req, res) {
	
	let entryTitle = req.body.entryTitle;
	let entryId = req.body.entryId;
	let dateUpdated = req.body.dateUpdated;

	// access component by id
	Entry.findOneAndUpdate(
		{"_id": entryId},
		{$set: {"entryTitle": entryTitle, "lastUpdated":  dateUpdated}}).exec(function(err, entry) {
			if (err) {
				return console.log("Entry title update failed: ", err);
			} else {
				entry.save(function(err) {
					if (err) {
						return console.log("Entry save failed: ", err);
					} else {
						console.log("Entry title successfully updated: ", entry);
						res.status(200).end();
					}
				});
			}
		}
	)
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
										res.status(200).end();
									}
								});
							}
						}
					)
				}
        	});
		}
	)
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
	let dateUpdated = req.body.dateUpdated;

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

						if (dateUpdated && dateUpdated.length) {
							Entry.findOneAndUpdate(
								{"_id": entryId},
								{$set: {"lastUpdated":  dateUpdated}}).exec(function(err, entry) {
									if (err) {
										return console.log("Entry update failed: ", err);
									} else {
										entry.save(function(err) {
											if (err) {
												return console.log("Entry save failed: ", err);
											} else {
												console.log("Entry successfully updated: ", entry);
												res.status(200).end();
											}
										});
									}
								}
							)
						}
					}
				});
			}
		}
	)
});

router.post('/UpdateQuestionTitle', function(req, res) {
	
	let QuestionId = req.body.QuestionId;
	let componentId = req.body.ComponentId;
	let entryId = req.body.EntryId;
	let QuestionTitle = req.body.QuestionTitle;
	let dateUpdated = req.body.dateUpdated;


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

						Entry.findOneAndUpdate(
							{"_id": entryId},
							{$set: {"lastUpdated":  dateUpdated}}).exec(function(err, entry) {
								if (err) {
									return console.log("Entry update failed: ", err);
								} else {
									entry.save(function(err) {
										if (err) {
											return console.log("Entry save failed: ", err);
										} else {
											console.log("Entry successfully updated: ", entry);
											res.status(200).end();
										}
									});
								}
							}
						)
					}
				});
			}
		}
	)
});

router.post('/UpdateQuestionContent', function(req, res) {
	
	let QuestionId = req.body.QuestionId;
	let componentId = req.body.ComponentId;
	let entryId = req.body.entryId;
	let QuestionContent = req.body.QuestionContent;
	let dateUpdated = req.body.dateUpdated;


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

					Entry.findOneAndUpdate(
						{"_id": entryId},
						{$set: {"lastUpdated":  dateUpdated}}).exec(function(err, entry) {
							if (err) {
								return console.log("Entry update failed: ", err);
							} else {
								entry.save(function(err) {
									if (err) {
										return console.log("Entry save failed: ", err);
									} else {
										console.log("Entry successfully updated: ", entry);
										res.status(200).end();
									}
								});
							}
						}
					)
				});
			}
		}
	)
});

router.post('/UpdateListItem', function(req, res) {
	
	let listItemId = req.body.listItemId;
	let componentId = req.body.ComponentId;
	let entryId = req.body.EntryId;
	let listItem = req.body.listItem;
	let dateUpdated = req.body.dateUpdated;


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

						Entry.findOneAndUpdate(
							{"_id": entryId},
							{$set: {"lastUpdated":  dateUpdated}}).exec(function(err, entry) {
								if (err) {
									return console.log("Entry update failed: ", err);
								} else {
									entry.save(function(err) {
										if (err) {
											return console.log("Entry save failed: ", err);
										} else {
											console.log("Entry successfully updated: ", entry);
											res.status(200).end();
										}
									});
								}
							}
						)
					}
				});
			}
		}
	)
});


router.post('/UpdateComponentContent', function(req, res) {
	
	let ComponentContent = req.body.ComponentContent;
	let componentId = req.body.ComponentId;
	let entryId = req.body.entryId;
	let dateUpdated = req.body.dateUpdated;

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

						Entry.findOneAndUpdate(
							{"_id": entryId},
							{$set: {"lastUpdated":  dateUpdated}}).exec(function(err, entry) {
								if (err) {
									return console.log("Entry update failed: ", err);
								} else {
									entry.save(function(err) {
										if (err) {
											return console.log("Entry save failed: ", err);
										} else {
											console.log("Entry successfully updated: ", entry);
											res.status(200).end();
										}
									});
								}
							}
						)
					}
				});
			}
		}
	)
});


/* == Create new list item */

router.post('/UpdateChecklist', function(req, res) {
	let checkboxValue = req.body.checkboxValue;
	let componentId = req.body.componentId;
	let listItemId = req.body.listItemId;
	let dateUpdated = req.body.dateUpdated;
	let entryId = req.body.entryId;

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

						Entry.findOneAndUpdate(
							{"_id": entryId},
							{$set: {"lastUpdated":  dateUpdated}}).exec(function(err, entry) {
								if (err) {
									return console.log("Entry update failed: ", err);
								} else {
									entry.save(function(err) {
										if (err) {
											return console.log("Entry save failed: ", err);
										} else {
											console.log("Entry successfully updated: ", entry);
											res.status(200).end();
										}
									});
								}
							}
						)
					}
				});
			}
		}
	)

})

router.post('/CreateNewListItem', function(req, res) {

	let entryId = req.body.entryId;
	let componentId = req.body.componentId;
	let itemOrder = req.body.itemOrder;
	let componentType = req.body.componentType;
	let dateUpdated = req.body.dateUpdated;

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

						Entry.findOneAndUpdate(
							{"_id": entryId},
							{$set: {"lastUpdated":  dateUpdated}}).exec(function(err, entry) {
								if (err) {
									return console.log("Entry update failed: ", err);
								} else {
									entry.save(function(err) {
										if (err) {
											return console.log("Entry save failed: ", err);
										} else {
											console.log("Entry successfully updated: ", entry);
											// RETURN ITEM
											res.json(item);
										}
									});
								}
							}
						)
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
	let dateUpdated = req.body.dateUpdated;

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

						Entry.findOneAndUpdate(
							{"_id": entryId},
							{$set: {"lastUpdated":  dateUpdated}}).exec(function(err, entry) {
								if (err) {
									return console.log("Entry update failed: ", err);
								} else {
									entry.save(function(err) {
										if (err) {
											return console.log("Entry save failed: ", err);
										} else {
											console.log("Entry successfully updated: ", entry);
											res.json(item);
										}
									});
								}
							}
						)
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
			res.json({
				entry: entry
			});
		});

	})
})

router.post('/PublishEntry', function(req, res) {

	let entryId = req.body.entryId;
	let userId = req.user._id;

	Entry.findById(entryId, function(err, entry) {
		if (err) {
			return console.log("Could not find entry: ", err);
		}

		if (entry.entryState == "Draft") {
			entry.entryState = "Published";
		}

		entry.save(function(err){
			if (err) { 
				return console.log("Entry save failed: ", err);
			}
			let entryId = entry._id;
			let curataId = entry.curataId;
			let listId = entry.curataListId;
			res.json({
				entry: entry,
				redirectTo: '/browse/users/' + userId + '/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId
			});
		});
	})
})

router.post('/TrashEntry', function(req, res) {

	let entryId = req.body.entryId;
	let userId = req.user._id;

	Entry.findById(entryId, function(err, entry) {
		if (err) {
			return console.log("Could not find entry: ", err);
		}

		entry.entryState = "Trashed";

		entry.save(function(err){
			if (err) { 
				return console.log("Entry save failed: ", err);
			}

			let entryId = entry._id;
			let curataId = entry.curataId;
			let listId = entry.curataListId;
			res.json({
				entry: entry,
				redirectTo: '/dashboard/curatas/' + curataId
			});
		});

	})
})

router.post('/DraftEntry', function(req, res) {

	let entryId = req.body.entryId;
	let userId = req.user._id;

	Entry.findById(entryId, function(err, entry) {
		if (err) {
			return console.log("Could not find entry: ", err);
		}

		entry.entryState = "Draft";

		entry.save(function(err){
			if (err) { 
				return console.log("Entry save failed: ", err);
			}

			let entryId = entry._id;
			let curataId = entry.curataId;
			let listId = entry.curataListId;
			res.json({
				entry: entry
			});
		});
	})
})

router.post('/UntrashEntry', function(req, res) {

	let entryId = req.body.entryId;
	let userId = req.user._id;

	Entry.findById(entryId, function(err, entry) {
		if (err) {
			return console.log("Could not find entry: ", err);
		}

		entry.entryState = "Draft";

		entry.save(function(err){
			if (err) { 
				return console.log("Entry save failed: ", err);
			}

			let entryId = entry._id;
			let curataId = entry.curataId;
			let listId = entry.curataListId;
			res.json({
				entry: entry
			});
		});
	})
})

router.post('/curatas/:curataId/lists/:listId/newDraft', ensureAuthenticated, function(req, res) {

	let userId = req.user._id;
	let creationTime = req.body.creationTime;
	let curataId = req.body.curataId;
	let listId = req.body.listId;

	let entryTitle = req.body.entryTitle;
	let entryDescription = req.body.entryDescription;
	let entryLink = req.body.entryLink;

	// next step is setting up questions

	let entry = new Entry();
	entry.entryState = "Draft";
	// entry.linkedTemplateId = template._id;
	entry.curataListId = listId;
	entry.curataId = curataId;
	entry.dateCreated = creationTime;
	entry.creator.creator_id = userId;
	entry.owner.owner_id = userId;
	entry.contributors.push(userId);
	entry.entryTitle = entryTitle;
	entry.entryDescription = entryDescription;
	entry.entryLink = entryLink;

	if (req.body.imageKey && req.body.imageURL) {
		let imageKey = req.body.imageKey;
		let imageURL = req.body.imageURL;
		entry.entryImageKey = imageKey;
		entry.entryImageURL = imageURL;
	}

	entry.save(function(err){
		if (err) { 
			return console.log("Entry saving error: ", err);
		}

		curataList.findById(listId, function(err, cList) {
			cList.entries.push(entry._id);

			cList.save(function(err) {
				if (err) {
					return console.log("curataList save failed: ", err);
				}

				let entryId = entry._id;
				let userId = req.user._id;
				res.json({
					entry: entry,
					entryId: entryId
				});
			});
		});
	});
})

router.post('/curatas/:curataId/lists/:listId/entries/:entryId/publish', ensureAuthenticated, function(req, res) {

	let entryId = req.params.entryId;

	Entry.findById(entryId, function(err, entry) {
		if (err) {
			return console.log("Could not find entry: ", err);
		}

		if (entry.entryState == "Draft") {
			entry.entryState = "Published";
		}

		entry.save(function(err){
			if (err) { 
				return console.log("Entry save failed: ", err);
			}
			
			res.json({
				entry: entry
			});
		});
	})
})

router.post('/curatas/:curataId/lists/:listId/newEntry', ensureAuthenticated, function(req, res) {

	let userId = req.user._id;
	let creationTime = req.body.creationTime;
	let curataId = req.body.curataId;
	let listId = req.body.listId;

	let entryTitle = req.body.entryTitle;
	let entryDescription = req.body.entryDescription;
	let entryLink = req.body.entryLink;

	// next step is setting up questions

	let entry = new Entry();
	entry.entryState = "Published";
	// entry.linkedTemplateId = template._id;
	entry.curataListId = listId;
	entry.curataId = curataId;
	entry.dateCreated = creationTime;
	entry.creator.creator_id = userId;
	entry.owner.owner_id = userId;
	entry.contributors.push(userId);
	entry.entryTitle = entryTitle;
	entry.entryDescription = entryDescription;
	entry.entryLink = entryLink;

	if (req.body.imageKey && req.body.imageURL) {
		let imageKey = req.body.imageKey;
		let imageURL = req.body.imageURL;
		entry.entryImageKey = imageKey;
		entry.entryImageURL = imageURL;
	}

	entry.save(function(err){
		if (err) { 
			return console.log("Entry saving error: ", err);
		}

		curataList.findById(listId, function(err, cList) {
			cList.entries.push(entry._id);

			cList.save(function(err) {
				if (err) {
					return console.log("curataList save failed: ", err);
				}

				let entryId = entry._id;
				let userId = req.user._id;
				res.json({
					entry: entry,
					entryId: entryId
				});
			});
		});
	});
	
})

router.post('/curatas/:curataId/lists/:listId/createNewEntry', ensureAuthenticated, async function(req, res) {

	let userId = req.user._id;
	let creationTime = req.body.creationTime;
	let curataId = req.params.curataId;
	let listId = req.params.listId;

	// next step is setting up questions
	try {
		let entry = new Entry();
		entry.entryState = "Draft";
		// entry.linkedTemplateId = template._id;
		entry.curataListId = listId;
		entry.curataId = curataId;
		entry.dateCreated = creationTime;
		entry.creator.creator_id = userId;
		entry.owner.owner_id = userId;
		entry.contributors.push(userId);

		await entry.save();
		const list = await curataList.findById(listId);
		if (!list) {
			return res.status(404).json({
				message: "List not found."
			});
		}
		list.entries.push(entry._id);
		await list.save();

		let entryId = entry._id;
		res.json({
			entry: entry,
			redirectTo: '/dashboard/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId + '/editing'
		});
	} catch(err) {
		console.log('error', err);
		res.status(500).json({
			message: "Something went wrong."
		});
	}
	
})

router.post('/curataLists/CreateNewEntry', ensureAuthenticated, function(req, res) {

	let userId = req.user._id;
	let creationTime = req.body.creationTime;
	let curataId = req.body.curataId;
	let listId = req.body.listId;

	// next step is setting up questions

	let entry = new Entry();
	entry.entryState = "Draft";
	// entry.linkedTemplateId = template._id;
	entry.curataListId = listId;
	entry.curataId = curataId;
	entry.dateCreated = creationTime;
	entry.creator.creator_id = userId;
	entry.owner.owner_id = userId;
	entry.contributors.push(userId);

	entry.save(function(err){
		if (err) { 
			return console.log("Entry saving error: ", err);
		}

		curataList.findById(listId, function(err, cList) {
			cList.entries.push(entry._id);

			cList.save(function(err) {
				if (err) {
					return console.log("curataList save failed: ", err);
				}

				let entryId = entry._id;
				let userId = req.user._id;
				res.json({
					entry: entry,
					redirectTo: '/dashboard/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId + '/editing'
				});
			});
		});
	});

});

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

				// Recursion to replace forEach()
				var archiveComponents = function(x) {
					if (x < data.length) {
						let tempEntry = data[x];

						let entryComponentId;

						for (var i=0; i < tempEntry.entryComponents.length; i++) {
							let oneComponent = tempEntry.entryComponents[i];
							if (oneComponent.templateComponentId == templateComponentId) {
								console.log("Correct one: ", oneComponent);
								entryComponentId = oneComponent._id;
								break;
							}
						}

						tempEntry.archivedComponents.push(entryComponentId);
						tempEntry.entryComponents.pull(entryComponentId);
						tempEntry.save(function(err) {
							if (err) {
								return console.log("Failed to archive component: ", err);
							}
							console.log("Successfully archived component.");
							archiveComponents(x+1);
						})

					} else {
						res.status(200).end();
					}
				}
				archiveComponents(0);
			})
		});
	})
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

				// Recursion to replace forEach()
				var unarchiveComponents = function(x) {
					if (x < data.length) {
						let tempEntry = data[x];

						let entryComponentId;

						for (var i=0; i < tempEntry.archivedComponents.length; i++) {
							let oneComponent = tempEntry.archivedComponents[i];
							if (oneComponent.templateComponentId == templateComponentId) {
								console.log("Correct one: ", oneComponent);
								entryComponentId = oneComponent._id;
								break;
							}
						}

						tempEntry.archivedComponents.pull(entryComponentId);
						tempEntry.entryComponents.push(entryComponentId);
						tempEntry.save(function(err) {
							if (err) {
								return console.log("Failed to unarchive component: ", err);
							}
							console.log("Successfully unarchived component.");
							unarchiveComponents(x+1);
						})

					} else {
						res.json({
							templateComponent: templateComponent
						});
					}
				}
				unarchiveComponents(0);
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

				// 1. Find all entries where linkedTemplateId == templateId
					// 1.1 Per entry, go through each entry's components
						// 1.1.1 Check / match each component's templateComponentId
							// 1.1.1.1 If the component's templateComponentId == templateComponentId declared before, as there is only one possible match, then store that component's id in a variable
							// 1.1.1.2 Pull

				// Recursion to replace forEach()
				var deleteComponents = function(x) {
					if (x < data.length) {
						let tempEntry = data[x];

						let entryComponentId;

						for (var i=0; i < tempEntry.entryComponents.length; i++) {
							let oneComponent = tempEntry.entryComponents[i];
							if (oneComponent.templateComponentId == templateComponentId) {
								console.log("Correct one: ", oneComponent);
								entryComponentId = oneComponent._id;
								break;
							}
						}

						tempEntry.archivedComponents.pull(entryComponentId);

						tempEntry.save(function(err) {
							if (err) {
								return console.log("Failed to remove component: ", err);
							}
							console.log("Successfully removed component.");
							deleteComponents(x+1);
						})

					} else {
						entryComponent.deleteMany({templateComponentId: templateComponentId}).exec(function(err, results) {

							if (err) {
								return console.log(err);
							} else {
								console.log("Related entryComponents successfully removed.", results);
								res.status(200).send(results);
							}
						});
					}
				}
				deleteComponents(0);
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
router.delete('/permaDeleteSpace', ensureAuthenticated, function(req, res) {

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

	let listItemId = req.body.listItemId;
	let componentId = req.body.componentId;
	let dateUpdated = req.body.dateUpdated;
	let entryId = req.body.entryId;

	entryComponent.findOneAndUpdate(
		{ _id: componentId },
		{ $pull: { componentList: { _id: listItemId} } },
		{ new: true },
		function(err, removed) {
			if (err) { console.log(err) }

			Entry.findOneAndUpdate(
				{"_id": entryId},
				{$set: {"lastUpdated":  dateUpdated}}).exec(function(err, entry) {
					if (err) {
						return console.log("Entry update failed: ", err);
					} else {
						entry.save(function(err) {
							if (err) {
								return console.log("Entry save failed: ", err);
							} else {
								console.log("Entry successfully updated: ", entry);

								res.status(200).send(removed);
							}
						});
					}
				}
			)
		}
	)

});

// Delete question from component
router.delete('/DeleteQuestion', ensureAuthenticated, function(req, res) {

	let QuestionId = req.body.QuestionId;
	let componentId = req.body.componentId;
	let dateUpdated = req.body.dateUpdated;
	let entryId = req.body.entryId;

	entryComponent.findOneAndUpdate(
		{ _id: componentId },
		{ $pull: { componentList: { _id: QuestionId} } },
		{ new: true },
		function(err, removed) {
			if (err) { console.log(err) }

			Entry.findOneAndUpdate(
				{"_id": entryId},
				{$set: {"lastUpdated":  dateUpdated}}).exec(function(err, entry) {
					if (err) {
						return console.log("Entry update failed: ", err);
					} else {
						entry.save(function(err) {
							if (err) {
								return console.log("Entry save failed: ", err);
							} else {
								console.log("Entry successfully updated: ", entry);

								res.status(200).send(removed);
							}
						});
					}
				}
			)
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

				curataImage.deleteOne({ _id: image._id }, function (err) {
				  if (err) return console.log(err);
				  console.log("Successfully removed image.");

					s3.deleteObject({
					  Bucket: 'curata',
					  Key: '' + imageKey
					}, function (err, data) {
						if (err) {
							console.log("Error: ", err);
						}
						console.log("Success.");
						res.status(200).end();
					})
				});
			}
		);
	});

});

router.post('/saveListItemLink', function(req, res) {
	
	let listItemId = req.body.listItemId;
	let componentId = req.body.componentId;
	let listItemLink = req.body.listItemLink;
	let dateUpdated = req.body.dateUpdated;
	let entryId = req.body.entryId;

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

						Entry.findOneAndUpdate(
							{"_id": entryId},
							{$set: {"lastUpdated":  dateUpdated}}).exec(function(err, entry) {
								if (err) {
									return console.log("Entry update failed: ", err);
								} else {
									entry.save(function(err) {
										if (err) {
											return console.log("Entry save failed: ", err);
										} else {
											console.log("Entry successfully updated: ", entry);
											res.status(200).end();
										}
									});
								}
							}
						)
					}
				});
			}
		}
	)
});

router.post('/removeListItemLink', function(req, res) {
	
	let listItemId = req.body.listItemId;
	let componentId = req.body.componentId;
	let dateUpdated = req.body.dateUpdated;
	let entryId = req.body.entryId;

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

						Entry.findOneAndUpdate(
							{"_id": entryId},
							{$set: {"lastUpdated":  dateUpdated}}).exec(function(err, entry) {
								if (err) {
									return console.log("Entry update failed: ", err);
								} else {
									entry.save(function(err) {
										if (err) {
											return console.log("Entry save failed: ", err);
										} else {
											console.log("Entry successfully updated: ", entry);
											res.status(200).end();
										}
									});
								}
							}
						)
					}
				});
			}
		}
	)
});


// Delete image
router.delete('/DeleteImage', function(req, res) {

	let imageKey = req.body.imageKey;
	let dateUpdated = req.body.dateUpdated;
	let componentId;
	let entryId = req.body.entryId;
	let isMainImage;

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
	} 

	if (req.body.isMainImage) {
		isMainImage = req.body.isMainImage;
	}


	if (entryId && isMainImage !== "true") {
		Entry.findById(entryId,
			function(err, entry) {
				if (err) { 
					console.log(err) 
				} else {
					console.log('Entry: ', entry);
					entry.lastUpdated = dateUpdated;
					entry.save(function(err) {
						if (err) console.log(err);
					})
				}
			}
		)
	}

	if (isMainImage && isMainImage == "true" && entryId) {
		Entry.findById(entryId,
			function(err, entry) {
				if (err) { 
					console.log(err) 
				} else {
					console.log('Entry: ', entry);
					entry.entryImageKey = undefined;
					entry.entryImageURL = undefined;
					entry.lastUpdated = dateUpdated;
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

				s3.deleteObject({
				  Bucket: 'curata',
				  Key: '' + imageKey
				}, function (err, data) {
					if (err) {
						console.log("Error: ", err);
					}

					curataImage.deleteOne({ _id: image._id }, function (err) {
					  if (err) return console.log(err);
					  console.log("Successfully removed image.");
					  res.status(200).end();
					});

				})
			}
		);
	});
});

// Delete image title
router.delete('/DeleteImageTitle', function(req, res) {

	let componentId = req.body.componentId;
	let dateUpdated = req.body.dateUpdated;
	let entryId = req.body.entryId;

	entryComponent.findById(componentId,
		function(err, component) {
			if (err) { 
				console.log(err) 
			} else {
				console.log('Component: ', component);
				component.componentTitle = undefined;
				component.save(function(err) {
					if (err) console.log(err);

					if (entryId) {
						Entry.findById(entryId,
							function(err, entry) {
								if (err) { 
									console.log(err) 
								} else {
									console.log('Entry: ', entry);
									entry.lastUpdated = dateUpdated;
									entry.save(function(err) {
										if (err) console.log(err);
										res.status(200).end();
									})
								}
							}
						)
					}
				})
			}
		}
	)
});

// Delete image title
router.delete('/DeleteImageDescription', function(req, res) {

	let componentId = req.body.componentId;
	let dateUpdated = req.body.dateUpdated;
	let entryId = req.body.entryId;

	entryComponent.findById(componentId,
		function(err, component) {
			if (err) { 
				console.log(err) 
			} else {
				console.log('Component: ', component);
				component.componentContent = undefined;
				component.save(function(err) {
					if (err) console.log(err);

					if (entryId) {
						Entry.findById(entryId,
							function(err, entry) {
								if (err) { 
									console.log(err) 
								} else {
									console.log('Entry: ', entry);
									entry.lastUpdated = dateUpdated;
									entry.save(function(err) {
										if (err) console.log(err);
										res.status(200).end();
									})
								}
							}
						)
					}

				})
			}
		}
	)

});

// Delete entry link
router.delete('/RemoveEntryLink', function(req, res) {

	let entryId = req.body.entryId;
	let dateUpdated = req.body.dateUpdated;

	Entry.findById(entryId,
		function(err, entry) {
			if (err) { 
				console.log(err) 
			} else {
				console.log('Entry: ', entry);
				entry.entryLink = undefined;
				entry.lastUpdated = dateUpdated;
				entry.save(function(err) {
					if (err) console.log(err);
					res.status(200).end();
				})
			}
		}
	)
});

// Delete entry
router.delete('/DeleteEntry', function(req, res) {

	let entryId = req.body.entryId;

	if (entryId && entryId.length) {
		console.log("Deleting entry, entry id exists: ", entryId);
	} else {
		return console.log("Deleting entry, entry id not found!!!!");
	}

	Entry.findByIdAndDelete(entryId, function(err, entry) {
		if (err) {
			console.log("Entry delete failed.");
		}

		if (entry.curataId && entry.curataId.length) {
			console.log("Deleting entry, curata id exists: ", entry.curataId);
		} else {
			return console.log("Deleting entry, curata id not found!!!!");
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

router.get('/curatas/:curataId/lists/:listId/entries/:entryId/template/:templateId', ensureAuthenticated, function(req, res) {

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

				res.render('entry__draft', {
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

router.get('/curatas/:curataId/lists/:listId/entries/:entryId', function(req, res) {

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

				res.render('entry__published', {
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


// If Curata has no owner anything, delete it
// Console log curata owner fields
// If owner field exists and is equivalent to id-s
// Populate all Curatas with appropriate field

// Find all Curatas
// Go through each Curata
// Get Curata.owner field
// Get user with that id
// Get user's values
// Fill that Curata's fields


// DATABASE DISPLAY FUNCTION
// Curata.find({}, function(err, curatas) {
// 	curatas.forEach(function(curata) {
// 		// console.log("Admins field: ", curata.admins);
// 		console.log("Owner of list:", curata.owner);
// 		// console.log("Creator of list:", list.creator);
// 		// console.log("List curata-id: ", list.curataId);
// 	})
// })

// if list has no curata-id, delete it and its entries... deleting entries is quite a hazard, but I'll just use the code I've already implemented

// DATABASE POPULATING FUNCTION
	// How to make sure only certain people can access the database in this fashion so as to run a script to populate it?
// Curata.find({}, function(err, curatas) {

// 		var fsm = function(i) {
// 			if (i < curatas.length) {
// 				let userId;
// 				let firstName;
// 				let lastName;
// 				console.log("Updating one list.");

// 				console.log("Current Curata: ", curatas[i]);
// 				console.log("Admins: ", curatas[i].admins[0]);
				
// 				userId = curatas[i].admins[0];
// 				console.log("userId: ", userId);

// 				User.findById(userId, function(err, user) {
// 					if (err) {
// 						return console.log("Could not get user.", err); 
// 					}

// 					console.log("user: ", user);
// 					firstName = user.firstname;
// 					lastName = user.lastname;

// 					curatas[i].owner = undefined;
// 					curatas[i].creator = undefined;

// 					curatas[i].owner.firstName = undefined;
// 					curatas[i].owner.lastName =  undefined;
// 					curatas[i].owner.owner_id = undefined;


// 					curatas[i].creator.firstName = undefined;
// 					curatas[i].creator.lastName =  undefined;
// 					curatas[i].creator.creator_id = undefined;

// 					curatas[i].owner.firstName = firstName;
// 					curatas[i].owner.lastName =  lastName;
// 					curatas[i].owner.owner_id = user._id;

// 					curatas[i].creator.firstName = firstName;
// 					curatas[i].creator.lastName =  lastName;
// 					curatas[i].creator.creator_id = user._id;

// 					curatas[i].save(function(err) {
// 						if (err) {
// 							return console.log("Curata save failed: ", err);
// 						} else {
// 							console.log("Curata successfully updated: ", curatas[i]);
// 							fsm(i+1);
// 						}
// 					});
// 				})

// 			} else {
// 				console.log("Done with all curatas.");
// 			}
// 		}
// 		// fsm(0);
// })

// Curata.find({}, function(err, curatas) {
// 	console.log("allllll curatas: ", curatas);
// 	curatas.forEach(function(curata) {
// 		console.log("currrata: ", curata)
// 		let newDate = new Date();
// 		console.log("dateee: ", newDate);

// 		User.findById(curata.owner, function(err, user) {

// 			let name = user.firstname + ' ' + user.lastname;
// 			console.log("Full name: ", name);
// 			Curata.findOneAndUpdate(
// 				{"_id": curata._id},
// 				// update
// 				{$set: {"ownerName": name}},
// 				{new: true},
// 				function(err, cura) {
// 					if (err) {
// 						return console.log("Cura update failed: ", err);
// 					} else {
// 						cura.save(function(err) {
// 							if (err) {
// 								return console.log("Cura save failed: ", err);
// 							} else {
// 								console.log("Cura successfully updated: ", cura);
// 							}
// 						});
// 					}
// 				}
// 			)
// 		})
// 	})
// })

// Get all Curatas by user (later by joint users)
router.get('/curatas', ensureAuthenticated, function(req, res) {

	// Ensure only owner has access, else render error message
	/*if (req.user._id !== req.params.userId) {

		res.render('curatas', {
			error: "error"
		})
	}*/

	let userId =  req.user._id;

		// find any Curata where user is either an owner, admin or a collaborator (and later other levels of administration -- these are essentially all of the user's curatas, to which the user will later have various degrees of control)
	Curata.find({$or:[{"owner.owner_id": userId}, {"admins": userId}, {"collaborators": userId}]}).populate('collaborators').exec(function (err, curatas) {
		
		if (err) {
			return console.log("Could not get curatas: ", err);
		}

		if (!err && curatas) {
			console.log("Received all user's curatas: ", curatas);

			curatas.sort(function(a, b) {
				return a.dateCreated - b.dateCreated;
			});

			res.render('curatas', {
				curatas: curatas,
			})

		} else {
			console.log("Curatas not found.");
			res.redirect('/');
		}
	});
})

// Get the contents of a specific, single Curata of a user  (all the lists)
router.get('/curatas/:curataId/entries', ensureAuthenticated, function(req, res) {

	// get id for template
	let curataId = req.params.curataId;

		// next step is setting up questions
	Curata.findById(curataId).populate({
		path: 'curataList',
		populate: { path: 'entries'}
	}).exec(function (err, curata) {
		
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

			let allCount = 0;
			let publishedCount = 0;
			let draftCount = 0;
			let trashedCount = 0;
			let listCount = 0;

			curata.curataList.forEach(function(obj) {
				listCount++;
				obj.entries.forEach(function(entry) {
					allCount++;
					if (entry.entryState == "Published") {
						publishedCount++
					}
					if (entry.entryState == "Draft") {
						draftCount++;
					}
					if (entry.entryState == "Trashed") {
						trashedCount++
					}
				})
			})

			Curata.find({"owner.owner_id": req.user._id}, function (err, curatas) {
				
				if (err) {
					return console.log("Could not get curatas: ", err);
				}

				Template.find({"curataId": curataId}, function(err, templates) {
					if (err) {
						 return console.log("Could not get templates", err);
					}

					res.render('dashboard__entries', {
						curata: curata,
						templates: templates,
						curatas: curatas,
						allCount: allCount,
						publishedCount: publishedCount,
						draftCount: draftCount,
						trashedCount: trashedCount,
						listCount: listCount
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
router.get('/curatas/:curataId/lists/:listId', ensureAuthenticated, function(req, res) {

	// get id for template
	let curataId = req.params.curataId;
	let listId = req.params.listId;

		// next step is setting up questions
	curataList.findById(listId).populate('entries').exec(function (err, list) {
		
		if (err) {
			return console.log("Could not get list: ", err);
		}

		if (!err && list) {
			console.log("Received entry lists: ", list);

			list.entries.sort(function(a, b) {
				return a.dateCreated - b.dateCreated;
			});

			let allCount = 0;
			let publishedCount = 0;
			let draftCount = 0;
			let trashedCount = 0;

			list.entries.forEach(function(entry) {
				allCount++;
				if (entry.entryState == "Published") {
					publishedCount++
				}
				if (entry.entryState == "Draft") {
					draftCount++;
				}
				if (entry.entryState == "Trashed") {
					trashedCount++
				}
			})

			Curata.findById(curataId, function(err, curata) {
				if (err) {
					return console.log("Could not get Curata", err);
				}

				Curata.find({"owner.owner_id": req.user._id}, function (err, curatas) {
					
					if (err) {
						return console.log("Could not get curatas: ", err);
					}
					console.log("This is list: ", list);
					console.log("This is entries: ", list.entries);

					res.render('dashboard__list', {
						curata: curata,
						list: list,
						curatas: curatas,
						allCount: allCount,
						publishedCount: publishedCount,
						draftCount: draftCount,
						trashedCount: trashedCount
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
router.get('/curatas/:curataId/templates', ensureAuthenticated, function(req, res) {

	// get id for template
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

					Curata.find({"owner.owner_id": req.user._id}, function (err, curatas) {
						
						if (err) {
							return console.log("Could not get curatas: ", err);
						}

						res.render('dashboard__templates', {
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
	let template;

	if (templateTitle) {
		template = new Template({
			name: templateTitle,
			curataId: curataId,
			creator: userId
		});
	} else {
		template = new Template({
			curataId: curataId,
			creator: userId
		});	
	}

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

router.post('/updateNewList', ensureAuthenticated, function(req, res) {
	let listName = req.body.listTitle;
	let listDescription = req.body.listDescription;

	let listId = req.body.listId;

	if (listName) {
		curataList.findOneAndUpdate(
			{_id: listId},
			{$set: {listName: listName}},
			{new: true},
			function(err, list) {
				if (err) {
					return console.log(err);
				}
				list.save(function(err) {
					if (err) {
						return console.log(err);
					}
					console.log("List name updated: ", list.listName);
					res.status(200).end();
				})
			}
		)
	} 

	if (listDescription) {
		curataList.findOneAndUpdate(
			{_id: listId},
			{$set: {listDescription: listDescription}},
			{new: true},
			function(err, list) {
				if (err) {
					return console.log(err);
				}
				list.save(function(err) {
					if (err) {
						return console.log(err);
					}
					console.log("List description updated: ", list.listDescription);
					res.status(200).end();
				})
			}
		)	
	}
})

router.post('/curatas/:curataId/lists/:listId/createCategory', ensureAuthenticated, function(req, res) {

	let cat = req.body.category;
	cat = cat[0].toUpperCase() + cat.slice(1);
	cat = cat.replace(/^\s+|\s+$/g, "");

	let category = new entryCategory();
	category.entryCategoryName = cat;
	category.listId = req.body.listId;
	category.curataId = req.body.curataId;
	category.dateCreated = req.body.dateCreated;
	category.creator.creator_id = req.user._id;
	category.admins.push(req.user._id);

	category.save(function(err) {
		if (err) {
			return console.log(err);
		}

		Curata.findById(req.body.curataId, function(err, curata) {
			if (err) {
				return console.log("Could not find curata: ", err);
			}

			let categoryId = category._id;

			curata.categories.push(categoryId);

			curata.save(function(err) {
				if (err) {
					return console.log(err);
				}

				res.json({
					category: category,
					categoryId: categoryId
				});
			});
		})
	});
});

router.post('/createNewList', ensureAuthenticated, function(req, res) {

	let listName = req.body.listTitle;
	let listDescription = req.body.listDescription;
	let curataId = req.body.curataId;
	let templateId = req.body.templateId;
	let userId = req.user._id;

	let list = new curataList();
	list.creator.creator_id = userId;
	list.owner.owner_id = userId;
	if (listName) {
		list.listName = listName;
	}
	if (listDescription) {
		list.listDescription = listDescription;
	}
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


router.get('/curatas/:curataId/templates/newTemplateWithList', ensureAuthenticated, function(req, res) {

	let curataId = req.params.curataId;


	res.render('template-list', {
		curataId: curataId
	})
})

// Get all the entries of all lists of a Curata
router.get('/curatas/:curataId/collaborators', ensureAuthenticated, function(req, res) {

	let curataId = req.params.curataId;

	Curata.findById(curataId, function (err, curata) {
		
		if (err) {
			return console.log("Could not get curata: ", err);
		}

		if (!err && curata) {

			Curata.find({"owner.owner_id": req.user._id}, function (err, curatas) {
				
				if (err) {
					return console.log("Could not get curatas: ", err);
				}

				res.render('dashboard__collaborators', {
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

router.get('/curatas/:curataId/settings', ensureAuthenticated, function(req, res) {

	let curataId = req.params.curataId;

	Curata.findById(curataId, function (err, curata) {
		
		if (err) {
			return console.log("Could not get curata: ", err);
		}

		if (!err && curata) {

			Curata.find({"owner.owner_id": req.user._id}, function (err, curatas) {
				
				if (err) {
					return console.log("Could not get curatas: ", err);
				}

				res.render('dashboard__settings', {
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

router.get('/settings', ensureAuthenticated, function(req, res) {

	res.render('user__accountSettings');

})


// Get all the entries of all lists of a Curata
router.get('/curatas/:curataId/files', ensureAuthenticated, function(req, res) {

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

				Curata.find({"owner.owner_id": req.user._id}, function (err, curatas) {
					
					if (err) {
						return console.log("Could not get curatas: ", err);
					}

					res.render('dashboard__files', {
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
router.get('/curatas/:curataId/appearance', ensureAuthenticated, function(req, res) {

	let curataId = req.params.curataId;

	Curata.findById(curataId, function (err, curata) {
		
		if (err) {
			return console.log("Could not get curata: ", err);
		}

		if (!err && curata) {

			Curata.find({"owner.owner_id": req.user._id}, function (err, curatas) {
				
				if (err) {
					return console.log("Could not get curatas: ", err);
				}

				res.render('dashboard__appearance', {
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


router.get('/curatas/:curataId/lists/:listId/entries/:entryId/template/:templateId', ensureAuthenticated, function(req, res) {

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

router.get('/curatas/:curataId/lists/newListFromTemplate/:templateId', ensureAuthenticated, function(req, res) {

	let curataId = req.params.curataId;
	let templateId = req.params.templateId;
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

		res.render('new_list_from_template', {
			template: template,
			componentTypes: componentTypes,
			curataId: curataId
		})
	})
})


/*

1. button with template number in link
2. link gets called and route takes template nr from call
3. link renders page with correct template


*/

/*
===========================
== List page for entries
===========================
*/

router.post('/UpdateListTitle', function(req, res) {
	
	let listTitle = req.body.listTitle;
	let listId = req.body.listId;

    curataList.update({"_id": listId}, {"$set": {"listName": listTitle }}, function(err, list) {
			if (err) {
				return console.log("Title update failed: ", err);
	        }

	        res.status(200).end();
    });

});

// Delete list, entries, components and listId from curata
router.delete('/deleteList', ensureAuthenticated, function(req, res) {

	let listId = req.body.listId;
	let curataId = req.body.curataId;
	let userId = req.user._id;

	if (!listId) {
		return console.log("No list id.");
	}

	if (!curataId) {
		return console.log("No Curata id.");
	}

	curataList.deleteOne({ _id: listId }).exec(function (err, removed) {
		if (err)  {
			return console.log("Failed to delete Curata list: ", err);
		}

		console.log("Successfully deleted Curata list");


		// Remove list id from Curata
		Curata.findOneAndUpdate(
			{ _id: curataId },
			{ $pull: { curataList: { _id: listId} } },
			{ new: true },
			function(err, removed) {
				if (err) { console.log(err) }

				Entry.find({ "curataListId": listId}, function(err, entries) {

					console.log("Entries of deleted Curata list, if any: ", entries);

					// Delete all components linked with each entry, then entries
					var loopEntryComponents = function(z) {
						if (z<entries.length) {
							let removeEntryId = entries[z]._id;
							console.log("To be removed entry id: ", removeEntryId);

							entryComponent.findOneAndRemove({"entryId": removeEntryId}, function(err) {
								if (err) {
									return console.log("Failed to remove component: ", err);
								} else {
									console.log("Curata entry component successfully removed.");
									loopEntryComponents(z+1);
								}
							})
						} else {
							console.log("Done with all entryComponents");
							Entry.deleteMany({ "curataListId": listId}).exec(function(err) {
								if (err) {
									return console.log("Failed to delete Curata listentries: ", err);
								} else {
									console.log("Curata list entries successfully removed.");

									res.json({
										redirectTo: '/dashboard/curatas/' + curataId
									});
								}
							});
						}
					}
					loopEntryComponents(0);
				});
			}
		);
	});

});

/*
===========================
== Account settings
===========================
*/

router.post('/updateFirstName', ensureAuthenticated, function(req, res) {
	
	let firstName = req.body.firstName;
	let userId = req.user._id;

    User.update({"_id": userId}, {"$set": {"firstname": firstName }}, function(err, user) {
			if (err) {
				return console.log("User update failed: ", err);
	        }

	        res.status(200).end();
    });

});

router.post('/updateLastName', ensureAuthenticated, function(req, res) {
	
	let lastName = req.body.lastName;
	let userId = req.user._id;

    User.update({"_id": userId}, {"$set": {"lastname": lastName }}, function(err, user) {
			if (err) {
				return console.log("User update failed: ", err);
	        }

	        res.status(200).end();
    });

});

router.post('/updateUsername', ensureAuthenticated, function(req, res) {
	
	let username = req.body.username;
	let userId = req.user._id

	let success = "Username available.";
	let fail = "Username not available.";

	// check if username already exists
	User.find({"username": username}, function(err, docs) {
		if (err) {
			console.log("Query failed: ", err);
		}
		if (docs.length) {
			//  username  already exists
			res.json({fail: fail});
		} else {
		    User.update({"_id": userId}, {"$set": {"username": username }}, function(err, user) {
				if (err) {
					return console.log("User update failed: ", err);
		        }

		        res.json({success: success});
		    });
		}
	})

});

router.post('/checkUsername', ensureAuthenticated, function(req, res) {
	
	let username = req.body.username;
	let success = "Username available.";
	let fail = "Username not available.";

	// check if username already exists
	User.find({"username": username}, function(err, docs) {
		if (docs.length) {
			//  username  already exists
			res.json({fail: fail});
		} else {
			res.json({success: success});
		}
	})

});

router.post('/updateEmail', ensureAuthenticated, function(req, res) {

	// check for if such email exists
		// if not, then update email
			// then send confirmation email
	
	let email = req.body.email;
	let userId = req.user._id;

    User.update({"_id": userId}, {"$set": {"email": email }}, function(err, user) {
			if (err) {
				return console.log("User update failed: ", err);
	        }

	        res.status(200).end();
    });

});

router.post('/updatePassword', ensureAuthenticated, function(req, res) {
	
	let username = req.body.password;
	let userId = req.user._id;

	// check if old password matches current
	// check if new password is legit and bcrypt it

    User.update({"_id": userId}, {"$set": {"password": password }}, function(err, user) {
			if (err) {
				return console.log("User update failed: ", err);
	        }

	        res.status(200).end();
    });

});


// Delete account and first set to expire
// At the time of creating this, I do not understand Promises, therefore I used a manual approach
router.delete('/deleteAccount', ensureAuthenticated, function(req, res) {

	let userId = req.user._id;
	let firstname = req.user.firstname;
	let lastname = req.user.lastname;
	let email = req.user.email;
	let password = req.user.password;


	if (!userId) {
		return console.log("Failed to delete account. No user id.");
	}

	// Delete account
	User.deleteOne({ _id: userId }).exec(function (err, removed) {
		if (err)  {
			return console.log("Failed to delete account: ", err);
		}

		console.log("Successfully deleted account.");

		// 2. Update owner field and names for all related Curatas
		// 3. Update owner field and names for all curataLists
		// 4. Update owner field and names for all entries

		// Find all curatas where owner_id equals userId
		Curata.find({"owner.owner_id": userId},
			function(err, curatas) {
				if (err) { 
					console.log(err) 
				}

				var modifyCurataOwnership = function(i) {
					if (i < curatas.length) {
						console.log('Curata: ', curatas[i]);
						console.log('curata.owner.firstName: ', curatas[i].owner.firstName);
						curatas[i].owner.firstName = "NoOwner";
						curatas[i].owner.lastName = "NoOwner";
						curatas[i].owner.owner_id = "NoOwner";
						curatas[i].save(function(err) {
							if (err) return console.log(err);
							modifyCurataOwnership(i+1);
						})
					} else {
						curataList.find({"owner.owner_id": userId},
							function(err, list) {
								if (err) { 
									console.log(err) 
								} 
								var modifyListOwnership = function(i) {
									if (i < list.length) {
										console.log('curataList: ', list[i]);
										list[i].owner.firstName = "NoOwner";
										list[i].owner.lastName = "NoOwner";
										list[i].owner.owner_id = "NoOwner";
										list[i].save(function(err) {
											if (err) return console.log(err);
											modifyListOwnership(i+1);
										})
									} else {
										Entry.find({"owner.owner_id": userId},
											function(err, entries) {
												if (err) { 
													console.log(err) 
												} 
												var modifyEntryOwnership = function(i) {
													if (i < entries.length) {
														console.log('Entry: ', entries[i]);
														entries[i].owner.firstName = "NoOwner";
														entries[i].owner.lastName = "NoOwner";
														entries[i].owner.owner_id = "NoOwner";
														entries[i].save(function(err) {
															if (err) return console.log(err);
															modifyEntryOwnership(i+1);
														})
													} else {
														// 0. Create mirror account in 'expired' collection in which it will expire in 30 days by default;
														let expired = new ExpiredUser();

														if (req.user.firstname) {
															expired.firstname = req.user.firstname;
														}

														if (req.user.lastname) {
															expired.lastname = req.user.lastname;
														}

														if (req.user.email) {
															expired.email = req.user.email;
														}

														if (req.user.password) {
															expired.password = req.user.password;
														}

														expired.save(function(err) {
															if (err) {
																return console.log(err);
															}

															req.logout();
															console.log('Account deleted and you are logged out');
															// res.redirect('/');
															res.status(200).send(removed);
														});
													}
												}
												modifyEntryOwnership(0);
											}
										)
									}
								}
								modifyListOwnership(0);
							}
						)
					}
				}
				modifyCurataOwnership(0);
			}
		)

	});

});

	// entryComponent.findOneAndUpdate(
	// 	{"_id": componentId},
	// 	// update
	// 	{$set: {"componentImageKey": ComponentImageKey, "componentURL": ComponentURL}},
	// 	function(err, component) {
	// 		if (err) {
	// 			return console.log("Image component update failed: ", err);
	// 		} else {
	// 			component.save(function(err) {
	// 				if (err) {
	// 					return console.log("Image component save failed: ", err);
	// 				} else {
	// 					console.log("Image component successfully updated: ", component);

	// 					if (entryId) {
	// 						Entry.findById(entryId,
	// 							function(err, entry) {
	// 								if (err) { 
	// 									console.log(err) 
	// 								} else {
	// 									console.log('Entry: ', entry);
	// 									entry.lastUpdated = dateUpdated;
	// 									entry.save(function(err) {
	// 										if (err) console.log(err);
	// 									})
	// 								}
	// 							}
	// 						)
	// 					}

	// 					res.json({component: component});
	// 				}
	// 			});
	// 		}
	// 	}
	// )



/*====== Access control  ======*/
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
  	console.log("Authentication successful.");
    return next();
  } else {
  	console.log("Authentication failed.");
    res.redirect(302, '/');
  }
}

module.exports = router;