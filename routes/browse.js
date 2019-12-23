const express = require('express');
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


router.get('/', function(req, res) {
	res.render('browse');
})

// Get Curata
router.get('/users/:userId/curatas/:curataId', function(req, res) {

	let userId = req.params.userId;
	let curataId = req.params.curataId;

	Curata.findById(curataId).populate('curataList').exec(function(err, curata) {
		if (err) {
			return console.log("Could not get Curata. ", err);
		}

		curataList.find({"curataId": curataId}).populate('entries').exec(function(err, lists) {
			if (err) {
				return console.log("Could not get lists.", err)
			}

			res.render('viewCurata', {
				curata: curata,
				lists: lists,
				userId: userId
			})
			// for each list
		})
	})
	// for curata:
		// title
		// description


	// get Curata
		// get all lists
		// if curata has more than one list
			// set that up
		// if only one list
			// set up accordingly as well

	// based on custom list style
		// display list

	// if only single list... populate and display list items

	// if only one list in data
		// display one kind of setup / style / design
			// possibly this can be done in pug as well
				// check if multiple lists
				// then display boxes with each list's title or so

	// list types
		// show latest upload to X list
		// set default list that pops up
		// set option to look through multiple lists on the front page like Dribbble

	// classical:
		// submit button(?)
		// title
		// about-description
		// category
			// (entry link / link elsewhere)
			// title
			// image
			// description
			// (read more button AND link button to the external link)

	// classical-multi: 
		// submit button(?)
		// title
		// about-description
		// category 1 (one list)
			// title
			// image
			// description
		// category 2
			// title
			// image
			// description
		// etc.

		// EXTRA:
			// 'Subscribe button (financial) / fund me / patreon'
			// 'Buy me a coffee' / Donate
			// FAQ?

		// show categories on the left
			// 

	// options:
		// choose between a few designs for how the list ITEMS look like
		// choose between a few designs for how the LISTS are displayed


// How do we begin? Who is our first target audience? Who and what kind of people do we get on board and are there some kinds of people we shouldn't get on board initially? 

// HOW TO GET INTO BROWSE
	// There is an area for absolutely all Curatas
	// There is also an area to which you only get your curata to if you get enough upvotes
	// Also unique page views
	// Low quality stuff gets downvoted or marked as 'Low quality'


// OTHER OPTIONS
	// Is your site/list community-collaboration / hand-picked-team-picked / mix

// CURATA APPEARANCE SETTINGS

	// eventually:
		// choose your title's position (left, center, right)
		// choose your title's font-family
		// choose your title's font-size out of a few options

	// HOME PAGE SETTINGS (LAYOUT)
		// display only lists (without entries)
		// display only one list with entries with other lists (categories) accessible through some other areak
		// display categories on the left, and the entries on the right per chosen category (also eventually an option to have a scroll display like ethical.net)

	// HOME PAGE SETTINGS (APPEARANCE)
		// modal popup with entry inside (like undraw.co)


// LIST APPEARANCE SETTINGS

	// LIST APPEARANCE IMAGE SETTINGS
		// display / don't display
		// display slightly over the edge of the box + larger margin
		// do you want the image to fit?

	// LIST BOX APPEARANCE SETTINGS
		// display border / no border

	// LIST BOX APPEARANCE: HOVER (enable/disable)
		// scale full box on hover
		// scale image on hover (even if it is a background image)
		// scale title on hover
		// move box up on hover


	// LIST LINK SETTINGS
		// do you want the link click to take to the entry or to the default link?
		// do you want the default link to be displayed on the front page somehow?

	// LIST LAYOUT
		// category on the top, then title, image as background, possible other indicator data below (such as 231 jobs, 30 startups in that list)

	// allow submitting? 
		// can disable per list or for entire curata
		// influences whether submit button exists

	// You can display ONLY lists (as big boxes?)
		// and then you click on each list to get the entries inside
	// Or you can display all the entries
	// Or you can display just the entries of one of the categories
	// Or you can display the entries of the selected category

});

// Get Curata lists
router.get('/users/:userId/curatas/:curataId/lists/', function(req, res) {
	
	let userId = req.params.userId;
	let curataId = req.params.curataId;

	Curata.findById(curataId, function(err, curata) {
		if (err) {
			return console.log("Could not get Curata. ", err);
		}

		curataList.find({"curataId": curataId}).populate('entries').exec(function(err, lists) {
			if (err) {
				return console.log("Could not get lists.", err)
			}

			res.render('viewCurata', {
				curata: curata,
				lists: lists,
				userId: userId
			})
			// for each list
		})
	})
});

// Get Curata list
router.get('/users/:userId/curatas/:curataId/lists/:curataListId', function(req, res) {

	let userId = req.params.userId;
	let curataId = req.params.curataId;
	let listId = req.params.curataListId;

	Curata.findById(curataId, function(err, curata) {
		if (err) {
			return console.log("Could not get Curata. ", err);
		}

		curataList.findById(listId).populate('entries').exec(function(err, list) {
			if (err) {
				return console.log("Could not get lists.", err)
			}

			let entries = list.entries;

			entries.sort(function(a, b) {
				return a.dateCreated - b.dateCreated;
			});

			res.render('viewCurata', {
				curata: curata,
				list: list,
				userId: userId,
				entry: entry
			})
		})
	})
	// based on list type, etc. you might be able to upvote, etc.
});

// Get Curata list entries
router.get('/users/:userId/curatas/:curataId/lists/:curataListId/entries', function(req, res) {

	let userId = req.params.userId;
	let curataId = req.params.curataId;
	let listId = req.params.curataListId;

	Curata.findById(curataId, function(err, curata) {
		if (err) {
			return console.log("Could not get Curata. ", err);
		}

		curataList.findById(listId).populate('entries').exec(function(err, list) {
			if (err) {
				return console.log("Could not get lists.", err)
			}

			let entries = list.entries;

			entries.sort(function(a, b) {
				return a.dateCreated - b.dateCreated;
			});

			res.render('viewCurata', {
				curata: curata,
				list: list,
				userId: userId,
				entry: entry
			})
		})
	})
});

// Get Curata list entries entry
router.get('/users/:userId/curatas/:curataId/lists/:curataListId/entries/:entryId', function(req, res) {

	let userId = req.params.userId;
	let curataId = req.params.curataId;
	let listId = req.params.curataListId;
	let entryId = req.params.entryId;

	Curata.findById(curataId, function(err, curata) {
		if (err) {
			return console.log("Could not get Curata. ", err);
		}

		curataList.findById(listId, function(err, list) {
			if (err) {
				return console.log("Could not get lists.", err)
			}

			Entry.findById(entryId).populate('entryComponents').exec(function(err, entry) {
				if (err) {
					return console.log("Could not get entry.");
				}

				let components = entry.entryComponents;

				components.sort(function(a, b) {
					return a.componentOrder - b.componentOrder;
				});

				res.render('entry__view', {
					curata: curata,
					list: list,
					userId: userId,
					entry: entry
				})
			})
		})
	})
});

/*
===========================
== Submit page
===========================
*/

router.get('/curatas/:curataId/submit', function(req, res) {

	let curataId = req.params.curataId;

	Curata.findById(curataId).populate('curataList').exec(function(err, curata) {
		if (err) {
			return console.log("Could not get curata: ", err);
		}

		if (curata) {
			res.render('submit', {
				curata: curata,
			})
		} else {
			console.log("Curata not found.");
			res.redirect('/');
		}
	})
})

router.get('/curatas/:curataId/submit/lists/:curataListId', function(req, res) {

	let curataId = req.params.curataId;
	let curataListId = req.params.curataListId;

	Curata.findById(curataId).populate('curataList').exec(function(err, curata) {
		if (err) {
			return console.log("Could not get curata: ", err);
		}

		curataList.findById(curataListId, function(err, list) {
			if (err) { return console.log(err) };

			let templateId = list.defaultTemplate;

			Template.findById(templateId, function(err, template) {
				if (err) { return console.log(err) };

					if (curata) {
						res.render('submitEntry', {
							curata: curata,
							list: list,
							template: template
						})
					} else {
						console.log("Curata not found.");
						res.redirect('/');
					}

			})
		})
	})

})

router.post('/curatas/:curataId/addLike', function(req, res) {

	let curataId = req.params.curataId;
	let userId = req.body.userId;

	console.log("curataid: ", curataId);
	console.log("userId: ", userId);

	Curata.findById(curataId, function(err, curata) {
		if (err) {
			return console.log("Could not get curata: ", err);
		}

		// if undefined and not even zero, make it one
		if (!curata.likeCount) {
			curata.likeCount = 1;
		} else if (curata.likeCount == 0 || curata.likeCount > 0) {
			curata.likeCount = curata.likeCount + 1;
		}

		curata.save(function(err) {
			if(err) {
				return console.log(err);
			} 

			let newCount = curata.likeCount;

			User.findById(userId, function(err, user) {
				if (err) {
					return console.log("Could not get user: ", err);
				}
				user.likedSpaces.push(curataId);
				user.save(function(err) {
					if (err) {
						return consle.log("Could not save user: ", err);
					}

					res.json({
						newCount: newCount
					})
				})

			})
		});
	})
})


/*====== Users  ======*/

// Get Curata list entries entry
router.get('/users', function(req, res) {

});

// Get Curata list entries entry
router.get('/users/:userId', function(req, res) {

});

// Get Curata list entries entry
router.get('/users/:userId/curatas', function(req, res) {

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