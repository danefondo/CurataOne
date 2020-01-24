let Curata = require('../models/curata');

module.exports = {
	getCurata(curataId) {
        return new Promise(async resolve => {
            console.log("The Curata Id AGAIN: ", curataId);
            const curata = await Curata.findById(curataId).populate('curataList').populate('categories').exec();
            if (!curata) {
                return resolve(false);
            }
    
            curata.categories.sort(function(a, b) {
                return a.entryCategoryName.localeCompare(b.entryCategoryName);
            });
            resolve(curata);
        });
    }
}