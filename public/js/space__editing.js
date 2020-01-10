 $(document).ready(function () { 

 	let deletionModal = $('.emptyModal');
 	let userId = $('.userId').attr('id');
	let username = $('.userId').attr('data-username');
 	const coreURL = 'dashboard';

	let curataId = $('.curataId').attr('id');

	function initCurataDropdown() {
		// reapply upon creating new component
		$('.currentCurataSwitch').off('click');
		$('.currentCurataSwitch').on('click', function(){
		    $('.curataSwitcher').toggleClass('drop-down--active');
		});
	}
	initCurataDropdown();

	function initDropdownClosing() {

		$('.DropdownX').on('click', function(event) {
			event.stopPropagation();
		})

		$('.curataSwitcher').on('click', function(event) {
			event.stopPropagation();
		})

		$(document).on('click', function() {
			$('.DropdownX').removeClass('is-expanded');
			$('.curataSwitcher').removeClass('drop-down--active');
		})
	}
	initDropdownClosing();

	function initMakeDefaultCurata() {
		$('.makeDefault').off('click');
		$('.makeDefault').on('click', function() {
			let btn = this
			let curataId = $('.currentCurataSwitch').attr('id');

	    	$.ajax({
	    		data: {
	    			curataId: curataId
	    		},
	    		type:'POST',
	    		url: '/' + coreURL + '/makeDefaultCurata',
	    		success: function(response) {
	    			$(btn).removeClass('makeDefault').addClass('defaultCurata');
	    			$(btn).text('Default Curata');
	    			$('.dashboardBtn').attr('href', '/' + coreURL + '/curatas/' + curataId);
	    		},
	    		error: function(err) {
	    			console.log("Failed to make Curata default: ", err);
	    			// Display error not being able to publish
	    		}
	    	});
		})
	}
	initMakeDefaultCurata();


	$('.createEntryModal__space').bind('mousewheel DOMMouseScroll', function(e) {
	    var scrollTo = null;

	    if (e.type == 'mousewheel') {
	        scrollTo = (e.originalEvent.wheelDelta * -1);
	    }
	    else if (e.type == 'DOMMouseScroll') {
	        scrollTo = 40 * e.originalEvent.detail;
	    }

	    if (scrollTo) {
	        e.preventDefault();
	        $(this).scrollTop(scrollTo + $(this).scrollTop());
	    }
	});

	function initPreviewButton() {

		$('.closeWindowBtn').off('click');
		$('.closeWindowBtn').on('click', function() {
			window.top.close();
		});
	}
	initPreviewButton();

	function initNewCategoryCreation() {
		$('.entryNewCategory__space').on('click', function() {
			let clickObject = $(this);
			// $(this).closest('.entryDetailsGroup').removeClass('flex');
			$('.dropdown').css("float", "none");
			// $('.entryNewCategory__space').css("display", "none");
			// $('.entryCreateCategoryBlock__space').css("display", "block");
			hideShowCategoryCreator(clickObject);
			initCancelCategoryCreation();
			initCreateNewCategory();
		})
	}
	initNewCategoryCreation();

	function initCancelCategoryCreation() {
		$('.entryNewCategoryCancel__space').off('click');
		$('.entryNewCategoryCancel__space').on('click', function() {
			let clickObject = $(this);
			// $(this).closest('.entryDetailsGroup').addClass('flex');
			$('.dropdown').css("float", "left");
			// $('.entryNewCategory__space').css("display", "inline-block");
			// $('.entryCreateCategoryBlock__space').css("display", "none");
			$('.entryNewCategoryText__space').val('');
			hideShowCategoryCreator(clickObject);
		});
	}

	function hideShowMoreOptions() {
		$('.entryShowHideMoreOptions__space').off('click');
		$('.entryShowHideMoreOptions__space').on('click', function() {
			$('.createEntryModalActionButton__space').toggle();
		})
	}
	hideShowMoreOptions();

	function hideShowCategoryCreator(clickObject) {
		clickObject.closest('.entryDetailsGroup').toggleClass('flex');
		$('.entryNewCategory__space').toggle();
		$('.entryCreateCategoryBlock__space').toggle();
	}

	function initCreateNewCategory() {
		$('.entryNewCategoryCreate__space').off('click');
		$('.entryNewCategoryCreate__space').on('click', function() {
			let clickObject = $(this);

			let category = $('.entryNewCategoryText__space').val();
			category = category[0].toUpperCase() + category.slice(1);
			category = category.replace(/^\s+|\s+$/g, "");

			let listId = $('.entryCurrentListSelector__space').attr('data-listId');

			clickObject.text('Creating...');


			let data = {};
			data.category = category;
			data.listId = listId;
			data.curataId = curataId;
			data.dateCreated = new Date();

			// create category in database
			$.ajax({
				data: data,
				type: 'POST',
				url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/createCategory',
				success: function(response) {
					console.log("Yoho! Successfully created new category!");
					let categoryId = response.categoryId;
					category = response.category.entryCategoryName
					// clear and hide category creator
					clickObject.text('Create');
					hideShowCategoryCreator(clickObject);
					$('.entryNewCategoryText__space').val('');
					$('.dropdown').css("float", "left");

					let listOption = $('<li>', {'class': 'option selected', 'data-value': categoryId})
					listOption.text(category);

					let categoryList = $('.dropdown').find('ul');
					categoryList.append(listOption);

					let dropdownList = $('.dropdown').find('.list');
					dropdownList.find('.selected').removeClass('selected');

					// set newly created category as default

					$('.dropdown').find('.current').text(category);
					$('.dropdown').find('.current').attr("listId", categoryId);

					$('.dropdown').prev('select').val(category).trigger('change');

					// sort alphabetically upon add, whilst keeping 'None' at start
					let optionList = $('.optionList');
					optionList.children().not('.doNotSortMe').detach().sort(function(a, b) {
					    if (!$(a).hasClass('.doNotSortMe') && !$(b).hasClass('.doNotSortMe')) { 
					        return $(a).text().localeCompare($(b).text());
					    }
					}).appendTo(optionList);

				},
				error: function(err) {
					console.log("Arrghh! Failed to publish entry!");
				}
			})	

		})
	}

	// to show contents
		// click entry
		// get entry id
		// open modal
		// load entry contents (ideally preloaded)

	function initAddNewList() {
		let creationModal = $('.emptyModal');

		$('.openListChooser__space').off('click');
		$('.openListChooser__space').on('click', function() {
			creationModal.show();
		})

		$('.cancelListCreating').off('click');
		$('.cancelListCreating').on('click', function() {
			creationModal.hide();
		})
		$('.modalBackground').off('click');
		$('.modalBackground').on('click', function() {
			creationModal.hide();
		})

		// Press esc key to hide
		$(document).keydown(function(event) { 
		  if (event.keyCode == 27) { 
		  	if (creationModal.length) {
		  		let modalState = creationModal.css('display');
			  	if (modalState == "block") {
			  		creationModal.hide();
			  	}
		  	}
		  }
		});

	}
	initAddNewList();

	function initCreateEntry() {
		$('.createEntry__space').off('click');
		$('.createEntry__space').on('click', function() {

			let entryButton = $(this);
			let entryCreator = entryButton.closest('.createEntryModal__space');

			let entryCheck = checkIfEntryExists();
			if (entryCheck) {
				let listId = $('.entryCurrentListSelector__space').attr('data-listId');
				let entryId = $('.modalEntryId').attr('id');
				$.ajax({
					type: 'POST',
					url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId + '/publish',
					success: function(response) {
						console.log("Yoho! Successfully created new entry!");
						// window.location.href = response.redirectTo;
						let newEntry = $('<div>', {'class': 'entry__liveCurata', 'id': entryId});
						let entryTitleBlock = $('<a>', {'class': 'entryTitle__liveCurata'})
						entryTitleBlock.text(response.entry.entryTitle);
						let entryImageBlock = $('<div>', {'class': 'curataEntryImage'})
						entryImageBlock.attr("data-image-key", response.entry.entryImageKey);
						entryImageBlock.attr("data-image-url", response.entry.entryImageURL);
						entryImageBlock.css("background-image", "url(" + response.entry.entryImageURL + ")");
						newEntry.append(entryTitleBlock);
						newEntry.append(entryImageBlock);
						console.log("listid: ", listId);
						$('#' + listId).append(newEntry);
						deletionModal.hide();
						$('.createEntryModal__space').find('input, textarea').val('');
						$('.modalEntryId').removeAttr('id');
					},
					error: function(err) {
						console.log("Arrghh! Failed to publish entry!");
					}
				})				
			} else {
				// if entry already exists but is draft, just send call to publish and then return to add dynamically
				let data = {}
				let creationTime = new Date();

				let entryCategory = entryCreator.find('.current').text();
				let listId = $('.entryCurrentListSelector__space').attr('data-listId');
				let entryTitle = entryCreator.find('.EntryTitle').val();
				let entryDescription = entryCreator.find('.postDescription').val();
				let entryLink = entryCreator.find('.entryLink').val();

				let imageBlock = entryCreator.find('.imageBlock');
				let imageKey = imageBlock.attr('data-image-key');
				let imageURL = imageBlock.attr('data-image-url');

				data.entryCategory = entryCategory;
				data.entryTitle = entryTitle;
				data.entryDescription = entryDescription;
				data.entryLink = entryLink;
				data.imageKey = imageKey;
				data.imageURL = imageURL;
				data.creationTime = creationTime;
				data.curataId = curataId;

				data.listId = listId;

				$.ajax({
					data: data,
					type: 'POST',
					url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/newEntry',
					success: function(response) {
						console.log("Yoho! Successfully created new entry!");
						// window.location.href = response.redirectTo;
						let newEntry = $('<div>', {'class': 'entry__liveCurata', 'id': entryId});
						let entryTitleBlock = $('<a>', {'class': 'entryTitle__liveCurata'})
						entryTitleBlock.text(response.entry.entryTitle);
						let entryImageBlock = $('<div>', {'class': 'curataEntryImage'})
						entryImageBlock.attr("data-image-key", response.entry.entryImageKey);
						entryImageBlock.attr("data-image-url", response.entry.entryImageURL);
						entryImageBlock.css("background-image", "url(" + response.entry.entryImageURL + ")");
						newEntry.append(entryTitleBlock);
						newEntry.append(entryImageBlock);
						console.log("listid: ", listId);
						$('#' + listId).append(newEntry);
						deletionModal.hide();
						$('.createEntryModal__space').find('input, textarea').val('');
						$('.modalEntryId').removeAttr('id');
						// find appropriate list by id
						// create divs w/content
						// append div to list
					},
					error: function(err) {
						console.log("Arrghh! Failed to create entry!");
					}
				})
			}
		})
	}
	initCreateEntry();

	function checkIfEntryExists() {
		let entryId = $('.modalEntryId').attr('id');
		let returnValue;

		if (typeof entryId !== typeof undefined && entryId !== false) {
		    returnValue = true;
		} else {
			returnValue = false;
		}
		return returnValue;
	}

	function checkIfImageExists() {
		let imageBlock = $('.imageBlock').attr('data-image-key');
		let imageCheck;

		if (typeof imageBlock !== typeof undefined && imageBlock !== false) {
			imageCheck = true;
		} else {
			imageCheck = false;
		}
		return imageCheck;
	}

	function createNewDraft() {
		let data = {}
		let entryCreator = $('.createEntryModal__space');

		// what if no list? (e.g. person removes manually, doesn't load properly, but there should always be some list, e.g. then it takes from default list in database) -- just check on backend
		let dateCreated = new Date();
		let listId = $('.entryCurrentListSelector__space').attr('data-listId');
		let currentCategoryObject = entryCreator.find('.current');
		let entryCategory = currentCategoryObject.text();
		let entryCategoryId = currentCategoryObject.attr('data-value');
		let entryTitle = entryCreator.find('.entryTitle__space').val();
		let entryDescription = entryCreator.find('.postDescription').val();
		let entryLink = entryCreator.find('.entryLink').val();

		let imageExists = checkIfImageExists();

		// check on backend if any such variable is in data or not
		if (imageExists) {
			let imageBlock = entryCreator.find('.imageBlock');
			let imageKey = imageBlock.attr('data-image-key');
			let imageURL = imageBlock.attr('data-image-url');
			data.imageKey = imageKey;
			data.imageURL = imageURL;
		} 

		data.entryCategory = entryCategory;
		data.entryCategoryId = entryCategoryId;
		data.entryTitle = entryTitle;
		data.entryDescription = entryDescription;
		data.entryLink = entryLink;
		data.dateCreated = dateCreated;
		data.curataId = curataId;
		data.listId = listId;

		$.ajax({
			data: data,
			type: 'POST',
			url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/newDraft',
			success: function(response) {
				console.log("Yoho! Successfully created draft!");
				let fullPageLink = $('<a>', {'class': 'createEntryModalActionButton__space entryFull__space block hide' , 'href': '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/' + response.entryId + '/editing'})
				fullPageLink.text("Full page editor")
				$('.entryFull__space').replaceWith(fullPageLink);
				hideShowMoreOptions();
				$('.modalEntryId').attr('id', response.entryId);
			},
			error: function(err) {
				console.log("Arrghh! Failed to create draft!");
			}
		})
	}

	function updateDraft() {
		let data = {}
		let entryCreator = $('.createEntryModal__space');
		let entryId = $('.modalEntryId').attr('id');

		// what if no list? (e.g. person removes manually, doesn't load properly, but there should always be some list, e.g. then it takes from default list in database) -- just check on backend
		let dateCreated = new Date();
		let listId = $('.entryCurrentListSelector__space').attr('data-listId');
		let currentCategoryObject = entryCreator.find('.current');
		let entryCategory = currentCategoryObject.text();
		let entryCategoryId = currentCategoryObject.attr('data-value');
		let entryTitle = entryCreator.find('.entryTitle__space').val();
		let entryDescription = entryCreator.find('.postDescription').val();
		let entryLink = entryCreator.find('.entryLink').val();

		let imageExists = checkIfImageExists();

		// check on backend if any such variable is in data or not
		if (imageExists) {
			let imageBlock = entryCreator.find('.imageBlock');
			let imageKey = imageBlock.attr('data-image-key');
			let imageURL = imageBlock.attr('data-image-url');
			data.imageKey = imageKey;
			data.imageURL = imageURL;
		} 

		data.entryCategory = entryCategory;
		data.entryCategoryId = entryCategoryId;
		data.entryTitle = entryTitle;
		data.entryDescription = entryDescription;
		data.entryLink = entryLink;
		data.dateCreated = dateCreated;
		data.curataId = curataId;
		data.listId = listId;
		data.entryId = entryId;

		$.ajax({
			data: data,
			type: 'POST',
			url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId + '/updateEntry',
			success: function(response) {
				console.log("Yoho! Updated entry!");
			},
			error: function(err) {
				console.log("Arrghh! Failed to create draft!");
			}
		})
	}

	// #2
	function createOrUpdateDraft() {
		let typingTimer;                //timer identifier
		let doneTypingInterval = 1500;  //time in ms (5 seconds)

        console.log("I changed! Haha!");
        let entryExists = checkIfEntryExists();
		if (entryExists) {
		    clearTimeout(typingTimer);
	        typingTimer = setTimeout(updateDraft, doneTypingInterval);
		} else {
			createNewDraft();
		}
	}

	// #1
	function initInputListening() {
		$('.entryInput__space').off('input change');
		$('.entryInput__space').on('input change', function() {
			createOrUpdateDraft();
		})

	    $('.dropdown').prev('select').on('change', function() {
	    	createOrUpdateDraft();
	    });

	    // image input listening??
	}
	initInputListening();

	// 5106128

	// upon CLEAR turn off all listening

	// create entry, setup entryId, then save reference

	// if entry does not exist, create one and initialize it as draft
		// then set entry id
		// then update full editor button
		// then create save draft & exit button

		// handle clear for all cases
		// handle case if attempt create without category
		// fix entry category change listening updates
		// handle case if attempt upload without image
		// fix textarea not working
		// fix textarea being wrong size

		// make drafts section
		// make drafts appear there

		// make option to VIEW entries/drafts -- from which where you can also easily access full-page mode
		// make option to trash entries/drafts

		// make option to delete entries/drafts

		// handle case for empty list (always have some list existing)

	function checkIfMainImageExists() {
		let imageCheck = $('.imageBlock').attr('data-image-key');
		if (typeof imageCheck !== typeof undefined && imageCheck !== false) {
			$('.image-upload-wrap').hide();
			$('.file-upload-content').show();
			enableImageDelete();
		} else {
			enableImageUpload();
		}
	}
	checkIfMainImageExists();

	function enableImageUpload() {

		$('.image-upload-wrap').off('dragover');
		$('.image-upload-wrap').on('dragover', function () {
			$('.image-upload-wrap').addClass('image-dropping');
		});

		$('.image-upload-wrap').off('dragleave');
		$('.image-upload-wrap').on('dragleave', function () {
			$('.image-upload-wrap').removeClass('image-dropping');
		});

		$('.file-upload-btn').off('click');
		$('.file-upload-btn').on('click', function() {
			$('.file-upload-input').trigger( 'click' );
		})

		$('.file-upload-input').off('change');
		$('.file-upload-input').on('change', function() {
			$('.createEntry__space').text("Saving...");
			$('.createEntry__space').css("background-color", "#b39ddb");

			readURL(this);
			// setup upload failed instead and set the image later and until then set uploading image

			const files = $(this).files;
			// const file = files[0];

			let file = $(this).prop('files')[0];

			const imageBlock = $(this).closest('.imageBlock');
			const dateUpdated = new Date();

			let uploadData = {};
			uploadData.imageBlock = imageBlock;
			uploadData.dateUpdated = dateUpdated;

			if (file === null) {
				$('.createEntry__space').text("Create entry");
				$('.createEntry__space').css("background-color", "#673ab7");
				return alert('No file selected.');
			}

			getSignedRequest(file, uploadData);

		});
	}

	function disableImageUpload() {
		$('.file-upload-btn').off('click');
		$('.file-upload-input').off('change');
		$('.image-upload-wrap').off('dragover');
		$('.image-upload-wrap').off('dragleave');
	}

	function enableImageDelete() {
		$('.remove-image').off('click');
		$('.remove-image').on('click', function() {
			let obj = this;
			removeUpload(obj);
			// fix this shit
		})
	}

	function disableImageDelete() {
		$('.remove-image').off('click');
	}

	function launchUploadingIcon() {

	}

	function readURL(input) {
	  if (input.files && input.files[0]) {

	    var reader = new FileReader();

	    reader.onload = function(e) {
	      $('.image-upload-wrap').hide();

	      $('.file-upload-image').attr('src', e.target.result);
	      $('.file-upload-content').show();

	      $('.image-title').html(input.files[0].name);
	    };

	    reader.readAsDataURL(input.files[0]);
	    return 

	  } else {
	    removeUpload(input);
	  }
	}

	function removeUpload(obj) {

		let entryId = $('.modalEntryId').attr('id');
		if (typeof entryId == typeof undefined || entryId == false) {
			return alert("Entry does not exist yet or entry id is not available.");
		}
		$('.createEntry__space').text("Saving...");
		$('.createEntry__space').css("background-color", "#b39ddb");

		let image = $(obj).closest('.imageBlock')
		let imageKey = image.attr('data-image-key');
		let isMainImage = "true";
		let dateUpdated = new Date();

    	$.ajax({
    		data: {
    			imageKey: imageKey,
    			entryId: entryId,
    			isMainImage: isMainImage,
    			dateUpdated: dateUpdated
    		},
    		type:'DELETE',
    		url: '/' + coreURL + '/DeleteImage',
    		success: function(response) {
    			console.log("Deleted image from database.");
    			image.removeAttr('data-image-key');
				$('.file-upload-input').replaceWith($('.file-upload-input').clone());
				$('.file-upload-content').hide();
				$('.image-upload-wrap').show();
    			enableImageUpload();
				$('.createEntry__space').text("Create entry");
				$('.createEntry__space').css("background-color", "#673ab7");
    		},
    		error: function(err) {
    			console.log("Failed to delete image from database: ", err);
    			enableImageUpload();
				$('.createEntry__space').text("Create entry");
				$('.createEntry__space').css("background-color", "#673ab7");
    			// Display error not being able to delete note
    		}
    	});
	}

	function saveFileReference(uploadData) {

		let entryId = $('.modalEntryId').attr('id');

		if (typeof entryId !== typeof undefined && entryId !== false) {
			uploadData.entryId = entryId;
			uploadData.curataId = curataId;

			let imageBlock = uploadData.imageBlock;
			delete uploadData.imageBlock;

			$.ajax({
				url: '/' + coreURL + '/saveFileReference',
				type: 'POST',
				data: JSON.stringify(uploadData),
				processData: false,
				contentType: 'application/json',
				success: function(data) {
					let imageKey = uploadData.fileName;
					let imageURL = uploadData.fileURL;
					imageBlock.attr('data-image-key', imageKey);
					imageBlock.attr('data-image-url', imageURL);
					$('.createEntry__space').text("Create entry");
					$('.createEntry__space').css("background-color", "#673ab7");
				},
				error: function(err) {
					console.log("Could not save file reference.", err);
					$('.createEntry__space').text("Create entry");
					$('.createEntry__space').css("background-color", "#673ab7");
				}
			})
		} else {

			// create entry, setup entryId, then save reference
			let data = {}
			let entryCreator = $('.createEntryModal__space');
			let dateCreated = new Date();

			let listId = $('.entryCurrentListSelector__space').attr('data-listId');
			let currentCategoryObject = entryCreator.find('.current');
			let entryCategory = currentCategoryObject.text();
			let entryCategoryId = currentCategoryObject.attr('data-value');
			let entryTitle = entryCreator.find('.entryTitle__space').val();
			let entryDescription = entryCreator.find('.postDescription').val();
			let entryLink = entryCreator.find('.entryLink').val();
			let imageKey = uploadData.fileName;
			let imageURL = uploadData.fileURL;

			data.entryCategory = entryCategory;
			data.entryCategoryId = entryCategoryId;
			data.entryTitle = entryTitle;
			data.entryDescription = entryDescription;
			data.entryLink = entryLink;
			data.imageKey = imageKey;
			data.imageURL = imageURL;
			data.dateCreated = dateCreated;
			data.curataId = curataId;

			data.listId = listId;

			$.ajax({
				data: data,
				type: 'POST',
				url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/newDraft',
				success: function(response) {
					console.log("Yoho! Successfully created draft!");
					$('.modalEntryId').attr('id', response.entryId);
					entryId = response.entryId;

					uploadData.entryId = entryId;
					uploadData.curataId = curataId;

					let imageBlock = uploadData.imageBlock;
					delete uploadData.imageBlock;

					$.ajax({
						url: '/' + coreURL + '/saveFileReference',
						type: 'POST',
						data: JSON.stringify(uploadData),
						processData: false,
						contentType: 'application/json',
						success: function(data) {
							console.log("Successfully uploaded image.");
							$('.createEntry__space').text("Create entry");
							$('.createEntry__space').css("background-color", "#673ab7");
							let imageKey = uploadData.fileName;
							let imageURL = uploadData.fileURL;
							imageBlock.attr('data-image-key', imageKey);
							imageBlock.attr('data-image-url', imageURL);
						},
						error: function(err) {
							console.log("Could not save file reference.", err);
							$('.createEntry__space').text("Create entry");
							$('.createEntry__space').css("background-color", "#673ab7");
						}
					})
				},
				error: function(err) {
					console.log("Arrghh! Failed to create draft!");
					$('.createEntry__space').text("Create entry");
					$('.createEntry__space').css("background-color", "#673ab7");
				}
			})

		}
	}

	function uploadFile(file, signedRequest, url, uploadData) {

		$.ajax({
			url: signedRequest,
			type: 'PUT',
			processData: false,
			contentType: false,
			data: file,
			success: function(data) {
				saveFileReference(uploadData);
			},
			error: function(err) {
				console.log("Could not upload file", err);
				$('.createEntry__space').text("Create entry");
				$('.createEntry__space').css("background-color", "#673ab7");
			}
		})
	}

	function getSignedRequest(file, uploadData) {
		// const fileName = file.name + '-' + Date.now().toString();
		// to not need to parse strings or remove spaces, etc:
		const fileName = Date.now().toString();
		const fileType = file.type;

		$.ajax({
			url: '/' + coreURL + `/sign-s3?file-name=${fileName}&file-type=${file.type}`,
			type: 'GET',
			data: {
				fileName: fileName,
				fileType: fileType
			},
			processData: false,
			contentType: false,
			success: function(data) {
				const response = data.returnData;
				const signedRequest = response.signedRequest;
				const responseURL = response.url;
				uploadData.fileName = data.fileName;
				uploadData.fileURL = response.url;
				uploadFile(file, signedRequest, responseURL, uploadData);
			},
			error: function(err) {
				console.log("Could not get signed URL.", err);
				$('.createEntry__space').text("Create entry");
				$('.createEntry__space').css("background-color", "#673ab7");
			}
		})
	}


 });