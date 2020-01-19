let Curata = require('../models/curata');
let curataList = require('../models/curataList');

const dashboardController = {
	async getCurata(req, res) {
		try {
			const curataId = req.params.curataId;
			const curatas = await Curata.find({"owner.owner_id": req.user._id});
			if (!curatas) {
				return res.render('404');
			}
			const curata = await Curata.findById(curataId).populate('curataList').populate('categories').exec();
			if (!curata) {
				return res.render('404');
			}

			const lists = await curataList.find({"curataId": curataId}).populate('entries').exec();
			if (!lists) {
				return res.render('404');
			}

			curata.categories.sort(function(a, b) {
				return a.entryCategoryName.localeCompare(b.entryCategoryName);
			});

			res.render('dashboard__space', {
				curatas: curatas,
				curata: curata,
				lists: lists
			})

		} catch (error) {
			console.log(error);
			res.render('404')
		}

	}
}

module.exports = dashboardController;
