let Curata = require('../models/curata');
let Entry = require('../models/entry');
let entryComponent = require('../models/entryComponent');
let curataList = require('../models/curataList');
let curataImage = require('../models/image');
const aws = require('aws-sdk');
const s3 = new aws.S3();

const entryController = {
    async updateEntryText(req, res) {
        try {
            let entryText = req.body.entryText;
            let entryId = req.body.entryId;
            let dateUpdated = req.body.dateUpdated;
            const entry = await Entry.findOneAndUpdate(
                {"_id": entryId}, 
                {$set: {"entryText": entryText, "lastUpdated":  dateUpdated}}).exec();
            if (!entry) {
				return res.status('404').json({
					message: "Entry content update failed"
				});
            }
            await entry.save();
            console.log("Entry content successfully updated: ", entry);
            res.status(200).end();
        } catch (error) {
            console.log("Entry content update failed.");
			console.log("error", error);
			res.status('500').json({
				message: "An error occurred while updating your entry." 
			});
        }
    },

    async createNewDraft(req, res) {
        try {
            let userId = req.user._id;
            let dateCreated = req.body.dateCreated;
            let curataId = req.body.curataId;
            let listId = req.body.listId;
            let entryTitle = req.body.entryTitle;
            let entryText = req.body.entryText;
            let entryLink = req.body.entryLink;
            let entryCategory = req.body.entryCategory;
            let entryCategoryId = req.body.entryCategoryId;

            if (!listId) {
                if (curataId) {
                    const curata = await Curata.findById(curataId);
                    if (!curata) {
                        return res.status('404').json({
                            message: "Curata not found."
                        });
                    }
                    listId = curata.defaultListId || curata.curataList[0];
                } else {
                    console.log("No Curata Id available.");
                }
            }

            let entry = new Entry();
            entry.entryState = "Draft";
            entry.curataListId = listId;
            entry.curataId = curataId;
            entry.dateCreated = dateCreated;
            entry.creator.creator_id = userId;
            entry.owner.owner_id = userId;
            entry.contributors.push(userId);
            entry.entryTitle = entryTitle;
            entry.entryText = entryText;
            entry.entryLink = entryLink;
            entry.entryCategory = entryCategory;
            entry.entryCategoryId = entryCategoryId;

            if (req.body.imageKey && req.body.imageURL) {
                let imageKey = req.body.imageKey;
                let imageURL = req.body.imageURL;
                entry.entryImageKey = imageKey;
                entry.entryImageURL = imageURL;
            }
            
            await entry.save();

            const list = await curataList.findById(listId);
            if (!list) {
                return res.status('404').json({
                    message: "List not found."
                });
            }
            list.entries.push(entry._id);
            await list.save();

            let entryId = entry._id;
            res.json({
                entry: entry,
                entryId: entryId
            });
         
        } catch (error) {
            console.log("Entry create failed.");
			console.log("error", error);
			res.status('500').json({
				message: "An error occurred while trying to create your entry." 
			});
        }
    },

    async updateEntry(req, res) {
		let userId = req.user._id;
		let entryId = req.body.entryId;
		let dateCreated = req.body.dateCreated;
		let curataId = req.body.curataId;
		let listId = req.body.listId;
		let entryTitle = req.body.entryTitle;
		let entryText = req.body.entryText;
		let entryLink = req.body.entryLink;
		let entryCategory = req.body.entryCategory;
		let entryCategoryId = req.body.entryCategoryId;
	
		if (!listId) {
			if (curataId) {
				const curata = await Curata.findById(curataId);
				if (!curata) {
					return res.status('404').json({
						message: "Curata not found."
					});
				}
				listId = curata.defaultListId || curata.curataList[0];
			} else {
				console.log("No Curata Id available.");
			}
		}

		try {
			const entry = await Entry.findById(entryId);
			if (!entry) {
				return res.status('404').json({
					message: "Entry does not exist"
				});
			}
			entry.curataListId = listId;
			entry.curataId = curataId;
			entry.dateCreated = dateCreated;
			entry.entryTitle = entryTitle;
			entry.entryText = entryText;
			entry.entryLink = entryLink;
			entry.entryCategory = entryCategory;
			entry.entryCategoryId = entryCategoryId;
	
			if (req.body.imageKey && req.body.imageURL) {
				let imageKey = req.body.imageKey;
				let imageURL = req.body.imageURL;
				entry.entryImageKey = imageKey;
				entry.entryImageURL = imageURL;
			}
	
			await entry.save();
			res.json({
				entry: entry,
				entryId: entryId
			});
		} catch (error) {
			console.log("error", error);
			res.status('500').json({
				message: "An error occurred while updating your entry" 
			});
		}
    },

    async trashEntry(req, res) {
        try {
            let entryId = req.body.entryId;

            const entry = await Entry.findById(entryId);
			if (!entry) {
				return res.status('404').json({
					message: "Could not find entry."
				});
            }
            
            entry.entryState = "Trashed";
            await entry.save();

            let curataId = entry.curataId;
            res.json({
                entry: entry,
                redirectTo: '/dashboard/curatas/' + curataId
            });
        
        } catch (error) {
            console.log("error", error);
			res.status('500').json({
				message: "An error occurred while trashing your entry" 
			}); 
        }
    },

    async untrashEntry(req, res) {
        try {
            let entryId = req.body.entryId;

            const entry = await Entry.findById(entryId);
			if (!entry) {
				return res.status('404').json({
					message: "Could not find entry."
				});
            }
            
            entry.entryState = "Draft";
            await entry.save();

            res.json({
                entry: entry
            });
        
        } catch (error) {
            console.log("error", error);
			res.status('500').json({
				message: "An error occurred while updating your entry" 
			}); 
        }
    },

    async deleteEntry(req, res) {

        let entryId = req.body.entryId;
        let listId = req.body.listId;
        let curataId = req.params.curataId;

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
                redirectTo: '/dashboard/curatas/' + curataId + '/?entrydelete'
            });

        } catch(error) {
            console.log(error);
            res.status(500).json({
                errors: "An unknown error occurred."
            });
        }
    }

}

module.exports = entryController;
