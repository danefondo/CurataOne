 $(document).ready(function () {


 	/*
	Note that I read somewhere how in Google or someplace they have some fantastic rules to keep code neat and organized.

	One of them was that even how long a particular line extends or a particular function has strict limits. This is to be applied here as well, just so that it is all readable.
 	*/

	// function initDropDown() {
	// 	// reapply upon creating new component
	// 	$('#create-button').off('click');
	// 	$('#create-button').on('click', function(){
	// 	    $('#create').toggleClass('drop-down--active');
	// 	});
	// }
	// initDropDown();

	/*

Future editors should let set up sections, functions and say at which line they begin

INDEX OF ALL FUNCTIONS:

initPreviewButton()
initCancelAndDeleteEntry()
initRevertToDraft()
initGoToEditTemplate()
initPublishAndCreateEntry()
enableDisablePublish()
initQuestionBlocks()
initExpandable()
initImageTitleAdding()
initImageDescriptionAdding()
initImageDelete()
initEntryImageDelete()
initImageTitleDelete()
initImageDescriptionDelete()
initChecklists()
initNewQuestionAdding()
initMainEditor()
initializeEditor()
initializeSimpleEditor()
findAndInitMainEditor()
findAndInitEditors()
findAndInitSimpleEditors()
initAddEntryLink()
initEntryLinkSave()
initEntryLinkExit()
initEntryLinkRemove()
initEntryTitleListening()
initComponentTitleListening()
initImageInputsListening()
initQuestionDeleting()
initQuestionTitleListening()
initComponentTitleExit()
createNewEntry()
initNewListItemAdding()
initListItemsListening()
initListItemDeleting()
updateListItemOrderInDB()
initSortable()

NOTE: For every '.on('click')' inside a function, it seems safer to also run .off('click') right before it in case the same function gets called or used ever again on the same page -- I've spent countless hours trying to fix strange errors only to discover this problem.

	*/

	let editorCount = 0;
	let editors = {};
	let creatingListItem = false;
	let creatingQuestion = false;
	let savingInProgress = false;
	let enableDisableInProgress = false;
	let firstCreationInProgress = false;
	let deletionModal = $('.emptyModal');
	let lastUsedEditorComponentId;

	let entryId = $('.entryContainer__space').attr('data-entryformid');
	let tempId = $('.TemplateId').attr('id');
	let userId = $('.userId').attr('id');
	let username = $('.userId').attr('data-username');

	// coreURL is the default route or url key to which all pages ought route to; it has come up that I've needed to change this previously, as such, this variable has been created to make this modifcation easy to do next time; such as if we want 'curata.one/admin/' instead of 'curata.one/dashboard/'
	// coreURL is also the logic separator, sometimes, the coreURL might also be dashboard/entries 
	let coreURL = 'dashboard';

	// $('input').focus(function(){
	//   var that = this;
	//   setTimeout(function(){ that.selectionStart = that.selectionEnd = 10000; }, 0);
	// });

	/* SPECIAL (CUSTOM) FUNCTIONS */

	// More on jQuery special events: http://benalman.com/news/2010/03/jquery-special-events/
	// Custom function to later listen to the 'removal' of an element
	(function($){
	  $.event.special.destroyed = {
	    remove: function(o) {
	      if (o.handler) {
	        o.handler()
	      }
	    }
	  }
	})(jQuery)

	function initPreviewButton() {

		$('.closeWindowBtn').off('click');
		$('.closeWindowBtn').on('click', function() {
			window.top.close();
		});
	}
	initPreviewButton();

	function initAddNewList() {
		let creationModal = $('.emptyModal');

		$('.addNewList').off('click');
		$('.addNewList').on('click', function() {
			creationModal.show();
		})

		$('.cancelListCreating').off('click');
		$('.cancelListCreating').on('click', function() {
			creationModal.hide();
		})
	}
	initAddNewList();

	function initPermaDeleteList() {

		let emptyModal = $(".modal__deleteList");
		let listId;
		let curataId = $('.currentCurataSwitch').attr('id');

		// careful here, you mighty declare this once, and if this function is not established anew each click, then old values remain, causing difficult to spot errors later on

		$('.permaDeleteList').off('click');
		$('.permaDeleteList').on('click', function() {
			listId = $('.entriesContainer').attr('id');
			console.log("List id", listId);
			emptyModal.show();
		})

		$('.cancelPermaDeleteList').off('click');
		$('.cancelPermaDeleteList').on('click', function() {
			emptyModal.hide();
		})

		$('.modalBackground__deleteList').off('click');
		$('.modalBackground__deleteList').on('click', function() {
			emptyModal.hide();
		})

		// Press esc key to hide
		$(document).keydown(function(event) { 
		  if (event.keyCode == 27) { 
		  	if (emptyModal.length) {
		  		let modalState = emptyModal.css('display');
			  	if (modalState == "block") {
			  		emptyModal.hide();
			  	}
		  	}
		  }
		});

		$('.confirmPermaDeleteList').off('click');
		$('.confirmPermaDeleteList').on('click', function() {

			// Indicate 'deleting'
			emptyModal.hide();

			$.ajax({
				data: {
					listId: listId,
					curataId: curataId
				},
				type: 'DELETE',
				url: '/' + coreURL + '/deleteList',
				success: function(response) {
					console.log('List deleted. Redirecting.');
					// Redirect to Curata
					window.location.href = response.redirectTo;

				},
				error: function(err) {
					console.log("Failed to delete list.");
					//TODO: Display error message
				}
			})
		});
	}
	initPermaDeleteList()

	// Delete entry
	function initPermaDeleteEntry() {
		let emptyModal = $(".modal__deleteEntry");
		let entry;
		let entry_id;

		// careful here, you mighty declare this once, and if this function is not established anew each click, then old values remain, causing difficult to spot errors later on

		$('.permaDeleteEntry').off('click');
		$('.permaDeleteEntry').on('click', function() {
			console.log("Establishing new entry values");
			let thisButton = $(this);
			entry = thisButton.closest('.singleList');
			console.log("Entry", entry);
			entry_id = entry.attr('data-id');
			console.log("Entry id", entry_id);
			emptyModal.show();
		})

		$('.cancelPermaDeleteEntry').off('click');
		$('.cancelPermaDeleteEntry').on('click', function() {
			emptyModal.hide();
		})

		$('.modalBackground__deleteEntry').off('click');
		$('.modalBackground__deleteEntry').on('click', function() {
			emptyModal.hide();
		})

		// Press esc key to hide
		$(document).keydown(function(event) { 
		  if (event.keyCode == 27) { 
		  	if (emptyModal.length) {
		  		let modalState = emptyModal.css('display');
			  	if (modalState == "block") {
			  		emptyModal.hide();
			  	}
		  	}
		  }
		});

		$('.confirmPermaDeleteEntry').off('click');
		$('.confirmPermaDeleteEntry').on('click', function() {

			// Indicate 'deleting'
			emptyModal.hide();
			console.log("Displaying entry before deletion: ", entry);
			console.log("Displaying entry id before deletion: ", entry_id);
			let trashedIndic = entry.find('.trashedIndicator');
			if (trashedIndic.length < 0) {
				trashedIndic.find('p').text("Deleting...");
				trashedIndic.addClass('deletingIndicator');
				trashedIndic.removeClass('trashedIndicator');
			}
			let dropMenu = entry.find('entry-drop-down');
			dropMenu.hide();

			$.ajax({
				data: {
					entryId: entry_id
				},
				type: 'DELETE',
				url: '/' + coreURL + '/DeleteEntry',
				success: function(response) {
					console.log('Entry deleted.');

					let listCount;
					console.log("This is first time listCount: ", listCount);

					$('.singleList').each(function(i, obj) {
	    				let dataAttr = $(obj).attr('data-id');
	    				if (dataAttr == entry_id) {
	    					let entriesList = $(obj).closest('.entriesList');
	    					let list = entriesList.closest('.listContainer')
	    					let listId = list.attr('data-id');
	    					let cList = list.closest('.curataList');

	    					let listHeader = list.find('.listHeader');

	    					let listCountBlock = listHeader.find('.listCount');

	    					if (listCount === null || listCount === undefined) {
	    						console.log("List count is null.");
	    						let listCountText = listCountBlock.text();
		    					listCount = parseInt(listCountText);
		    					listCount = listCount - 1;
		    					console.log("count: ", listCount);
	    					}

	    					// check if lists have content, if not, remove lists everywhere except 'All'
	    					// if list exists empty, then show the empty list under 'all'
	    					// if nothing left under published, drafts, trashed, then show 'nothing there'

	    					// must check if curataList is empty before showing noContentBlock
	    					// if entriesList = empty, remove listContainer
	    					// but till then I can remove listContainers

	    					// remove from everywhere
	    					$(obj).remove();
	    					listCountBlock.text(listCount);

	    					let listsAreaList = $('#Lists').find('[data-id=' + listId + ']');
	    					let listsAreaListCount = listsAreaList.find('.listCount');
	    					listsAreaListCount.text(listCount);

	    					let allItems = $('#All').find('.singleList');
	    					let allCount = allItems.length;
	    					let trashedItems = $('#Trash').find('.singleList');
	    					let trashedCount = trashedItems.length;
	    					$('*[data-tab="Trash"]').text("Trashed (" + trashedCount + ")");
	    					$('*[data-tab="All"]').text("All (" + allCount + ")");

	    					// checking if list is empty after remove
	    					if (entriesList.children().length === 0) {

	    						if (cList.parents('#All').length == 1) {
		    						console.log("List empty.");
		    						// adding empty block
		    						let emptyItem = $('<li>', {'class': 'noEntriesBlock'});
		    						let emptyItemText = $('<div>', {'class': 'noEntriesMessage'});
		    						emptyItemText.text("Your list is empty.");
		    						emptyItem.append(emptyItemText);
		    						entriesList.append(emptyItem);
	    						} else {
	    							list.remove();
	    						}

	    						if (cList.children().length === 0) {
	    							// check if entriesList is part of published or draft or trashed, if so, remove the lists instead and do nothing
	    							if (cList.parents('#Published').length == 1) {
	    								// adding 'nothing there' block
		    							let noContentBlock = $('<div>', {'class': 'noContentBlock'});
		    							let noContentMessage = $('<div>', {'class': 'noContentMessage'});
		    							noContentMessage.text("You have no published entries.");
		    							noContentBlock.append(noContentMessage);
		    							cList.append(noContentBlock);
	    							} else if (cList.parents('#Drafts').length == 1) {
		    							// adding 'nothing there' block
		    							let noContentBlock = $('<div>', {'class': 'noContentBlock'});
		    							let noContentMessage = $('<div>', {'class': 'noContentMessage'});
		    							noContentMessage.text("You have no drafts.");
		    							noContentBlock.append(noContentMessage);
		    							cList.append(noContentBlock);
		    						} else if (cList.parents('#Trash').length == 1) {
		    							// adding 'nothing there' block
		    							let noContentBlock = $('<div>', {'class': 'noContentBlock'});
		    							let noContentMessage = $('<div>', {'class': 'noContentMessage'});
		    							noContentMessage.text("Wonderful, your trash is empty!");
		    							noContentBlock.append(noContentMessage);
		    							cList.append(noContentBlock);
		    						}
	    						}

	    					} else {
	    						console.log("List still contains stuff.");
	    					}
	    				}
	    			})
				},
				error: function(err) {
					console.log("Failed to delete entry.");
					// Deleting failed, revert to 'Trashed';
					let deletingIndic = entry.find('.deletingIndicator');
					if (deletingIndic.length < 0) {
						deletingIndic.find('p').text("Trashed");
						deletingIndic.addClass('trashedIndicator');
						deletingIndic.removeClass('deletingIndicator');
					}
					dropMenu.show();
				}
			})
		});
	}
	initPermaDeleteEntry();

	function initCancelAndTrashEntry() {

		$('.trashEntry').off('click');
		$('.trashEntry').on('click', function() {
			deletionModal.show();
		})

		$('.cancelTrashEntry').off('click');
		$('.cancelTrashEntry').on('click', function() {
			deletionModal.hide();
		})

		$('.modalBackground').off('click');
		$('.modalBackground').on('click', function() {
			deletionModal.hide();
		})

		// Press esc key to hide
		$(document).keydown(function(event) { 
		  if (event.keyCode == 27) { 
		  	if (deletionModal.length) {
		  		let modalState = deletionModal.css('display');
			  	if (modalState == "block") {
			  		deletionModal.hide();
			  	}
		  	}
		  }
		});

		$('.confirmTrashEntry').off('click');
		$('.confirmTrashEntry').on('click', function() {
			let entryId = $('.entryContainer__space').attr('data-entryformid');

	    	$.ajax({
	    		data: {
	    			entryId: entryId
	    		},
	    		type:'POST',
	    		url: '/' + coreURL + '/trashEntry',
	    		success: function(response) {
	    			// take person to all entries
	    			window.location.href = response.redirectTo;
	    		},
	    		error: function(err) {
	    			console.log("Failed to trash entry: ", err);
	    			// Display error not being able to publish
	    		}
	    	});
		});
	}
	initCancelAndTrashEntry();

	// let datesArea = $('<div>', {'class': 'datesarea'});
	// let creatorField = $('<div>', {'class': 'creatorField'});
	// let creatorField.text("Created by: " + );
	// let updatedField = $('<div>', {'class': 'lastUpdated'});
	// let creationDate = $('<div>', {'class': 'creationDate'});

	// Trash entry
	function initInstaTrashEntry() {
		$('.instaTrashEntry').off('click');
		$('.instaTrashEntry').on('click', function() {

			let entry = $(this).closest('.singleList');
			let entry_id = entry.attr('data-id');

			let entry_title = entry.find('.ribbonList').text();
			let entry_href = entry.find('.ribbonList').attr('href');
			let viewEntry_href = entry.find('.viewEntry').attr('href');

			console.log("Entry: ",  entry);
			if (entry && entry.length) {
				console.log("Entry: ",  entry);
				console.log("Entry id: ",  entry_id);
			} else {
				return console.log("Nothing found! Entry is a ghost!");
			}

	    	$.ajax({
	    		data: {
	    			entryId: entry_id
	    		},
	    		type:'POST',
	    		url: '/' + coreURL + '/trashEntry',
	    		success: function(response) {
	    			$('.singleList').each(function(i, obj) {
	    				let dataAttr = $(obj).attr('data-id');
	    				if (dataAttr == entry_id) {
	    					let entriesList = $(obj).closest('.entriesList');
	    					let list = entriesList.closest('.listContainer')
	    					let listId = list.attr('data-id');
	    					// let tempId = list.attr('data-default-template');
	    					let list_title = list.find('.entriesListTitle').text();
	    					let list_href = list.find('.listHeader').attr('href');
	    					let cList = entriesList.closest('.curataList');

	    					let metaClone = $(obj).find('.datesArea').clone();

	    					// check if entry under 'all', else remove
	    					if (entriesList.parents('#All').length == 1) {
 
	    						// change to trashed
	    						let draftIndic = $(obj).find('.draftIndicator');
	    						if (draftIndic.length > 0) {
	    							draftIndic.find('p').text("Trashed");
	    							draftIndic.addClass('trashedIndicator');
	    							draftIndic.removeClass('draftIndicator');
	    						} else {
	    							// if no indicator, add published indicator
	    							let trashedIndic = $('<div>', {'class': 'trashedIndicator'});
	    							let trashedParagraph = $('<p>');
	    							trashedParagraph.text("Trashed");
	    							trashedIndic.append(trashedParagraph);
	    							let ribbon = $(obj).find('.ribbonList');
	    							ribbon.after(trashedIndic);
	    						}

	    						let dropMenu = $(obj).find('.entry-drop-down__menu');

	    						let view_href = dropMenu.find('.viewEntry').attr('href');
	    						// remove existing dropMenu items
	    						dropMenu.empty();

	    						let viewItem = $('<a>', {'class': 'viewEntry dropLink'});
	    						viewItem.attr('href', view_href);
	    						viewItem.text("View");
	    						let untrashItem = $('<a>', {'class': 'instaUntrashEntry dropLink'});
	    						untrashItem.text("Untrash");
	    						let deleteItem = $('<a>', {'class': 'permaDeleteEntry dropLink'});
	    						deleteItem.text("Delete");

	    						let viewContainer = $('<li>', {'class': 'entry-drop-down__item'});
	    						let untrashContainer = $('<li>', {'class': 'entry-drop-down__item'});
	    						let deleteContainer = $('<li>', {'class': 'entry-drop-down__item'});

	    						viewContainer.append(viewItem);
	    						untrashContainer.append(untrashItem);
	    						deleteContainer.append(deleteItem);

	    						dropMenu.append(viewContainer);
	    						dropMenu.append(untrashContainer);
	    						dropMenu.append(deleteContainer);

	    					} else {
	    						// removing the matching entry block
	    						$(obj).remove();
	    					}

	    					// checking if list is empty after remove
	    					if (entriesList.children().length === 0) {

	    						if (entriesList.parents('#Published').length == 1 || entriesList.parents('#Drafts').length == 1 || entriesList.parents('#Trash').length == 1) {
	    							// if list is empty and is not 'All', then remove
	    							list.remove();
	    						}

	    						if (cList.children().length === 0) {
	    							// check if entriesList is part of published or draft or trashed, if so, remove the lists instead and do nothing
	    							if (cList.parents('#Published').length == 1) {
	    								// adding 'nothing there' block
		    							let noContentBlock = $('<div>', {'class': 'noContentBlock'});
		    							let noContentMessage = $('<div>', {'class': 'noContentMessage'});
		    							noContentMessage.text("You have no published entries.");
		    							noContentBlock.append(noContentMessage);
		    							cList.append(noContentBlock);
	    							} else if (cList.parents('#Drafts').length == 1) {
		    							// adding 'nothing there' block
		    							let noContentBlock = $('<div>', {'class': 'noContentBlock'});
		    							let noContentMessage = $('<div>', {'class': 'noContentMessage'});
		    							noContentMessage.text("You have no drafts.");
		    							noContentBlock.append(noContentMessage);
		    							cList.append(noContentBlock);
		    						}
	    						}

	    					} else  {
	    						console.log("List still contains stuff.");
	    					}

	    					let pageType = $('.pageType').attr('data-pageType');

	    					let trashArea = $('#Trash');
	    					let trashList = trashArea.find(`[data-id='${listId}']`);
	    					let checkEmptyBlock = trashArea.find('.noContentBlock');

	    					// creating trashedItem
	    					let trashedItem = $('<li>', {'class': 'singleList', 'data-id': entry_id});
	    					let trashedItemContent = $('<a>', {'class': 'ribbonList'});
	    					trashedItemContent.attr('href', entry_href);
	    					trashedItemContent.text(entry_title);

	    					let trashedIndicator = $('<div>', {'class': 'trashedIndicator'});
	    					let paragraph = $('<p>');
	    					paragraph.text('Trashed');
	    					trashedIndicator.append(paragraph);

	    					let entryDropdown = $('<div>', {'class': 'entry-drop-down'});

	    					let entryDropdownButton = $('<div>', {'class': 'entryDropdown entry-drop-down__button unsortable'});
	    					let moreButton = $('<span>', {'class': 'component-more'});
	    					moreButton.text('...');
	    					entryDropdownButton.append(moreButton);

	    					let entryDropdownMenuBox = $('<div>', {'class': 'entry-drop-down__menu-box unsortable'});

	    					let entryDropdownMenu = $('<ul>', {'class': 'entry-drop-down__menu'});

	    					let entryDropdownMenuItemView = $('<li>', {'class': 'entry-drop-down__item'});
	    					let viewEntry = $('<a>', {'class': 'viewEntry dropLink'});
	    					viewEntry.attr('href', viewEntry_href);
	    					viewEntry.text('View');
	    					entryDropdownMenuItemView.append(viewEntry);

	    					let entryDropdownMenuItemUntrash = $('<li>', {'class': 'entry-drop-down__item'});
	    					let untrashEntry = $('<a>', {'class': 'instaUntrashEntry dropLink'});
	    					untrashEntry.text('Untrash');
	    					entryDropdownMenuItemUntrash.append(untrashEntry);

	    					let entryDropdownMenuItemDelete = $('<li>', {'class': 'entry-drop-down__item'});
	    					let deleteEntry = $('<a>', {'class': 'permaDeleteEntry dropLink'});
	    					deleteEntry.text('Delete');
	    					entryDropdownMenuItemDelete.append(deleteEntry);

	    					entryDropdownMenu.append(entryDropdownMenuItemView);
	    					entryDropdownMenu.append(entryDropdownMenuItemUntrash);
	    					entryDropdownMenu.append(entryDropdownMenuItemDelete);

	    					entryDropdownMenuBox.append(entryDropdownMenu);
	    					entryDropdown.append(entryDropdownButton);
	    					entryDropdown.append(entryDropdownMenuBox);

	    					trashedItem.append(trashedItemContent);
	    					trashedItem.append(trashedIndicator);
	    					trashedItem.append(entryDropdown);
	    					trashedItem.append(metaClone);

	    					let checkExisting = trashList.find(`[data-id='${entry_id}']`);

	    					// check if any lists with such id exist under trash
	    					if (trashList.length > 0) {

	    						if (checkExisting.length < 1) {
	    							trashList.find('.entriesList').append(trashedItem);
	    						}
	    					
	    					} else {

	    						if (checkEmptyBlock.length > 0) {
	    							checkEmptyBlock.remove();
	    						}
	    						let curataList = trashArea.find('.curataList');
	    						// adding trashList into all lists
	    						let listContainer = $('<div>', {'class': 'listContainer'});
	    						listContainer.attr('data-id', listId);
	    						// listContainer.attr('data-default-template', tempId);

	    						let listHeaderContainer = $('<div>', {'class': 'listHeaderContainer'});
	    						let listHeader = $('<a>', {'class': 'listHeader'});
	    						let listTitleBlock = $('<li>', {'class': 'listTitleBlock'});
	    						let listTitle = $('<div>', {'class': 'entriesListTitle'});
	    						listHeader.attr('href', list_href);
	    						listTitle.text(list_title);
	    						listTitleBlock.append(listTitle);
	    						// let addNewEntryBlock = $('<div>', {'class': 'addNewEntryBlock'});
	    						// let addNewEntry = $('<div>', {'class': 'addNewEntry'});
	    						// addNewEntry.text('+ add new entry');
	    						// addNewEntryBlock.append(addNewEntry);

	    						listHeader.append(listTitleBlock);
	    						listHeaderContainer.append(listHeader);
	    						// listHeader.append(addNewEntryBlock);

	    						let newEntriesList = $('<ul>', {'class': 'entriesList'});

	    						// adding trashedItem (with trashedIndicator) to trashList
	    						newEntriesList.append(trashedItem);

	    						if (pageType !== "entries")  {
									listContainer.append(listHeaderContainer);
	    						}

	    						listContainer.append(newEntriesList);

	    						curataList.append(listContainer);
	    						// activate adding new entry
	    					}
	    				}
	    			})
 					initEntriesDropdown();
 					initPermaDeleteEntry();
 					initInstaUntrashEntry();
 					initCreateNewEntry();

 					makeHeaderLink();

 					// Update counts
					let trashedItems = $('#Trash').find('.singleList');
					let trashedCount = trashedItems.length;
					let draftItems = $('#Drafts').find('.singleList');
					let draftCount = draftItems.length;
					let publishedItems = $('#Published').find('.singleList');
					let publishedCount = publishedItems.length;
					$('*[data-tab="Trash"]').text("Trashed (" + trashedCount + ")");
					$('*[data-tab="Drafts"]').text("Drafts (" + draftCount + ")");
					$('*[data-tab="Published"]').text("Published (" + publishedCount + ")");
	    		},
	    		error: function(err) {
	    			console.log("Failed to trash entry: ", err);
	    			// Display error not being able to publish
	    		}
	    	});
		})
	}
	initInstaTrashEntry();

	// Untrash entry:
	/*

	1. Change from Trashed to Draft under 'All'
	2. Remove non-relevant buttons from dropMenu and add relevant buttons
	3. Check if proper list exists under 'Drafts', if not, create it
	4. Add copy under appropriate list under 'Drafts'
	5. Remove non-relevant buttons from dropMenu and add relevant buttons
	6. Remove from 'Trashed'
	7. Check if list under 'Trashed' is empty, if so, remove it
	8. If list was empty under 'Trashed', check if other lists exist, if not, add noTrashBlock
	9. Activate all relevant functions
	10. If 'noContentBlock' exists, remove

	*/

	// Trash entry
	function initInstaUntrashEntry() {
		$('.instaUntrashEntry').off('click');
		$('.instaUntrashEntry').on('click', function() {

			let entry = $(this).closest('.singleList');
			let entry_id = entry.attr('data-id');

			let entry_title = entry.find('.ribbonList').text();
			let entry_href = entry.find('.ribbonList').attr('href');
			let viewEntry_href = entry.find('.viewEntry').attr('href');

	    	$.ajax({
	    		data: {
	    			entryId: entry_id
	    		},
	    		type:'POST',
	    		url: '/' + coreURL + '/UntrashEntry',
	    		success: function(response) {
	    			$('.singleList').each(function(i, obj) {
	    				let dataAttr = $(obj).attr('data-id');
	    				if (dataAttr == entry_id) {
	    					let entriesList = $(obj).closest('.entriesList');
	    					let list = entriesList.closest('.listContainer');
	    					let listId = list.attr('data-id');
	    					// let tempId = list.attr('data-default-template');
	    					let list_title = list.find('.entriesListTitle').text();
	    					let list_href = list.find('.listHeader').attr('href');
	    					let cList = entriesList.closest('.curataList');

	    					let metaClone = $(obj).find('.datesArea').clone();

	    					// check if entry under 'all', else remove
	    					if (entriesList.parents('#All').length == 1) {
 
	    						// find trashed, change to draft
	    						let trashedIndic = $(obj).find('.trashedIndicator');
	    						if (trashedIndic.length > 0) {
	    							trashedIndic.find('p').text("Draft");
	    							trashedIndic.addClass('draftIndicator');
	    							trashedIndic.removeClass('trashedIndicator');
	    						}

	    						let dropMenu = $(obj).find('.entry-drop-down__menu');

	    						let view_href = dropMenu.find('.viewEntry').attr('href');
	    						// remove existing dropMenu items
	    						dropMenu.empty();

	    						let viewItem = $('<a>', {'class': 'viewEntry dropLink'});
	    						viewItem.attr('href', view_href);
	    						viewItem.text("Edit");
	    						let instaTrashItem = $('<a>', {'class': 'instaTrashEntry dropLink'});
	    						instaTrashItem.text("Trash");

	    						let viewContainer = $('<li>', {'class': 'entry-drop-down__item'});
	    						let instaTrashContainer = $('<li>', {'class': 'entry-drop-down__item'});

	    						viewContainer.append(viewItem);
	    						instaTrashContainer.append(instaTrashItem);

	    						dropMenu.append(viewContainer);
	    						dropMenu.append(instaTrashContainer);

	    					} else if (entriesList.parents('#Trash').length == 1) {
	    						// removing matching entry block
	    						console.log("Trash YES");
	    						$(obj).remove();
	    					}

	    					// checking if list is empty after remove
	    					if (entriesList.children().length === 0) {

	    						if (entriesList.parents('#Trash').length == 1) {
	    							// if list is empty and is 'Trash', remove list
	    							console.log("YES TRASH TWO");
	    							list.remove();
	    						}

	    						if (cList.children().length === 0) {
	    							// check if entriesList is part of published or draft or trashed, if so, remove the lists instead and do nothing
	    							if (cList.parents('#Trash').length == 1) {
	    								// adding 'nothing there' block
		    							let noContentBlock = $('<div>', {'class': 'noContentBlock'});
		    							let noContentMessage = $('<div>', {'class': 'noContentMessage'});
		    							noContentMessage.text("Wonderful, your trash is empty!");
		    							noContentBlock.append(noContentMessage);
		    							cList.append(noContentBlock);
	    							}
	    						}

	    					} else  {
	    						console.log("List still contains stuff.");
	    					}

	    					let pageType = $('.pageType').attr('data-pageType');

	    					let draftsArea = $('#Drafts');
	    					let draftsList = draftsArea.find(`[data-id='${listId}']`);

	    					let checkEmptyBlock = draftsArea.find('.noContentBlock');

	    					// creating draftItem
	    					let draftItem = $('<li>', {'class': 'singleList', 'data-id': entry_id});
	    					let draftItemContent = $('<a>', {'class': 'ribbonList'});
	    					draftItemContent.attr('href', entry_href);
	    					draftItemContent.text(entry_title);

	    					let draftIndicator = $('<div>', {'class': 'draftIndicator'});
	    					let paragraph = $('<p>');
	    					paragraph.text('Draft');
	    					draftIndicator.append(paragraph);

	    					let entryDropdown = $('<div>', {'class': 'entry-drop-down'});

	    					let entryDropdownButton = $('<div>', {'class': 'entryDropdown entry-drop-down__button unsortable'});
	    					let moreButton = $('<span>', {'class': 'component-more'});
	    					moreButton.text('...');
	    					entryDropdownButton.append(moreButton);

	    					let entryDropdownMenuBox = $('<div>', {'class': 'entry-drop-down__menu-box unsortable'});

	    					let entryDropdownMenu = $('<ul>', {'class': 'entry-drop-down__menu'});

	    					let entryDropdownMenuItemView = $('<li>', {'class': 'entry-drop-down__item'});
	    					let viewEntry = $('<a>', {'class': 'viewEntry dropLink'});
	    					viewEntry.attr('href', viewEntry_href);
	    					viewEntry.text('View');
	    					entryDropdownMenuItemView.append(viewEntry);

	    					let entryDropdownMenuItemTrash = $('<li>', {'class': 'entry-drop-down__item'});
	    					let instaTrashEntry = $('<a>', {'class': 'instaTrashEntry dropLink'});
	    					instaTrashEntry.text('Trash');
	    					entryDropdownMenuItemTrash.append(instaTrashEntry);

	    					entryDropdownMenu.append(entryDropdownMenuItemView);
	    					entryDropdownMenu.append(entryDropdownMenuItemTrash);

	    					entryDropdownMenuBox.append(entryDropdownMenu);
	    					entryDropdown.append(entryDropdownButton);
	    					entryDropdown.append(entryDropdownMenuBox);

	    					draftItem.append(draftItemContent);
	    					draftItem.append(draftIndicator);
	    					draftItem.append(entryDropdown);
	    					draftItem.append(metaClone);

	    					let checkExisting = draftsList.find(`[data-id='${entry_id}']`);

	    					// check if any lists with such id exist under trash
	    					if (draftsList.length > 0) {

	    						if (checkExisting.length < 1) {
	    							draftsList.find('.entriesList').append(draftItem);
	    						}
	    					
	    					} else {

	    						if (checkEmptyBlock.length > 0) {
	    							checkEmptyBlock.remove();
	    						}
	    						let curataList = draftsArea.find('.curataList');
	    						// adding draftList into all lists
	    						let listContainer = $('<div>', {'class': 'listContainer'});
	    						listContainer.attr('data-id', listId);
	    						// listContainer.attr('data-default-template', tempId);

	    						let listHeaderContainer = $('<div>', {'class': 'listHeaderContainer'});
	    						let listHeader = $('<a>', {'class': 'listHeader'});
	    						let listTitleBlock = $('<li>', {'class': 'listTitleBlock'});
	    						let listTitle = $('<div>', {'class': 'entriesListTitle'});
	    						listHeader.attr('href', list_href);
	    						listTitle.text(list_title);
	    						listTitleBlock.append(listTitle);

	    						let addNewEntryBlock = $('<div>', {'class': 'addNewEntryBlock'});
	    						addNewEntryBlock.text('+ add new entry');

	    						listHeader.append(listTitleBlock);
	    						listHeaderContainer.append(listHeader);
	    						listHeaderContainer.append(addNewEntryBlock);

	    						let newEntriesList = $('<ul>', {'class': 'entriesList'});
	    						// adding draftItem (with draftIndicator) to draftsList
	    						newEntriesList.append(draftItem);

	    						if (pageType !== "entries")  {
									listContainer.append(listHeaderContainer);
	    						}
	    						listContainer.append(newEntriesList);


	    						curataList.append(listContainer);
	    						// activate adding new entry
	    					}
	    				}
	    			})
    				initEntriesDropdown();
 					initInstaTrashEntry();
 					initCreateNewEntry();

 					makeHeaderLink();

  					// Update counts
					let trashedItems = $('#Trash').find('.singleList');
					let trashedCount = trashedItems.length;
					let draftItems = $('#Drafts').find('.singleList');
					let draftCount = draftItems.length;
					$('*[data-tab="Trash"]').text("Trashed (" + trashedCount + ")");
					$('*[data-tab="Drafts"]').text("Drafts (" + draftCount + ")");
	    		},
	    		error: function(err) {
	    			console.log("Failed to trash entry: ", err);
	    			// Display error not being able to publish
	    		}
	    	});
		})
	}
	initInstaUntrashEntry();


	function initInstaDraftEntry() {
		$('.instaDraftEntry').off('click');
		$('.instaDraftEntry').on('click', function() {

			let entry = $(this).closest('.singleList');
			let entry_id = entry.attr('data-id');

			let entry_title = entry.find('.ribbonList').text();
			let entry_href = entry.find('.ribbonList').attr('href');
			let viewEntry_href = entry.find('.viewEntry').attr('href');

	    	$.ajax({
	    		data: {
	    			entryId: entry_id
	    		},
	    		type:'POST',
	    		url: '/' + coreURL + '/DraftEntry',
	    		success: function(response) {
	    			$('.singleList').each(function(i, obj) {
	    				let dataAttr = $(obj).attr('data-id');
	    				if (dataAttr == entry_id) {
	    					let entriesList = $(obj).closest('.entriesList');
	    					let list = entriesList.closest('.listContainer');
	    					let listId = list.attr('data-id');
	    					// let tempId = list.attr('data-default-template');
	    					let list_title = list.find('.entriesListTitle').text();
	    					let list_href = list.find('.listHeader').attr('href');
	    					let cList = entriesList.closest('.curataList');

	    					let metaClone = $(obj).find('.datesArea').clone();

	    					// check if entry under 'all', else remove
	    					if (entriesList.parents('#All').length == 1) {
    							
    							let draftIndic = $('<div>', {'class': 'draftIndicator'});
    							let draftParagraph = $('<p>');
    							draftParagraph.text("Draft");
    							draftIndic.append(draftParagraph);
    							let ribbon = $(obj).find('.ribbonList');
    							ribbon.after(draftIndic);

	    						let dropMenu = $(obj).find('.entry-drop-down__menu');

	    						let view_href = dropMenu.find('.viewEntry').attr('href');
	    						// remove existing dropMenu items
	    						dropMenu.empty();

	    						let viewItem = $('<a>', {'class': 'viewEntry dropLink'});
	    						viewItem.attr('href', view_href);
	    						viewItem.text("Edit");
	    						let instaTrashItem = $('<a>', {'class': 'instaTrashEntry dropLink'});
	    						instaTrashItem.text("Trash");

	    						let viewContainer = $('<li>', {'class': 'entry-drop-down__item'});
	    						let instaTrashContainer = $('<li>', {'class': 'entry-drop-down__item'});

	    						viewContainer.append(viewItem);
	    						instaTrashContainer.append(instaTrashItem);

	    						dropMenu.append(viewContainer);
	    						dropMenu.append(instaTrashContainer);

	    					} else if (entriesList.parents('#Published').length == 1) {
	    						// removing matching entry block
	    						console.log("Trash YES");
	    						$(obj).remove();
	    					}

	    					// checking if list is empty after remove
	    					if (entriesList.children().length === 0) {

	    						if (entriesList.parents('#Published').length == 1) {
	    							// if list is empty and is 'Published', remove list
	    							console.log("Removing empty published list");
	    							list.remove();
	    						}

	    						if (cList.children().length === 0) {
	    							// check if entriesList is part of published or draft or trashed, if so, remove the lists instead and do nothing
	    							if (cList.parents('#Published').length == 1) {
	    								// adding 'nothing there' block
		    							let noContentBlock = $('<div>', {'class': 'noContentBlock'});
		    							let noContentMessage = $('<div>', {'class': 'noContentMessage'});
		    							noContentMessage.text("You have no published entries!");
		    							noContentBlock.append(noContentMessage);
		    							cList.append(noContentBlock);
	    							}
	    						}

	    					} else  {
	    						console.log("List still contains stuff.");
	    					}

	    					let pageType = $('.pageType').attr('data-pageType');

	    					let draftsArea = $('#Drafts');
	    					let draftsList = draftsArea.find(`[data-id='${listId}']`);


	    					// Risky to make code dependent on this check -- as if user modified html-css, then the code breaks and may introduce security vulnerabilities
	    					let checkEmptyBlock = draftsArea.find('.noContentBlock');

	    					// creating draftItem
	    					let draftItem = $('<li>', {'class': 'singleList', 'data-id': entry_id});
	    					let draftItemContent = $('<a>', {'class': 'ribbonList'});
	    					draftItemContent.attr('href', entry_href);
	    					draftItemContent.text(entry_title);

	    					let draftIndicator = $('<div>', {'class': 'draftIndicator'});
	    					let paragraph = $('<p>');
	    					paragraph.text('Draft');
	    					draftIndicator.append(paragraph);

	    					let entryDropdown = $('<div>', {'class': 'entry-drop-down'});

	    					let entryDropdownButton = $('<div>', {'class': 'entryDropdown entry-drop-down__button unsortable'});
	    					let moreButton = $('<span>', {'class': 'component-more'});
	    					moreButton.text('...');
	    					entryDropdownButton.append(moreButton);

	    					let entryDropdownMenuBox = $('<div>', {'class': 'entry-drop-down__menu-box unsortable'});

	    					let entryDropdownMenu = $('<ul>', {'class': 'entry-drop-down__menu'});

	    					let entryDropdownMenuItemView = $('<li>', {'class': 'entry-drop-down__item'});
	    					let viewEntry = $('<a>', {'class': 'viewEntry dropLink'});
	    					viewEntry.attr('href', viewEntry_href);
	    					viewEntry.text('View');
	    					entryDropdownMenuItemView.append(viewEntry);

	    					let entryDropdownMenuItemTrash = $('<li>', {'class': 'entry-drop-down__item'});
	    					let instaTrashEntry = $('<a>', {'class': 'instaTrashEntry dropLink'});
	    					instaTrashEntry.text('Trash');
	    					entryDropdownMenuItemTrash.append(instaTrashEntry);

	    					entryDropdownMenu.append(entryDropdownMenuItemView);
	    					entryDropdownMenu.append(entryDropdownMenuItemTrash);

	    					entryDropdownMenuBox.append(entryDropdownMenu);
	    					entryDropdown.append(entryDropdownButton);
	    					entryDropdown.append(entryDropdownMenuBox);

	    					draftItem.append(draftItemContent);
	    					draftItem.append(draftIndicator);
	    					draftItem.append(entryDropdown);
	    					draftItem.append(metaClone);

	    					let checkExisting = draftsList.find(`[data-id='${entry_id}']`);

	    					// check if any lists with such id exist under trash
	    					// Note that any such superficial checks that only happen on the client side are not real checks and are 'unintelligent' -- a real check must be in sync with real data, therefore the server and backend activity simply ought reflect on the front (such as brain is the server-computer and the screen is consciousness)
	    					if (draftsList.length > 0) {

	    						if (checkExisting.length < 1) {
	    							draftsList.find('.entriesList').append(draftItem);
	    						}
	    					
	    					} else {

	    						if (checkEmptyBlock.length > 0) {
	    							checkEmptyBlock.remove();
	    						}
	    						let curataList = draftsArea.find('.curataList');
	    						// adding draftList into all lists
	    						let listContainer = $('<div>', {'class': 'listContainer'});
	    						listContainer.attr('data-id', listId);
	    						// listContainer.attr('data-default-template', tempId);

	    						let listHeaderContainer = $('<div>', {'class': 'listHeaderContainer'});
	    						let listHeader = $('<a>', {'class': 'listHeader'});
	    						let listTitleBlock = $('<li>', {'class': 'listTitleBlock'});
	    						let listTitle = $('<div>', {'class': 'entriesListTitle'});
	    						listHeader.attr('href', list_href);
	    						listTitle.text(list_title);
	    						listTitleBlock.append(listTitle);

	    						let addNewEntryBlock = $('<div>', {'class': 'addNewEntryBlock'});
	    						addNewEntryBlock.text('+ add new entry');

	    						listHeader.append(listTitleBlock);
	    						listHeaderContainer.append(listHeader);
	    						listHeaderContainer.append(addNewEntryBlock);

	    						let newEntriesList = $('<ul>', {'class': 'entriesList'});
	    						// adding draftItem (with draftIndicator) to draftsList
	    						newEntriesList.append(draftItem);

	    						if (pageType !== "entries")  {
									listContainer.append(listHeaderContainer);
	    						}
	    						listContainer.append(newEntriesList);


	    						curataList.append(listContainer);
	    						// activate adding new entry
	    					}
	    				}
	    			})
    				initEntriesDropdown();
 					initInstaTrashEntry();
 					initCreateNewEntry();

 					makeHeaderLink();

  					// Update counts
					let publishedItems = $('#Published').find('.singleList');
					let publishedCount = publishedItems.length;
					let draftItems = $('#Drafts').find('.singleList');
					let draftCount = draftItems.length;
					$('*[data-tab="Published"]').text("Published (" + publishedCount + ")");
					$('*[data-tab="Drafts"]').text("Drafts (" + draftCount + ")");
	    		},
	    		error: function(err) {
	    			console.log("Failed to trash entry: ", err);
	    			// Display error not being able to publish
	    		}
	    	});
		})
	}
	initInstaDraftEntry();

	function initUntrashEntry() {
		$('.untrashEntry').off('click');
		$('.untrashEntry').on('click', function() {

	    	$.ajax({
	    		data: {
	    			entryId: entryId
	    		},
	    		type:'POST',
	    		url: '/' + coreURL + '/UntrashEntry',
	    		success: function(response) {
	    			// depending on place, change css and remove trashed stuff from lists, add to other lists, change data-attr values
	    			let trashButton = $('.untrashEntry');
	    			trashButton.addClass('trashEntry');
	    			$('.untrashEntry span').text("Move to trash");
	    			trashButton.removeClass('untrashEntry');
	    			location.reload();
	    		},
	    		error: function(err) {
	    			console.log("Failed to trash entry: ", err);
	    			// Display error not being able to publish
	    		}
	    	});
		});
	}
	initUntrashEntry();

	function initRevertToDraft() {
		$('.makeDraft').off('click');
		$('.makeDraft').on('click', function() {
			let btn = this;

	    	$.ajax({
	    		data: {
	    			entryId: entryId
	    		},
	    		type:'POST',
	    		url: '/' + coreURL + '/RevertEntryToDraft',
	    		success: function(response) {
	    			console.log("Reverted entry back to draft.", response)
	    			let publishBtn = $("<div>", {"class": "publishEntry inline"});
	    			publishBtn.text("Publish");
	    			$('.viewLive').replaceWith(publishBtn);
	    			$(btn).closest('.entrySettingsBlock').remove();
	    			$('.entryState').text('Status: Draft');
	    			initPublishAndCreateEntry();
	    		},
	    		error: function(err) {
	    			console.log("Failed to publish entry: ", err);
	    			// Display error not being able to publish
	    		}
	    	});
		})
	}

	$(window).scroll(function() {

	    //After scrolling 100px from the top...
	    if ( $(window).scrollTop() >= 57 ) {
	        $('.settingsSideNav').css('top', '0');
	        $('.entrySettingsDelete').css('bottom', '0');

	    //Otherwise remove inline styles and thereby revert to original stying
	    } else {
	        $('.settingsSideNav').css('top', '57px');
	        $('.entrySettingsDelete').css('bottom', '57px');

	    }
	});

	// function initGoToEditTemplate() {
	// 	$('.editTemplate').on('click', function() {
	// 		if (savingInProgress == true) {
	// 			alert('Wait! Save in progress!');
	// 		} else {
	// 			window.location.href = '/' + coreURL + '/templates/' + tempId;
	// 		}
	// 	}) 
	// }
	// initGoToEditTemplate();

	if ($('.navlink').length) {
	    $(".navlink").each(function() {
	        if (this.href == window.location.href) {
	            $(this).addClass("activeNav");
	        }
	    });
	}

	if ($('.sidelink').length) {
	    $(".sidelink").each(function() {
	        if (this.href == window.location.href) {
	            $(this).addClass("activeSideLink");
	        }
	    });
	}

	function initCloseEntrySettings() {

		$('.closeEntrySettings').off('click');
		$('.closeEntrySettings').on('click', function() {
			$('.settingsSideNav').hide();
			$('.sectionArea').removeClass('recalculatedWidth');
		})
	}
	initCloseEntrySettings();

	function initToggleEntrySettings() {

		$('.settingsButton').off('click');
		$('.settingsButton').on('click', function() {
			$('.settingsSideNav').toggle();
			$('.sectionArea').toggleClass('recalculatedWidth');
		})
	}
	initToggleEntrySettings();


	function initPublishAndCreateEntry() {
		
		$('.publishEntry').off('click');
		$('.publishEntry').on('click', function() {
			let entryId = $('.entryContainer__space').attr('data-entryformid');

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

	if ($('.entryState').attr('data-entryState') == "Draft") {
		initPublishAndCreateEntry();
	} else {
		initRevertToDraft();
	}

	function enableDisablePublish() {
		if (enableDisableInProgress == true) {
			return console.log('Still handling previous case. Will resolve on its own.');
		} else {
			enableDisableInProgress = true;
			savingInProgress = !savingInProgress;
			if (savingInProgress == true) {
				if ($('.entryState').attr('data-entryState') == "Draft") {
					$('.publishEntry').off('click');
					$('.editTemplate').off('click');
					$('.publishEntry').css('background-color', '#ececec');
					$('.publishEntry').css('color', '#ccc');
					$('.editTemplate').css('background-color', '#ececec');  
					$('.editTemplate').css('color', '#ccc');  
					$('.statusMessage').text("Saving changes...")
					enableDisableInProgress = false;
				} else {
					$('.makeDraft').off('click');
					$('.editTemplate').off('click');
					$('.publishEntry').css('background-color', '#ececec');
					$('.publishEntry').css('color', '#ccc');
					$('.editTemplate').css('background-color', '#ececec');  
					$('.editTemplate').css('color', '#ccc'); 
					$('.statusMessage').text("Saving changes...")
					enableDisableInProgress = false;
				}
			} else if (savingInProgress == false) {
				if ($('.entryState').attr('data-entryState') == "Draft") {
					initPublishAndCreateEntry();
					// $('.publishEntry').css();
					$('.statusMessage').text("All changes saved.")
					$('.publishEntry').css('background-color', '#ffffff');
					$('.publishEntry').css('color', '#333333');
					$('.editTemplate').css('background-color', '#ffffff');  
					$('.editTemplate').css('color', '#333333'); 
					enableDisableInProgress = false;
				} else {
					initRevertToDraft();
					$('.editTemplate').css('background-color', '#ffffff'); 
					$('.publishEntry').css('background-color', '#ffffff');
					$('.editTemplate').css('color', '#333333'); 
					$('.publishEntry').css('color', '#333333');
					$('.statusMessage').text("All changes saved.")
					enableDisableInProgress = false;
				}
			}
		}
	}


	function initQuestionBlocks() {
		$('.collapsible').off('click');
		$('.collapsible').each(function(index, obj) {
			$(this).on('click', function(event) {
				if ($(event.target).is('.QuestionTitle') || $(event.target).is('.deleteQuestion')) return;
				$(this).toggleClass('active');
				// targets questionBlock because there are multiple contents
				let parentBlock = $(this).closest('.questionBlock');
				let content = parentBlock.find('.content');
				// beware, there is mixing of vanilla JS with jQuery
			    if (content[0].style.maxHeight) {
			    	content[0].style.maxHeight = null;
			    } else {
			  		let scrollHeight = content[0].scrollHeight;
			  		let modifiedHeight = scrollHeight + "px";
			  		console.log(scrollHeight);
			  		console.log("modified: ", modifiedHeight);
			  		content.css('max-height', modifiedHeight);
			    } 
		 	});
		})
	}
	initQuestionBlocks();

	function initExpandable() {
		$('.expandable').off('click');
		$('.expandable').each(function(index, obj) {
			$(this).on('click', function() {
				$(this).toggleClass('activeExpandable');
				let parentBlock = $(this).closest('.Component');
				let content = parentBlock.find('.content');
				// beware, there is mixing of vanilla JS with jQuery
			    if (content[0].style.maxHeight) {
			    	content[0].style.maxHeight = null;
			    } else {
			  		let scrollHeight = content[0].scrollHeight;
			  		let modifiedHeight = scrollHeight + "px";
			  		console.log(scrollHeight);
			  		console.log("modified: ", modifiedHeight);
			  		content.css('max-height', modifiedHeight);
			    } 
		 	});
		})
	}
	initExpandable();

	function initImageTitleAdding() {
		$('.addImageTitle').on('click', function() {
			// declare html blocks to insert
			let ImageTitle = $("<div>", {"class": "ImageTitle"});
			let ImageTitleInput = $("<input>", {"class": "ElementTitle ImageTitleInput", "placeholder": "Image title or name"});

			let deleteBtn = $("<div>", {"class": "deleteImageTitle"});
			deleteBtn.text('Delete');

			ImageTitle.append(ImageTitleInput);

			let Component = $(this).closest('.Component');
			let componentId = Component.attr('id');

			Component.find('.ImageTitleBlock').append(ImageTitle);
			Component.find('.ImageTitleBlock').append(deleteBtn)

		    initTitleListening(elementTitleInput, elementTitleURL, typePOST, 'componentTitle');
		    initComponentTitleExit();
			initImageTitleDelete();
			$(this).remove();
		})
	}
	initImageTitleAdding();

	function initImageDescriptionAdding() {
		$('.addImageDescription').on('click', function() {
			console.log("Yo.");
			let Component = $(this).closest('.Component');
			let ComponentId = Component.attr('id');

			let ImageDescription = $("<div>", {"class": "editorSortable"});
			let simpleEditor = $("<div>", {"class": "simpleEditor"});
			let editorTools = $("<div>", {"class": "editorTools unreset", "id": "toolbar_" + ComponentId});
			let editorText = $("<div>", {"class": "editorText unreset", "id": "editor_" + ComponentId});
			let fillerText = $("<p>");
			fillerText.text('Write something...');


			editorText.append(fillerText);
			simpleEditor.append(editorTools);
			simpleEditor.append(editorText);
			ImageDescription.append(simpleEditor);

			let deleteBtn = $("<div>", {"class": "deleteImageDescription"});
			deleteBtn.text('Delete');

			ImageDescriptionBlock = Component.find('.ImageDescriptionBlock')

			ImageDescriptionBlock.append(ImageDescription);
			ImageDescriptionBlock.append(deleteBtn);

			findAndInitSimpleEditors();
			$(this).remove();
			initImageDescriptionDelete();
		})
	}
	initImageDescriptionAdding();

	function initImageDelete() {
		$('.deleteImage').off('click');
		$('.deleteImage').on('click', function() {
			enableDisablePublish();
			let Component = $(this).closest('.Component');
			let ComponentId = Component.attr('id');

			let image = Component.find('.imageBlock')
			let imageKey = image.attr('data-image-key');

			let dateUpdated = new Date();

	    	$.ajax({
	    		data: {
	    			imageKey: imageKey,
	    			componentId: ComponentId,
	    			dateUpdated: dateUpdated,
	    			entryId: entryId
	    		},
	    		type:'DELETE',
	    		url: '/' + coreURL + '/DeleteImage',
	    		success: function(response) {
	    			console.log("Deleted image from database.");
	    			image.css('background-image', '');
	    			image.removeAttr('data-image-key');
	    			Component.find('.deleteImage').remove();
	    			enableDisablePublish();
	    		},
	    		error: function(err) {
	    			console.log("Failed to delete image from database: ", err);
	    			enableDisablePublish();
	    			// Display error not being able to delete note
	    		}
	    	});
		})
	}
	initImageDelete();

	function initEntryImageDelete() {
		$('.deleteMainImage').off('click');
		$('.deleteMainImage').on('click', function() {
			enableDisablePublish();

			let image = $(this).closest('.imageBlock')
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
	    			image.css('background-image', '');
	    			image.removeAttr('data-image-key');
	    			image.find('.deleteMainImage').remove();
	    			enableDisablePublish();
	    		},
	    		error: function(err) {
	    			console.log("Failed to delete image from database: ", err);
	    			enableDisablePublish();
	    			// Display error not being able to delete note
	    		}
	    	});
		})
	}
	initEntryImageDelete();

	function initImageTitleDelete() {
		$('.deleteImageTitle').off('click');
		$('.deleteImageTitle').on('click', function() {
			enableDisablePublish();
			let Component = $(this).closest('.Component');
			let ComponentId = Component.attr('id');
			let dateUpdated = new Date();

			let title = Component.find('.ImageTitleInput')

			title.animate({opacity:0});

			let deleteBtn = this

	    	$.ajax({
	    		data: {
	    			componentId: ComponentId,
	    			dateUpdated: dateUpdated,
					entryId: entryId
	    		},
	    		type:'DELETE',
	    		url: '/' + coreURL + '/DeleteImageTitle',
	    		success: function(response) {
	    			title.remove();
	    			$(deleteBtn).remove()
	    			let addTitleBtn = $("<div>", {"class": "addImageTitle"});
	    			addTitleBtn.text('+ Add title');
	    			Component.find('.ImageTitleAddingBlock').append(addTitleBtn);
	    			initImageTitleAdding();
	    			enableDisablePublish();

	    		},
	    		error: function(err) {
	    			console.log("Failed to delete image from database: ", err);
	    			title.animate({opacity:1});
	    			enableDisablePublish();
	    			// Display error not being able to delete note
	    		}
	    	});
		})
	}
	initImageTitleDelete();

	function initImageDescriptionDelete() {
		$('.deleteImageDescription').off('click');
		$('.deleteImageDescription').on('click', function() {
			enableDisablePublish();
			let Component = $(this).closest('.Component');
			let ComponentId = Component.attr('id');
			let dateUpdated = new Date();

			let description = Component.find('.editorSortable')

			description.animate({opacity:0});

			let deleteBtn = this

	    	$.ajax({
	    		data: {
	    			componentId: ComponentId,
	    			dateUpdated: dateUpdated,
					entryId: entryId
	    		},
	    		type:'DELETE',
	    		url: '/' + coreURL + '/DeleteImageDescription',
	    		success: function(response) {
	    			description.remove();
	    			$(deleteBtn).remove()
	    			let addDescriptionBtn = $("<div>", {"class": "addImageDescription"});
	    			addDescriptionBtn.text('+ Add description');
	    			Component.find('.ImageDescriptionAddingBlock').append(addDescriptionBtn);
	    			initImageDescriptionAdding();
	    			enableDisablePublish();

	    		},
	    		error: function(err) {
	    			console.log("Failed to delete image from database: ", err);
	    			description.animate({opacity:1});
	    			enableDisablePublish();
	    			// Display error not being able to delete note
	    		}
	    	});
		})
	}
	initImageDescriptionDelete();

	function initChecklists() {
		$('input[type="checkbox"][class="checklistBox"]').on('change', 
			function() {
			if (firstCreationInProgress == true) {
				return console.log("Will push update with next attempt.");
			}
			enableDisablePublish();
			console.log("Checkbox value change");

			let component = $(this).closest('.Component');
			let componentId = component.attr('id');
			let componentType = component.attr('data-component');
			let listItem = $(this).closest('.ListItem');
			let thisBox = $(this);
			let dateUpdated = new Date();

	    	let lengthEqualsOne = false;
	    	let listLength = component.find('.ListItem').length;
	    	console.log('List length: ', listLength);

	    	if (listLength === 1) {
	    		lengthEqualsOne = true;
	    		console.log("Switched length equals one to true.");
	    	}
	    	console.log('Length value before: ', lengthEqualsOne);

			if (lengthEqualsOne == true && !listItem.attr('id')) {
				firstCreationInProgress = true;
				let itemOrder = listItem.index();
				let listItemInput = "N/A";
				$.ajax({
					data: {
						componentId: componentId,
						entryId: entryId,
						listItem: listItemInput,
						itemOrder: itemOrder,
						componentType: componentType,
						dateUpdated: dateUpdated
					},
					type: 'POST',
					url: '/' + coreURL + '/CreateNewListItem',
					success: function(item) {
						console.log("List item successfully created.");
						// display success or show 'entry saved' like in google docs
						listItem.attr('id', item._id);
						let deleteBtn = $('<div>', {'class': 'deleteItem'});
						deleteBtn.text('x');
						let linkContainer = listItem.find('.showLinkContainer');
						linkContainer.after(deleteBtn);
						initListItemDeleting();
						firstCreationInProgress = false;
					},
					error: function(err) {
						console.log("List item creation failed: ", err);
						firstCreationInProgress = false;
						// display error or show 'entry save failed' like in google docs
							// make hidden error div visible, replace text, hide in some seconds and .empty() text
					},
					complete: function() {
						let listItemId = listItem.attr('id');
						let checkboxValue;

						if (thisBox.is(':checked')) {
							checkboxValue = "Checked";
							console.log("Checkbox is checked.", checkboxValue);
							$.ajax({
								data: {
									checkboxValue: checkboxValue,
									componentId: componentId,
									listItemId: listItemId,
									dateUpdated: dateUpdated,
									entryId: entryId
								},
								type: 'POST',
								url: '/' + coreURL + '/UpdateChecklist',
					    		success: function(response) {
					    			console.log("Checklist update successful.");
					    			enableDisablePublish();
					    		},
					    		error: function(err) {
					    			console.log("Checklist update failed: ", err);
					    			// Display error not being able to delete note
					    			enableDisablePublish();
					    		}
							})
						} else {
							checkboxValue = "Unchecked";
							console.log("Checkbox is not checked.", checkboxValue);
							$.ajax({
								data: {
									checkboxValue: checkboxValue,
									componentId: componentId,
									listItemId: listItemId,
									dateUpdated: dateUpdated,
									entryId: entryId
								},
								type: 'POST',
								url: '/' + coreURL + '/UpdateChecklist',
					    		success: function(response) {
					    			console.log("Checklist update successful.");
					    			enableDisablePublish();
					    		},
					    		error: function(err) {
					    			console.log("Checklist update failed: ", err);
					    			// Display error not being able to delete note
					    			enableDisablePublish();
					    		}
							})
						}
					}
				})
			} else {
				let listItemId = listItem.attr('id');
				let checkboxValue;

				if (thisBox.is(':checked')) {
					checkboxValue = "Checked";
					console.log("Checkbox is checked.", checkboxValue);
					$.ajax({
						data: {
							checkboxValue: checkboxValue,
							componentId: componentId,
							listItemId: listItemId,
							dateUpdated: dateUpdated,
							entryId: entryId
						},
						type: 'POST',
						url: '/' + coreURL + '/UpdateChecklist',
			    		success: function(response) {
			    			console.log("Checklist update successful.");
			    			enableDisablePublish();
			    		},
			    		error: function(err) {
			    			console.log("Checklist update failed: ", err);
			    			// Display error not being able to delete note
			    			enableDisablePublish();
			    		}
					})
				} else {
					checkboxValue = "Unchecked";
					console.log("Checkbox is not checked.", checkboxValue);
					$.ajax({
						data: {
							checkboxValue: checkboxValue,
							componentId: componentId,
							listItemId: listItemId,
							dateUpdated: dateUpdated,
							entryId: entryId
						},
						type: 'POST',
						url: '/' + coreURL + '/UpdateChecklist',
			    		success: function(response) {
			    			console.log("Checklist update successful.");
			    			enableDisablePublish();
			    		},
			    		error: function(err) {
			    			console.log("Checklist update failed: ", err);
			    			// Display error not being able to delete note
			    			enableDisablePublish();
			    		}
					})
				}
			}
		})
	}
	initChecklists();

	function initNewQuestionAdding() {
		$('.addNewButton').on('click', function() {

			enableDisablePublish();

			if (creatingQuestion == true) {
				return console.log("Last question still being created, try again in a moment.")
			} else {

				// set flag 
				creatingQuestion = true;

				let dateUpdated = new Date();

				// declare html blocks to create
				let questionBlock = $("<li>", {"class": "questionBlock sortableListItem", "id": "tempQuestionId"});
				let questionBtn = $('<button>', {'class': 'collapsible unsortable'})
				let question = $("<input>", {"class": "QuestionTitle", "placeholder": "Question", "data-type": "question"});
				questionBtn.append(question);

				let contentBlock = $('<div>', {'class': 'content'});
				let editorBlock = $('<div>', {'class': 'editorSortable'});

				let simpleEditor = $('<div>', {'class': 'simpleEditor'});

				editorCount = editorCount + 1;
				editorID = 'editor_' + editorCount;
				toolbarID = 'toolbar_' + editorCount;

				let editorTools = $('<div>', {'class': 'editorTools unreset', 'id': toolbarID});
				let editorText = $('<div>', {'class': 'editorText unreset', 'id': editorID});

				let sampleParagraph = $('<p>');
				sampleParagraph.text('This is sample text.');
				editorText.append(sampleParagraph);

				simpleEditor.append(editorTools);
				simpleEditor.append(editorText);

				editorBlock.append(simpleEditor);
				contentBlock.append(editorBlock);

				questionBlock.append(questionBtn);
				questionBlock.append(contentBlock);

				let questions = $(this).closest('.Component').find('.questions');
				questions.append(questionBlock);
				initQuestionBlocks();

				let componentId = $(this).closest('.Component').attr('id');
				let entryId = $('.entryContainer__space').attr('data-entryformid');

				let componentOrder = $(this).closest('.Component').index();
				let itemOrder = $('#tempQuestionId').index();

				// create new question in database
				$.ajax({
				  data: {
				    entryId: entryId,
				    componentId: componentId,
				    itemOrder: itemOrder,
				    dateUpdated: dateUpdated
				  },
				  type: 'POST',
				  url: '/' + coreURL + '/CreateNewQuestion',
				  success: function(response){
				    console.log("Question successfully created: ", response);
				    // Display success message?

				    let QuestionId = response._id;
				    $('#tempQuestionId').attr('id', QuestionId);
				    let newToolsId = 'toolbar_' + response._id;
				    let newEditorId = 'editor_' + response._id;
				    let questionBlock = $('#' + QuestionId);
				    questionBlock.find('.editorText').attr('id', newEditorId);
				    questionBlock.find('.editorTools').attr('id', newToolsId);
				    initTitleListening(questionTitleInput, questionTitleURL, typePOST, 'question');
				    initQuestionTitleExit();
				    findAndInitSimpleEditors();
					let deleteBtn = $("<div>", {"class": "deleteQuestion"});
					deleteBtn.text("Delete");
					questionBlock.find('.collapsible').append(deleteBtn);
					initQuestionDeleting();
				    creatingQuestion = false;
				    enableDisablePublish();
				  },
				  error: function(err){
				    console.log("Question creation failed: ", err);
				    creatingQuestion = false;
				    // Display error message
				    enableDisablePublish();
				  }
				});
			}
		})
	}
	initNewQuestionAdding()

	class MyUploadAdapter {
	    constructor( loader ) {
	        // CKEditor 5's FileLoader instance.
	        this.loader = loader;

	        // URL where to send files.
	        this.url = '/' + coreURL + '/UploadSingleImage';
	    }

	    // Starts the upload process.
	    upload() {
	        return new Promise( ( resolve, reject ) => {
	            this._initRequest();
	            this._initListeners( resolve, reject );
	            this._sendRequest();
	        } );
	    }

	    // Aborts the upload process.
	    abort() {
	        if ( this.xhr ) {
	            this.xhr.abort();
	        }
	    }

	    // Example implementation using XMLHttpRequest.
	    _initRequest() {
	        const xhr = this.xhr = new XMLHttpRequest();

	        xhr.open( 'POST', this.url, true );
	        xhr.responseType = 'json';
	    }

	    // Initializes XMLHttpRequest listeners.
	    _initListeners( resolve, reject ) {
	        const xhr = this.xhr;
	        const loader = this.loader;
	        const genericErrorText = 'Couldn\'t upload file:' + ` ${ loader.file.name }.`;

	        xhr.addEventListener( 'error', () => reject( genericErrorText ) );
	        xhr.addEventListener( 'abort', () => reject() );
	        xhr.addEventListener( 'load', () => {
	            const response = xhr.response;

	            if ( !response || response.error ) {
	                return reject( response && response.error ? response.error.message : genericErrorText );
	            }

	            // If the upload is successful, resolve the upload promise with an object containing
	            // at least the "default" URL, pointing to the image on the server.
	            resolve( {
	                default: response.location
	            } );
	        } );

	        if ( xhr.upload ) {
	            xhr.upload.addEventListener( 'progress', evt => {
	                if ( evt.lengthComputable ) {
	                    loader.uploadTotal = evt.total;
	                    loader.uploaded = evt.loaded;
	                }
	            } );
	        }
	    }

	    // Prepares the data and sends the request.
	    _sendRequest() {
	        const data = new FormData();

	        data.append( 'image', this.loader.file );
	        let curataId = $('.curataId').attr('id');
	        let componentId = lastUsedEditorComponentId;
	        let entryId = $('.entryContainer__space').attr('data-entryformid');
	        let dateUpdated = new Date();
	        data.append('curataId', curataId);
	        data.append('componentId', componentId);
	        data.append('entryId', entryId);
	        data.append('dateUpdated', dateUpdated);

	        this.xhr.send( data );
	    }
	}

	function MyCustomUploadAdapterPlugin( editor ) {
	    editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader ) => {
	        return new MyUploadAdapter( loader );
	    };
	}

	// CKEditor meant only as the editor for an entry's default description
	function initMainEditor(editorID, toolbarID) {
	    DecoupledEditor
	        .create( document.querySelector( editorID ), {
	        removePlugins: [ 'FontSize', 'MediaEmbed', 'insertTable', 'Heading', 'alignment', 'Undo', 'Redo', 'FontFamily' ],
	        toolbar: ['bold', 'italic', 'highlight', '|' ,'bulletedList', 'numberedList', 'Link', 'blockQuote' ]
	    }  )
	        .then( editor => {
	            const toolbarContainer = document.querySelector( toolbarID );

				if (toolbarContainer && toolbarContainer.length) {
					toolbarContainer.appendChild(editor.ui.view.toolbar.element);
				}

	            // Multiple editor instances: https://stackoverflow.com/questions/48575534/ckeditor-5-get-editor-instances
	            // myEditor = editor;
	            editors[editorID] = editor;

				editor.model.document.on( 'change:data', function() {
					enableDisablePublish();
				    console.log( 'The data has changed!' );
				    let entryText = editor.getData();
				    console.log("Content: ", entryText);
				    let dateUpdated = new Date();


					$.ajax({
					  data: {
					    entryText: entryText,
					    entryId: entryId,
					    dateUpdated: dateUpdated
					  },
					  type: 'POST',
					  url: '/' + coreURL + '/UpdateEntryText',
					  success: function(Item){
					    console.log("Entry text successfully updated.")
					    // Display success message?
					    enableDisablePublish();
					  },
					  error: function(err){
					    console.log("Entry text update failed: ", err);
					    // Display error message?
					    enableDisablePublish();
					  }
					});
				});

	        } )
	        .catch( error => {
	            console.error( error );
	        } );
	}


	function initializeEditor(editorID, toolbarID, ComponentId) {
	    DecoupledEditor
	        .create( document.querySelector( editorID ), {
	        removePlugins: [ 'FontSize', 'MediaEmbed', 'insertTable', 'Heading', 'alignment', 'Undo', 'Redo', 'FontFamily', 'ImageCaption', 'ImageTextAlternative' ],
	        toolbar: ['bold', 'italic', 'highlight', '|' ,'bulletedList', 'numberedList', 'Link', 'blockQuote', 'ImageUpload' ],
	        extraPlugins: [ MyCustomUploadAdapterPlugin ]
	    }  )
	        .then( editor => {
	            const toolbarContainer = document.querySelector( toolbarID );

	            toolbarContainer.appendChild( editor.ui.view.toolbar.element );

	            // Multiple editor instances: https://stackoverflow.com/questions/48575534/ckeditor-5-get-editor-instances
	            // myEditor = editor;
	            editors[editorID] = editor;

				let ComponentOrder = $('#' + ComponentId).attr('data-order');

				editor.model.document.on( 'change:data', function() {
					enableDisablePublish();
				    console.log( 'The data has changed!' );
				    console.log("editorID: ", editorID);
				    console.log("cID", ComponentId);
				    lastUsedEditorComponentId = ComponentId;
				    let ComponentContent = editor.getData();
				    console.log("Content: ", ComponentContent);
				    let dateUpdated = new Date();

				    // In case there is a need for LivePreview, use this:

					// let matchingPreviewElement = $('.entryPreviewArea').find("[data-order='" +ComponentOrder +"']").find('.editorText');
					// matchingPreviewElement.html(ComponentContent);

					$.ajax({
					  data: {
					    ComponentId: ComponentId,
					    ComponentContent: ComponentContent,
					    entryId: entryId,
					    dateUpdated: dateUpdated
					  },
					  type: 'POST',
					  url: '/' + coreURL + '/UpdateComponentContent',
					  success: function(Item){
					    console.log("Component content successfully updated.")
					    // Display success message?
					    enableDisablePublish();
					  },
					  error: function(err){
					    console.log("Component content update failed: ", err);
					    // Display error message?
					    enableDisablePublish();
					  }
					});
				});

	        } )
	        .catch( error => {
	            console.error( error );
	        } );
	}

	function initializeSimpleEditor(editorID, toolbarID, ComponentId, componentType, QuestionId) {
	    DecoupledEditor
	        .create( document.querySelector( editorID ), {
	        removePlugins: [ 'FontSize', 'MediaEmbed', 'insertTable', 'Heading', 'alignment', 'Undo', 'Redo', 'FontFamily', 'highlight' ],
	        toolbar: ['bold', 'italic', '|' ,'bulletedList', 'numberedList', 'Link', 'blockQuote' ]
	    }  )
	        .then( editor => {
	            const toolbarContainer = document.querySelector( toolbarID );

	            toolbarContainer.appendChild( editor.ui.view.toolbar.element );

	            // Editor initialization
	            // myEditor = editor;
	            editors[editorID] = editor;
	            console.log("Simple editors: ", editors);
	            let ComponentOrder = $('#' + ComponentId).attr('data-order');

				editor.model.document.on( 'change:data', function() {
					enableDisablePublish();

					let dateUpdated = new Date();

					if (componentType == "questionAnswer") {
						console.log("Question content data has changed!");
						let QuestionContent = editor.getData();

						// let matchingPreviewElement = $('.entryPreviewArea').find("[data-order='" +ComponentOrder +"']").find('#' + QuestionId).find('.editorText');
						// matchingPreviewElement.html(QuestionContent);

						$.ajax({
							data: {
								ComponentId: ComponentId,
								QuestionContent: QuestionContent,
								QuestionId: QuestionId,
								entryId: entryId,
								dateUpdated: dateUpdated
							},
							type: 'POST',
							url: '/' + coreURL + '/UpdateQuestionContent',
							success: function(Item) {
								console.log("Question content successfully updated.");
								//  display success message
								enableDisablePublish();
							},
							error: function(Item) {
								console.log("Question content update failed.");
								// display error message
								enableDisablePublish();
							}
						})
					} else {
					    console.log( 'The data has changed!' );
					    console.log("editorID: ", editorID);
					    console.log("cID", ComponentId);
					    let ComponentContent = editor.getData();
					    console.log("Content: ", ComponentContent);

						// let matchingPreviewElement = $('.entryPreviewArea').find("[data-order='" +ComponentOrder +"']").find('.editorText');
						// matchingPreviewElement.html(ComponentContent);

						$.ajax({
						  data: {
						    ComponentId: ComponentId,
						    ComponentContent: ComponentContent,
						    entryId: entryId
						  },
						  type: 'POST',
						  url: '/' + coreURL + '/UpdateComponentContent',
						  success: function(Item){
						    console.log("Component content successfully updated.")
						    // Display success message
						    enableDisablePublish();
						  },
						  error: function(err){
						    console.log("Component content update failed: ", err);
						    // Display error message
						    enableDisablePublish();
						  }
						});
					}
				});

	        } )
	        .catch( error => {
	            console.error( error );
	        } );
	}

	function findAndInitMainEditor() {
		let mainEditor = $('.mainEditor');
		let editorID = mainEditor.find('.editorText').attr('id');
		let toolbarID = mainEditor.find('.editorTools').attr('id');

		editorID = '#' + editorID;
		toolbarID = '#' + toolbarID;

		console.log("regular editorID: ",  editorID);
		console.log("regular toolbarID: ", toolbarID);
		initMainEditor(editorID, toolbarID);
	}
	if ($('.mainEditor').length) {
		findAndInitMainEditor();
	}

	function findAndInitEditors() {
		$('.editor').each(function(index, obj) {

			let editorID = $(this).find('.editorText').attr('id');
			let toolbarID = $(this).find('.editorTools').attr('id');
			let componentId = $(this).closest('.Component').attr('id');

			editorID = '#' + editorID;
			toolbarID = '#' + toolbarID;

			console.log("regular editorID: ",  editorID);
			console.log("regular toolbarID: ", toolbarID);
			initializeEditor(editorID, toolbarID, componentId);
		});
	}
	findAndInitEditors();

	function findAndInitSimpleEditors() {
		$('.simpleEditor').each(function(index, obj) {
			let editor = $(this).find('.editorText');
			let initializedValue = editor.attr('data-editor-initialized');
			if (initializedValue == 'true') {
				console.log('This editor already initialized, proceeding to next one.');
			} else {
				editor.attr('data-editor-initialized', 'true');
				let editorID = editor.attr('id');
				let toolbarID = $(this).find('.editorTools').attr('id');
				let componentId = $(this).closest('.Component').attr('id');
				let componentType = $(this).closest('.Component').attr('data-component');
				let QuestionId = "NA";
				if (componentType == "questionAnswer") {
					QuestionId = $(this).closest('.questionBlock').attr('id');
				};
				editorID = '#' + editorID;
				toolbarID = '#' + toolbarID;
				$(this).find('.editorTools').hide();
				console.log("editorID: ",  editorID);
				console.log("toolbarID: ", toolbarID);
				initializeSimpleEditor(editorID, toolbarID, componentId, componentType, QuestionId);

			}
		})
	}
	findAndInitSimpleEditors();

	// async function activateEditors() {
	// 	findAndInitSimpleEditors();
	// }

	// async function afterEditorsActivated() {
	// 	await activateEditors();
	// 	initEditorListening();
	// }

	// activateEditors();
	// afterEditorsActivated();

	// if a particular component has no data, don't display it in preview & live

	// choose what info is displayed in lists (configure the meta-data)
		// choose to make each item only direct elsewhere (e.g. like an affiliate product listing)


	function initAddEntryLink() {
		$('.addEntryLink').on('click', function() {
			let linkContainer = $(this).closest('.linkContainer');
			let linkInput = $('<input>', {'class': 'EntryLink'});
			linkInput.attr('placeholder', "Your link");
			let saveEntryLink = $('<div>', {'class': 'saveEntryLink'});
			saveEntryLink.text("Save link");
			linkContainer.append(linkInput);
			linkContainer.append(saveEntryLink);
			initEntryLinkSave();
			initEntryLinkExit();
			$(this).remove();
		})
	}
	initAddEntryLink();

	function initEntryLinkSave() {
		$('.saveEntryLink').on('click', function() {
			enableDisablePublish();

			let item = $(this);
			let entryLink = $('.EntryLink');
			let link = $('.EntryLink').val();
			let parsedLink = (link.indexOf('://') === -1) ? 'http://' + link : link;
			let dateUpdated = new Date();

			$.ajax({
			  data: {
			    entryLink: parsedLink,
			    entryId: entryId,
			    dateUpdated: dateUpdated
			  },
			  type: 'POST',
			  url: '/' + coreURL + '/UpdateEntryLink',
			  success: function(Item){
			    console.log("Entry link successfully updated.")
			    let newLink = $('<a>', {'class': 'EntryLink'});
			    newLink.attr("href", parsedLink);
			    newLink.attr("target", "_blank");
			    newLink.text(parsedLink);
			    entryLink.replaceWith(newLink);
			    let linkContainer = item.closest('.linkContainer');
			    if (linkContainer.find('.removeLink').length) {
			    	console.log("Remove link already exists.");
			    } else {
					let removeLinkBtn = $('<div>', {'class': 'removeLink'});
					removeLinkBtn.text("Remove link");
					$('.linkContainer').append(removeLinkBtn);
					initEntryLinkRemove();
			    }
			    item.remove();
			    // Display success message?
			    enableDisablePublish();

			  },
			  error: function(err){
			    console.log("Entry link update failed: ", err);
			    // Display error message?
			    enableDisablePublish();
			  }
			});
		})
	}
	initEntryLinkSave();

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

	function initEntryLinkRemove() {
		$('.removeLink').on('click', function() {
			enableDisablePublish();
			let link = $(this);
			let dateUpdated = new Date();
			$.ajax({
				data: {
					entryId: entryId,
					dateUpdated: dateUpdated
				},
				type: 'DELETE',
				url: '/' + coreURL + '/RemoveEntryLink',
				success: function(response) {
					console.log('Entry link successfully removed!');
					let linkContainer = link.closest('.linkContainer');
					let entryLink = linkContainer.find('.EntryLink');
					entryLink.remove();
					let addLinkBtn = $('<div>', {'class': 'addEntryLink'});
					addLinkBtn.text("+ Add link");
					link.remove();
					linkContainer.append(addLinkBtn);
					initAddEntryLink();
					enableDisablePublish();
				},
				error: function(err) {
					console.log('Entry link remove failed: ', err);
					enableDisablePublish();
				}
			})

		})
	}
	initEntryLinkRemove();

	// Init listening to any title input change for all title types found on any particular page
	function initTitleListening(titleElement, ajaxURL, ajaxType, titleGroup) {
		titleElement.off('input change');
		titleElement.on('input change', function() {

			let dateUpdated = new Date();

			let element = $(this);
			let entryId = $('.entryContainer__space').attr('data-entryformid');
			let component = element.closest('.Component');
			let componentId;
			if (component && component.length) {
				componentId = component.attr('id');
			}
			let question = element.closest('.questionBlock');
			let questionId;
			if (question && question.length) {
				questionId = question.attr('id');
			}
			let curataId = $('.curataId');

			if (curataId && curataId.length) {
				curataId = curataId.attr('id');
			} else  {
				// first element does not exist, look for other element
				let otherElement = $('.currentCurataSwitch');
				if (otherElement && otherElement.length) {
					curataId = otherElement.attr('id');
				}
			}

			let title = element.val();

			let data = {};

			if (titleGroup == "componentTitle") {
				enableDisablePublish();
				data.ComponentTitle = title;
				data.ComponentId = componentId
				data.entryId = entryId;
				data.dateUpdated = dateUpdated;

			} else if (titleGroup == "entryTitle") {
				enableDisablePublish();
				data.entryTitle = title;
				data.entryId = entryId;
				data.dateUpdated = dateUpdated;

			} else if (titleGroup == "curataName") {
				data.curataName = title;
				data.curataId = curataId;

			} else if (titleGroup == "curataAddress") {
				data.curataAddress = title;
				data.curataId = curataId;

			} else if (titleGroup == "question") {
				enableDisablePublish();
				data.ComponentId = componentId;
				data.EntryId = entryId;
				data.QuestionId = questionId;
				data.QuestionTitle = title;
				data.dateUpdated = dateUpdated;
			} else if (titleGroup == "listTitle") {
				let listId = $('.entriesContainer').attr('id');
				data.listTitle = title;
				data.listId = listId;
			}

			$.ajax({
				data: data,
				type: ajaxType,
				url: '' + ajaxURL,
				success: function(data) {
					console.log("Update successful");
					if (titleGroup == "componentTitle" || titleGroup == "entryTitle" || titleGroup == "question") {
						enableDisablePublish();
					}
					if (titleGroup == "curataName") {
						$('.curataName').text(title);
					}

					if (titleGroup == "listTitle") {
						$('.curataPageTitle').text(title);
					}
				},
				error: function(err) {
					console.log("Update failed:", err);
					if (titleGroup == "componentTitle" || titleGroup == "entryTitle" || titleGroup == "question") {
						enableDisablePublish();
					}
				}
			})

		})
	}

	let typePOST = 'POST';

	let elementTitleInput = $('.ElementTitle');
	let elementTitleURL = '/' + coreURL + '/UpdateComponentTitle';
	initTitleListening(elementTitleInput, elementTitleURL, typePOST, 'componentTitle');

	let entryTitleInput = $('.EntryTitle');
	let entryTitleURL = '/' + coreURL + '/updateEntryTitle';
	initTitleListening(entryTitleInput, entryTitleURL, typePOST, 'entryTitle');

	let curataName = $('.curataSettingsTitle');
	let curataURL = '/' + coreURL + '/UpdateCurataName';
	initTitleListening(curataName, curataURL, typePOST, 'curataName');

	let curataAddress = $('.curataSettingsAddress');
	let curataAddressURL = '/' + coreURL + '/UpdateCurataAddress';
	initTitleListening(curataAddress, curataAddressURL, typePOST, 'curataAddress');

	let questionTitleInput = $('.QuestionTitle');
	let questionTitleURL = '/' + coreURL + '/UpdateQuestionTitle';
	initTitleListening(questionTitleInput, questionTitleURL, typePOST, 'question');

	let listTitleInput = $('.listTitle__listSettings');
	let listTitleURL = '/' + coreURL + '/UpdateListTitle';
	initTitleListening(listTitleInput, listTitleURL, typePOST, 'listTitle');

	// function initPermaDeleteCurata() {
	// 	$('.deleteCurataButton').on('click', function() {
	// 		let curataId = $('.currentCurataSwitch').attr('id');

	//     	$.ajax({
	//     		data: {
	//     			curataId: curataId
	//     		},
	//     		type:'DELETE',
	//     		url: '/' + coreURL + '/permaDeleteCurata',
	//     		success: function(response) {
	//     			console.log("Deleted Curata.");
	//     			window.location.href = '/';
	//     		},
	//     		error: function(err) {
	//     			console.log("Failed to delete Curata: ", err);
	//     		}
	//     	});
	// 	})
	// }
	// initPermaDeleteCurata();


	function initDeleteSpace__spaceSettings() {

		let emptyModal = $(".modal__deleteSpace");
		let curataId = $('.currentCurataSwitch').attr('id');

		// careful here, you mighty declare this once, and if this function is not established anew each click, then old values remain, causing difficult to spot errors later on

		$('.deleteSpaceButton').off('click');
		$('.deleteSpaceButton').on('click', function() {
			emptyModal.show();
		})

		$('.cancelPermaDeleteSpace').off('click');
		$('.cancelPermaDeleteSpace').on('click', function() {
			emptyModal.hide();
		})

		$('.modalBackground__deleteSpace').off('click');
		$('.modalBackground__deleteSpace').on('click', function() {
			emptyModal.hide();
		})

		// Press esc key to hide
		$(document).keydown(function(event) { 
		  if (event.keyCode == 27) { 
		  	if (emptyModal.length) {
		  		let modalState = emptyModal.css('display');
			  	if (modalState == "block") {
			  		emptyModal.hide();
			  	}
		  	}
		  }
		});

		$('.confirmPermaDeleteSpace').off('click');
		$('.confirmPermaDeleteSpace').on('click', function() {

			// Indicate 'deleting'
			emptyModal.hide();

			$.ajax({
	    		data: {
	    			curataId: curataId
	    		},
				type: 'DELETE',
				url: '/' + coreURL + '/permaDeleteSpace',
				success: function(response) {
					console.log('Space deleted. Redirecting.');
					window.location.href = '/';

				},
				error: function(err) {
					console.log("Failed to delete spaec.");
					//TODO: Display error message
				}
			})
		});
	}
	initDeleteSpace__spaceSettings()

	/* Functionality: Change username or email
		
		1. Check per input change, whether such username already exists.
			1.1 If such a username exists, display error circle with message that 'Username not available', hide any 'Save' buttons if exist
			1.2 If such a username does not exist and is available for the taking, then display green check circle indicating availability and show message 'Username available' and display 'Save' button

	*/


	/* Functionality: Delete account


		
		1. Check per input change, whether such username already exists.
			1.1 If such a username exists, display error circle with message that 'Username not available', hide any 'Save' buttons if exist
			1.2 If such a username does not exist and is available for the taking, then display green check circle indicating availability and show message 'Username available' and display 'Save' button

	*/


	function initDescriptionListening(descElement, ajaxURL, ajaxType, group) {
		descElement.on('input selectionchange propertychange', function() {

			let element = $(this);
			let value = element.val();
			let data = {};

			if (group == "curataDescription") {
				data.curataDescription = value;
				data.curataId = $('.currentCurataSwitch').attr('id');
			}

			$.ajax({
				data: data,
				type: ajaxType,
				url: '' + ajaxURL,
				success: function(data) {
					console.log("Update successful");
				},
				error: function(err) {
					console.log("Update failed:", err);
				}
			})

		})
	}

	let curataDescription = $('.curataDescription')
	let curataDescriptionURL = '/' + coreURL + '/UpdateCurataDescription'
	initDescriptionListening(curataDescription, curataDescriptionURL, typePOST, 'curataDescription')


	// function initDescriptionListening(descElement, ajaxURL, ajaxType, group) {
	// 	descElement.on('input selectionchange propertychange', function() {

	// 		let element = $(this);
	// 		let value = element.val();
	// 		let data = {};

	// 		if (group == "curataDescription") {
	// 			data.curataDescription = value;
	// 			data.curataId = $('.currentCurataSwitch').attr('id');
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

	// let curataDescription = $('.curataDescription')
	// let curataDescriptionURL = '/' + coreURL + '/UpdateCurataDescription'
	// initDescriptionListening(curataDescription, curataDescriptionURL, typePOST, 'curataDescription')



	// function initEntryTitleListening() {
	// 	$('.EntryTitle').unbind('input change');
	// 	$('.EntryTitle').bind('input change', function() {
	// 		enableDisablePublish();

	// 		let entryTitle = $(this).val();

	// 		$.ajax({
	// 		  data: {
	// 		    entryTitle: entryTitle,
	// 		    entryId: entryId
	// 		  },
	// 		  type: 'POST',
	// 		  url: '/' + coreURL + '/updateEntryTitle',
	// 		  success: function(Item){
	// 		    console.log("Entry title successfully updated.")
	// 		    // Display success message?
	// 		    enableDisablePublish();

	// 		  },
	// 		  error: function(err){
	// 		    console.log("Entry title update failed: ", err);
	// 		    // Display error message?
	// 		    enableDisablePublish();
	// 		  }
	// 		});

	// 	});
	// }
	// initEntryTitleListening();

	// function initComponentTitleListening() {
	// 	$('.ElementTitle').unbind('input change');
	// 	$('.ElementTitle').bind('input change', function() {
	// 		enableDisablePublish();

	// 		let Component = $(this).closest('.Component')
	// 		let ComponentId = Component.attr('id');
	// 		let ComponentTitle = $(this).val();

	// 		$.ajax({
	// 		  data: {
	// 		    ComponentId: ComponentId,
	// 		    ComponentTitle: ComponentTitle,
	// 		    entryId: entryId
	// 		  },
	// 		  type: 'POST',
	// 		  url: '/' + coreURL + '/UpdateComponentTitle',
	// 		  success: function(Item){
	// 		    console.log("Component title successfully updated.")
	// 		    // Display success message?
	// 		    enableDisablePublish();

	// 		  },
	// 		  error: function(err){
	// 		    console.log("Component title update failed: ", err);
	// 		    // Display error message?
	// 		    enableDisablePublish();
	// 		  }
	// 		});

	// 	});
	// }
	// initComponentTitleListening();

	// function initQuestionTitleListening() {
	// 	$('.QuestionTitle').unbind('input change');
	// 	$('.QuestionTitle').bind('input change', function() {
	// 		enableDisablePublish();
	// 		let ComponentId = $(this).closest('.Component').attr('id');
	// 		let EntryId = $('.entryContainer__space').attr('data-entryformid');
	// 		let QuestionId = $(this).closest('.questionBlock').attr('id');
	// 		let QuestionTitle = $(this).val();

	// 		$.ajax({
	// 			data: {
	// 				ComponentId: ComponentId,
	// 				EntryId: EntryId,
	// 				QuestionId: QuestionId,
	// 				QuestionTitle: QuestionTitle
	// 			},
	// 			type: 'POST',
	// 			url: '/' + coreURL + '/UpdateQuestionTitle',
	// 			success: function(Item) {
	// 				console.log("Question title successfully updated.");
	// 				// display success or show 'entry saved' like in google docs
	// 				enableDisablePublish();
	// 			},
	// 			error: function(err) {
	// 				console.log("Question title update failed: ", err);
	// 				// display error or show 'entry save failed' like in google docs
	// 				enableDisablePublish();
	// 			}
	// 		})
	// 	})
	// }
	// initQuestionTitleListening();

	function initImageInputsListening() {
		$('.ImageInput').off('change');
		$('.ImageInput').on('change', function() {
			
			enableDisablePublish();

			console.log('Input changed');
			console.log(this.files);
			console.log(this.files[0]);

			let ComponentId = $(this).closest('.Component').attr('id');

			let input = this;

			let imageBlock = $(this).closest('.imageBlock');
			let blockBackground = imageBlock.css('background-image');
			let previousImageExists = false;
			let oldImageKey;
			let isMainImage = false;
			let dateUpdated = new Date();

			let dataType = imageBlock.attr('data-type');
			if (typeof dataType !== typeof undefined && dataType !== false) {
				if (dataType == "mainImage") {
					isMainImage = true;
				}
			}

			if (blockBackground != "none") {
				console.log('An image exists, preparing to delete previous image: ', blockBackground);
				previousImageExists = true;
				oldImageKey = imageBlock.attr('data-image-key');
			} else {
				console.log('No image yet.');
			}

			if (input.files && input.files[0]) {
				let imageURL = URL.createObjectURL(input.files[0]);
			    imageBlock.css({
			       'background-image': 'url(\''+imageURL+'\')'
			    });
			}

			let form = $(this).closest('.imageForm');
			console.log("Form: ", form);

			let formData = new FormData();
			formData.append("image", input.files[0]);
			console.log("formData: ", formData);

			let ComponentImageKey;
			let ComponentURL;

			let responseData;

			$.ajax({
				url: '/' + coreURL + '/UploadSingleImage',
				type: 'POST',
				data: {
					formData: formData,
					dateUpdated: dateUpdated,
					entryId: entryId
				},
				success: function(data) {
					if (! $(input).closest('.imageBlock').find('.deleteImage').length &&  isMainImage == false) {
						let deleteImageBtn = $("<div>", {"class": "deleteImage"});
						deleteImageBtn.text('x');
						$(input).closest('.imageBlock').prepend(deleteImageBtn);
						initImageDelete();
					} else if (! $(input).closest('.imageBlock').find('.deleteMainImage').length) {
						let deleteImageBtn = $("<div>", {"class": "deleteMainImage"});
						deleteImageBtn.text('x');
						$(input).closest('.imageBlock').prepend(deleteImageBtn);
						initEntryImageDelete();
					}
					console.log("Success: ", data);
					form.get(0).reset();
					ComponentImageKey = data["image"];
					ComponentURL = data["location"];
					imageBlock.attr('data-image-key', ComponentImageKey);
				},
				error: function(err) {
					console.log("Error: ", err);
				},
				contentType: false,
				processData: false,
				cache: false,
				complete: function() {
					if (isMainImage) {
						$.ajax({
							url: '/' + coreURL + '/UpdateEntryMainImage',
							type:  'POST',
							data: {
								entryId: entryId,
								ComponentURL: ComponentURL,
								ComponentImageKey: ComponentImageKey
							},
							success: function(data) {
								console.log('Success: ', data);
								responseData = data;
								enableDisablePublish();
							},
							error: function(err) {
								console.log('Error ', err);
								enableDisablePublish();
							},
							complete: function() {
								let imageKey = responseData.entry.entryImageKey;
								let imageURL = responseData.entry.entryImageURL;
								console.log("TEST imageKey: ", imageKey);
								console.log("TEST imageURL: ", imageURL);
								$.ajax({
									data: {
										entryId: entryId,
										imageKey: imageKey,
										imageURL: imageURL
									},
									url: '/' + coreURL + '/AddImageToCurataFiles',
									type: 'POST',
									success: function(data) {
										console.log('Successfully added image to Curata.');
									},
									error: function(err) {
										console.log('Failed to add image to Curata: ', err)
									},
									complete: function() {
										if (previousImageExists) {
											$.ajax({
												data: {
													oldImageKey: oldImageKey
												},
												url: '/' + coreURL + '/DeletePreviousImage',
												type: 'DELETE',
												success: function(data) {
													console.log("Successfully deleted old image from everywhere.");
												},
												error: function(err) {
													console.log("Failed to delete old image: ", err);
												}
											})
										} else {
											console.log("No old image to delete.");
										}
									}
								})
							}
						})
					} else {
						$.ajax({
							url: '/' + coreURL + '/UpdateImageComponent',
							type:  'POST',
							data: {
								ComponentId: ComponentId,
								EntryId: entryId,
								ComponentURL: ComponentURL,
								ComponentImageKey: ComponentImageKey,
								dateUpdated: dateUpdated
							},
							success: function(data) {
								console.log('Success: ', data);
								responseData = data;
								enableDisablePublish();
							},
							error: function(err) {
								console.log('Error ', err);
								enableDisablePublish();
							},
							complete: function() {
								let imageKey = responseData.component.componentImageKey;
								let imageURL = responseData.component.componentURL;
								console.log("TEST imageKey: ", imageKey);
								console.log("TEST imageURL: ", imageURL);
								$.ajax({
									data: {
										entryId: entryId,
										componentId: ComponentId,
										imageKey: imageKey,
										imageURL: imageURL
									},
									url: '/' + coreURL + '/AddImageToCurataFiles',
									type: 'POST',
									success: function(data) {
										console.log('Successfully added image to Curata.');
									},
									error: function(err) {
										console.log('Failed to add image to Curata: ', err)
									}
									// complete: function() {
									// 	if (previousImageExists) {
									// 		$.ajax({
									// 			data: {
									// 				oldImageKey: oldImageKey
									// 			},
									// 			url: '/' + coreURL + '/DeletePreviousImage',
									// 			type: 'DELETE',
									// 			success: function(data) {
									// 				console.log("Successfully deleted old image from everywhere.");
									// 			},
									// 			error: function(err) {
									// 				console.log("Failed to delete old image: ", err);
									// 			}
									// 		})
									// 	} else {
									// 		console.log("No old image to delete.");
									// 	}
									// }
								})
							}
						})
					}
				}
			})


		});
	}
	initImageInputsListening();

	function initQuestionDeleting() {
		$('.deleteQuestion').off('click');
		$('.deleteQuestion').on('click', function() {
			enableDisablePublish();
			let componentId = $(this).closest('.Component').attr('id');
			let component = $('#' + componentId);
			let QuestionId = $(this).closest('.questionBlock').attr('id');
			let question = $('#' + QuestionId);
			let dateUpdated = new Date();

	    	// For buffer - quickly remove from display to not show delay of removing from database.
	    	question.animate({opacity:0});

	    	let lengthEqualsOne = false;
	    	let listLength = component.find('.questionBlock').length;
	    	console.log('List length: ', listLength);

	    	if (listLength === 1) {
	    		lengthEqualsOne = true;
	    		console.log("Switched length equals one to true.");
	    	}

	    	$.ajax({
	    		data: {
	    			QuestionId: QuestionId,
	    			componentId: componentId,
	    			dateUpdated: dateUpdated,
	    			entryId: entryId
	    		},
	    		type:'DELETE',
	    		url: '/' + coreURL + '/DeleteQuestion',
	    		success: function(response) {
	    			console.log("Deleted question from database.");
	    			question.fadeOut('fast', function() { $(this).remove(); });
	    			if (lengthEqualsOne) {
	    				console.log("Creating new empty list item.");
	    				component.find('.addNewButton').trigger('click');
	    			}
	    			enableDisablePublish();
	    		},
	    		error: function(err) {
	    			console.log("Failed to delete question: ", err);
	    			// Display error not being able to delete note
	    			question.animate({opacity:1});
	    			enableDisablePublish();
	    		}
	    	});
		})
	}
	initQuestionDeleting();

	function initComponentTitleExit() {
		$('.ElementTitle').off('keyup');
		$('.ElementTitle').on('keyup', function(event) {
			$(this).val($(this).val().replace(/[\r\n\v]+/g, ''));
		})

		$('.ElementTitle').off('keypress');
		$('.ElementTitle').on('keypress', function(event) {
			if (event.keyCode === 13) {
				event.preventDefault();
				$(this).blur();
			}
		})
	}
	initComponentTitleExit();

	function initQuestionTitleExit() {
		$('.QuestionTitle').off('keyup');
		$('.QuestionTitle').on('keyup', function(event) {
			$(this).val($(this).val().replace(/[\r\n\v]+/g, ''));
		})

		$('.QuestionTitle').off('keypress');
		$('.QuestionTitle').on('keypress', function(event) {
			if (event.keyCode === 13) {
				event.preventDefault();
				$(this).blur();
			}
		})
	}
	initQuestionTitleExit();

	function createNewEntry() {
		let listId = $('.entriesContainer').attr('id');
		let curataId = $('.entriesContainer').attr('data-curataId');
		let createNewEntryBtn = $('.createNewEntry');
		// let defaultTemplate = createNewEntryBtn.attr('data-default-template');
		let creationTime = new Date();
		let multiTempState = createNewEntryBtn.attr('data-multi-template');
		if (multiTempState == 'true') {
			console.log('Activate multi template functions.');
		} else {
			createNewEntryBtn.off('click');
			createNewEntryBtn.on('click', function() {
				// select list default template
				// create new entry in list
				$.ajax({
					data: {
						// TemplateId: defaultTemplate,
						creationTime: creationTime
					},
					type: 'POST',
					url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/createNewEntry',
					success: function(response) {
						console.log("Yoho! Successfully created new entry!");
						window.location.href = response.redirectTo;
					},
					error: function(err) {
						console.log("Arrghh! Failed to create entry!");
					}
				})
			})
		}
	}
	createNewEntry();

	function initCreateNewEntry() {
		let curataId = $('.currentCurataSwitch').attr('id');
		let createNewEntry = $('.addNewEntryBlock');
		createNewEntry.off('click');
		createNewEntry.on('click', function() {
			let entryButton = $(this);
			let creationTime = new Date();
			// let defaultTemplate = entryButton.closest('.listContainer').attr('data-default-template');
			let listId = entryButton.closest('.listContainer').attr('data-id');
			console.log("This is the list id: ", listId);
			$.ajax({
				data: {
					// TemplateId: defaultTemplate,
					creationTime: creationTime
				},
				type: 'POST',
				url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/createNewEntry',
				success: function(response) {
					console.log("Yoho! Successfully created new entry!");
					window.location.href = response.redirectTo;
				},
				error: function(err) {
					console.log("Arrghh! Failed to create entry!");
				}
			})
		})
	}
	initCreateNewEntry();

	function initCreateNewEntryFromList() {
		let curataId = $('.curataId').attr('data-curataId');
		let createNewEntry = $('.addEntryFromList');
		createNewEntry.off('click');
		createNewEntry.on('click', function() {
			let creationTime = new Date();
			let defaultTemplate = $('.Template').attr('id');
			let listId = $('.CreateListArea').attr('id');
			$.ajax({
				data: {
					TemplateId: defaultTemplate,
					creationTime: creationTime
				},
				type: 'POST',
				url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/createNewEntry',
				success: function(response) {
					console.log("Yoho! Successfully created new entry!");
					window.location.href = response.redirectTo;
				},
				error: function(err) {
					console.log("Arrghh! Failed to create entry!");
				}
			})
		})
	}

	/* LISTS
	=================================
	=================================
	 */


	// This part exists for the case where there are no list items.
		// At any given time, it is only possible a single item exists with no id, which signals no list items exist in the database.
		// At any given time, there can be an item without an id only if there is one item in the list.
		// In any case where there are two or more items in the list, all items by design get an id so that item reordering and other functions would work. 
			// Without this, if the first item is empty and not created, and you create a second item, upon reload, the first one does not appear.
		// This will give the empty list item an id and initialized delete button
	function createFirstListItem(componentId, entryId, listItemInput, itemOrder, componentType, listItem) {
				$.ajax({
					data: {
						componentId: componentId,
						entryId: entryId,
						listItem: listItemInput,
						itemOrder: itemOrder,
						componentType: componentType
					},
					type: 'POST',
					url: '/' + coreURL + '/CreateNewListItem',
					success: function(item) {
						console.log("List item successfully created.");
						// display success or show 'entry saved' like in google docs
						listItem.attr('id', item._id);
						let deleteBtn = $('<div>', {'class': 'deleteItem'});
						deleteBtn.text('x');
						let linkContainer = listItem.find('.showLinkContainer');
						linkContainer.after(deleteBtn);
						initListItemDeleting();
						enableDisablePublish();
					},
					error: function(err) {
						console.log("List item creation failed: ", err);
						// display error or show 'entry save failed' like in google docs
							// make hidden error div visible, replace text, hide in some seconds and .empty() text
						enableDisablePublish();
					}
				})
	}

	function initNewListItemAdding() {
		$('.addNewListItemButton').on('click', function() {

			enableDisablePublish();

			if (creatingListItem == true) {
				return console.log("Last list item was still being created, try again.")
			} else {

				// set flag
				creatingListItem = true; 

				let component = $(this).closest('.Component');
				let componentId = component.attr('id');
				let componentType = component.attr('data-component');

				let listItems = component.find('.listItems');
				let firstItem = listItems.find('.ListItem').first();
				let firstIndex = firstItem.index();

				if (firstIndex == 0) {
					console.log("First is first.");
				}

				if (!firstItem.attr('id')) {
					console.log("No list items exist. Initializing first one before creating a second one");
					let listItemInput = "N/A";
					$.ajax({
						data: {
							componentId: componentId,
							entryId: entryId,
							listItem: listItemInput,
							itemOrder: firstIndex,
							componentType: componentType
						},
						type: 'POST',
						url: '/' + coreURL + '/CreateNewListItem',
						success: function(item) {
							console.log("List item successfully created.");
							// display success or show 'entry saved' like in google docs
							firstItem.attr('id', item._id);
							let deleteBtn = $('<div>', {'class': 'deleteItem'});
							deleteBtn.text('x');
							let linkContainer = firstItem.find('.showLinkContainer');
							linkContainer.after(deleteBtn);
							initListItemDeleting();
						},
						error: function(err) {
							console.log("List item creation failed: ", err);
							// display error or show 'entry save failed' like in google docs
								// make hidden error div visible, replace text, hide in some seconds and .empty() text
						}
					})
				}

				if (componentType == "checklist") {
					// declare html blocks to insert
					let listItem = $("<li>", {"class": "ListItem ChecklistItem sortableListItem", "id": "tempItemId"});
					let checklistInput = $("<input>", {"type": "checkbox", "class":"checklistBox"})
					let listInput = $("<input>", {"class": "listItemInput"});
					listInput.attr('placeholder', 'Write something...');

					listItem.append(checklistInput);
					listItem.append(listInput);

					// append to unordered list
					let listItems = component.find('.listItems');
					listItems.append(listItem);

					let componentOrder = component.index();
					let itemOrder = $('#tempItemId').index();
					console.log("itemOrder: ", itemOrder);

					// create new list item in database
					$.ajax({
					  data: {
					    entryId: entryId,
					    componentId: componentId,
					    itemOrder: itemOrder,
					    componentType: componentType
					  },
					  type: 'POST',
					  url: '/' + coreURL + '/CreateNewListItem',
					  success: function(response){
					    console.log("Component item successfully created: ", response);
					    // Display success message?

					    let listItemId = response._id;
					    $('#tempItemId').attr('id', listItemId);
					    initListItemsListening();
					    initChecklists();
					    let listItem = $('#' + listItemId)
					    let showLinkContainerBtn = $("<div>", {"class": "showLinkContainer"});
					    showLinkContainerBtn.text('Add link');
					    listItem.append(showLinkContainerBtn);
					    initShowLinkContainer();
						let deleteBtn = $("<div>", {"class": "deleteItem"});
						deleteBtn.text("x");
						if (!listItem.find('.deleteItem').length) {
							listItem.append(deleteBtn);
						}
						let linkContainer = $("<div>", {"class": "linkContainer hidden"});
						let linkInput = $("<input>", {"class": "linkInput"});
						linkInput.attr('placeholder', 'Your link');
						let saveBtn = $("<div>", {"class": "saveListItemLink"});
						saveBtn.text('Save');
						let cancelBtn = $("<div>", {"class": "cancelListItemLink"});
						cancelBtn.text('Cancel');
						linkContainer.append(linkInput);
						linkContainer.append(saveBtn);
						linkContainer.append(cancelBtn);
						listItem.append(linkContainer);
						initCancelListItemLink();
						initSaveListItemLink();
						initListItemDeleting();
					    creatingListItem = false;
					    enableDisablePublish();
					  },
					  error: function(err){
					    console.log("Component item creation failed: ", err);
					    creatingListItem = false;
					    // Display error message?
					    enableDisablePublish();
					  }
					});
				} else {
					// declare html blocks to insert
					let listItem = $("<li>", {"class": "ListItem sortableListItem", "id": "tempItemId"});
					let listInput = $("<input>", {"class": "listItemInput"});
					listInput.attr('placeholder', 'Write something...');

					listItem.append(listInput);

					// append to unordered list
					let listItems = component.find('.listItems');
					listItems.append(listItem);

					let componentOrder = component.index();
					let itemOrder = $('#tempItemId').index();
					console.log("itemOrder: ", itemOrder);

					// create new list item in database
					$.ajax({
					  data: {
					    entryId: entryId,
					    componentId: componentId,
					    itemOrder: itemOrder,
					    componentType: componentType
					  },
					  type: 'POST',
					  url: '/' + coreURL + '/CreateNewListItem',
					  success: function(response){
					    console.log("Component item successfully created: ", response);
					    // Display success message?

					    let listItemId = response._id;
					    $('#tempItemId').attr('id', listItemId);
					    initListItemsListening();
					    let listItem = $('#' + listItemId)
					    let showLinkContainerBtn = $("<div>", {"class": "showLinkContainer"});
					    showLinkContainerBtn.text('Add link');
					    listItem.append(showLinkContainerBtn);
					    initShowLinkContainer();
						let deleteBtn = $("<div>", {"class": "deleteItem"});
						deleteBtn.text("x");
						if (!listItem.find('.deleteItem').length) {
							listItem.append(deleteBtn);
						}
						let linkContainer = $("<div>", {"class": "linkContainer hidden"});
						let linkInput = $("<input>", {"class": "linkInput"});
						linkInput.attr('placeholder', 'Your link');
						let saveBtn = $("<div>", {"class": "saveListItemLink"});
						saveBtn.text('Save');
						let cancelBtn = $("<div>", {"class": "cancelListItemLink"});
						cancelBtn.text('Cancel');
						linkContainer.append(linkInput);
						linkContainer.append(saveBtn);
						linkContainer.append(cancelBtn);
						listItem.append(linkContainer);
						initCancelListItemLink();
						initSaveListItemLink();
						initListItemDeleting();
					    creatingListItem = false;
					    enableDisablePublish();
					  },
					  error: function(err){
					    console.log("Component item creation failed: ", err);
					    creatingListItem = false;
					    // Display error message?
					    enableDisablePublish();
					  }
					});
				}
			}
		})
	}
	initNewListItemAdding()

	function initShowLinkContainer() {
		$('.showLinkContainer').off('click');
		$('.showLinkContainer').on('click', function() {
			let listItem = $(this).closest('.ListItem');
			listItem.find('.linkContainer').removeClass('hidden');
			$(this).empty();
			$(this).off('click');
		})
	}
	initShowLinkContainer();

	function initHideLinkContainer() {
		$('.hideLinkContainer').off('click');
		$('.hideLinkContainer').on('click', function() {
			let listItem = $(this).closest('.ListItem');
			listItem.find('.linkContainer').addClass('hidden');
			listItem.find('.showLinkContainer').text('View link');
			initShowLinkContainer();
		})
	}
	initHideLinkContainer();

	function initCancelListItemLink() {
		$('.cancelListItemLink').off('click');
		$('.cancelListItemLink').on('click', function() {
			let listItem = $(this).closest('.ListItem');
			let linkInput = listItem.find('.linkInput');
			listItem.find('.linkContainer').addClass('hidden');
			linkInput.val(null);
			listItem.find('.showLinkContainer').text('Add link');
			initShowLinkContainer();
		})
	}
	initCancelListItemLink();

	function initSaveListItemLink() {
		$('.saveListItemLink').off('click');
		$('.saveListItemLink').on('click', function() {
			enableDisablePublish();
			let component = $(this).closest('.Component');
			let componentType = component.attr('data-component');
			let componentId = component.attr('id');
			let listItem = $(this).closest('.ListItem');
			let linkInput = listItem.find('.linkInput');
			let link = linkInput.val();
			let thisBtn = $(this);
			let dateUpdated = new Date();

			if (!link) {
				return alert("No link!");
			}

	    	let lengthEqualsOne = false;
	    	let listLength = component.find('.ListItem').length;
	    	console.log('List length: ', listLength);

	    	if (listLength === 1) {
	    		lengthEqualsOne = true;
	    		console.log("Switched length equals one to true.");
	    	}
	    	console.log('Length value before: ', lengthEqualsOne);

			if (lengthEqualsOne == true && !listItem.attr('id')) {
				let itemOrder = listItem.index();
				let listItemInput = "N/A";
				$.ajax({
					data: {
						componentId: componentId,
						entryId: entryId,
						listItem: listItemInput,
						itemOrder: itemOrder,
						componentType: componentType,
						dateUpdated: dateUpdated
					},
					type: 'POST',
					url: '/' + coreURL + '/CreateNewListItem',
					success: function(item) {
						console.log("List item successfully created.");
						// display success or show 'entry saved' like in google docs
						listItem.attr('id', item._id);
						let deleteBtn = $('<div>', {'class': 'deleteItem'});
						deleteBtn.text('x');
						let linkContainer = listItem.find('.showLinkContainer');
						linkContainer.after(deleteBtn);
						initListItemDeleting();
					},
					error: function(err) {
						console.log("List item creation failed: ", err);
						// display error or show 'entry save failed' like in google docs
							// make hidden error div visible, replace text, hide in some seconds and .empty() text
					},
					complete: function() {
						listItemLink = (link.indexOf('://') === -1) ? 'http://' + link : link;
						let cancelListItemLinkBtn = listItem.find('.cancelListItemLink');
						let linkDiv = $('<a>', {'class': 'listItemLink'});
						linkDiv.attr('target', '_blank');
						linkDiv.attr('href', listItemLink);
						linkDiv.text(listItemLink);
						let hideLinkContainerBtn = $('<div>', {'class': 'hideLinkContainer'});
						hideLinkContainerBtn.text('Hide');
						let removeListItemLinkBtn = $('<div>', {'class': 'removeListItemLink'});
						removeListItemLinkBtn.text('Remove link');
						let listItemId = listItem.attr('id');
						$.ajax({
							data: {
								componentId: componentId,
								listItemId: listItemId,
								listItemLink: listItemLink,
								dateUpdated: dateUpdated,
								entryId: entryId
							},
							type: 'POST',
							url: '/' + coreURL + '/saveListItemLink',
							success: function(Item) {
								console.log("List item URL successfully created.");
								// display success or show 'entry saved' like in google docs
								linkInput.replaceWith(linkDiv);
								thisBtn.replaceWith(hideLinkContainerBtn);
								cancelListItemLinkBtn.replaceWith(removeListItemLinkBtn);
								initRemoveListItemLink();
								initHideLinkContainer();
								enableDisablePublish();
							},
							error: function(err) {
								console.log("List item URL creation failed: ", err);
								// display error or show 'entry save failed' like in google docs
								enableDisablePublish();
							}
						})
					}
				})
			} else {
				listItemLink = (link.indexOf('://') === -1) ? 'http://' + link : link;

				let cancelListItemLinkBtn = listItem.find('.cancelListItemLink');

				let linkDiv = $('<a>', {'class': 'listItemLink'});
				linkDiv.attr('target', '_blank');
				linkDiv.attr('href', listItemLink);
				linkDiv.text(listItemLink);

				let hideLinkContainerBtn = $('<div>', {'class': 'hideLinkContainer'});
				hideLinkContainerBtn.text('Hide');

				let removeListItemLinkBtn = $('<div>', {'class': 'removeListItemLink'});
				removeListItemLinkBtn.text('Remove link');
				let listItemId = listItem.attr('id');
				$.ajax({
					data: {
						componentId: componentId,
						listItemId: listItemId,
						listItemLink: listItemLink,
						dateUpdated: dateUpdated,
						entryId: entryId
					},
					type: 'POST',
					url: '/' + coreURL + '/saveListItemLink',
					success: function(Item) {
						console.log("List item URL successfully created.");
						// display success or show 'entry saved' like in google docs
						linkInput.replaceWith(linkDiv);
						thisBtn.replaceWith(hideLinkContainerBtn);
						cancelListItemLinkBtn.replaceWith(removeListItemLinkBtn);
						initRemoveListItemLink();
						initHideLinkContainer();
						enableDisablePublish();
					},
					error: function(err) {
						console.log("List item URL creation failed: ", err);
						// display error or show 'entry save failed' like in google docs
						enableDisablePublish();
					}
				})
			}
		})
	}
	initSaveListItemLink();

	function initRemoveListItemLink() {
		$('.removeListItemLink').off('click');
		$('.removeListItemLink').on('click', function() {
			enableDisablePublish();
			let component = $(this).closest('.Component');
			let componentId = component.attr('id');
			let listItem = $(this).closest('.ListItem');
			let listItemId = listItem.attr('id');
			let listItemLink = listItem.find('.listItemLink');
			let hideLinkContainerBtn = listItem.find('.hideLinkContainer');
			let thisBtn = $(this);

			let dateUpdated = new Date();

			let inputDiv = $('<input>', {'class': 'linkInput'});
			inputDiv.attr('placeholder', 'Your link');

			let saveListItemLinkBtn = $('<div>', {'class': 'saveListItemLink'});
			saveListItemLinkBtn.text('Save');

			let cancelListItemLinkBtn = $('<div>', {'class': 'cancelListItemLink'});
			cancelListItemLinkBtn.text('Cancel');

			$.ajax({
				data: {
					componentId: componentId,
					listItemId: listItemId,
					dateUpdated: dateUpdated,
					entryId: entryId
				},
				type: 'POST',
				url: '/' + coreURL + '/removeListItemLink',
				success: function(Item) {
					console.log("List item URL removed.");
					// display success or show 'entry saved' like in google docs
					listItemLink.replaceWith(inputDiv);
					hideLinkContainerBtn.replaceWith(saveListItemLinkBtn);
					thisBtn.replaceWith(cancelListItemLinkBtn);
					listItem.find('.showLinkContainer').text('Add link');
					initSaveListItemLink();
					initCancelListItemLink();
					listItem.find('.linkContainer').addClass('hidden');
					listItem.find('.showLinkContainer').text('Add link');
					initShowLinkContainer();
					enableDisablePublish();
				},
				error: function(err) {
					console.log("List item URL removal failed: ", err);
					// display error or show 'entry save failed' like in google docs
					enableDisablePublish();
				}
			})
		})
	}
	initRemoveListItemLink();

	function initListItemsListening() {
		$('.listItemInput').unbind('input change');
		$('.listItemInput').bind('input change', function() {
			if (firstCreationInProgress == false) {
				enableDisablePublish();
				let component = $(this).closest('.Component');
				let componentId = component.attr('id');
				let componentType = component.attr('data-component');
				let listItem = $(this).closest('.ListItem');
				let itemOrder = listItem.index();
				let listItemInput = $(this).val();
				let dateUpdated = new Date();
				console.log('Got listItem: ', listItemInput);

		    	let lengthEqualsOne = false;
		    	let listLength = component.find('.ListItem').length;
		    	console.log('List length: ', listLength);

		    	if (listLength === 1) {
		    		lengthEqualsOne = true;
		    		console.log("Switched length equals one to true.");
		    	}
		    	console.log('Length value before: ', lengthEqualsOne);

				if (lengthEqualsOne == false || listItem.attr('id')) {
					let listItemId = listItem.attr('id');
					$.ajax({
						data: {
							ComponentId: componentId,
							EntryId: entryId,
							listItemId: listItemId,
							listItem: listItemInput,
							dateUpdated: dateUpdated
						},
						type: 'POST',
						url: '/' + coreURL + '/UpdateListItem',
						success: function(Item) {
							console.log("List item successfully updated.");
							// display success or show 'entry saved' like in google docs
							enableDisablePublish();
						},
						error: function(err) {
							console.log("List item update failed: ", err);
							// display error or show 'entry save failed' like in google docs
							enableDisablePublish();
						}
					})
				} else if (lengthEqualsOne == true && !listItem.attr('id')) {
					// This part exists for the case where there are no list items.
					firstCreationInProgress = true;
					$.ajax({
						data: {
							componentId: componentId,
							entryId: entryId,
							listItem: listItemInput,
							itemOrder: itemOrder,
							componentType: componentType,
							dateUpdated: dateUpdated
						},
						type: 'POST',
						url: '/' + coreURL + '/CreateNewListItem',
						success: function(item) {
							listItem.attr('id', item._id);
							console.log("List item successfully created.");
							// display success or show 'entry saved' like in google docs
							let deleteBtn = $('<div>', {'class': 'deleteItem'});
							deleteBtn.text('x');
							let linkContainer = listItem.find('.showLinkContainer');
							linkContainer.after(deleteBtn);
							initListItemDeleting();
							firstCreationInProgress = false;
							enableDisablePublish();
						},
						error: function(err) {
							console.log("List item creation failed: ", err);
							// display error or show 'entry save failed' like in google docs
								// make hidden error div visible, replace text, hide in some seconds and .empty() text
							firstCreationInProgress = false;
							enableDisablePublish();
						}
					})
				}
			} else {
				return console.log("Will push update with next one");
			}
		})
	}
	initListItemsListening();

	function initListItemDeleting() {
		$('.deleteItem').off('click');
		$('.deleteItem').on('click', function() {
			enableDisablePublish();
			let componentType = $(this).closest('.Component').attr('data-component');
			let componentId = $(this).closest('.Component').attr('id');
			let component = $('#' + componentId);
			let listItemId = $(this).closest('.ListItem').attr('id');
			let listItem = $('#' + listItemId);
			let dateUpdated = new Date();

	    	// For buffer - quickly remove from display to not show delay of removing from database.
	    	listItem.animate({opacity:0});

	    	let lengthEqualsOne = false;
	    	let listLength = component.find('.ListItem').length;
	    	console.log('List length: ', listLength);

	    	if (listLength === 1) {
	    		lengthEqualsOne = true;
	    		console.log("Switched length equals one to true.");
	    	}

	    	console.log('Length value before: ', lengthEqualsOne);

	    	$.ajax({
	    		data: {
	    			listItemId: listItemId,
	    			componentId: componentId,
	    			dateUpdated: dateUpdated,
	    			entryId: entryId
	    		},
	    		type:'DELETE',
	    		url: '/' + coreURL + '/DeleteListItem',
	    		success: function(response) {
	    			console.log("Deleted list item from database.");
	    			console.log("Value of length: ", lengthEqualsOne);
	    			if (lengthEqualsOne ==  true) {
	    				// AND has no id!!!
	    				console.log("Creating new empty list item.");
	    				let checkbox;
	    				let newListItem;
	    				if (componentType == "checklist") {
	    					checkbox = $('<input>', {'class': 'checklistBox'});
	    					checkbox.attr('type', 'checkbox');
	    					newListItem = $('<li>', {'class': 'ListItem ChecklistItem sortableListItem'});
	    					newListItem.append(checkbox);
	    				} else if (componentType == "list") {
	    					newListItem = $('<li>', {'class': 'ListItem sortableListItem'});
	    				}
	    				let newListInput = $('<input>', {'class': 'listItemInput'});
	    				newListInput.attr('placeholder', 'Write something');
	    				let newShowBtn = $('<div>', {'class': 'showLinkContainer'});
	    				newShowBtn.text('Add link');
	    				let newContainer = $('<div>', {'class': 'linkContainer hidden'});
	    				let newLinkInput = $('<input>', {'class': 'linkInput'});
	    				newLinkInput.attr('placeholder', 'Your link');
	    				let newSaveBtn = $('<div>', {'class': 'saveListItemLink'});
	    				newSaveBtn.text('Save');
	    				let newCancelBtn = $('<div>', {'class': 'cancelListItemLink'});
	    				newCancelBtn.text('Cancel');
	    				newContainer.append(newLinkInput);
	    				newContainer.append(newSaveBtn);
	    				newContainer.append(newCancelBtn);
	    				newListItem.append(newListInput);
	    				newListItem.append(newShowBtn);
	    				newListItem.append(newContainer);
	    				listItem.replaceWith(newListItem);
	    				initListItemsListening();
	    				if (componentType == "checklist") {
	    					initChecklists();
	    				}
	    				initShowLinkContainer();
	    				initSaveListItemLink();
	    				initCancelListItemLink();
	    			} else {
						listItem.fadeOut('fast', function() { $(this).remove(); });
	    			}
	    			enableDisablePublish();
	    		},
	    		error: function(err) {
	    			console.log("Failed to delete list item: ", err);
	    			// Display error not being able to delete note
	    			listItem.animate({opacity:1});
	    			enableDisablePublish();
	    		}
	    	});
		})
	}
	initListItemDeleting();

	/* SORTABLE FUNCTIONALITY */

	function updateListItemOrderInDB(sortableId, componentId) {
		enableDisablePublish();
		let indexArray = [];
		let dateUpdated = new Date();

		$('#' + sortableId).find('.sortableListItem').each(function(index, item) {
			let itemId = $(this).attr('id');
			let obj = {};
			obj['itemId'] = itemId;
			obj['newPosition'] = index;
			indexArray.push(obj)
		});

		console.log("indexArray: ", indexArray);

		$.ajax({
			data: {
				indexArray: JSON.stringify(indexArray),
				componentId: componentId,
				dateUpdated: dateUpdated,
				entryId: entryId
			},
			type: 'POST',
			url: '/' + coreURL + '/UpdateListItemOrder',
			success: function(response) {
				console.log("Yoho! Successfully updated positions.");
				enableDisablePublish();
			},
			error: function(err) {
				console.log("Arrghh! Failed to update positions: ", err);
				enableDisablePublish();
			}
		});
	}

	function initSortable() {
		$('.sortableList').each(function(index, item) {
			console.log('Let us find ye lengthy bastards, yoho!');

			let componentId = $(item).closest('.Component').attr('id');
			let sortableId = "sortable_" + componentId;

			$('#' + sortableId).sortable({
				cancel: "input,textarea,button,select,option,[contenteditable],.unsortable,span",
				update: function(event, ui) {
					updateListItemOrderInDB(sortableId, componentId);
				}
			});
		});
	};
	initSortable();

/*
===========================
== Template functions
===========================
*/

	function updateTemplateTitle(inputObj) {
		let templateTitle = inputObj.val();
		let templateId = $('.Template').attr('id');

		$.ajax({
		  data: {
		    TemplateTitle: templateTitle,
		    TemplateId: templateId
		  },
		  type: 'POST',
		  url: '/' + coreURL + '/UpdateTemplateTitle',
		  success: function(item){
		    console.log("Template updated.")
		    // Display success message?
		  },
		  error: function(err){
		    console.log("Template creation failed: ", err);
		    // Display error message?
		  }
		});
	}

	function initTemplateTitle2Exit() {
		$('.templateTitle2').off('keyup');
		$('.templateTitle2').on('keyup', function(event) {
			$(this).val($(this).val().replace(/[\r\n\v]+/g, ''));
		})

		$('.templateTitle2').off('keypress');
		$('.templateTitle2').on('keypress', function(event) {
			if (event.keyCode === 13) {
				event.preventDefault();
				$(this).blur();
			}
		})

	}
	initTemplateTitle2Exit();

	function initTemplateTitle2Listening() {
		let templateBeingCreated = false;
		$('.templateTitle2').bind('input change', function() {

			let thisObj = $(this);
			let templateTitle = $(this).val();
			let curataId = $('.curataId').attr('data-curataId');

			if (!curataId) {
				return console.log("Curata id not loaded.");
			}

			templateId = $('.Template').attr('id');

			if (!templateId) {
				console.log("Template does not exist yet or has not yet finished being created. Will auto-update later.");
				if (templateBeingCreated == true) {
					// Template is being created.
					console.log("Template still being created. Will auto-update once done.");
				} else {
					// Template does not exist and is not being created.
					// Create template
					templateBeingCreated = true;
					$.ajax({
					  data: {
					    templateTitle: templateTitle,
					    curataId: curataId
					  },
					  type: 'POST',
					  url: '/' + coreURL + '/createNewTemplate',
					  success: function(item){
					    console.log("Template created.", item);
					    $('.Template').attr('id', item._id);
					    // Display success message?
					    templateBeingCreated = false;
					    updateTemplateTitle(thisObj);

					  },
					  error: function(err){
					    console.log("Template creation failed: ", err);
					    // Display error message?
					    templateBeingCreated = false;
					  }
					});
				}
			} else {
				updateTemplateTitle(thisObj);
			}

		});
	}
	initTemplateTitle2Listening();

	function initNewListCreation() {
		let templateBeingCreated = false;
		let listBeingCreated = false;
		let messageBlock = $('.messageUpdate');
		$('.ListTitle').bind('input change', function() {

			let thisObj = $(this);
			let listTitle = thisObj.val();

			let listId = $('.CreateListArea').attr('id');

			// if list exists, just update because if list exists, a template must already exist, as such, it only needs to be updated and it also solves the problem of someone typing a second letter before template is created 
			if (listId && listId.length > 0 && templateBeingCreated == false && listBeingCreated  == false) {
				// list exists, just update
				console.log("About to update list.");
				messageBlock.text("Updating list...");
				$.ajax({
				  data: {
				  	listTitle: listTitle,
				  	listId: listId
				  },
				  type: 'POST',
				  url: '/' + coreURL + '/updateNewList',
				  success: function(listItem){
				  	messageBlock.text("List update successful.");
				    console.log("List item updated.");
				    // Display success message?
				  },
				  error: function(err){
				  	messageBlock.text("Update failed.");
				    console.log("List update failed: ", err);
				    // Display error message?
				  }
				});
			} else if (templateBeingCreated == true) {
				// updates list later
				return console.log("Template being created. Will auto-update.");
			} else if (listBeingCreated == true) {
				// updates list later, this is necessary, as it is possible that while a list is being created, and the id's don't yet exist, then changes are made to the title or description, but then can't be updated as lists don't yet exist, and it is also necessary to prevent creating the list multiple times; the solution to this is to perform an update at the end of the creation and skip any updates while creation is in in progress.
				return console.log("List being created. Will auto-update.");
			} else {
				// if list does not exist and template is not being created --> create list
				let templateId = $('.Template').attr('id');
				let curataId = $('.curataId').attr('data-curataId');

				listBeingCreated = true;

				if (!templateId) {
					templateBeingCreated = true;
					console.log("Template does not yet exist.");
					if ($('.OverlayComponents').length) {
						console.log("Template being created.");
						$('.OverlayComponents').bind('destroyed', function() {
							// console log
							if (templateId) {
								console.log("Template has been created, proceed.");
								templateBeingCreated = false;
							} else {
								console.log("Template creation must have failed.");
								templateBeingCreated = false;
							}
						})
					} else {
						// Create template
						console.log("Creating template.");
						let overlayComponents = $("<div>", {"class": "OverlayComponents"});
						overlayComponents.text("Finishing up template creation...");
						$('.TemplateConstructor').prepend(overlayComponents);
						$('.templateTitle2').prop("readonly", true);
						$('.templateTitle2').attr("placeholder", "Finishing creating template...");
						$.ajax({
						  data: {
						    curataId: curataId
						  },
						  type: 'POST',
						  url: '/' + coreURL + '/createNewTemplate',
						  success: function(item){
						    console.log("Template created.", item);
						    $('.Template').attr('id', item._id);
						    // Display success message?
						    messageBlock.text("Creating list...");
							// create list
							listTitle = thisObj.val();

							$.ajax({
							  data: {
							  	listTitle: listTitle,
							  	curataId: curataId,
							  	templateId: item._id
							  },
							  type: 'POST',
							  url: '/' + coreURL + '/createNewList',
							  success: function(object){
							  	console.log("List created: ", object);
							  	$('.CreateListArea').attr('id', object._id)
							  	// add '+ new entry' button
							  	let addNewEntry = $("<a>",  {"class": "addEntryFromList"});
							  	addNewEntry.text('+ New Entry');
							  	$('.helperNavigation').append(addNewEntry); 
							  	initCreateNewEntryFromList()
							  	messageBlock.text("List created.");
							  	let listName = $('.CreateListArea').find('.ListTitle').val();
							  	let listDesc = $('.CreateListArea').find('.ListDescription').val();
							  	messageBlock.text("Updating list...");
								$.ajax({
								  data: {
								  	listTitle: listName,
								  	listDescription: listDesc,
								  	listId: object._id
								  },
								  type: 'POST',
								  url: '/' + coreURL + '/updateNewList',
								  success: function(item){
								  	listBeingCreated = false;
								    templateBeingCreated = false;
								    $('.OverlayComponents').remove();
									$('.templateTitle2').prop("readonly", false);
									$('.templateTitle2').attr("placeholder", "Give your template a name!");
								    console.log("List item updated.");
								    // Display success message?
								    messageBlock.text("List update successful.");
								  },
								  error: function(err){
								  	listBeingCreated = false;
								  	templateBeingCreated = false;
								    $('.templateTitle2').attr("placeholder", "Template creation failed.");
								    $('.OverlayComponents').text("Template creation failed.");
								    console.log("List update failed: ", err);
								    messageBlock.text("List update failed.");
								    // Display error message?
								  }
								});
							    // Display success message?
							  },
							  error: function(err){
							    console.log("List creation failed: ", err);
							    listBeingCreated = false;
							    messageBlock.text("List creation failed.");
							    // Display error message?
							  }
							});
						  },
						  error: function(err){
						    console.log("Template creation failed: ", err);
						    // Display error message?
						    templateBeingCreated = false;
						    $('.templateTitle2').attr("placeholder", "Template creation failed.");
						    $('.OverlayComponents').text("Template creation failed.");
						  }
						});
					}
				} else {
					console.log("Template exists. Creating list.");

					listTitle = thisObj.val();
					messageBlock.text("Creating list..");
					$.ajax({
					  data: {
					  	listTitle: listTitle,
					  	curataId: curataId,
					  	templateId: templateId
					  },
					  type: 'POST',
					  url: '/' + coreURL + '/createNewList',
					  success: function(object){
					  	console.log("List created: ", object);
					  	$('.CreateListArea').attr('id', object._id)
					  	let addNewEntry = $("<a>",  {"class": "addEntryFromList"});
					  	addNewEntry.text('+ New Entry');
					  	$('.helperNavigation').append(addNewEntry); 
					  	initCreateNewEntryFromList()
					  	messageBlock.text("List created.");
					  	let listName = $('.CreateListArea').find('.ListTitle').val();
					  	let listDesc = $('.CreateListArea').find('.ListDescription').val();
					  	messageBlock.text("Updating list...");

						$.ajax({
						  data: {
						  	listTitle: listName,
						  	listDescription: listDesc,
						  	listId: object._id
						  },
						  type: 'POST',
						  url: '/' + coreURL + '/updateNewList',
						  success: function(item){
						  	messageBlock.text("List update successful.");
					  		listBeingCreated = false;
						    console.log("List item updated.");
						    // Display success message?
						  },
						  error: function(err){
						  	messageBlock.text("List update failed.");
						  	listBeingCreated = false;
						    console.log("List update failed: ", err);
						    // Display error message?
						  }
						});
	
					  	// if list updates, just say list updated;

					    // Display success message?
					  },
					  error: function(err){
					    console.log("List creation failed: ", err);
					    listBeingCreated = false;
					    // Display error message?
					  }
					});
				}

			}

		});

		$('.ListDescription').bind('input selectionchange propertychange', function() {

			let thisObj = $(this);
			let listDescription = thisObj.val();

			let listId = $('.CreateListArea').attr('id');

			// if list exists, just update because if list exists, a template must already exist, as such, it only needs to be updated and it also solves the problem of someone typing a second letter before template is created 
			if (listId && listId.length > 0 && templateBeingCreated == false && listBeingCreated  == false) {
				// list exists, just update
				messageBlock.text("Updating list...");
				$.ajax({
				  data: {
				  	listDescription: listDescription,
				  	listId: listId
				  },
				  type: 'POST',
				  url: '/' + coreURL + '/updateNewList',
				  success: function(item){
				  	messageBlock.text("List update successful.");
				    console.log("List item updated.");
				    // Display success message?
				  },
				  error: function(err){
				  	messageBlock.text("List update failed.");
				    console.log("List update failed: ", err);
				    // Display error message?
				  }
				});
			} else if (templateBeingCreated == true) {
				// updates list later
				return console.log("Template being created. Will auto-update.");
			} else if (listBeingCreated == true) {
				// updates list later, this is necessary, as it is possible that while a list is being created, and the id's don't yet exist, then changes are made to the title or description, but then can't be updated as lists don't yet exist, and it is also necessary to prevent creating the list multiple times; the solution to this is to perform an update at the end of the creation and skip any updates while creation is in in progress.
				return console.log("List being created. Will auto-update.");
			} else {
				// if list does not exist and template is not being created --> create list
				let templateId = $('.Template').attr('id');
				let curataId = $('.curataId').attr('data-curataId');

				listBeingCreated = true;

				// if template does not exist --> check if begin created, else --> create template
				if (!templateId) {
					templateBeingCreated = true;
					console.log("Template does not yet exist.");
					if ($('.OverlayComponents').length) {
						console.log("Template being created.");
						$('.OverlayComponents').bind('destroyed', function() {
							// console log
							if (templateId) {
								console.log("Template has been created, proceed.");
								templateBeingCreated = false;
							} else {
								console.log("Template creation must have failed.");
								templateBeingCreated = false;
							}
						})
					} else {
						// Create template
						console.log("Creating template.");
						let overlayComponents = $("<div>", {"class": "OverlayComponents"});
						overlayComponents.text("Finishing up template creation...");
						$('.TemplateConstructor').prepend(overlayComponents);
						$('.templateTitle2').prop("readonly", true);
						$('.templateTitle2').attr("placeholder", "Finishing creating template...");
						$.ajax({
						  data: {
						    curataId: curataId
						  },
						  type: 'POST',
						  url: '/' + coreURL + '/createNewTemplate',
						  success: function(item){
						    console.log("Template created.", item);
						    $('.Template').attr('id', item._id);
						    // Display success message?
						    messageBlock.text("Creating list...");
							listDescription = thisObj.val();

							$.ajax({
							  data: {
							  	listDescription: listDescription,
							  	curataId: curataId,
							  	templateId: item._id
							  },
							  type: 'POST',
							  url: '/' + coreURL + '/createNewList',
							  success: function(object){
							  	console.log("List created: ", object);
							  	$('.CreateListArea').attr('id', object._id)
							  	let addNewEntry = $("<a>",  {"class": "addEntryFromList"});
							  	addNewEntry.text('+ New Entry');
							  	$('.helperNavigation').append(addNewEntry); 
							  	initCreateNewEntryFromList()
							  	messageBlock.text("List created.");
							  	let listName = $('.CreateListArea').find('.ListTitle').val();
							  	let listDesc = $('.CreateListArea').find('.ListDescription').val();
							  	messageBlock.text("Updating list...");

								$.ajax({
								  data: {
								  	listTitle: listName,
								  	listDescription: listDesc,
								  	listId: object._id
								  },
								  type: 'POST',
								  url: '/' + coreURL + '/updateNewList',
								  success: function(item){
								  	messageBlock.text("List update successful.");
								    console.log("List item updated.");
								    // Display success message?
								    templateBeingCreated = false;
								    listBeingCreated = false;
								    $('.OverlayComponents').remove();
									$('.templateTitle2').prop("readonly", false);
									$('.templateTitle2').attr("placeholder", "Give your template a name!");
								  },
								  error: function(err){
								    console.log("List update failed: ", err);
								    messageBlock.text("List update failed.");
								    templateBeingCreated = false;
								    listBeingCreated = false;
								    $('.templateTitle2').attr("placeholder", "Template creation failed.");
								    $('.OverlayComponents').text("Template creation failed.");
								    // Display error message?
								  }
								});
			
							  	// if list updates, just say list updated;

							    // Display success message?
							  },
							  error: function(err){
							    console.log("List creation failed: ", err);
							    listBeingCreated = false;
							    // Display error message?
							    templateBeingCreated = false;
							  }
							});

						  },
						  error: function(err){
						    console.log("Template creation failed: ", err);
						    // Display error message?
						    templateBeingCreated = false;
						    $('.templateTitle2').attr("placeholder", "Template creation failed.");
						    $('.OverlayComponents').text("Template creation failed.");
						  }
						});
					}
				} else {
					// Template exists but list doesn't --> create list
					console.log("Template exists. Creating list.");
					messageBlock.text("Creating list...");
					listDescription = thisObj.val();

					$.ajax({
					  data: {
					  	listDescription: listDescription,
					  	curataId: curataId,
					  	templateId: templateId
					  },
					  type: 'POST',
					  url: '/' + coreURL + '/createNewList',
					  success: function(object){
					  	console.log("List created: ", object);
					  	messageBlock.text("List created.");
					  	$('.CreateListArea').attr('id', object._id)
					  	let addNewEntry = $("<a>",  {"class": "addEntryFromList"});
					  	addNewEntry.text('+ New Entry');
					  	$('.helperNavigation').append(addNewEntry); 
					  	initCreateNewEntryFromList()
					  	let listName = $('.CreateListArea').find('.ListTitle').val();
					  	let listDesc = $('.CreateListArea').find('.ListDescription').val();

						$.ajax({
						  data: {
						  	listTitle: listName,
						  	listDescription: listDesc,
						  	listId: object._id
						  },
						  type: 'POST',
						  url: '/' + coreURL + '/updateNewList',
						  success: function(item){
						  	messageBlock.text("List update successful.");
						  	listBeingCreated = false;
						    console.log("List item updated.");
						    // Display success message?
						  },
						  error: function(err){
						  	messageBlock.text("List update failed.");
						  	listBeingCreated = false;
						    console.log("List update failed: ", err);
						    // Display error message?
						  }
						});
	
					  	// if list updates, just say list updated;

					    // Display success message?
					  },
					  error: function(err){
					    console.log("List creation failed: ", err);
					    messageBlock.text("List creation failed.");
					    listBeingCreated = false;
					    // Display error message?
					  }
					});
				}

			}

		});
	}
	initNewListCreation();


	function initCreateNewList() {

		// when list is created and no template exists, also create template instantly
		$('.CreateListButton').on('click', function() {
			let listTitle = $('.ListTitle').val();
			let listDescription = $('.ListDescription').val();

			let templateId = $('.Template').attr('id');
			let curataId = $('.curataId').attr('data-curataId');

			if (!templateId) {
				return console.log("Template is empty! Give your template a title or add a component!");
			}

			if (!listTitle) {
				return console.log("Give your list a title!");
			}

			$.ajax({
			  data: {
			  	listTitle: listTitle,
			  	listDescription: listDescription,
			  	curataId: curataId,
			  	templateId: templateId
			  },
			  type: 'POST',
			  url: '/' + coreURL + '/createNewList',
			  success: function(item){
			    console.log("List created: ", item);
			    window.location.href = '/' + coreURL + '/curatas/' + curataId;
			    // Display success message?
			  },
			  error: function(err){
			    console.log("List creation failed: ", err);
			    // Display error message?
			  }
			});


		})
	}
	initCreateNewList();

	function makeHeaderLink() {
		$('.listHeader').off('click');
		$('.listHeader').on('click', function() {
			window.location.href = $('a', this).attr('href');
		})
	}
	makeHeaderLink();


	function initDropDown() {
		// reapply upon creating new component
		$('.dropDown').off('click');
		$('.dropDown').on('click', function(){
			let ComponentId = $(this).closest('.Component').attr('id');
			let List = $("#" + ComponentId);
		    List.find('.drop-down2').toggleClass('drop-down--active');
		});
	}
	initDropDown();

	function initAllCuratasDropdown() {
		// reapply upon creating new component
		$('.curataDropdown').off('click');
		$('.curataDropdown').on('click', function(){

			let thisDrop = $(this);

			$('.singleCurata').each(function(i, obj) {
				let dropper = $(obj).find('.curataDropdown');
				let dropperParent = dropper.parent().hasClass('')
				if (dropper.is(thisDrop)) {
					// Making exception for dropdown button that is same as click
				} else if ($(obj).find('.curata-drop-down').hasClass('drop-down--active')) {
					$(obj).find('.curata-drop-down').removeClass('drop-down--active');
				}
			})
			let singleCurata = $(this).closest('.singleCurata');
			let curataDropdown = singleCurata.find('.curata-drop-down');
		    curataDropdown.toggleClass('drop-down--active');
		    if (curataDropdown.hasClass('drop-down--active')) {
		    	curataDropdown.addClass('closeDropdown');
		    	$(document).off('click');
		    	let type = "curata";
		    	initDropdownListening(curataDropdown, thisDrop, type);
		    }

		    initDropdownClosing();
		});
	}
	initAllCuratasDropdown();


	function initEntriesDropdown() {
		// reapply upon creating new component
		$('.entryDropdown').off('click');
		$('.entryDropdown').on('click', function(){

			let thisDrop = $(this);

			$('.singleList').each(function(i, obj) {
				let dropper = $(obj).find('.entryDropdown');
				// let dropperParent = dropper.parent().hasClass('')
				if (dropper.is(thisDrop)) {
					// Making exception for dropdown button that is same as click
				} else if ($(obj).find('.entry-drop-down').hasClass('drop-down--active')) {
					$(obj).find('.entry-drop-down').removeClass('drop-down--active');
				}
			})
			let singleList = $(this).closest('.singleList');
			let entryDropdown = singleList.find('.entry-drop-down');
			// modifiedIndex exists so that the dropdown would not get hidden underneath other list blocks
			$('.modifiedIndex').removeClass('modifiedIndex');
			singleList.toggleClass('modifiedIndex');
		    entryDropdown.toggleClass('drop-down--active');
		    if (entryDropdown.hasClass('drop-down--active')) {
		    	entryDropdown.addClass('closeDropdown');
		    	$(document).off('click');
		    	let type = "entry";
		    	initDropdownListening(entryDropdown, thisDrop, type);
		    }
		});
	}
	initEntriesDropdown();


/*

1. Must not be the dropdown itself -- those clicks are neutralized
2. If any other dropdown button is clicked, anything still open should be closed and then the new one should be opened
3. If the 

*/

// When the user clicks anywhere outside of the modal, close it

	// let activeElement = $('.drop-down--active');
	// if (activeElement.length) {
	// 	activeElement.removeClass('drop-down--active');
	// }

// if user clicks somewhere
// if not specific object
	// close that specific object
// if is specific object, do nothing

// if (activeElement.length) {
// 	console.log("Exists!");
// 	if ($(event.target) !== activeElement) {
// 		console.log("Is same!");
// 		activeElement.removeClass('drop-down--active');
// 	} else {
// 		console.log("Confused!");
// 	}
// } else {
// 	console.log("Doesn't exist!");
// }

// if (target !== $('.curata-drop-down__menu-box') && target.parents('.curata-drop-down').length == false && target !== $('.curataDropdown')) {
// dropdown.removeClass('drop-down--active');

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

	function initDropdownListening(dropdown, dropdownBtn, type) {
		$(document).on('click', function(event) {

			// close dropdown if user clicks anywhere else 
			// that is not the dropdown itself, including
			// if the user opens a new dropdown

			let target = $(event.target);

			if (target.hasClass(type + '-drop-down__menu-box') == false && target.parents('.' + type + '-drop-down').length < 1 && target.hasClass(type + 'Dropdown') == false || target.hasClass(type + '-drop-down__item') == true || target.hasClass('dropLink') == true) {
				$('.' + type + '-drop-down').removeClass('drop-down--active');
				let singleList = $('.' + type + '-drop-down').closest('.singleList');
				if (singleList && singleList.length) {
					singleList.removeClass('modifiedIndex');
				}
			}

		});
	}

	/* REVERSE ORDER */
	function initCurataReverseSort() {
		let chronologicalOrder = true;
		$(".changeOrder").click(function() {
			var list = $('.curatasList');
			var listItems = list.children('.singleCurata');
			list.append(listItems.get().reverse());
			chronologicalOrder = !chronologicalOrder;
		});
	}
	initCurataReverseSort();

	function initReverseSort() {
		let chronologicalOrder = true;
		$(".swapOrder").click(function() {
			$('.entriesList').each(function(i, list) {
				var listItems = $(list).children('.singleList');
				$(list).append(listItems.get().reverse());
				chronologicalOrder = !chronologicalOrder;
			})
		});
	}
	initReverseSort();

	function initCurataAlphabetSort() {
		$(".sortAlpha").click(function() {
			let list = $('.curatasList');
			list.children().detach().sort(function(a, b) {
				return $(a).find('.curataLink').text().localeCompare($(b).find('.curataLink').text());
			}).appendTo(list);
		});
	}
	initCurataAlphabetSort();

	function initABCSort() {
		$(".sortABC").click(function() {
			let list = $('.entriesList');
			list.each(function(i, obj) {
				$(obj).children().detach().sort(function(a, b) {
					return $(a).find('.ribbonList').text().localeCompare($(b).find('.ribbonList').text());
				}).appendTo($(obj));
			})
		});
	}
	initABCSort();

	function initCurataOwnerSort() {
		$(".ownerSort").click(function() {
			let list = $('.curatasList');
			list.children().detach().sort(function(a, b) {
				return $(a).find('.curataOwner').text().localeCompare($(b).find('.curataOwner').text());
			}).appendTo(list);
		});
	}
	initCurataOwnerSort();

	function initOwnerSort() {
		$(".ownerFilter").click(function() {
			let list = $('.entriesList');
			list.each(function(i, obj) {
				$(obj).children().detach().sort(function(a, b) {
					return $(a).find('.entryOwner').text().localeCompare($(b).find('.entryOwner').text());
				}).appendTo($(obj));
			})
		});
	}
	initOwnerSort();

	function initCurataAscendingDateSort() {
		$('.ascendingDate').on('click', function() {
			let list = $('.curatasList');
			let listItem = $('.singleCurata');

			listItem.sort(function(a,b){
			    a = $(a).find('.dateCreated').attr("data-date");
			    b = $(b).find('.dateCreated').attr("data-date");
			    return a<b ? -1 : a>b ? 1 : 0;
			}).each(function(){
			    list.prepend(this);
			});
		})
	}
	initCurataAscendingDateSort();

	function initAscendingDateSort() {
		$('.ascendingSort').on('click', function() {
			let list = $('.entriesList');

			list.each(function(i, object) {
				let listItem = $(object).find('.singleList');
				listItem.sort(function(a,b){
				    a = $(a).find('.datesArea').attr("data-created");
				    b = $(b).find('.datesArea').attr("data-created");
				    return a<b ? -1 : a>b ? 1 : 0;
				}).each(function(){
					$(object).prepend(this);
				});
			})
		})
	}
	initAscendingDateSort();

	function initCurataDescendingDateSort() {
		$('.descendingDate').on('click', function() {
			let list = $('.curatasList');
			let listItem = $('.singleCurata');

			listItem.sort(function(a,b){
			    a = $(a).find('.dateCreated').attr("data-date");
			    b = $(b).find('.dateCreated').attr("data-date");
			    return a>b ? -1 : a<b ? 1 : 0;
			}).each(function(){
			    list.prepend(this);
			});
		})
	}
	initCurataDescendingDateSort();

	function initDescendingDateSort() {
		$('.descendingSort').on('click', function() {
			let list = $('.entriesList');

			list.each(function(i, object) {
				let listItem = $(object).find('.singleList');
				listItem.sort(function(a,b){
			  		a = $(a).find('.datesArea').attr("data-created");
			    	b = $(b).find('.datesArea').attr("data-created");
			    	return a>b ? -1 : a<b ? 1 : 0;
			}).each(function(){
					$(object).prepend(this);
				});
			})
		})
	}
	initDescendingDateSort();

	function initCurataSelfSort() {
		$('.selfSort').on('click', function() {
			let listItem = $('.singleCurata');

			listItem.each(function(i, item) {
				let curataOwner = $(this).find('.curataOwner').attr('data-username');
				if (curataOwner !== username) {
					$(this).toggleClass('hidden');
				}
			})
		})
	}
	initCurataSelfSort();

	function initSelfSort() {
		$('.selfFilter').on('click', function() {
			let list = $('.entriesList');

			list.each(function(i, obj) {
				let listItem = $(obj).find('.singleList');
				listItem.each(function(i, item) {
					let entryOwner = $(this).find('.creatorField').attr('id');
					if (entryOwner !== userId) {
						$(this).toggleClass('hidden');
					}
				})
			})
		})
	}
	initSelfSort();

	function initCollabSort() {
		$('.collabSort').on('click', function() {
			let listItem = $('.singleCurata');

			listItem.each(function(i, item) {
				console.log("Hello.");
				let collabIndicator = $(this).find('.collabIndicator');
				if (!collabIndicator.length) {
					$(item).addClass('hidden');
				}
			})
		})
	}
	initCollabSort();

	function initCurataResetSort() {
		$('.resetSort').on('click', function() {
			let listItem = $('.singleCurata');

			listItem.each(function(i, item) {
				if ($(this).hasClass('hidden')) {
					$(this).removeClass('hidden');
				}
			})

			$('#searchFilter').val('');
			performSearchSort();
		})
	}
	initCurataResetSort();

	function initResetSort() {
		$('.resetOrder').on('click', function() {
			let listItem = $('.singleList');

			listItem.each(function(i, item) {
				if ($(this).hasClass('hidden')) {
					$(this).removeClass('hidden');
				}
			})

			$('#searchEntries').val('');
			performEntriesSearch();
		})
	}
	initResetSort();

	function initSwitchView() {
		$('.viewAsList').on('click', function() {
			let listItem = $('.singleCurata');

			listItem.each(function(i, item) {
				$(item).toggleClass('listViewCss');
				if ($(item).hasClass('listViewCss')) {
					$('.viewAsList').text("Grid view");
				} else {
					$('.viewAsList').text("List view");
				}
			})
		})
	}
	initSwitchView();

	function initOpenFilters() {
		$('.openFilters').on('click', function() {
			let filters = $('.modificationButtons');

			filters.removeClass('hidden');
			$(this).addClass('hidden');
		})
	}
	initOpenFilters();

	function initCloseFilters() {
		$('.closeFilters').on('click', function() {
			let filters = $('.modificationButtons');

			filters.addClass('hidden');
			$('.openFilters').removeClass('hidden');
		})
	}
	initCloseFilters();

	$('#searchFilter').on('keyup', function() {
		performSearchSort();
	})

	function performSearchSort() {
	  // Declare variables
	  let input, filter, list, listItems;
	  input = $('#searchFilter');
	  filter = input.val().toUpperCase();
	  list = $(".curatasList");
	  listItems = list.find('.singleCurata');

	// Loop through all list items, and hide those who don't match the search query
	  listItems.each(function(i, item) {
	  	let textBlock = $(item).find('.curataLink').text();
	    if (textBlock.toUpperCase().indexOf(filter) > -1) {
	      $(item).show();
	    } else {
	      $(item).hide();
	    }
	  })
	}

	$('#searchEntries').on('keyup', function() {
		performEntriesSearch();
	})

	function performEntriesSearch() {
		// Declare variables
		let input, filter, list, listItems;
		input = $('#searchEntries');
		filter = input.val().toUpperCase();
		list = $(".entriesList");
		listItems = list.find('.singleList');

		// Loop through all list items, and hide those who don't match the search query

		$('.listContainer').show();
		$('.singleList').show();
		$('.nothingFoundBlock').remove();
		listItems.each(function(i, item) {
			if ($(item).parents('#Lists').length == 1) {
				let altBlock = $(item).find('.entriesListTitle').text();
			    if (altBlock.toUpperCase().indexOf(filter) > -1) {
			      $(item).closest('.listContainer').show();
			    } else {
			      $(item).closest('.listContainer').hide();
			    }

			    let entriesList = $(item).closest('.entriesList');
			    let listBlocks = entriesList.find('.listContainer');

				let blockCount = 0;
				listBlocks.each(function(i, block) {
					if ($(block).css('display') !== 'none') {
						console.log("Counting.");
						blockCount++;
						console.log("Block count: ", blockCount);
					}
				})

				if (blockCount == 0) {
					let nothingFoundBlock = $('<div>', {"class": "nothingFoundBlock"});
					let nothingFoundMessage = $('<div>', {"class": "nothingFoundMessage"});
					nothingFoundMessage.text("Nothing found! Try searching something else.");
					let nothingFoundImage = $('<img>', {"class": "nothingFoundImage"});
					nothingFoundImage.attr('src', '/images/ginger-cat-empty.png')
					nothingFoundBlock.append(nothingFoundMessage);
					nothingFoundBlock.append(nothingFoundImage);
					if (entriesList.find('.nothingFoundBlock').length == 0) {
						entriesList.append(nothingFoundBlock);
					}
				}

			} else {
			  	let textBlock = $(item).find('.ribbonList').text();
			  	// and if list titles also return false...
			    if (textBlock.toUpperCase().indexOf(filter) > -1) {
			      $(item).show();
			    } else {
			      $(item).hide();
			      let entriesList = $(item).closest('.entriesList');
			      if (entriesList.children(':visible').length == 0) {
			      	entriesList.closest('.listContainer').hide();
			      }

			      let curataList = $(item).closest('.curataList');

			      curataList.find('.listContainer').each(function(i, obj) {
		      		let singleItemCount = 0;
		      		$(obj).find('.singleList').each(function(i, singleItem) {
		      			if ($(singleItem).css('display') !== 'none') {
		      				console.log("Counting.");
		      				singleItemCount++;
		      				console.log("Single item count: ", singleItemCount);
		      			}
		      		})
			      	if (singleItemCount == 0) {
			      		console.log("Removing.");
			      		$(obj).hide();
			      	}
			      })
			      let containerCount = 0;
			      curataList.find('.listContainer').each(function(i, container) {
			      	if ($(container).css('display') !== 'none') {
			      		console.log("Counting.");
			      		containerCount++;
			      		console.log("Container count: ", containerCount);
			      	}
			      })
			      if (containerCount == 0) {
					let nothingFoundBlock = $('<div>', {"class": "nothingFoundBlock"});
					let nothingFoundMessage = $('<div>', {"class": "nothingFoundMessage"});
					nothingFoundMessage.text("Nothing found! Try searching something else.");
					let nothingFoundImage = $('<img>', {"class": "nothingFoundImage"});
					nothingFoundImage.attr('src', '/images/ginger-cat-empty.png')
					nothingFoundBlock.append(nothingFoundMessage);
					nothingFoundBlock.append(nothingFoundImage);
					if (curataList.find('.nothingFoundBlock').length == 0) {
						curataList.append(nothingFoundBlock);
					}
			      }
			    }
			}
		})
	}


function switchTab(click, tabType) {
	$('.tabcontent').each(function(i, obj) {
		$(obj).hide();
		$(obj).removeClass('block');
	})

	$(".tablinks").each(function(i, obj) {
		$(obj).removeClass('activeTab');
	})

	$("#" + tabType).show();
	$(click).addClass('activeTab');
}

$('.tablinks').on('click', function() {
	let click = this;
	let tabType = $(click).attr('data-tab');
	switchTab(click, tabType)
})


	



	// function initEditorListening() {

	// 	$('.simpleEditor').each(function(index, obj) {
	// 		let editorText = $(this).find('.editorText');
	// 		let editorID = editorText.attr('id');
	// 		// editorID = $('#' + editorID);
	// 		editorID = '#' + editorID;
	// 		console.log("THE editorID: ", editorID);

	// 		let editor = editors.editorID;
	// 		console.log("editor: ", editor);

	// 		editor.model.document.on( 'change:data', function() {
	// 		    console.log( 'The data has changed!' );
	// 		} );
	// 	})

	// }


	// function initEditorListening() {
	// $('.ElementTitle').unbind('input change');
	// $('.ElementTitle').bind('input change', function() {


	// 	// get id 
	// 	// there are many items, and I must get them all separately
	// 	// so perhaps using .each()?
	// 		// for each editorText
	// 			// get their id
	// 			// init editor changes
	// 	let editorID = X;
	// 	let editor = editors[editorID];

	// 	editor.model.document.on( 'change:data', function() {
	// 	    console.log( 'The data has changed!' );
	// 	} );


	// 	let ComponentId = $(this).closest('.Component').attr('id');
	// 	let ComponentTitle = $(this).val();
	// 	console.log("component id: ", ComponentId);
	// 	console.log("title: ", ComponentTitle);

	// 	let dataType = $(this).attr('data-type');
	// 	if (dataType == 'question') {
	// 		console.log("This is a question.");
	// 	} else {
	// 		console.log("This is not a question.");
	// 	}

	// 	// $.ajax({
	// 	//   data: {
	// 	//     ComponentId: ComponentId,
	// 	//     ComponentTitle: ComponentTitle,
	// 	//   },
	// 	//   type: 'POST',
	// 	//   url: '/' + coreURL + '/UpdateComponentTitle',
	// 	//   success: function(Item){
	// 	//     console.log("Component title successfully updated.")
	// 	//     // Display success message?

	// 	//   },
	// 	//   error: function(err){
	// 	//     console.log("Component title update failed: ", err);
	// 	//     // Display error message?
	// 	//   }
	// 	// });

	// 	});
	// }
	// initEditorListening();

});
