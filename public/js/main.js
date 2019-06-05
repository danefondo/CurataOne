 $(document).ready(function () {

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
initSaveAsDraft()
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
initTitleListening()
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

	*/

	let editorCount = 0;
	let editors = {};
	let creatingListItem = false;
	let creatingQuestion = false;
	let savingInProgress = false;
	let enableDisableInProgress = false;
	let firstCreationInProgress = false;
	let deletionModal = $('.emptyModal');

	let entryId = $('.TemplateHolder').attr('id');
	let tempId = $('.TemplateId').attr('id');
	let userId = $('.userId').attr('id');
	let username = $('.userId').attr('data-username');

	$(".DropdownX").on("click", function(){
	  $(this).toggleClass('is-expanded');
	});

	function initPreviewButton() {
		$('.showPreview').off('click');
		$('.showPreview').on('click', function() {
			window.open('/curatas/drafts/' + entryId, '_blank');
		})

		$('.closeWindowBtn').on('click', function() {
			window.top.close();
		});
	}
	initPreviewButton();

	function initAddNewList() {
		let creationModal = $('.emptyModal');

		$('.addNewList').on('click', function() {
			creationModal.show();
		})

		$('.cancelListCreating').on('click', function() {
			creationModal.hide();
		})

		// $('.createNewTemplate').on('click', function() {

		// 	let curataId = $('.currentCurataSwitch').attr('id');
		// 	window.location.href = '/curatas/' + username +'/curatas/' + curataId + '/templates/newTemplate';

		// 	// $.ajax({
		// 	// 	data: {
		// 	// 		curataId: curataId
		// 	// 	},
		// 	// 	type: 'POST',
		// 	// 	url: '/curatas/' + username +'/curatas/' + curataId + '/templates/newTemplate',
		// 	// 	success: function(response) {
		// 	// 		console.log("Yoho! Successfully created new template!");
		// 	// 		window.location.href = response.redirectTo;
		// 	// 	},
		// 	// 	error: function(err) {
		// 	// 		console.log("Arrghh! Failed to create template!");
		// 	// 	}
		// 	// });

		// })
	}
	initAddNewList();

	function initCancelAndDeleteEntry() {

		$('.cancelDeleteEntry').on('click', function() {
			deletionModal.show();
		})

		$('.cancelEntryDelete').on('click', function() {
			deletionModal.hide();
		})

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

		$('.confirmEntryDelete').on('click', function() {
			$.ajax({
				data: {
					entryId: entryId
				},
				type: 'DELETE',
				url: '/curatas/CancelAndDeleteEntry',
				success: function(response) {
					console.log('Entry deleted.');
					window.location.href = response.redirectTo;
				},
				error: function(err) {
					console.log("Failed to delete entry.");
				}
			})
		});
	}
	initCancelAndDeleteEntry();

	function initRevertToDraft() {
		$('.makeDraft').on('click', function() {
			let btn = this;

	    	$.ajax({
	    		data: {
	    			entryId: entryId
	    		},
	    		type:'POST',
	    		url: '/curatas/RevertEntryToDraft',
	    		success: function(response) {
	    			console.log("Reverted entry back to draft.", response)
	    			let publishBtn = $("<div>", {"class": "publishEntry buttonGrey inline"});
	    			publishBtn.text("Publish");
	    			$(btn).replaceWith(publishBtn);
	    			$('.entryState').text('Entry is a Draft.');
	    			initPublishAndCreateEntry();
	    		},
	    		error: function(err) {
	    			console.log("Failed to publish entry: ", err);
	    			// Display error not being able to publish
	    		}
	    	});
		})
	}

	function initGoToEditTemplate() {
		$('.editTemplate').on('click', function() {
			if (savingInProgress == true) {
				alert('Wait! Save in progress!');
			} else {
				window.location.href = '/curatas/templates/' + tempId;
			}
		}) 
	}
	initGoToEditTemplate();

	if ($('.navlink').length) {
	    $(".navlink").each(function() {
	        if (this.href == window.location.href) {
	            $(this).addClass("activeNav");
	        }
	    });
	}


	function initPublishAndCreateEntry() {
		$('.publishEntry').on('click', function() {

	    	$.ajax({
	    		data: {
	    			entryId: entryId
	    		},
	    		type:'POST',
	    		url: '/curatas/PublishEntry',
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
					$('.publishEntry').text("Save in progress");
					$('.statusMessage').text("Saving changes...")
					enableDisableInProgress = false;
				} else {
					$('.makeDraft').off('click');
					$('.editTemplate').off('click');
					$('.publishEntry').css('background-color', '#ececec');
					$('.publishEntry').css('color', '#ccc');
					$('.editTemplate').css('background-color', '#ececec');  
					$('.editTemplate').css('color', '#ccc'); 
					$('.makeDraft').text("Save in progress");
					$('.statusMessage').text("Saving changes...")
					enableDisableInProgress = false;
				}
			} else if (savingInProgress == false) {
				if ($('.entryState').attr('data-entryState') == "Draft") {
					initPublishAndCreateEntry();
					initGoToEditTemplate();
					// $('.publishEntry').css();
					$('.publishEntry').text("Publish");
					$('.statusMessage').text("All changes saved.")
					$('.publishEntry').css('background-color', 'gainsboro');
					$('.publishEntry').css('color', '#6f6f6f');
					$('.editTemplate').css('background-color', 'gainsboro');  
					$('.editTemplate').css('color', '#6f6f6f'); 
					enableDisableInProgress = false;
				} else {
					initRevertToDraft();
					initGoToEditTemplate();
					$('.editTemplate').css('background-color', 'gainsboro'); 
					$('.publishEntry').css('background-color', 'gainsboro');
					$('.editTemplate').css('color', '#6f6f6f'); 
					$('.publishEntry').css('color', '#6f6f6f');
					$('.makeDraft').text("Revert to draft");
					$('.statusMessage').text("All changes saved.")
					enableDisableInProgress = false;
				}
			}
		}
	}

	function initSaveAsDraft() {
		// Save as draft and simply exit to the general list

		// in one place you view the publicly listed entries
			// in the other place you can manage all but filter by draft/published
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

		    initTitleListening();
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

	    	$.ajax({
	    		data: {
	    			imageKey: imageKey,
	    			componentId: ComponentId
	    		},
	    		type:'DELETE',
	    		url: '/curatas/DeleteImage',
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

	    	$.ajax({
	    		data: {
	    			imageKey: imageKey,
	    			entryId: entryId
	    		},
	    		type:'DELETE',
	    		url: '/curatas/DeleteImage',
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

			let title = Component.find('.ImageTitleInput')

			title.animate({opacity:0});

			let deleteBtn = this

	    	$.ajax({
	    		data: {
	    			componentId: ComponentId
	    		},
	    		type:'DELETE',
	    		url: '/curatas/DeleteImageTitle',
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

			let description = Component.find('.editorSortable')

			description.animate({opacity:0});

			let deleteBtn = this

	    	$.ajax({
	    		data: {
	    			componentId: ComponentId
	    		},
	    		type:'DELETE',
	    		url: '/curatas/DeleteImageDescription',
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
						componentType: componentType
					},
					type: 'POST',
					url: '/curatas/CreateNewListItem',
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
									listItemId: listItemId
								},
								type: 'POST',
								url: '/curatas/UpdateChecklist',
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
									listItemId: listItemId
								},
								type: 'POST',
								url: '/curatas/UpdateChecklist',
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
							listItemId: listItemId
						},
						type: 'POST',
						url: '/curatas/UpdateChecklist',
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
							listItemId: listItemId
						},
						type: 'POST',
						url: '/curatas/UpdateChecklist',
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
				let entryId = $('.TemplateHolder').attr('id');

				let componentOrder = $(this).closest('.Component').index();
				let itemOrder = $('#tempQuestionId').index();

				// create new question in database
				$.ajax({
				  data: {
				    entryId: entryId,
				    componentId: componentId,
				    itemOrder: itemOrder
				  },
				  type: 'POST',
				  url: '/curatas/CreateNewQuestion',
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
				    initQuestionTitleListening();
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

	function initMainEditor(editorID, toolbarID) {
	    DecoupledEditor
	        .create( document.querySelector( editorID ), {
	        removePlugins: [ 'FontSize', 'MediaEmbed', 'insertTable', 'Heading', 'alignment', 'Undo', 'Redo', 'FontFamily' ],
	        toolbar: ['bold', 'italic', 'highlight', '|' ,'bulletedList', 'numberedList', 'Link', 'blockQuote' ]
	    }  )
	        .then( editor => {
	            const toolbarContainer = document.querySelector( toolbarID );

	            toolbarContainer.appendChild( editor.ui.view.toolbar.element );

	            // Multiple editor instances: https://stackoverflow.com/questions/48575534/ckeditor-5-get-editor-instances
	            // myEditor = editor;
	            editors[editorID] = editor;

				editor.model.document.on( 'change:data', function() {
					enableDisablePublish();
				    console.log( 'The data has changed!' );
				    let entryText = editor.getData();
				    console.log("Content: ", entryText);


					$.ajax({
					  data: {
					    entryText: entryText,
					    entryId: entryId
					  },
					  type: 'POST',
					  url: '/curatas/UpdateEntryText',
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
	        removePlugins: [ 'FontSize', 'MediaEmbed', 'insertTable', 'Heading', 'alignment', 'Undo', 'Redo', 'FontFamily' ],
	        toolbar: ['bold', 'italic', 'highlight', '|' ,'bulletedList', 'numberedList', 'Link', 'blockQuote' ]
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
				    let ComponentContent = editor.getData();
				    console.log("Content: ", ComponentContent);

				    // In case there is a need for LivePreview, use this:

					// let matchingPreviewElement = $('.entryPreviewArea').find("[data-order='" +ComponentOrder +"']").find('.editorText');
					// matchingPreviewElement.html(ComponentContent);

					$.ajax({
					  data: {
					    ComponentId: ComponentId,
					    ComponentContent: ComponentContent,
					    entryId: entryId
					  },
					  type: 'POST',
					  url: '/curatas/UpdateComponentContent',
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

	            let EntryId = $('.TemplateHolder').attr('id');
	            let ComponentOrder = $('#' + ComponentId).attr('data-order');

				editor.model.document.on( 'change:data', function() {
					enableDisablePublish();

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
								EntryId: EntryId
							},
							type: 'POST',
							url: '/curatas/UpdateQuestionContent',
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
						    EntryId: EntryId
						  },
						  type: 'POST',
						  url: '/curatas/UpdateComponentContent',
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

			$.ajax({
			  data: {
			    entryLink: parsedLink,
			    entryId: entryId
			  },
			  type: 'POST',
			  url: '/curatas/UpdateEntryLink',
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
			$.ajax({
				data: {
					entryId: entryId
				},
				type: 'DELETE',
				url: '/curatas/RemoveEntryLink',
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

	function initEntryTitleListening() {
		$('.EntryTitle').unbind('input change');
		$('.EntryTitle').bind('input change', function() {
			enableDisablePublish();

			let entryTitle = $(this).val();

			$.ajax({
			  data: {
			    entryTitle: entryTitle,
			    entryId: entryId
			  },
			  type: 'POST',
			  url: '/curatas/UpdateEntryTitle',
			  success: function(Item){
			    console.log("Entry title successfully updated.")
			    // Display success message?
			    enableDisablePublish();

			  },
			  error: function(err){
			    console.log("Entry title update failed: ", err);
			    // Display error message?
			    enableDisablePublish();
			  }
			});

		});
	}
	initEntryTitleListening();

	function initTitleListening() {
		$('.ElementTitle').unbind('input change');
		$('.ElementTitle').bind('input change', function() {
			enableDisablePublish();

			let Component = $(this).closest('.Component')
			let ComponentId = Component.attr('id');
			let ComponentOrder = Component.attr('data-order');
			let ComponentTitle = $(this).val();
			let dataType = $(this).attr('data-type');

			// LiveEditPreview:

			// let matchingPreviewElement = $('.entryPreviewArea').find("[data-order='" +ComponentOrder +"']").find('.ElementTitle');
			// matchingPreviewElement.text(ComponentTitle);

			$.ajax({
			  data: {
			    ComponentId: ComponentId,
			    ComponentTitle: ComponentTitle,
			    entryId: entryId
			  },
			  type: 'POST',
			  url: '/curatas/UpdateComponentTitle',
			  success: function(Item){
			    console.log("Component title successfully updated.")
			    // Display success message?
			    enableDisablePublish();

			  },
			  error: function(err){
			    console.log("Component title update failed: ", err);
			    // Display error message?
			    enableDisablePublish();
			  }
			});

		});
	}
	initTitleListening();

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
				url: '/curatas/UploadSingleImage',
				type: 'POST',
				data: formData,
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
							url: '/curatas/UpdateEntryMainImage',
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
								$.ajax({
									data: {
										entryId: entryId,
										imageKey: imageKey,
										imageURL: imageURL
									},
									url: '/curatas/AddImageToCurataFiles',
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
												url: '/curatas/DeletePreviousImage',
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
							url: '/curatas/UpdateImageComponent',
							type:  'POST',
							data: {
								ComponentId: ComponentId,
								EntryId: entryId,
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
								let imageKey = responseData.component.componentImageKey;
								let imageURL = responseData.component.componentURL;
								$.ajax({
									data: {
										entryId: entryId,
										componentId: ComponentId,
										imageKey: imageKey,
										imageURL: imageURL
									},
									url: '/curatas/AddImageToCurataFiles',
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
												url: '/curatas/DeletePreviousImage',
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
					}
				}
			})


		});
	}
	initImageInputsListening();

	// function addImageToCurataFiles() {

	// }

	function initQuestionDeleting() {
		$('.deleteQuestion').off('click');
		$('.deleteQuestion').on('click', function() {
			enableDisablePublish();
			let componentId = $(this).closest('.Component').attr('id');
			let component = $('#' + componentId);
			let QuestionId = $(this).closest('.questionBlock').attr('id');
			let question = $('#' + QuestionId);

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
	    			componentId: componentId
	    		},
	    		type:'DELETE',
	    		url: '/curatas/DeleteQuestion',
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

	function initQuestionTitleListening() {
		$('.QuestionTitle').unbind('input change');
		$('.QuestionTitle').bind('input change', function() {
			enableDisablePublish();
			let ComponentId = $(this).closest('.Component').attr('id');
			let EntryId = $('.TemplateHolder').attr('id');
			let QuestionId = $(this).closest('.questionBlock').attr('id');
			let QuestionTitle = $(this).val();
			console.log('Got QuestionTitle: ', QuestionTitle);

			$.ajax({
				data: {
					ComponentId: ComponentId,
					EntryId: EntryId,
					QuestionId: QuestionId,
					QuestionTitle: QuestionTitle
				},
				type: 'POST',
				url: '/curatas/UpdateQuestionTitle',
				success: function(Item) {
					console.log("Question title successfully updated.");
					// display success or show 'entry saved' like in google docs
					enableDisablePublish();
				},
				error: function(err) {
					console.log("Question title update failed: ", err);
					// display error or show 'entry save failed' like in google docs
					enableDisablePublish();
				}
			})
		})
	}
	initQuestionTitleListening();

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
		let defaultTemplate = createNewEntryBtn.attr('data-default-template');
		let creationTime = new Date();
		let multiTempState = createNewEntryBtn.attr('data-multi-template');
		if (multiTempState == 'true') {
			console.log('Activate multi template functions.');
		} else {
			createNewEntryBtn.on('click', function() {
				// select list default template
				// create new entry in list
				$.ajax({
					data: {
						TemplateId: defaultTemplate,
						creationTime: creationTime
					},
					type: 'POST',
					url: '/curatas/' + username +'/curatas/' + curataId + '/lists/' + listId + '/createNewEntry',
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
					url: '/curatas/CreateNewListItem',
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
						url: '/curatas/CreateNewListItem',
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
					  url: '/curatas/CreateNewListItem',
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
					  url: '/curatas/CreateNewListItem',
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
						componentType: componentType
					},
					type: 'POST',
					url: '/curatas/CreateNewListItem',
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
								listItemLink: listItemLink
							},
							type: 'POST',
							url: '/curatas/saveListItemLink',
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
						listItemLink: listItemLink
					},
					type: 'POST',
					url: '/curatas/saveListItemLink',
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

			let inputDiv = $('<input>', {'class': 'linkInput'});
			inputDiv.attr('placeholder', 'Your link');

			let saveListItemLinkBtn = $('<div>', {'class': 'saveListItemLink'});
			saveListItemLinkBtn.text('Save');

			let cancelListItemLinkBtn = $('<div>', {'class': 'cancelListItemLink'});
			cancelListItemLinkBtn.text('Cancel');

			$.ajax({
				data: {
					componentId: componentId,
					listItemId: listItemId
				},
				type: 'POST',
				url: '/curatas/removeListItemLink',
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
							listItem: listItemInput
						},
						type: 'POST',
						url: '/curatas/UpdateListItem',
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
							componentType: componentType
						},
						type: 'POST',
						url: '/curatas/CreateNewListItem',
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
	    			componentId: componentId
	    		},
	    		type:'DELETE',
	    		url: '/curatas/DeleteListItem',
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
				componentId: componentId
			},
			type: 'POST',
			url: '/curatas/UpdateListItemOrder',
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
		  url: '/curatas/UpdateTemplateTitle',
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
					  url: '/curatas/createNewTemplate',
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

	function initCreateNewList() {
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
			  url: '/curatas/createNewList',
			  success: function(item){
			    console.log("List created: ", item);
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
	// 	//   url: '/curatas/UpdateComponentTitle',
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
