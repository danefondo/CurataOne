 $(document).ready(function () { 

	let deletionModal = $('.emptyModal');
	let trashedModal = $('.trashedModal');
	let anyModal = $('.anyModal');
 	let userId = $('.userId').attr('id');
	let username = $('.userId').attr('data-username');
 	const coreURL = 'dashboard';
	let creatingEntry = false;
	let entryBeingUpdated = false;

	let entryContainerSpace = $('.entryForm');
	let trashContainer = $('.trashForm');

	let curataId = $('.curataId').attr('id');
	let entryId = entryContainerSpace.attr('data-entryformid');

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

	function initFullPageEditorLink(listId, entryId) {
		let fullPageLink = $('<a>', {'class': 'createEntryModalActionButton__space entryFull__space block hide' , 'href': '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId + '/editing'});

		fullPageLink.text("Full page editor");
		
		let clearEntry = $('.entryClear__space');
		if (clearEntry.is(":visible")) {
			// hide all modal action buttons (idientified by class below)
			$('.createEntryModalActionButton__space').toggle();
		}
		
		$('.entryFull__space').replaceWith(fullPageLink);
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

	// can define divs in variables and reuse here and call by need
	function clearEntryCreation() {
		// 1. Identify and check that correct modal and form
		// 2. Clear all input fields
		// 3. Clear textarea
		// 4. Clear category
		// 5. Clear image
		// 6. Clear link input and link
		// 7. Remove 'save & exit' or 'save draft & exit'
		// 8. Remove 'trash' button
		// 9. Remove 'preview' or 'view live' button
		// 10. Reset list to default
		// 11. Remove saved indicator
		// 12. Reset 'full page editor' link
		// 13. Remove entryId from modal form
		let createEntryModal = $('.createEntryModal__space');
		let entryFormBlock = $('.entryForm');

		let entryInput = entryFormBlock.find('.entryInput__space');
		entryInput.off('input');

		let linkPreview = createEntryModal.find('.entryLinkPreview');

		createEntryModal.find('input, textarea').val('');
		createEntryModal.find('.entryLinkPreview').removeAttr('href');
		let hiddenCheck = linkPreview.hasClass('hidden');
		if (!hiddenCheck) {
			linkPreview.addClass('hidden');
		}
		entryFormBlock.removeAttr('data-entryformid');
		$('.selected').removeClass('selected');
		$('.doNotSortMe').addClass('selected');
		let noneSelection = $('.noneSelection__space').attr('data-display-text');
		let categoryDropdown = entryFormBlock.find('.dropdown');
		categoryDropdown.find('.currentCategorySelection').text(noneSelection);
		categoryDropdown.find('.currentCategorySelection').removeAttr('data-categoryId');
		let noCategory = $('.noneSelection__space').val();
		let selectorSpace = entryFormBlock.find('.selector__space');
		selectorSpace.val(noCategory).trigger('change');

		let image = entryFormBlock.find('.imageBlock');
		image.removeAttr('data-image-key');
		image.removeAttr('data-image-url');
		let fileUploadInput = entryFormBlock.find('.file-upload-input');
		let fileUploadClone = fileUploadInput.clone();
		fileUploadInput.replaceWith(fileUploadClone);
		let fileUploadContent = entryFormBlock.find('.file-upload-content');
		fileUploadContent.hide();
		let fileUploadWrap = entryFormBlock.find('.image-upload-wrap');
		fileUploadWrap.show();
		enableImageUpload();

		initInputListening();
		turnOffSaveDraftAndExit();
		$('.directTrashDraft__space').remove();
		
		let clearEntry = $('.entryClear__space');
		if (clearEntry.is(":visible")) {
			// hide all modal action buttons (idientified by class below)
			$('.createEntryModalActionButton__space').toggle();
		}
		
		let listId = $('.entryCurrentListSelector__space').attr('data-listid');
		$('.entryFull__space').attr('href', '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/new');
		$('.statusMessage').css("color", "#777");
		$('.statusMessage').text("");
	}

	function checkIfModal() {
		let modalCheck = $('.modalEntryId').length;
		return modalCheck;
	}

	function checkWhichModal() {
		let result = "N/A";
		let modalCheck = $('.newEntryModal');
		if (modalCheck.css('display')  == 'block')  {
			result = "newEntryModal";
		}
		return result;
	}

	function initSaveAndExit() {
		let saveDraftButton = $('.entrySaveAndExit__space');

		let hiddenCheck = saveDraftButton.hasClass('hidden');
		if (hiddenCheck) {
			saveDraftButton.removeClass('hidden');
		}

		saveDraftButton.off('click');
		saveDraftButton.on('click', function() {
			let entryCheck = checkIfEntryExists();
			if (entryCheck) {
				updateEntry();
			}

			let modalCheck = checkIfModal();
			if (modalCheck) {
				$('.anyModal').hide();
				clearModals();
			} 
		});
	}

	function initSaveDraftAndExit() {
		let saveDraftButton = $('.entrySaveDraftAndExit__space');

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
		let saveDraftButton = $('.entrySaveDraftAndExit__space');
	
		let hiddenCheck = saveDraftButton.hasClass('hidden');
		if (!hiddenCheck) {
			saveDraftButton.addClass('hidden');
		}
		saveDraftButton.off('click');
	}

	function initUpdatingDraftDiv() {
		// on typing entries, any changes to content should be reflected, including if it later has meta data stored inside it (as also  with different entry designs, sometimes summary or other details are shown, other times not)
		// turn this off when clearing modal
		// turn this off when creating/publishing
		// turn this off when saving draft & closing

		// actually at the end of typing, push update manually
	}

	function initAddingTrashButton() {
		let draftTrasher = $('<div>', {'class': 'directTrashDraft__space createEntryModalActionButton__space hide'});
		draftTrasher.text("Trash");
		$('.entryClear__space').after(draftTrasher);
		
		initEntryTrashing();
	}

	function initEntryModalFunctions(listId, entryId) {
		initFullPageEditorLink(listId, entryId)
		initAddingTrashButton();
	}

	function appendDataToTrash(entryData) {
		entryData = setupEntryData();
		entryData.entryId = entryId;
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
		// init box changes updating
	}

	function checkCurrentState() {
		// check if current tab/focus to decide whether to hide appended entry/draft;
		let state = $('.currentState').attr('data-statetype');
		return state;
	}

	function setupEntryData() {
		let data = {}
		let entryCreator = $('.entryForm');
		// what if no list? (e.g. person removes manually, doesn't load properly, but there should always be some list, e.g. then it takes from default list in database) -- just check on backend
		let dateCreated = new Date();
		let listId = $('.entryCurrentListSelector__space').data('listid') || $('.listId').data('listid');
		let currentCategoryObject = entryCreator.find('.currentCategorySelection');
		let entryCategory = currentCategoryObject.text();
		let entryCategoryId = currentCategoryObject.attr('data-categoryid');
		let entryTitle = entryCreator.find('.entryTitle__space').val();
		let entryText = entryCreator.find('.postDescription').val();
		let entryLink = entryCreator.find('.entryLink').val();

		console.log("entrycat", entryCategory);

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

		console.log("entrycat2", data.entryCategory);

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
				let entryId = entryContainerSpace.attr('data-entryformid');
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

	function initPreviewIcon(entryId) {
		console.log("how he f am i herre")
		$('.entryCurrentListContainer__space').css('margin-left', '10px');
		$('.entryPreviewLink').removeClass('hidden');
		$('.entryPreviewLink').attr('href', '/dashboard/drafts/' + entryId);		
	}

	function createNewDraft(uploadData=0) {
		console.log("wtf");
		$('.statusMessage').css("color", "#777");
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
				entryContainerSpace.attr('data-entryformid', entryId);

				let modalCheck = checkIfModal();
				if (modalCheck) {
					appendDraft(response, listId);
					initEntryModalFunctions(listId, entryId);
					initHideShowMoreOptions();
					initSaveDraftAndExit();
					initPreviewIcon(entryId);
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
				$('.statusMessage').css("color", "red");
				creatingEntry = false;
			}
		})
	}

	function checkIfEntryExists() {
		let entryId = entryContainerSpace.attr('data-entryformid');
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
		let entryId = entryContainerSpace.attr('data-entryformid');

		publishButton.removeAttr('disabled');
		publishButton.css('opacity', '');
		publishButton.css('cursor', 'pointer');

		previewButton.removeClass('hidden');
		previewButton.attr('href', '/dashboard/drafts/' + entryId);
		trashSection.removeClass('hidden');

		$('.settingsDraftBlock').removeClass('hidden');
		initPublishAndCreateEntry();
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
		$('.statusMessage').css("color", "#777");
		$('.statusMessage').text("Saving...");

		let data = setupEntryData();

		let entryCreator = entryContainerSpace;
		let entryId = entryCreator.attr('data-entryformid');
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
				$('.statusMessage').css("color", "red");
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
		let entryFormBlock = $('.entryForm');

		let entryInputSpace = entryFormBlock.find('.entryInput__space');
		entryInputSpace.off('input');
		entryInputSpace.on('input', function() {
			createOrUpdateEntry();
		})

		let selectorSpace = entryFormBlock.find('.selector__space');

		selectorSpace.off('change');
		selectorSpace.on('change', function() {
			let entryCheck = checkIfEntryExists();
			if (entryCheck) {
				updateEntry();
			}
		});
	}
	initInputListening();

	function checkIfMainImageExists() {
		let entryFormBlock = $('.entryForm');
		let imageCheck = entryFormBlock.find('.imageBlock').attr('data-image-key');
		if (typeof imageCheck !== typeof undefined && imageCheck !== false) {
			let imageUploadWrap = entryFormBlock.find('.image-upload-wrap');
			imageUploadWrap.hide();
			let fileUploadContent = entryFormBlock.find('.file-upload-content');
			fileUploadContent.show();
			enableImageDelete();
		} else {
			enableImageUpload();
		}
	}
	checkIfMainImageExists();

	function enableImageUpload() {
		let entryFormBlock = $('.entryForm');
		let imageUploadWrap = entryFormBlock.find('.image-upload-wrap');

		imageUploadWrap.off('dragover');
		imageUploadWrap.on('dragover', function () {
			imageUploadWrap.addClass('image-dropping');
		});

		imageUploadWrap.off('dragleave');
		imageUploadWrap.on('dragleave', function () {
			imageUploadWrap.removeClass('image-dropping');
		});

		let fileUploadButton = entryFormBlock.find('.file-upload-btn');
		let fileUploadInput = entryFormBlock.find('.file-upload-input');

		fileUploadButton.off('click');
		fileUploadButton.on('click', function() {
			fileUploadInput.trigger( 'click' );
		})

		fileUploadInput.off('change');
		fileUploadInput.on('change', function() {
			let createEntryButton = $('.createEntry__space');
			createEntryButton.text("Saving...");
			createEntryButton.css("background-color", "#b39ddb");
			createEntryButton.attr('disabled', true);

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
		createEntryButton.prop('disabled', false);		
	}

	function enableImageDelete() {
		let entryFormBlock = $('.entryForm');
		let removeImage = entryFormBlock.find('.remove-image');
		removeImage.off('click');
		removeImage.on('click', function() {
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
		let entryFormBlock = $('.entryForm');
		let imagePreTitle = entryFormBlock.find('.image-pre-title');
		let imageTitle = entryFormBlock.find('.image-title');
		let imageUploadingTitle = entryFormBlock.find('.image-uploading-title');
		imagePreTitle.toggle();
		imageTitle.toggle();
		imageUploadingTitle.toggle();

		let imageUploadingButton = entryFormBlock.find('.remove-image');
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
		let entryId = entryContainerSpace.attr('data-entryformid');
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

		let entryId = entryContainerSpace.attr('data-entryformid');

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

	function initPublishAndCreateEntry() {
		
		$('.publishEntry').off('click');
		$('.publishEntry').on('click', function() {
			let entryId = entryContainerSpace.attr('data-entryformid');

	    	$.ajax({
	    		data: {
	    			entryId: entryId
	    		},
	    		type:'POST',
	    		url: '/' + coreURL + '/PublishEntry',
	    		success: function(response) {
	    			window.location.href = response.redirectTo;
	    		},
	    		error: function(err) {
	    			console.log("Failed to publish entry: ", err);
	    			// Display error not being able to publish
	    		}
	    	});
		});
	}

	function createAndAppendCategories(entryCategory, entryCategoryId, ) {

	}

	function create_custom_dropdowns() {
		let dropdown;
		$('select').each(function(i, select) {
		  if (!$(this).next().hasClass('dropdown')) {
			$(this).after('<div class="dropdown ' + ($(this).attr('class') || '') + '" tabindex="0"><span class="currentCategorySelection"></span><div class="list"><ul class="optionList"></ul></div></div>');
			dropdown = $(this).next();
			var options = $(select).find('option');
			var selected = $(this).find('option:selected');
			dropdown.find('.currentCategorySelection').html(selected.data('display-text') || selected.text());
			options.each(function(j, o) {
			  var display = $(o).data('display-text') || '';
			  dropdown.find('ul').append('<li class="option ' + ($(o).is(':selected') ? 'selected' : '') + '" data-value="' + $(o).val() + '" data-display-text="' + display + '">' + $(o).text() + '</li>');
			});
		  }
		  dropdown = $(this).next();
		  dropdown.find('.selected').addClass('doNotSortMe');
		});
	  }

	function openPublishedOrDraft(entry, entryId, listId) {
		$('.newEntryModal').show();
		changeURL(entryId, listId);
		let entryTitle = entry.attr('data-entryTitle');
		let entryText = entry.attr('data-entryText');
		let entryLink = entry.attr('data-entryLink');
		let entryCategory = entry.attr('data-entryCategory');
		let entryCategoryId = entry.attr('data-entryCategoryId');
		let entryImageURL= entry.attr('data-entryImageURL');
		let entryImageKey= entry.attr('data-entryImageKey');
		let entryImageName = entry.attr('data-entryImageName');
		entryContainerSpace.attr('data-entryformid', entryId);
		if (entryTitle) {
			entryContainerSpace.find('.entryTitle__space').val(entryTitle);
		}
		if (entryText) {
			entryContainerSpace.find('.postDescription').text(entryText);
		}	
		if (entryLink) {
			entryContainerSpace.find('.entryLink').val(entryLink);
			entryContainerSpace.find('.entryLink').attr("href", entryLink);
		}	
		if (entryImageKey && entryImageURL) {
			entryContainerSpace.find('.imageForm').hide();
			entryContainerSpace.find('.file-upload-content').show();
			entryContainerSpace.find('.imageBlock').attr('data-image-key', entryImageKey);
			entryContainerSpace.find('.file-upload-image').attr('src', entryImageURL);
			entryContainerSpace.find('.image-title').text(entryImageName);
		}		
		if (entryCategory && entryCategoryId) {
			$('.currentCategorySelection').attr('data-categoryid', entryCategoryId);
			$('.currentCategorySelection').text(entryCategory);
		}
		initSaveAndExit()
		entryContainerSpace.closest('.sectionArea').find('.createEntry__space').hide();
		entryContainerSpace.closest('.sectionArea').find('.entrySaveAndExit__space').removeClass('hidden');

		initFullPageEditorLink(listId, entryId);
		initAddingTrashButton();
		create_custom_dropdowns();
	}
	// ENTRY EDIT PREVIEW FOR DRAFTS, PUBLISHED ENTRIES, TRASH
	$('.entry__liveCurata').off('click');
	$('.entry__liveCurata').on('click', function(e) {
		e.preventDefault();
		let entry = $(this);
		let entryId = entry.attr('id');
		let listId = entry.closest('.list__liveCurata').attr('id');
		let entryState = entry.attr('data-entrystate');

		if (entryState == "Published") {
			openPublishedOrDraft(entry, entryId, listId);
		} else if (entryState == "Draft") {

		} else if (entryState == "Trashed") {

		} else if (entryState == "Submit") {

		}


		// grab data
		// add data, images, category, list
		// append entryId
		// full page editor link
		// trash button
		// remove 'create entry' button
		// make editing possible
		// clear upon close
	})

	// CLEAR & CLOSE MODALS FUNCTIONS

	function clearPreviewModal() {
		console.log("Clearing preview modal.");
	}

	function clearTrashedModal() {
		console.log("Clearing trash modal.");
		trashContainer.find('.currentCategorySelection').text('Miscellaneous category');
		trashContainer.find('.trashTitle__space').text('No title');
		trashContainer.find('.trashDescription').text('No summary');
		trashContainer.find('.entryLink').text('No link');
		let imageBlock = trashContainer.find('.imageBlock');
		imageBlock.removeAttr('data-image-key');
		imageBlock.find('.file-upload-image').removeAttr('src');
		imageBlock.find('.image-title').text('');
		imageBlock.find('.file-upload-image').hide();
		imageBlock.find('.file-upload-content').hide();
		imageBlock.find('.trashImageForm').hide();
		imageBlock.find('.trashImageForm2').show();
		imageBlock.find('.trashImageForm2').removeClass('hidden');
		trashContainer.removeAttr('data-entryformid');
	}

	function clearModals() {
		clearTrashedModal();
		clearPreviewModal();
		clearEntryCreation();
	}

	// TRASHED FORM FUNCTIONS

	// 1. untrash
		// 1.1 change in DB
		// 1.2 change state
		// 1.3 clear all modals
		// 1.4 hide all modals
		// 1.5 hide/show as necessary
	// 2. delete
		// 2.1 remove from DB
		// 2.2 remove box
		// 2.3 close all modals
		// 2.4 clear all modals
	// 3. close modal button
		// 3.1 clear all modals
		// 3.2 close all modals

	function initEntryDeleting() {
		$('.deleteEntry').off('click');
		$('.deleteEntry').on('click', function() {
			let data = {};
			let entryId = entryContainerSpace.attr('data-entryformid');
			if (!entryId) {
				return console.log("Couldn't find entry to delete.");
			}
			let listId = $('.listId').attr('data-listId');
			data.entryId = entryId;
			data.listId = listId;

			$.ajax({
				data: data,
				type: 'DELETE',
				url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId + '/deleteEntry',
				success: function(response) {
					console.log(response.message);
					let modalCheck = checkIfModal();
					if (modalCheck) {
						let entryBox = $('#' + entryId);
						entryBox.remove();
						clearModals();
						anyModal.hide();
					} else {
						window.location.href = response.redirectTo;
					}
				},
				error: function(err) {
					console.log("Failed to delete entry.", err.errors[0]);
					// display fail message
				}
			})			
		})
	}
	initEntryDeleting();

	function initEntryTrashing() {
		$('.directTrashDraft__space').off('click');
		$('.directTrashDraft__space').on('click', function() {
			
			let clickObject = $(this);
			let data = {};
			let entryId = entryContainerSpace.attr('data-entryformid');
			let listId = $('.entryCurrentListSelector__space').attr('data-listId');

			data.entryId = entryId;
			data.listId = listId;

			$.ajax({
				data: data,
				type: 'POST',
				url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId + '/trashEntry',
				success: function(response) {
					console.log(response.message);
					let trashedEntry = $('#' + entryId);
					trashedEntry.attr('data-entrystate', 'Trashed');
					// decide whether should be hidden or not
					let state = checkCurrentState();

					if (state !== "Trashed") {
						trashedEntry.addClass('hidden');
					} 

					clearEntryCreation();
					clearPreviewModal();

					let whichModal = checkWhichModal();
					if (whichModal == "newEntryModal") {
						clickObject.remove();
					}
					anyModal.hide();

				},
				error: function(err) {
					console.log("Arrghh! Failed to create draft!");
					console.log(err.errors[0]);
				}
			})

		})
	}

	function initUntrashEntry() {
		$('.untrashEntry').off('click');
		$('.untrashEntry').on('click', function() {

			let entryId = trashContainer.attr('data-entryformid');
			if (!entryId) {
				return console.log("Couldn't find entry to trash.");
			}

	    	$.ajax({
	    		data: {
	    			entryId: entryId
	    		},
	    		type:'POST',
	    		url: '/' + coreURL + '/UntrashEntry',
	    		success: function(response) {
					let entry = $('#' + entryId);
					entry.attr('data-entrystate', 'Draft')
					let state = checkCurrentState();

					if (state !== "Draft") {
						entry.addClass('hidden');
					} 
					clearModals();
					anyModal.hide();
	    		},
	    		error: function(err) {
	    			console.log("Failed to trash entry: ", err);
	    			// Display error not being able to publish
	    		}
	    	});
		});
	}
	initUntrashEntry();

 });