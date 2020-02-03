let Curata = require('../models/curata');
let Entry = require('../models/entry');
let curataList = require('../models/curataList');
let utils = require('../utils/dashboard');

const dashboardController = {
	async getCurata(req, res) {
		console.log("params!: ", req.params);
		try {
			const curataId = req.params.curataId;
			console.log("The Curata Id: ", curataId);
			
			// this is for the 'Curata switcher'
			const curatas = await Curata.find({"owner.owner_id": req.user._id});
			if (!curatas) {
				return res.render('404');
			}
			
			const { curata } = req;
			if (!curata) {
				return res.render('404');
			}
			const lists = await curataList.find({"curataId": curataId}).populate('entries').exec();
			if (!lists) {
				return res.render('404');
			}

			res.render('dashboard__space', {
				curatas: curatas,
				curata: curata,
				lists: lists
			})

		} catch (error) {
			console.log(error);
			res.render('404')
		}

	},

	async editCurata(req, res) {

		try {
			const curataId = req.params.curataId;
			const entryId = req.params.id;
			const entry = await Entry.findById(entryId).populate('entryComponents').exec();
			if (!entry) {
				return res.render('404');
			}
			console.log("Received entry: ", entry);

			const curata = await utils.getCurata(curataId);
			if (!curata) {
				return res.render('404');
			}

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
			res.render('entry__editing', {
				entry,
				curata
			});
		} catch (error) {
			console.log(error);
			res.render('404')
		}
	
	},

	async newCurata(req, res) {
		let curataId = req.params.curataId;

		try {
			const curata = await utils.getCurata(curataId);
			if (!curata) {
				return res.render('404');
			}
		
			res.render('entry__new', {
				curata
			})
		} catch (error) {
			console.log("error");
			res.render('404');
		}
	},

	async canUserViewCurata(req, res, next) {
		const curata = await utils.getCurata(req.params.curataId);
		if (curata.owner.owner_id == req.user._id) {
			req.curata = curata;
			return next();
		}
		res.redirect(302, '/');
	}
}

module.exports = dashboardController;
