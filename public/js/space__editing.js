 $(document).ready(function () { 

	let deletionModal = $('.emptyModal');
	let trashedModal = $('.trashedModal');
	let anyModal = $('.anyModal');
 	let userId = $('.userId').attr('id');
	let username = $('.userId').attr('data-username');
 	const coreURL = 'dashboard';
 	let creatingEntry = false;

	let curataId = $('.curataId').attr('id');
	let entryId = $('.entryContainer__space').attr('id');

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

	function initFullPageEditorLink() {

	}

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

	function initHideShowMoreOptions() {
		$('.entryShowHideMoreOptions__space').off('click');
		$('.entryShowHideMoreOptions__space').on('click', function() {
			$('.createEntryModalActionButton__space').toggle();
		})
	}
	initHideShowMoreOptions();

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
			anyModal.hide();
			restoreURL();
		})
		$('.modalBackground').off('click');
		$('.modalBackground').on('click', function() {
			creationModal.hide();
			anyModal.hide();
			restoreURL();
		})

		// Press esc key to hide
		$(document).keydown(function(event) { 
		  if (event.keyCode == 27) { 
		  	if (creationModal.length) {
		  		let modalState = creationModal.css('display');
			  	if (modalState == "block") {
					  creationModal.hide();
					  anyModal.hide();
					  restoreURL();
			  	}
		  	}
		  }
		});

	}
	initAddNewList();

	function initClearEntry() {
		$('.entryClear__space').off('click');
		$('.entryClear__space').on('click', function() {
			clearEntryCreation();
		})
	}
	initClearEntry();

	function clearEntryCreation() {
		$('.entryInput__space').off('input');
		$('.createEntryModal__space').find('input, textarea').val('');
		$('.entryContainer__space').removeAttr('id');
		$('.selected').removeClass('selected');
		$('.doNotSortMe').addClass('selected');
		let noneSelection = $('.noneSelection__space').attr('data-display-text');
		$('.dropdown').find('.currentCategorySelection').text(noneSelection);
		$('.dropdown').find('.currentCategorySelection').removeAttr('data-categoryId');
		let noCategory = $('.noneSelection__space').val();
		$('.selector__space').val(noCategory).trigger('change');
		let image = $('.imageBlock');
		image.removeAttr('data-image-key');
		image.removeAttr('data-image-url');
		$('.file-upload-input').replaceWith($('.file-upload-input').clone());
		$('.file-upload-content').hide();
		$('.image-upload-wrap').show();
		enableImageUpload();
		initInputListening();
		turnOffSaveDraftAndExit();
	}

	function checkIfModal() {
		let modalCheck = $('.modalEntryId').length;
		return modalCheck;
	}

	function initSaveDraftAndExit() {
		let saveDraftButton = $('.entrySaveDraft__space');

		let hiddenCheck = saveDraftButton.hasClass('hidden');
		if (hiddenCheck) {
			saveDraftButton.removeClass('hidden');
		}
		$('.createEntry__space').css("margin-left", "unset");

		saveDraftButton.off('click');
		saveDraftButton.on('click', function() {
			let entryCheck = checkIfEntryExists();
			if (entryCheck) {
				updateEntry();
			}

			let modalCheck = checkIfModal();
			if (modalCheck) {
				$('.emptyModal').hide();
				clearEntryCreation();
			} 
		});
	}

	function turnOffSaveDraftAndExit() {
		$('.createEntry__space').css("margin-left", "auto");
		let saveDraftButton = $('.entrySaveDraft__space');
	
		let hiddenCheck = saveDraftButton.hasClass('hidden');
		if (!hiddenCheck) {
			saveDraftButton.addClass('hidden');
		}
		saveDraftButton.off('click');
	}


	function initEntryTrashing() {
		// when trashed:
			// change entry state
			// close and clear current modal, whether view mode or create mode
			// then for viewing trashed entry, I can have another modal without doing magical changes with javascript that I can open quickly
		trashedModal.show();
		$('.entryOptionsContainer__space').hide();
		$('.statusMessage').hide();
		$('.entryCurrentListContainer__space').hide();
		$('.cancelListCreating').css("margin-left", "auto");
		// convert all inputs to non-editable, view-only content
		// 
	}

	function initUpdatingDraftDiv() {
		// on typing entries, any changes to content should be reflected, including if it later has meta data stored inside it (as also  with different entry designs, sometimes summary or other details are shown, other times not)
		// turn this off when clearing modal
		// turn this off when creating/publishing
		// turn this off when saving draft & closing

		// actually at the end of typing, push update manually
	}

	function initEntryModalFunctions(listId, entryId) {
		let fullPageLink = $('<a>', {'class': 'createEntryModalActionButton__space entryFull__space block hide' , 'href': '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId + '/editing'});

		fullPageLink.text("Full page editor");
		
		let clearEntry = $('.entryClear__space');
		if (clearEntry.is(":visible")) {
			// hide all modal action buttons (idientified by class below)
			$('.createEntryModalActionButton__space').toggle();
		}
		
		$('.entryFull__space').replaceWith(fullPageLink);
		
		let draftDeleter = $('<div>', {'class': 'directDeleteDraft__space createEntryModalActionButton__space hide'});
		draftDeleter.text("Delete draft");
		$('.entryOptionsContainer__space').append(draftDeleter);
		
		initDraftDeleting();
	}
	

	function appendDraft(response, listId) {

		let newEntry = $('<div>', {'class': 'entry__liveCurata', 'data-entrystate': 'Draft', 'id': response.entryId});
		let entryTitleBlock = $('<a>', {'class': 'entryTitle__liveCurata'})
		entryTitleBlock.text(response.entry.entryTitle || "Untitled entry");
		newEntry.append(entryTitleBlock);
		if (response.entry.entryImageKey && response.entry.entryImageURL) {
			let entryImageBlock = $('<div>', {'class': 'curataEntryImage'})
			entryImageBlock.attr("data-image-key", response.entry.entryImageKey);
			entryImageBlock.attr("data-image-url", response.entry.entryImageURL);
			entryImageBlock.css("background-image", "url(" + response.entry.entryImageURL + ")");
			newEntry.append(entryImageBlock);
		}

		// decide whether should be hidden or not
		let state = checkCurrentState();

		if (state !== "Draft") {
			newEntry.addClass('hidden');
		} 

		$('#' + listId).append(newEntry);
	}

	function checkCurrentState() {
		// check if current tab/focus to decide whether to hide appended entry/draft;
		let state = $('.currentState').attr('data-statetype');
		return state;
	}

	function setupEntryData() {
		let data = {}
		let entryCreator = $('.entryContainer__space');
		// what if no list? (e.g. person removes manually, doesn't load properly, but there should always be some list, e.g. then it takes from default list in database) -- just check on backend
		let dateCreated = new Date();
		let listId = $('.entryCurrentListSelector__space').data('listid') || $('.listId').data('listid');
		let currentCategoryObject = entryCreator.find('.currentCategorySelection');
		let entryCategory = currentCategoryObject.text();
		let entryCategoryId = currentCategoryObject.attr('data-categoryid');
		let entryTitle = entryCreator.find('.entryTitle__space').val();
		let entryText = entryCreator.find('.postDescription').val();
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
		data.entryText = entryText;
		data.entryLink = entryLink;
		data.dateCreated = dateCreated;
		data.curataId = curataId;
		data.listId = listId;

		return data;
	}

	function postCreatingDraftSuccessFunctions(response, listId) {
		console.log("Yoho! Successfully created new entry!");
		let newEntry = $('<div>', {'class': 'entry__liveCurata', 'id': response.entryId});
		let entryTitleBlock = $('<a>', {'class': 'entryTitle__liveCurata'})
		entryTitleBlock.text(response.entry.entryTitle || "Untitled entry");
		newEntry.append(entryTitleBlock);
		if (response.entry.entryImageKey && response.entry.entryImageURL) {
			let entryImageBlock = $('<div>', {'class': 'curataEntryImage'})
			entryImageBlock.attr("data-image-key", response.entry.entryImageKey);
			entryImageBlock.attr("data-image-url", response.entry.entryImageURL);
			entryImageBlock.css("background-image", "url(" + response.entry.entryImageURL + ")");
			newEntry.append(entryImageBlock);
		}
		console.log("listid: ", listId);
		$('#' + listId).append(newEntry);
		deletionModal.hide();
		clearEntryCreation();
		$('.statusMessage').text("Draft created.");
		creatingEntry = false;
		// find appropriate list by id
		// create divs w/content
		// append div to list
	}

	// modal only
	function initCreateEntry() {
		$('.createEntry__space').off('click');
		$('.createEntry__space').on('click', function() {

			let entryCheck = checkIfEntryExists();
			if (entryCheck) {
				let entryButton = $(this);
				let entryCreator = entryButton.closest('.createEntryModal__space');
	
				let listId = $('.entryCurrentListSelector__space').attr('data-listId');
				let entryId = $('.entryContainer__space').attr('id');
				$.ajax({
					type: 'POST',
					url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId + '/publish',
					success: function(response) {
						console.log("Yoho! Successfully published entry!");
						let newEntry = $('<div>', {'class': 'entry__liveCurata', 'id': entryId});
						let entryTitleBlock = $('<a>', {'class': 'entryTitle__liveCurata'})
						entryTitleBlock.text(response.entry.entryTitle);
						newEntry.append(entryTitleBlock);
						if (response.entry.entryImageKey && response.entry.entryImageURL) {
							let entryImageBlock = $('<div>', {'class': 'curataEntryImage'})
							entryImageBlock.attr("data-image-key", response.entry.entryImageKey);
							entryImageBlock.attr("data-image-url", response.entry.entryImageURL);
							entryImageBlock.css("background-image", "url(" + response.entry.entryImageURL + ")");
							newEntry.append(entryImageBlock);
						}
						console.log("listid: ", listId);
						$('#' + listId).append(newEntry);
						deletionModal.hide();
						clearEntryCreation();
					},
					error: function(err) {
						console.log("Arrghh! Failed to publish entry!");
					}
				})				
			} else if (creatingEntry == true) {
				return console.log("Previous entry or draft creation is still in progress.");
			} else {
				// if entry already exists but is draft, just send call to publish and then return to add dynamically
				$('.statusMessage').text("Creating draft...");
				creatingEntry = true;
				let data = setupEntryData();
				let listId = data.listId;

				$.ajax({
					data: data,
					type: 'POST',
					url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/newEntry',
					success: function(response) {
						postCreatingDraftSuccessFunctions(response, listId);
					},
					error: function(err) {
						$('.statusMessage').text("Failed to create draft.");
						creatingEntry = false;
					}
				})
			}
		})
	}
	initCreateEntry();

	function hideShowListsWithCurrentStateEntries(newState) {
		// hide all lists
		// for each list, find entries and their state
			// if list has any correct match entries, show

		let allLists = $('.listContainer__liveCurata');
		allLists.hide();
		allLists.each(function(i, obj) {
			let listContainer = $(obj);
			let list = listContainer.children('.list__liveCurata');

			// if list has element with newState attr equivalent, show / remove hidden
			if (list.children('div[data-entrystate=' + newState + ']').length > 0) {
				listContainer.removeClass('hidden');
				listContainer.show();
			}
		});
		
	}

	function hideShowEntriesByCurrentState(newState) {
		let allEntries = $('.entry__liveCurata');
		allEntries.hide();
		allEntries.each(function(i, obj) {
			let entry = $(obj);
			let entryAttr = entry.attr('data-entryState');
			console.log("attttr", entryAttr);
			if (entryAttr == newState) {
				entry.removeClass('hidden');
				entry.show();
			}
		})
	}

	function initEntryStateChange() {
		$('.entryStateSelector').off('click');
		$('.entryStateSelector').on('click', function() {
			$('.entryStateSelector').removeClass('currentState');
			let clickObject = $(this);
			clickObject.addClass('currentState');

			let newState = clickObject.attr('data-stateType');

			hideShowListsWithCurrentStateEntries(newState);

			hideShowEntriesByCurrentState(newState);

		})
	}
	initEntryStateChange();

	function createNewDraft(uploadData=0) {
		$('.statusMessage').text("Creating draft...");
		creatingEntry = true;
		let data = setupEntryData();
		let listId = data.listId;

		let uploadingImage = false;
		if (uploadData !== 0) {
			uploadingImage = true;
		}

		if (uploadingImage) {
			let imageKey = uploadData.fileName;
			let imageURL = uploadData.fileURL;
			data.imageKey = imageKey;
			data.imageURL = imageURL;
		}

		$.ajax({
			data: data,
			type: 'POST',
			url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/newDraft',
			success: function(response) {
				// check context, if full editor or quick-editor
				let entryId = response.entryId;
				$('.entryContainer__space').attr('id', entryId);

				let modalCheck = checkIfModal();
				if (modalCheck) {
					appendDraft(response, listId);
					initEntryModalFunctions(listId, entryId);
					initHideShowMoreOptions();
					initSaveDraftAndExit();
				} else {
					checkIfBlankEntry();
				}
				
				changeURL(entryId, listId)
				//initDraftTrashing();
				updateEntry();
				$('.statusMessage').text("Draft created.");
				creatingEntry = false;

				if (uploadingImage) {
					saveReference(entryId, uploadData);
				}
			},
			error: function(err) {
				revertEntryButton();
				$('.statusMessage').text("Failed to create draft.");
				creatingEntry = false;
			}
		})
	}

	function checkIfEntryExists() {
		let entryId = $('.entryContainer__space').attr('id');
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

	function checkIfBlankEntry() {
		let publishButton = $('.publishEntry');
		let publishAttr = publishButton.attr('disabled');

		if (publishAttr) {
			convertIntoEditor();
		}
	}

	function changeURL(entryId, listId) {
		if (history.pushState) {
			window.history.pushState('object or string', 'Title', '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId + '/editing');
		} else {
			// support for browsers not supporting pushState
			document.location.href = '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId + '/editing';
		}
	} 


	function restoreURL() {
		let url = window.location.href;
		let origin = window.location.origin;
		let dashboardPath = '/' + coreURL + '/curatas/' + curataId;
		let dashboardURL = origin + dashboardPath;
		if (url !== dashboardURL) {
			if (history.pushState) {
				window.history.pushState('object or string', 'Title', dashboardPath);
			} else {
				// support for browsers not supporting pushState
				document.location.href = dashboardPath;
			}
		}
	}

	// CONVERTING NEW ENTRY INTO DRAFT WITH INDICATORS
	// - upon creating draft, activate and enable Publish button (disabled by default)
	// - show and activate Preview button
	// - give Preview button a href link
	// - show and activate Move to Trash button
	// - show draft 'status' section in Settings section
	// - push url
	// - push different url's, in one case for the 'quick-editor' url, other the full page editor

	function convertIntoEditor() {
		let publishButton = $('.publishEntry');
		let previewButton = $('.showPreview');
		let trashSection = $('.entrySettingsDelete');
		let entryId = $('.entryContainer__space').attr('id');

		publishButton.removeAttr('disabled');
		publishButton.css('opacity', '');
		publishButton.css('cursor', 'pointer');

		previewButton.removeClass('hidden');
		previewButton.attr('href', '/dashboard/drafts/' + entryId);
		trashSection.removeClass('hidden');

		$('.settingsDraftBlock').removeClass('hidden');

	}

	function initDraftDeleting() {
		$('.directDeleteDraft__space').off('click');
		$('.directDeleteDraft__space').on('click', function() {
			
			let clickObject = $(this);
			let data = {};
			let entryId = $('.entryContainer__space').attr('id');
			let listId = $('.entryCurrentListSelector__space').attr('data-listId');

			data.entryId = entryId;
			data.listId = listId;

			$.ajax({
				data: data,
				type: 'DELETE',
				url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId + '/deleteEntry',
				success: function(response) {
					console.log("Yoho! Updated entry!");
					console.log(response.message);
					clearEntryCreation();
					clickObject.remove();
				},
				error: function(err) {
					console.log("Arrghh! Failed to create draft!");
					console.log(err.errors[0]);
				}
			})

		})
	}

	function showOrUpdateLinkPreview() {
		let container = $('.linkContainer');
		let link = container.find('.entryLink').val();
		let linkPreview = container.find('.entryLinkPreview');
		let parsedLink = (link.indexOf('://') === -1) ? 'http://' + link : link;

		let hiddenCheck = linkPreview.hasClass('hidden');
		if (hiddenCheck) {
			linkPreview.removeClass('hidden');
		}

		linkPreview.attr('href', parsedLink);
	}

	function updateEntry() {
		$('.statusMessage').text("Saving...");

		let data = setupEntryData();

		let entryCreator = $('.entryContainer__space');
		let entryId = entryCreator.attr('id');
		data.entryId = entryId;
		let listId = data.listId;

		showOrUpdateLinkPreview()

		$.ajax({
			data: data,
			type: 'POST',
			url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId + '/updateEntry',
			success: function(response) {
				$('.statusMessage').text("Saved.");
			},
			error: function(err) {
				$('.statusMessage').text("Save failed.");
			}
		})
	}

	// #2
	let typingTimer;                //timer identifier

	function createOrUpdateEntry() {
		let doneTypingInterval = 2000;  //time in ms 
		if (typingTimer) {
			clearTimeout(typingTimer);
		}
		if (creatingEntry == true) {
			return;
		} else {
			typingTimer = setTimeout(function() {
				let entryExists = checkIfEntryExists();
				console.log('entry status', entryExists)
				if (entryExists) {
					updateEntry();
				} else {
					createNewDraft();
				}
			}, doneTypingInterval);
		}
	}

	function initInputListening() {
		$('.entryInput__space').off('input');
		$('.entryInput__space').on('input', function() {
			createOrUpdateEntry();
		})

		$('.selector__space').off('change');
		$('.selector__space').on('change', function() {
			let entryCheck = checkIfEntryExists();
			if (entryCheck) {
				updateEntry();
			}
		});
	}
	initInputListening();

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
			let imageName = $(this).prop('files')[0].name;

			const imageBlock = $(this).closest('.imageBlock');
			const dateUpdated = new Date();

			let uploadData = {};
			uploadData.imageBlock = imageBlock;
			uploadData.dateUpdated = dateUpdated;
			uploadData.imageName = imageName;

			if (file === null) {
				revertEntryButton();
				return alert('No file selected.');
			}

			getSignedRequest(file, uploadData);

		});
	}

	function revertEntryButton() {
		let createEntryButton = $('.createEntry__space');
		createEntryButton.text("Create entry");
		createEntryButton.css("background-color", "#673ab7");		
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
		})
	}
	enableImageDelete();

	function disableImageDelete() {
		$('.remove-image').off('click');
	}

	function launchUploadingIcon() {

	}

	function toggleImageTitle() {
		$('.image-pre-title').toggle();
		$('.image-title').toggle();
		$('.image-uploading-title').toggle();

		let imageUploadingButton = $('.remove-image');
		if (!imageUploadingButton.hasClass('disabled'))  { 
			imageUploadingButton.css('opacity', '0.6');
			imageUploadingButton.css('cursor', 'not-allowed');
			imageUploadingButton.addClass('disabled');
		} 
		else { 
			imageUploadingButton.css('opacity', '');
			imageUploadingButton.css('cursor', 'pointer');
			imageUploadingButton.removeClass('disabled');
		}
		
	}

	function readURL(input) {
	  if (input.files && input.files[0]) {

	    var reader = new FileReader();

	    reader.onload = function(e) {
			$('.image-upload-wrap').hide();

			$('.file-upload-image').attr('src', e.target.result);
			$('.file-upload-content').show();

			toggleImageTitle();

			$('.image-title').html(input.files[0].name);
	    };

	    reader.readAsDataURL(input.files[0]);
	    return 

	  } else {
	    removeUpload(input);
	  }
	}

	function removeUpload(obj) {
		console.log("Beginning image delete.");
		let entryId = $('.entryContainer__space').attr('id');
		if (typeof entryId == typeof undefined || entryId == false) {
			return console.log("Entry does not exist yet or entry id is not available.");
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
    			image.removeAttr('data-image-url');
				$('.file-upload-input').replaceWith($('.file-upload-input').clone());
				$('.file-upload-content').hide();
				$('.image-upload-wrap').show();
				disableImageDelete();
    			enableImageUpload();
				revertEntryButton();
    		},
    		error: function(err) {
    			enableImageUpload();
				imageError("Failed to delete image from database.", err)
    			// Display error not being able to delete note
    		}
    	});
	}

	function saveFileReferenceSuccess(uploadData, imageBlock) {
		console.log("Successfully uploaded image.");
		revertEntryButton();
		let imageKey = uploadData.fileName;
		let imageURL = uploadData.fileURL;
		imageBlock.attr('data-image-key', imageKey);
		imageBlock.attr('data-image-url', imageURL);
		toggleImageTitle();
		enableImageDelete();		
	}

	function saveReference(entryId, uploadData) {
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
				saveFileReferenceSuccess(uploadData, imageBlock);
			},
			error: function(err) {
				imageError("Could not save file reference.", err);
			}
		})
		
	}

	function saveFileReference(uploadData) {

		let entryId = $('.entryContainer__space').attr('id');

		if (typeof entryId !== typeof undefined && entryId !== false) {
			saveReference(entryId, uploadData);
		} else {
			createNewDraft(uploadData);
		}
	}

	function imageError(consoleText, err) {
		console.log(consoleText, err);
		revertEntryButton();
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
				imageError("Failed to upload file.", err);
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
				imageError("Could not get signed URL.", err);
			}
		})
	}




	// function initEntryLinkSave() {
	// 	$('.entryLink').off('input change');
	// 	$('.entryLink').on('input change', function() {

			// let link = $(this).val();
			// let container = $(this).closest('.linkContainer');
			// let linkPreview = container.find('.entryLinkPreview');
			// let parsedLink = (link.indexOf('://') === -1) ? 'http://' + link : link;
			// let dateUpdated = new Date();

			// let hiddenCheck = linkPreview.hasClass('hidden');
			// if (hiddenCheck) {
			// 	linkPreview.removeClass('hidden');
			// }

			// linkPreview.attr('href', parsedLink);
			// // linkPreview.text(parsedLink);

	// 		$.ajax({
	// 		  data: {
	// 		    entryLink: parsedLink,
	// 		    entryId: entryId,
	// 		    dateUpdated: dateUpdated
	// 		  },
	// 		  type: 'POST',
	// 		  url: '/' + coreURL + '/UpdateEntryLink',
	// 		  success: function(Item){
	// 		    console.log("Entry link successfully updated.")
	// 		    // Display success message?

	// 		  },
	// 		  error: function(err){
	// 		    console.log("Entry link update failed: ", err);
	// 		    // Display error message?
	// 		  }
	// 		});
	// 	})
	// }
	// initEntryLinkSave();

	function initEntryLinkExit() {
		$('.EntryLink').off('keyup');
		$('.EntryLink').on('keyup', function(event) {
			$(this).val($(this).val().replace(/[\r\n\v]+/g, ''));
		})

		$('.EntryLink').off('keypress');
		$('.EntryLink').on('keypress', function(event) {
			if (event.keyCode === 13) {
				event.preventDefault();
				$(this).blur();
			}
		})

		$('.EntryLink').on('keypress', function(event) {
		    if(event.which === 32) 
		        return false;
		});
	}
	initEntryLinkExit();


	// function initDescriptionListening(descElement, ajaxURL, ajaxType, group) {
	// 	descElement.on('input selectionchange propertychange', function() {

	// 		let content = $(this).val();
	// 		let data = {};
	// 		const dateUpdated = new Date();

	// 		if (group == "entryDescription") {
	// 			data.entryText = content;
	// 			data.entryId = entryId;
	// 			data.dateUpdated = dateUpdated;
	// 		}

	// 		$.ajax({
	// 			data: data,
	// 			type: ajaxType,
	// 			url: '' + ajaxURL,
	// 			success: function(data) {
	// 				console.log("Update successful");
	// 			},
	// 			error: function(err) {
	// 				console.log("Update failed:", err);
	// 			}
	// 		})

	// 	})
	// }

	// let entryDescription = $('.postDescription')
	// let entryDescriptionURL = '/' + coreURL + '/UpdateEntryText'
	// initDescriptionListening(entryDescription, entryDescriptionURL, 'POST', 'entryDescription')


 });