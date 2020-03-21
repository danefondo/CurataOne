 $(document).ready(function () { 

	let deletionModal = $('.emptyModal');
	let trashedModal = $('.trashedModal');
	let anyModal = $('.anyModal');
 	let userId = $('.userId').attr('id');
	let username = $('.userId').attr('data-username');
 	const coreURL = 'dashboard';
	let creatingEntry = false;
	let entryBeingUpdated = false;
	let draftExit = false;

	let curataId = $('.curataId').attr('id');

	let stillEditingNewEntry = false;

	let currentModal;
	let currentModalForm;
	let currentModalType;
	let currentEntryState;

	// if not modal
	// set entire view as modal for info access
	function setModalFormAndType() {
		currentModal = $('.currentModal');

		//if (currentModal.length) {
			currentModalType = currentModal.attr('data-modaltype');

			if (currentModalType == "newEntryModal")  {
				currentModalForm = $('.entryForm');
			} else if (currentModalType == "editEntryModal")  {
				currentModalForm = $('.editForm');
			} else if (currentModalType == "trashedModal") {
				currentModalForm = $('.trashForm');
			}

		/*} else {
			currentModal = undefined;
			currentModalType = undefined;
			currentModalForm = undefined;
		}*/
	}

	function resetCurrentModal() {
		currentModal = undefined;
		currentModalType = undefined;
		currentModalForm = undefined;
	}

	// function getModalElement() {
	// 	let modal;
	// 	let modalType = checkModalType();

	// 	if (modalType == "new")  {
	// 		modal = '.newEntryModal'
	// 	} else if (modalType == "edit")  {
	// 		modal = '.editEntryModal'
	// 	} else if (modalType == "trash") {
	// 		modal = '.trashedEntryModal'
	// 	}
	// 	// submits next
	// 	return modal;
	// }

	// function getFormElement() {
	// 	let form;
	// 	let modalType = checkModalType();

	// 	if (modalType == "new")  {
	// 		form = '.entryForm'
	// 	} else if (modalType == "edit")  {
	// 		form = '.editForm'
	// 	} else if (modalType == "trash") {
	// 		form = '.trashForm'
	// 	}
	// 	// submits next
	// 	return form;
	// }

	// function checkModalType() {
	// 	let currentModal = $('.currentModal');
	// 	console.log("current", currentModal);
	// 	let modalType;
	// 	if (currentModal.length) {
	// 		console.log("made it");
	// 		modalType = currentModal.attr('data-modaltype');
	// 	}
	// 	return modalType
	// }

	function initFullPageEditorLink(listId, entryId) {

		let fullPageLink = '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId + '/editing';
		
		// let clearEntry = currentModal.find('.entryClear__space');
		// if (clearEntry.is(":visible")) {
		// 	// hide all modal action buttons (idientified by class below)
		// 	currentModal.find('.createEntryModalActionButton__space').toggle();
		// }
		
		currentModal.find('.entryFull__space').attr('href', fullPageLink)

		// initHideShowMoreOptions();
	}

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
		showHide = currentModal.find('.entryShowHideMoreOptions__space');

		let buttons = currentModal.find('.createEntryModalActionButton__space');

		showHide.off('click');
		showHide.on('click', function() {
			buttons.toggle();
		})

	}

	// to show contents
		// click entry
		// get entry id
		// open modal
		// load entry contents (ideally preloaded)

	function runModalCloseFunctions(isEditing=0) {
		if (currentModal == "newEntryModal") {
			let hiddenCheck = $('.entryStateIndicator').hasClass('hidden');
			if (!hiddenCheck) {
				currentModal.find('.entryStateIndicator').addClass('hidden');
			}			
		}
		anyModal.removeClass('currentModal');
		anyModal.hide();
		turnOffClearEntry();
		if (isEditing == 0) {
			clearModals();
		}
		if (currentModalType !== "newEntryModal") {
			clearModals();
		}
		disableDraftingEntry();
		disableSaveDraftAndExit();
		disableSaveAndExit();
		disablePublishAndCreateEntry();
		// resetCurrentModal();
	}	

	function runModalOpenFunctions(modal) {
		// show modal
		modal.show();
		anyModal.removeClass('currentModal');
		modal.addClass('currentModal');
		currentModal = modal;

		setModalFormAndType()
		currentModal.find('.entryStateIndicator').text(currentEntryState);
		let entryForm = currentModal.find('.entryForm');
		if (entryForm.attr('data-entryformid')) {
			initSaveDraftAndExit();
		}
		initClearEntry();
		initHideShowMoreOptions();
		initCreateEntry();
		checkIfMainImageExists();
		enableImageDelete();
		initEntryLinkExit();
		initUntrashEntry();
		initEntryDeleting();
		initDraftingEntry();
		initInputListening();

	}

	function initAddNewList() {
		let creationModal = $('.newEntryModal');

		$('.openListChooser__space').off('click');
		$('.openListChooser__space').on('click', function() {
			runModalOpenFunctions(creationModal);
			// handle case when modal gets closed but editing was still happening
			stillEditingNewEntry = true;
			let entryId = creationModal.find('.entryForm').attr('data-entryformid');
			let listId = creationModal.find('.entryCurrentListSelector__space').attr('data-listid');
			if (typeof entryId !== typeof undefined && entryId !== false) {
				changeURL(entryId, listId);
			}
		})

		$('.cancelListCreating').off('click');
		$('.cancelListCreating').on('click', function() {
			runModalCloseFunctions(stillEditingNewEntry);
			restoreURL();
		})
		$('.modalBackground').off('click');
		$('.modalBackground').on('click', function() {
			runModalCloseFunctions(stillEditingNewEntry);
			restoreURL();
		})

		// Press esc key to hide
		$(document).keydown(function(event) { 
		  if (event.keyCode == 27) { 
		  	if (creationModal.length) {
		  		let modalState = creationModal.css('display');
			  	if (modalState == "block") {
					runModalCloseFunctions(stillEditingNewEntry);
					restoreURL();
			  	}
		  	}
		  }
		});

	}
	initAddNewList();

	function initClearEntry() {
		currentModal.find('.entryClear__space').off('click');
		currentModal.find('.entryClear__space').on('click', function() {
			clearEntry();
		})
	}

	function turnOffClearEntry() {
		currentModal.find('.entryClear__space').off('click');
	}

	// so long as no same IDs exist simultaneously, should be possible to have just one clearEntryCreation and simply decide by the highst level unique hierarchy.

	// can define divs in variables and reuse here and call by need
	function clearEntry() {
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
		// 14. Revert URL if closing
		// 15. Change URL if just reverting to /entries/new

		turnOffInputListening();

		let linkPreview = currentModal.find('.entryLinkPreview');

		currentModal.find('input, textarea').val('');
		currentModal.find('.entryLinkPreview').removeAttr('href');
		let hiddenCheck = linkPreview.hasClass('hidden');
		if (!hiddenCheck) {
			linkPreview.addClass('hidden');
		}
		currentModalForm.removeAttr('data-entryformid');
		currentModalForm.find('.selected').removeClass('selected');
		currentModalForm.find('.doNotSortMe').addClass('selected');
		let noneSelection = currentModalForm.find('.noneSelection__space').attr('data-display-text');
		let categoryDropdown = currentModalForm.find('.dropdown');
		categoryDropdown.find('.currentCategorySelection').text(noneSelection);
		categoryDropdown.find('.currentCategorySelection').removeAttr('data-categoryId');
		let noCategory = currentModalForm.find('.noneSelection__space').val();
		let selectorSpace = currentModalForm.find('.selector__space');
		selectorSpace.val(noCategory).trigger('change');

		let image = currentModalForm.find('.imageBlock');
		image.removeAttr('data-image-key');
		image.removeAttr('data-image-url');
		let fileUploadInput = currentModalForm.find('.file-upload-input');
		let fileUploadClone = fileUploadInput.clone();
		fileUploadInput.replaceWith(fileUploadClone);
		let fileUploadContent = currentModalForm.find('.file-upload-content');
		fileUploadContent.hide();
		let fileUploadWrap = currentModalForm.find('.image-upload-wrap');
		fileUploadWrap.show();
		enableImageUpload();

		disableSaveDraftAndExit();

		stillEditingNewEntry = false;
		
		// let clearEntry = currentModal.find('.entryClear__space');
		// if (clearEntry.is(":visible")) {
		// 	// hide all modal action buttons (idientified by class below)
		// 	currentModal.find('.createEntryModalActionButton__space').toggle();
		// }

		currentModal.find('.entrySaveDraftAndExit__space').addClass('hidden');

		let indicatorTest = $('.entryStateIndicator').hasClass('hidden');
		if (!indicatorTest) {
			currentModal.find('.entryStateIndicator').addClass('hidden');
		}	
		
		let listId = currentModal.find('.entryCurrentListSelector__space').attr('data-listid');
		currentModal.find('.entryFull__space').attr('href', '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/new');
		$('.statusMessage').css("color", "#777");
		$('.statusMessage').text("");
		reversePreviewIcon();
		initInputListening();
		restoreURL();
		let trashButton = currentModal.find('.trashEntry__space');

		let trashCheck = trashButton.hasClass('hidden');
		if (!trashCheck) {
			trashButton.addClass('hidden');
		}

		trashButton.off('click');
		draftExit = false;
	}

	function checkIfModal() {
		let modalCheck = $('.currentModal').length;
		return modalCheck;
	}

	// prevent preview from making changes to new entry

	function initSaveAndExit() {
		let saveDraftButton = currentModal.find('.entrySaveAndExit__space');
		let entryCreateButton = currentModal.find('.createEntry__space');

		if (currentModalType == "editEntryModal") {
			entryCreateButton.css("margin-left", "10px");
			saveDraftButton.css("margin-right", "10px !important");
			saveDraftButton.css("margin-left", "auto !important");
		}

		let hiddenCheck = saveDraftButton.hasClass('hidden');
		if (hiddenCheck) {
			saveDraftButton.removeClass('hidden');
		}

		saveDraftButton.on('click', function() {
			let entryCheck = checkIfEntryExists();
			if (entryCheck) {
				updateEntry();
			}

			let modalCheck = checkIfModal();
			if (modalCheck) {
				runModalCloseFunctions()
			} 
			restoreURL();
		});
	}

	function disableSaveAndExit() {
		let saveDraftButton = currentModal.find('.entrySaveAndExit__space');
		let hiddenCheck = saveDraftButton.hasClass('hidden');
		if (!hiddenCheck) {
			saveDraftButton.addClass('hidden');
		}
		saveDraftButton.off('click');

	}

	function initSaveDraftAndExit() {
		let saveDraftButton = currentModal.find('.entrySaveDraftAndExit__space');

		let hiddenCheck = saveDraftButton.hasClass('hidden');
		if (hiddenCheck) {
			saveDraftButton.removeClass('hidden');
		}
		currentModal.find('.createEntry__space').css("margin-left", "unset");

		saveDraftButton.off('click');
		saveDraftButton.on('click', function() {
			draftExit = true;
			let entryCheck = checkIfEntryExists();
			if (entryCheck) {
				updateEntry();
			}
		});
	}

	function disableSaveDraftAndExit() {
		currentModal.find('.createEntry__space').css("margin-left", "auto");
		let saveDraftButton = currentModal.find('.entrySaveDraftAndExit__space');
	
		let hiddenCheck = saveDraftButton.hasClass('hidden');
		if (!hiddenCheck) {
			saveDraftButton.addClass('hidden');
		}
		saveDraftButton.off('click');
	}

	function waitForUpdateToComplete(functionToRun) {

	}

	function initUpdatingDraftDiv() {
		// on typing entries, any changes to content should be reflected, including if it later has meta data stored inside it (as also  with different entry designs, sometimes summary or other details are shown, other times not)
		// turn this off when clearing modal
		// turn this off when creating/publishing
		// turn this off when saving draft & closing

		// actually at the end of typing, push update manually
	}

	function initEntryModalFunctions(listId, entryId) {
		// let trashButton = currentModal.find('.trashEntry__space')
		// if (trashButton.hasClass('hidden')) {
		// 	trashButton.removeClass('hidden');
		// }
		initFullPageEditorLink(listId, entryId)
		initEntryTrashing();
	}

	function appendDataToTrash(entryData) {
		entryData = setupEntryData();
		entryData.entryId = entryId;
	}

	function checkCurrentState() {
		// check if current tab/focus to decide whether to hide appended entry/draft;
		let state = $('.currentState').attr('data-statetype');
		return state;
	}

	function setupEntryData() {
		let data = {}

		// what if no list? (e.g. person removes manually, doesn't load properly, but there should always be some list, e.g. then it takes from default list in database) -- just check on backend
		let dateCreated = new Date();
		let listId = currentModal.find('.entryCurrentListSelector__space').data('listid') || $('.listId').data('listid');
		let currentCategoryObject = currentModal.find('.currentCategorySelection');
		let entryCategory = currentCategoryObject.text();
		let entryCategoryId = currentCategoryObject.attr('data-categoryid');
		let entryTitle = currentModal.find('.entryTitle__space').val();
		let entryText = currentModal.find('.postDescription').val();
		let entryLink = currentModal.find('.entryLink').val();

		console.log("entrycat", entryCategory);

		let imageExists = checkIfImageExists();

		// check on backend if any such variable is in data or not
		if (imageExists) {
			let imageBlock = currentModal.find('.imageBlock');
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

	function addContentAttrToEntryBoxes(entry, newEntry) {
		if (entry.entryState){
			newEntry.attr('data-entryState', entry.entryState);
		}
		if (entry.entryTitle){
			newEntry.attr('data-entryTitle', entry.entryTitle);
		}
		if (entry.entryText){
			newEntry.attr('data-entryText', entry.entryText);
		}
		if (entry.entryLink){
			newEntry.attr('data-entryLink', entry.entryLink);
		}
		if (entry.entryImageURL){
			newEntry.attr('data-image-url', entry.entryImageURL);
		}
		if (entry.entryImageKey){
			newEntry.attr('data-image-key', entry.entryImageKey);
		}
		if (entry.entryImageName){
			newEntry.attr('data-image-name', entry.entryImageName);
		}
		if (entry.entryCategory){
			newEntry.attr('data-entryCategory', entry.entryCategory);
		}
		if (entry.entryCategoryId){
			newEntry.attr('data-entryCategoryId', entry.entryCategoryId);
		}
		return newEntry;
	}

	function prepareEntryBlock(entry) {
        let newEntry = $('<div>', {'class': 'entry__liveCurata', 'data-entrystate': entry.entryState, 'id': entry._id});
        let entryTitleBlock = $('<a>', {'class': 'entryTitle__liveCurata'});
        entryTitleBlock.text(entry.entryTitle || "Untitled entry");
        newEntry.append(entryTitleBlock);
		if (entry.entryImageKey && entry.entryImageURL) {
			let entryImageBlock = $('<div>', {'class': 'curataEntryImage'})
			entryImageBlock.attr("data-image-key", entry.entryImageKey);
			entryImageBlock.attr("data-image-url", entry.entryImageURL);
			entryImageBlock.css("background-image", "url(" + entry.entryImageURL + ")");
			newEntry.append(entryImageBlock);
        }
        return newEntry;
	}
	
	function hideEntryIfRespectiveTabNotOpen(entryState, newEntry) {
		let state = checkCurrentState();
		if (state !== entryState) {
			newEntry.addClass('hidden');
		} 
		return newEntry;
	}


	function postCreatingEntrySuccessFunctions(response, listId) {
		let entry = response.entry;
		let newEntry = prepareEntryBlock(entry);

		newEntry = addContentAttrToEntryBoxes(entry, newEntry)
		newEntry = hideEntryIfRespectiveTabNotOpen(entry.entryState, newEntry)
		
		// append
		$('#' + listId).append(newEntry);
		initContentQuickModal();
		creatingEntry = false;
	}

	// modal only
	function initCreateEntry() {
		currentModal.find('.createEntry__space').off('click');
		currentModal.find('.createEntry__space').on('click', function() {

			let entryCheck = checkIfEntryExists();
			if (entryCheck) {
				let entryButton = $(this);
				let entryCreator = entryButton.closest('.createEntryModal__space');
	
				let listId = currentModal.find('.entryCurrentListSelector__space').attr('data-listId');
				let entryId = currentModalForm.attr('data-entryformid');
				$.ajax({
					type: 'POST',
					url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId + '/publish',
					success: function(response) {
						let entry = $('#' + entryId);
						entry.attr('data-entrystate', "Published");
						hideEntryIfRespectiveTabNotOpen("Published", entry);
						runModalCloseFunctions();
	
						$('.entryStateSelector[data-statetype="Published"]').trigger('click');
					},
					error: function(err) {
						console.log("Failed to publish entry!");
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
						postCreatingEntrySuccessFunctions(response, listId);
						runModalCloseFunctions();
					},
					error: function(err) {
						$('.statusMessage').text("Failed to create draft.");
						creatingEntry = false;
					}
				})
			}
		})
	}

	function initPreviewIcon(link, entryState) {
		currentModal.find('.entryPreviewLink').removeClass('hidden');
		currentModal.find('.entryPreviewLink').attr('href', link);
		currentModal.find('.cancelListCreating').css('margin-left', '0px');	
		if (entryState == "Draft") {
			$('.entryPreviewLink').text('Preview');
		} else {
			$('.entryPreviewLink').text('View live');
		}
	}

	function reversePreviewIcon(entryId) {
		currentModal.find('.entryPreviewLink').addClass('hidden');
		currentModal.find('.entryPreviewLink').removeAttr('href');
		currentModal.find('.cancelListCreating').css('margin-left', 'auto');	
	}

	function createNewDraft(uploadData=0) {
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
				currentModalForm.attr('data-entryformid', entryId);
				if (uploadData !== 0) {
					uploadData.entryId = entryId;
				}

				let modalCheck = checkIfModal();
				if (modalCheck) {
					postCreatingEntrySuccessFunctions(response, listId);
					initEntryModalFunctions(listId, entryId);
					console.log('about to call show more options')
					initHideShowMoreOptions();
					initSaveDraftAndExit();
					let hrefLink = '/dashboard/drafts/' + entryId
					initPreviewIcon(hrefLink, "Draft");
					let entryIndicator = currentModal.find('.entryStateIndicator');
					let hiddenCheck = entryIndicator.hasClass('hidden');
					if (hiddenCheck) {
						entryIndicator.removeClass('hidden');
						entryIndicator.text("Draft");
					}
				} else {
					checkIfBlankEntry();
				}
				
				changeURL(entryId, listId)
				//initDraftTrashing();
				updateEntry();
				$('.statusMessage').text("Draft created.");
				creatingEntry = false;
				if (uploadingImage) {
					saveReference(uploadData);
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

		let entryId = currentModalForm.attr('data-entryformid');
		console.log("id", entryId)
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
		let publishButton = currentModal.find('.publishEntry__space');
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
		let publishButton = currentModal.find('.publishEntry__space');
		let previewButton = currentModal.find('.showPreview');
		let trashSection = currentModal.find('.entrySettingsDelete');
		let entryId = currentModalForm.attr('data-entryformid');

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
		let container = currentModal.find('.linkContainer');
		let link = container.find('.entryLink').val();
		let linkPreview = container.find('.entryLinkPreview');
		let parsedLink = (link.indexOf('://') === -1) ? 'http://' + link : link;

		let hiddenCheck = linkPreview.hasClass('hidden');
		if (hiddenCheck) {
			linkPreview.removeClass('hidden');
		}

		linkPreview.attr('href', parsedLink);
	}

	function addContentToEntryBox(entry, entryBox) {
		let entryTitle = entryBox.find('.entryTitle__liveCurata');
		let entryImage = entryBox.find('.curataEntryImage');
		if (entryTitle.length) {
			if (entry.entryTitle) {
				entryTitle.text(entry.entryTitle);
			}
		}
		if (entryImage.length) {
			if (entry.entryImageKey && entry.entryImageURL) {
				entryImage.attr('data-image-key', entry.entryImageKey);
				entryImage.css('background-image', 'url('+ entry.entryImageURL + ')');
			}
		}
	}

	function syncEntryChangesWithEntryBox(response) {
		let entry = response.entry;
		let entryBox = $('#' + entry._id);

		addContentAttrToEntryBoxes(entry, entryBox);
		addContentToEntryBox(entry, entryBox);

	}

	function updateEntry(modal=0) {
		$('.statusMessage').css("color", "#777");
		$('.statusMessage').text("Saving...");

		let data = setupEntryData();

		let entryId = currentModalForm.attr('data-entryformid');
		console.log("id2", entryId);
		data.entryId = entryId;
		let listId = data.listId;

		showOrUpdateLinkPreview()

		$.ajax({
			data: data,
			type: 'POST',
			url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/entries/' + entryId + '/updateEntry',
			success: function(response) {
				$('.statusMessage').text("Saved.");
				if (draftExit) {
					let modalCheck = checkIfModal();
					if (modalCheck) {
						runModalCloseFunctions();
					} 
				}
				syncEntryChangesWithEntryBox(response);
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

		let entryInputSpace = currentModalForm.find('.entryInput__space');
		entryInputSpace.off('input');
		entryInputSpace.on('input', function() {
			createOrUpdateEntry();
		})

		let selectorSpace = currentModalForm.find('.selector__space');

		selectorSpace.off('change');
		selectorSpace.on('change', function() {
			let entryCheck = checkIfEntryExists();
			if (entryCheck) {
				updateEntry();
			}
		});
	}

	function turnOffInputListening() {
		let entryInputSpace = currentModalForm.find('.entryInput__space');
		entryInputSpace.off('input');

		let selectorSpace = currentModalForm.find('.selector__space');

		selectorSpace.off('change');
	}

	function checkIfMainImageExists() {
		let imageCheck = currentModalForm.find('.imageBlock').attr('data-image-key');
		if (typeof imageCheck !== typeof undefined && imageCheck !== false) {
			let imageUploadWrap = currentModalForm.find('.image-upload-wrap');
			imageUploadWrap.hide();
			let fileUploadContent = currentModalForm.find('.file-upload-content');
			fileUploadContent.show();
			enableImageDelete();
		} else {
			enableImageUpload();
		}
	}

	function enableImageUpload() {
		console.log("testthis");
		// problems:
			// function runs 2-4 times -- prboably due to runmodalopenfunctions having  checkifMainImageExists and then again enableImageDelete
			// function runs even when closing modal
			// function fileUploadInput doesn't work post removal of image
		let imageUploadWrap = currentModalForm.find('.image-upload-wrap');

		imageUploadWrap.off('dragover');
		imageUploadWrap.on('dragover', function () {
			imageUploadWrap.addClass('image-dropping');
		});

		imageUploadWrap.off('dragleave');
		imageUploadWrap.on('dragleave', function () {
			imageUploadWrap.removeClass('image-dropping');
		});

		let fileUploadButton = currentModalForm.find('.file-upload-btn');
		let fileUploadInput = currentModalForm.find('.file-upload-input');

		console.log("ffuB", fileUploadButton);
		console.log("ffuI", fileUploadInput);

		fileUploadButton.off('click');
		fileUploadButton.on('click', function() {
			fileUploadInput.trigger( 'click' );
		})
		console.log("made it here2");
		fileUploadInput.off('change');
		fileUploadInput.on('change', function() {
			console.log("change change");
			let createEntryButton = currentModal.find('.createEntry__space');
			createEntryButton.text("Saving...");
			createEntryButton.css("background-color", "#d0d2da");
			createEntryButton.attr('disabled', true);
			console.log("made it here", this);
			let entryId = currentModal.find('.editForm').attr('data-entryformid') || currentModal.find('.entryForm').attr('data-entryformid');

			readURL(this, entryId);
			// setup upload failed instead and set the image later and until then set uploading image

			const files = $(this).files;
			// const file = files[0];

			let file = $(this).prop('files')[0];
			let imageName = $(this).prop('files')[0].name;
			console.log("imgname: ", imageName)

			const imageBlock = $(this).closest('.imageBlock');
			const dateUpdated = new Date();

			let uploadData = {};
			uploadData.imageBlock = imageBlock;
			uploadData.dateUpdated = dateUpdated;
			uploadData.imageName = imageName;
			uploadData.entryId = entryId;

			if (file === null) {
				revertEntryButton();
				return alert('No file selected.');
			}

			getSignedRequest(file, uploadData);

		});
	}

	function revertEntryButton() {
		let createEntryButton = currentModal.find('.createEntry__space');
		createEntryButton.text("Create entry");
		createEntryButton.css("background-color", "#2b59ff");
		createEntryButton.prop('disabled', false);		
	}

	function enableImageDelete() {
		let removeImage = currentModalForm.find('.remove-image');
		removeImage.off('click');
		removeImage.on('click', function() {
			let obj = this;
			removeUpload(obj);
		})
	}

	function disableImageDelete() {
		$('.remove-image').off('click');
	}

	function launchUploadingIcon() {

	}

	function toggleImageTitle() {
		let imagePreTitle = currentModalForm.find('.image-pre-title');
		let imageTitle = currentModalForm.find('.image-title');
		let imageUploadingTitle = currentModalForm.find('.image-uploading-title');
		imagePreTitle.toggle();
		imageTitle.toggle();
		imageUploadingTitle.toggle();

		let imageUploadingButton = currentModalForm.find('.remove-image');
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

	function readURL(input, entryId) {
	  if (input.files && input.files[0]) {

	    var reader = new FileReader();

	    reader.onload = function(e) {
			console.log("test?");
			currentModal.find('.image-upload-wrap').hide();

			currentModal.find('.file-upload-image').attr('src', e.target.result);
			currentModal.find('.file-upload-content').show();

			toggleImageTitle();

			currentModal.find('.image-title').html(input.files[0].name);

			let entry = $('#' + entryId);
			let entryImage = entry.find('.curataEntryImage');
			entryImage.css('background-image', `url(${e.target.result})`);

	    };

	    reader.readAsDataURL(input.files[0]);
	    return 

	  } else {
	    removeUpload(input);
	  }
	}

	function removeUpload(obj) {
		console.log("Beginning image delete.");
		let entryId = currentModalForm.attr('data-entryformid');
		if (typeof entryId == typeof undefined || entryId == false) {
			return console.log("Entry does not exist yet or entry id is not available.");
		}
		currentModal.find('.createEntry__space').text("Saving...");
		currentModal.find('.createEntry__space').css("background-color", "#d0d2da");

		// let image = $(obj).closest('.imageBlock')
		let image = currentModalForm.find('.imageBlock');
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
				image.removeAttr('data-image-name');
				image.find('.file-upload-image').removeAttr('src');
				let entry = $('#' + entryId);
				entry.attr('data-image-key', '');
				entry.attr('data-image-url', '');
				entry.attr('data-image-name', '');
				let entryImage = entry.find('.curataEntryImage');
				entryImage.css('background-image', '');
				entryImage.removeAttr('data-image-key');
				currentModal.find('.file-upload-input').val('')
				// let fileUploadInput = currentModal.find('.file-upload-input');
				// let fileUploadInputClone = fileUploadInput.clone();
				// fileUploadInput.replaceWith(fileUploadInputClone);
				currentModal.find('.file-upload-content').hide();
				currentModal.find('.image-upload-wrap').show();
				disableImageDelete();
				console.log("here1");
				enableImageUpload();
				console.log("after herer");
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
		let imageName = uploadData.imageName;
		imageBlock.attr('data-image-key', imageKey);
		imageBlock.attr('data-image-url', imageURL);
		imageBlock.attr('data-image-name', imageName);
		let entryId = uploadData.entryId;
		console.log(entryId);
		let entry = $('#' + entryId);
		entry.attr('data-image-key', imageKey);
		entry.attr('data-image-url', imageURL);
		entry.attr('data-image-name', imageName);
		let entryImage = entry.find('.curataEntryImage');
		entryImage.css('background-image', `url(${imageURL})`);
		entryImage.attr('data-image-key', imageKey);
		toggleImageTitle();
		enableImageDelete();		
	}

	function saveReference(uploadData) {
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

		let entryId = uploadData.entryId;
		console.log("eid", entryId);

		if (typeof entryId !== typeof undefined && entryId !== false) {
			saveReference(uploadData);
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

		let entryLinkInput = currentModal.find('.EntryLink');

		entryLinkInput.off('keyup');
		entryLinkInput.on('keyup', function(event) {
			$(this).val($(this).val().replace(/[\r\n\v]+/g, ''));
		})

		entryLinkInput.off('keypress');
		entryLinkInput.on('keypress', function(event) {
			if (event.keyCode === 13) {
				event.preventDefault();
				$(this).blur();
			}
		})

		entryLinkInput.on('keypress', function(event) {
		    if(event.which === 32) 
		        return false;
		});
	}


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

		let publishButton = currentModal.find('.publishEntry__space');
		let hiddenCheck = publishButton.hasClass('hidden');
		if (hiddenCheck) {
			publishButton.removeClass('hidden');
		}	
		publishButton.off('click');
		publishButton.on('click', function() {
			let entryId = currentModalForm.attr('data-entryformid');
			let entry = $('#' + entryId);

	    	$.ajax({
	    		data: {
	    			entryId: entryId
	    		},
	    		type:'POST',
	    		url: '/' + coreURL + '/PublishEntry',
	    		success: function(response) {
					entry.attr('data-entrystate', "Published");
					hideEntryIfRespectiveTabNotOpen("Published", entry);
					runModalCloseFunctions();

					$('.entryStateSelector[data-statetype="Published"]').trigger('click');
					entry.trigger('click');
					currentModal.find('.entryStateIndicator').text(currentEntryState);
	    		},
	    		error: function(err) {
	    			console.log("Failed to publish entry: ", err);
	    			// Display error not being able to publish
	    		}
	    	});
		});
	}

	function disablePublishAndCreateEntry() {
		let publishButton = currentModal.find('.publishEntry__space');
		let hiddenCheck = publishButton.hasClass('hidden');
		if (!hiddenCheck) {
			publishButton.addClass('hidden');
		}	
		publishButton.off('click');
	}

	function createAndAppendCategories(entryCategory, entryCategoryId, ) {

	}

	function create_custom_dropdowns() {
		let dropdown;
		currentModal.find('select').each(function(i, select) {
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

	// grabbing data from entryBox attributes
	function fetchEntryDataForModal(entryBox) {
		let modalData = {};

		modalData.entryTitle = entryBox.attr('data-entryTitle');
		modalData.entryText = entryBox.attr('data-entryText');
		modalData.entryLink = entryBox.attr('data-entryLink');
		modalData.entryCategory = entryBox.attr('data-entryCategory');
		modalData.entryCategoryId = entryBox.attr('data-entryCategoryId');
		modalData.entryImageURL= entryBox.attr('data-image-url');
		modalData.entryImageKey= entryBox.attr('data-image-key');
		modalData.entryImageName = entryBox.attr('data-image-name');

		return modalData;
	}

	function setModalData(modal, modalData) {
		let entryTitle = modalData.entryTitle;
		let entryText = modalData.entryText;
		let entryLink = modalData.entryLink;
		let entryCategory = modalData.entryCategory;
		let entryCategoryId = modalData.entryCategoryId;
		let entryImageURL= modalData.entryImageURL;
		let entryImageKey= modalData.entryImageKey;
		let entryImageName = modalData.entryImageName;

		let entryContainer = modal.find('.editForm');
		entryContainer.attr('data-entryformid', entryId);
		if (entryTitle) {
			entryContainer.find('.entryTitle__space').val(entryTitle);
		}
		if (entryText) {
			entryContainer.find('.postDescription').val(entryText);
		}	
		if (entryLink) {
			entryContainer.find('.entryLink').val(entryLink);
			const linkPreview = entryContainer.find('.entryLinkPreview');
			let hiddenCheck = linkPreview.hasClass('hidden');
			if (hiddenCheck) {
				linkPreview.removeClass('hidden');
			}
			let parsedLink = (entryLink.indexOf('://') === -1) ? 'http://' + entryLink : entryLink;
			linkPreview.attr("href", parsedLink);
		}	
		if (entryImageKey && entryImageURL) {
			entryContainer.find('.imageForm').hide();
			entryContainer.find('.file-upload-content').show();
			entryContainer.find('.imageBlock').attr('data-image-key', entryImageKey);
			entryContainer.find('.file-upload-image').attr('src', entryImageURL);
			entryContainer.find('.image-title').text(entryImageName);
		}		
		if (entryCategory && entryCategoryId) {
			entryContainer.find('.currentCategorySelection').attr('data-categoryid', entryCategoryId);
			entryContainer.find('.currentCategorySelection').text(entryCategory);
		}
		// also add LIST values & id
	}

	function openTrashedModal(entryBox, entryId, listId) {
		let trashedModal = $('.trashedModal');
		let modalData = fetchEntryDataForModal(trashedModal);
		runModalOpenFunctions(trashedModal);
		changeURL(entryId, listId);
	}

	function openPublishedOrDraft(entryBox, entryId, listId) {
		let editModal = $('.editEntryModal');
		let modalData = fetchEntryDataForModal(editModal);
		runModalOpenFunctions(editModal)
		changeURL(entryId, listId);
		initFullPageEditorLink(listId, entryId);

		setModalData(editModal, modalData);

		initEntryTrashing();
		create_custom_dropdowns();
	}
	// ENTRY EDIT PREVIEW FOR DRAFTS, PUBLISHED ENTRIES, TRASH
	function initContentQuickModal() {
		$('.entry__liveCurata').off('click');
		$('.entry__liveCurata').on('click', function(e) {
			e.preventDefault();
			let entryBox = $(this);
			let entryId = entryBox.attr('id');
			let listId = entryBox.closest('.list__liveCurata').attr('id');
			let entryState = entryBox.attr('data-entrystate');
			currentEntryState = entryState;
	
			if (entryState !== "Trashed") {
				openPublishedOrDraft(entryBox, entryId, listId);
				// clear button & functionality
				// initClearEntry(modal, form);
				if (entryState == "Published") {
					let liveLink = '/browse/users/' + userId + '/curatas' + curataId + '/lists/' + listId + '/entries/' + entryId;

					initPreviewIcon(liveLink, entryState);
					$('.revertToDraft').removeClass('hidden');
					currentModal.find('.entrySaveAndExit__space').removeClass('hidden');

					initSaveAndExit();
				}  else {
					let draftLink = '/' + coreURL + '/drafts/' + entryId;
					initPreviewIcon(draftLink, entryState);
					initSaveDraftAndExit();
					initPublishAndCreateEntry();
				}
			} else {
				// show trashed modal
				openTrashedModal(entryBox, entryId, listId);
			}

			// grab content from entryBox
			// load content in modal
			// assign entryId

			// exit modal + restoreURL
	
			// enable editing
			// sync updates to entryBox
			// enable closing
			// clean upon close
		})
	}
	// init every append
	initContentQuickModal()
	

	// CLEAR & CLOSE MODALS FUNCTIONS

	function clearPreviewModal() {
		console.log("Clearing preview modal.");
	}

	function clearTrashedModal() {
		console.log("Clearing trash modal.");
		currentModalForm.find('.currentCategorySelection').text('Miscellaneous category');
		currentModalForm.find('.trashTitle__space').text('No title');
		currentModalForm.find('.trashDescription').text('No summary');
		currentModalForm.find('.entryLink').text('No link');
		let imageBlock = currentModalForm.find('.imageBlock');
		imageBlock.removeAttr('data-image-key');
		imageBlock.find('.file-upload-image').removeAttr('src');
		imageBlock.find('.image-title').text('');
		imageBlock.find('.file-upload-image').hide();
		imageBlock.find('.file-upload-content').hide();
		imageBlock.find('.trashImageForm').hide();
		imageBlock.find('.trashImageForm2').show();
		imageBlock.find('.trashImageForm2').removeClass('hidden');
		currentModalForm.removeAttr('data-entryformid');
	}

	function clearModals() {
		// clearTrashedModal();
		// clearPreviewModal();
		clearEntry();
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

	function initEntryTrashing() {
		let trashButton = currentModal.find('.trashEntry__space');

		let hiddenCheck = trashButton.hasClass('hidden');
		if (hiddenCheck) {
			trashButton.removeClass('hidden');
		}

		trashButton.off('click');
		trashButton.on('click', function() {
			
			let clickObject = $(this);
			let data = {};
			let entryId = currentModalForm.attr('data-entryformid');
			let listId = currentModal.find('.entryCurrentListSelector__space').attr('data-listId');

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

					// let clearEntry = currentModal.find('.entryClear__space');
					// if (clearEntry.is(":visible")) {
					// 	// hide all modal action buttons (idientified by class below)
					// 	currentModal.find('.createEntryModalActionButton__space').toggle();
					// }

					// trashButton.hide();

					clickObject.off('click');
					runModalCloseFunctions();
					restoreURL();

				},
				error: function(err) {
					console.log("Arrghh! Failed to create draft!");
					console.log(err.errors[0]);
				}
			})

		})
	}

	function initUntrashEntry() {
		currentModal.find('.untrashEntry').off('click');
		currentModal.find('.untrashEntry').on('click', function() {

			let entryId = currentModalForm.attr('data-entryformid');
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
					runModalCloseFunctions();
	    		},
	    		error: function(err) {
	    			console.log("Failed to trash entry: ", err);
	    			// Display error not being able to publish
	    		}
	    	});
		});
	}

	function initEntryDeleting() {
		currentModal.find('.deleteEntry').off('click');
		currentModal.find('.deleteEntry').on('click', function() {
			let data = {};
			let entryId = currentModalForm.attr('data-entryformid');
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
						runModalCloseFunctions();
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

	function initDraftingEntry() {
		$('.revertToDraft').on('click', function() {

			let entryId = currentModal.find('[data-entryformid]').attr('data-entryformid');
			let entry = $('#' + entryId);

			$.ajax({
				data: {
					entryId: entryId
				},
				type:'POST',
				url: '/' + coreURL + '/RevertEntryToDraft',
				success: function(response) {
					console.log("Reverted entry back to draft.", response)
					entry.attr('data-entrystate', "Draft");
					hideEntryIfRespectiveTabNotOpen("Draft", entry);
					runModalCloseFunctions();

					$('.entryStateSelector[data-statetype="Draft"]').trigger('click');
					entry.trigger('click');
					currentModal.find('.entryStateIndicator').text(currentEntryState);
				},
				error: function(err) {
					console.log("Failed to draft entry: ", err);
					// Display error not being able to publish
				}
			});
		})
	}

	function disableDraftingEntry() {
		let revertToDraft = $('.revertToDraft')
		revertToDraft.off('click');
		if (!revertToDraft.hasClass('hidden')) {
			revertToDraft.addClass('hidden');
		}

	}

 });