$(document).ready(function () {	

// setting flag
let receiveInProgress = false;
let tempBeingCreated = false;
let editingExistingEntryTemplate = false;
let deleteConfirmationModal = $('.emptyConfirmModal');

function updateComponentOrderInDB() {
	let indexArray = [];
	$('.Component').each(function(index, item) {
		console.log("List's index: ", index);
		if ($(item).attr('id')) {
			let component_id = $(item).attr('id');

			console.log("The id: ", component_id);
			let obj = {};
			obj["component_id"] = component_id;
			obj["new_position"] = index;

			console.log("object: ", obj);
			indexArray.push(obj);
		} else {
			return console.log("Component has no id.");
		}
	});

	console.log("indexArray: ", indexArray);

	// check if dealing with editing template for an existing entry
	let editingEntryTemplate = false;
	let entry = $('.entryId');
	let entryId = "N/A";

	if (entry.length) {
		entryId = entry.attr('data-entryId');

		if (entryId && entryId.length && entryId !== "N/A") {
			editingEntryTemplate = true;
		}
	}

	let TemplateId = $('.Template').attr('id');

	$.ajax({
		data: {
			indexArray: JSON.stringify(indexArray),
			TemplateId: TemplateId,
			entryId: entryId
		},
		type: 'POST',
		url: '/dashboard/UpdateComponentPosition',
		success: function(response) {
			console.log("Successfully updated positions.");
			if (receiveInProgress == true) {
				receiveInProgress = false;
			}
		},
		error: function(err) {
			console.log("Failed to update positions: ", err);
			if (receiveInProgress == true) {
				receiveInProgress = false;
			}
		}
	});
};

$(".sortable").sortable({
	cancel: "input,textarea,button,select,option,[contenteditable],.editorArea,.unsortable,span,.ListItemText,.NoItems",
	receive: function(event, ui) {
			receiveInProgress = true;

			let originalItem = ui.item;
			let componentType = originalItem.attr('data-component-type');

			// check if dealing with editing template for an existing entry
			let editingEntryTemplate = false;
			let entry = $('.entryId');
			let entryId = 'N/A';

			if (entry.length) {
				entryId = entry.attr('data-entryId');

				if (entryId && entryId !== 'N/A') {
					editingEntryTemplate = true;
				}
			}

			if ($(".TestHandle").length) {
				$(".TestHandle").remove();
			}

			$(newItem).removeAttr("class style");

			// let customStyle = originalItem.attr('data-css');
			// $(newItem).attr("class", "Component componentStyling " + customStyle);
			$(newItem).attr("class", "Component");

			$(newItem).find('.section-component-text').remove();
			let cType = $("<span>", {"class": "componentType"});
			cType.text("" + componentType);
			$(newItem).append(cType);

			// if (componentType !== "section-break") {
			// 	let placeholderBtn = $("<div>", {"class": "addPlaceholder"});
			// 	placeholderBtn.text("+ Placeholder");
			// 	let requiredBtn = $("<div>", {"class": "checkRequired"});
			// 	requiredBtn.text("Required?");
			// 	$(newItem).append(placeholderBtn);
			// 	$(newItem).append(requiredBtn);
			// }

			// let deleteBtn = $("<div>", {"class": "deleteComponent"});
			// deleteBtn.text("Delete");
			// $(newItem).append(deleteBtn);
			let compTitle = $("<input>", {"class": "componentTitle"});
			compTitle.attr("placeholder", "Component title");
			$(newItem).append(compTitle);
			// initComponentTitleListening();

			let dropDown = $("<div>", {"class": "drop-down2"});
			let dotsContainer = $("<div>", {"class": "dropDown drop-down__button2 unsortable"});
			let dots = $("<span>", {"class": "component-more"});
			dots.text('...');
			let dropdownContainer = $("<div>", {"class": "drop-down__menu-box2 unsortable"});
			let dropdownList = $("<ul>", {"class": "drop-down__menu2"});
			let addDescription = $("<li>", {"class": "drop-down__item2 AddDescription"});
			addDescription.text('Add description');
			let markRequired = $("<li>", {"class": "drop-down__item2 MarkRequired"});
			markRequired.text('Mark as required');
			let deleteComponent = $("<li>", {"class": "drop-down__item2 DeleteComponent"});
			deleteComponent.text('Remove component');

			let archiveComponent = $("<li>", {"class": "drop-down__item2 ArchiveComponent"});
			archiveComponent.text('Archive component');

			dropdownList.append(addDescription);
			dropdownList.append(markRequired);
			if ($('.entryId').length) {
				dropdownList.append(archiveComponent);
			} else {
				dropdownList.append(deleteComponent);
			}
			dropdownContainer.append(dropdownList);
			dotsContainer.append(dots);
			dropDown.append(dotsContainer);
			dropDown.append(dropdownContainer);

			$(newItem).append(dropDown);
			initDropDown();

			let componentOrder = newItem.index();

			let TemplateId = $('.Template').attr('id');
			if (!TemplateId) {
				console.log("Template does not exist yet or has not yet finished being created. Will auto-update later.");

				let curataId = $('.curataId').attr('data-curataId');

				if (!curataId) {
					return console.log("Curata id not loaded.");
				}

				if (tempBeingCreated == true) {
					// Template is being created. Auto-update does not exist for this, as the OverlayComponents should prevent
					console.log("Template still being created..");
				} else {
					// Template does not exist and is not being created.
					// Create template and component
					tempBeingCreated = true;
					let overlayComponents = $("<div>", {"class": "OverlayComponents"});
					overlayComponents.text("Finishing up template creation...");
					$('.TemplateConstructor').prepend(overlayComponents);
					$.ajax({
					  data: {
					    componentOrder: componentOrder,
					    componentType: componentType,
					    curataId: curataId,
					    entryId: entryId
					  },
					  type: 'POST',
					  url: '/dashboard/createNewTemplateWithComponent',
					  success: function(data){
					    console.log("Template created.", data);
					    $('.Template').attr('id', data.template._id);
						if (data.component._id) {
							$(newItem).attr('id', data.component._id);
							updateComponentOrderInDB();
						} else {
							console.log("Component ID missing.");
							receiveInProgress = false;
						}
					    // Display success message?
					    tempBeingCreated = false;
					    $('.TemplateConstructor').find('.OverlayComponents').remove();
					    initComponentTitleListening();
					    initAddDescription()
					    initComponentDescriptionListening();
					    initComponentDelete();
					    initComponentArchive();
					    initMarkAsRequired();

					  },
					  error: function(err){
					    console.log("Template creation failed: ", err);
					    // Display error message?
					    tempBeingCreated = false;
					    receiveInProgress = false;
					  }
					});
				}
			} else {
				// this one always means the template is already created and exists, though does not necessarily mean it is connected to an entry?!
				$.ajax({
					data: {
						componentOrder: componentOrder,
						componentType: componentType,
						// componentTitle: componentTitle,
						// placeholder: placeholder,
						TemplateId:  TemplateId,
						entryId: entryId
					},
					type: 'POST',
					url: '/dashboard/updateTemplateComponent',
					success: function(response) {
						console.log("Successfully updated template: ", response.template);
						if (response.component._id) {
							$(newItem).attr('id', response.component._id);
							updateComponentOrderInDB();
						} else {
							console.log("Component ID missing.");
							receiveInProgress = false;
						}
						initComponentTitleListening();
						initAddDescription();
						initComponentDelete();
						initComponentArchive();
						initMarkAsRequired();
					},
					error: function(err) {
						console.log("Failed to update template: ", err);
						receiveInProgress = false;
					}
				})
			}

			// per component save, animate 'saved' notification in green and then fade away

	},
	beforeStop: function(event, ui) {
		newItem = ui.item;
	},
	update: function(event, ui) {
		if (receiveInProgress == true) {
			console.log("Receive in progress! Update will happen on its own.")
		} else {
			updateComponentOrderInDB();
		}
	}
});


	function initDraggable() {
		$( ".draggable" ).draggable({
			connectToSortable: ".sortable",
			helper: "clone",
			revert: "invalid"
		});
	}

	function initDropDown() {
		// reapply upon creating new component
		$('.dropDown').off('click');
		$('.dropDown').on('click', function(){
			let component = $(this).closest('.Component');
			let archComp = $(this).closest('.archivedComp');
			if (component.length) {
				component.find('.drop-down2').toggleClass('drop-down--active');
			} else if (archComp.length) {
				archComp.find('.drop-down2').toggleClass('drop-down--active');
			}
		    
		});
	}
	initDropDown();

	function initComponentDelete() {

		$('.DeleteComponent').off('click');
		$('.DeleteComponent').on('click', function() {
			let templateId = $('.Template').attr('id');
			let component = $(this).closest('.Component');
			let templateComponentId = component.attr('id');

			// should anything be done in other functions while deleteInProgress?

			component.animate({display:"none"});

			$.ajax({
				data: {
					templateId: templateId,
					templateComponentId: templateComponentId
				},
				type: 'DELETE',
				url: '/dashboard/deleteTemplateComponent',
				success: function(data) {
					console.log("Successfully removed component.");
					component.remove();
					if (!$('.sortable').has('.Component').length) {
						let emptyBlock = $("<li>", {"class": "Component unsortable TestHandle"});
						emptyBlock.text('Drag blocks here from the left');
						$('.sortable').append(emptyBlock);
					}
				},
				error: function(err) {
					console.log("Failed to remove component: ", err);
					component.animate({display:"list-item"});
				}
			})

		})
	}
	initComponentDelete();

	function initComponentArchive() {

		$('.ArchiveComponent').off('click');
		$('.ArchiveComponent').on('click', function() {
			let templateId = $('.Template').attr('id');
			let component = $(this).closest('.Component');
			let templateComponentId = component.attr('id');

			if (templateId && templateComponentId) {
				console.log("Template id, template component id exist.");
			} else {
				return console.log("Either template, its component id does not exist");
			}

			// should anything be done in other functions while deleteInProgress?
			component.animate({display:"none"});

			$.ajax({
				data: {
					templateId: templateId,
					templateComponentId: templateComponentId,
				},
				type: 'DELETE',
				url: '/dashboard/archiveComponent',
				success: function(data) {
					console.log("Successfully removed component.");
					component.remove();
					if (!$('.sortable').has('.Component').length) {
						let emptyBlock = $("<li>", {"class": "Component unsortable TestHandle"});
						emptyBlock.text('Drag blocks here from the left');
						$('.sortable').append(emptyBlock);
					}
				},
				error: function(err) {
					console.log("Failed to remove component: ", err);
					component.animate({display:"list-item"});
				}
			})

		})
	}
	initComponentArchive();

	// function checkTemplateArchives() {
	// 	let templateId = $('.Template').attr('id');
	// 	console.log("templId", templateId);
	// 	let archivedTemplateComponents;
	// 	let archivedEntryComponents;
	// 	$.ajax({
	// 		data: {
	// 			templateId: templateId
	// 		},
	// 		type: 'GET',
	// 		url: '/dashboard/checkTemplateArchives',
	// 		success: function(data) {
	// 			console.log("Received template data: ", data);
	// 			if (data.archivedEntryComponents !== "N/A") {
	// 				archivedEntryComponents = data.archivedEntryComponents;
	// 			} 

	// 			if (data.archivedTemplateComponents !== "N/A") {
	// 				archivedTemplateComponents = data.archivedTemplateComponents;
	// 			}

	// 		},
	// 		error: function(err) {
	// 			console.log("Couldn't get archives: ", err);
	// 		}
	// 	})

	// 	let returnData = {};
	// 	returnData["archivedEntryComponents"] = archivedEntryComponents;
	// 	returnData["archivedTemplateComponents"] = archivedTemplateComponents;

	// 	return returnData;
	// }

	function initAddFromArchives() {
		let componentChooser = $('.emptyModal');
		$('.addArchivedComponent').on('click', function() {
			componentChooser.show();
			// wait loading message
			// once load complete, remove message and add new archive
			let templateId = $('.Template').attr('id');
			console.log("templId", templateId);
			let archivedTemplateComponents;
			$.ajax({
				data: {
					templateId: templateId
				},
				type: 'POST',
				url: '/dashboard/checkTemplateArchives',
				success: function(data) {
					console.log("Received template data: ", data);

					if (data.archivedTemplateComponents && data.archivedTemplateComponents.length) {
						let archiveContainer = $('.archiveContainer');
						archiveContainer.empty();
						if ($('.emptyArchives').length) {
							$('.emptyArchives').remove();
						}
						if (data.componentTypes.length) {
							data.componentTypes.forEach(function(type) {
								let typeObj = $("<h2>", {"class": "componentCategory"});
								typeObj.text("" + type);
								let container = $("<div>", {"class": "componentsByCategory"});
								container.append(typeObj);
								archiveContainer.append(container);
								data.archivedTemplateComponents.forEach(function(component) {
									if (component["componentType"] == type) {
										console.log("My component: ", component);
										let comp = $("<div>", {"class": "archivedComp"});
										let compText = $("<p>", {"class": "archivedText"});
										compText.text("" + component["componentType"]);
										comp.attr("data-templateComponentId", component["_id"]);
										let cTitle = $("<div>", {"class": "componentTitle", "placeholder": "Component title"});
										if (component["componentTitle"] && component["componentTitle"].length) {
											cTitle.text(component["componentTitle"]);
										} else {
											cTitle.text("Untitled component");
										}

										let descriptionBox = $("<div>", {"class": "componentDescription hidden", "placeholder": "Describe the purpose of this component."});

										let showDescription = $("<div>", {"class": "showDescription"});
										showDescription.text("Show description.")

										if (component["componentDescription"] && component["componentDescription"].length) {
											descriptionBox.text(component["componentDescription"])
										}

										let dropDown = $("<div>", {"class": "drop-down2"});
										let dotsContainer = $("<div>", {"class": "dropDown drop-down__button2 unsortable"});
										let dots = $("<span>", {"class": "component-more"});
										dots.text('...');
										let dropdownContainer = $("<div>", {"class": "drop-down__menu-box2 unsortable"});
										let dropdownList = $("<ul>", {"class": "drop-down__menu2"});
										let deleteComponent = $("<li>", {"class": "drop-down__item2 deleteArchivedComp"});
										deleteComponent.text('Delete');

										let unarchiveComp = $("<li>", {"class": "drop-down__item2 unarchiveComp"});
										unarchiveComp.text('Unarchive');

										dropdownList.append(unarchiveComp);
										dropdownList.append(deleteComponent);
										dropdownContainer.append(dropdownList);
										dotsContainer.append(dots);
										dropDown.append(dotsContainer);
										dropDown.append(dropdownContainer);

										comp.append(compText);
										comp.append(cTitle);
										if (component["componentDescription"] && component["componentDescription"].length) {
											comp.append(showDescription);
											comp.append(descriptionBox);
										}
										comp.append(dropDown);
										container.append(comp);
										initDropDown();
										initPermaDeleteComponent();
										initShowDescription();
									}
								})
							})
						}
						initUnarchiveComponent();
					} else {
						if ($('.emptyArchives').length) {
							$('.emptyArchives').remove();
						}
						let emptyArchives = $("<div>", {"class": "emptyArchives"});
						emptyArchives.text("This template doesn't have any archived components.");
						$('.wrapperWidth').append(emptyArchives);
					}
				},
				error: function(err) {
					console.log("Couldn't get archives: ", err);
				}
			})

		})

		$('.cancelListCreating').on('click', function() {
			componentChooser.hide();
		})
	}
	initAddFromArchives();

	function initShowDescription() {
		$('.showDescription').off('click');
		$('.showDescription').on('click', function() {
			let showButton = $(this);

			let component = showButton.closest('.archivedComp');
			let descriptionBox = component.find('.componentDescription:hidden');
			descriptionBox.removeClass('hidden');

			showButton.text("Hide description");
			showButton.addClass('hideDescription');
			showButton.removeClass('showDescription');
			initHideDescription();
		})
	}
	initShowDescription();

	function initHideDescription() {
		$('.hideDescription').off('click');
		$('.hideDescription').on('click', function() {
			let hideButton = $(this);

			let component = hideButton.closest('.archivedComp');
			let descriptionBox = component.find('.componentDescription');
			descriptionBox.addClass('hidden');


			hideButton.text("Show description");
			hideButton.addClass('showDescription');
			hideButton.removeClass('hideDescription');
			initShowDescription();
		})
	}
	initHideDescription();

	function initUnarchiveComponent() {
		$('.unarchiveComp').off('click');
		$('.unarchiveComp').on('click', function() {
			let archivedComp = $(this).closest('.archivedComp');
			let templateComponentId = archivedComp.attr("data-templateComponentId");
			let templateId = $('.Template').attr('id');

			let componentChooser = $('.emptyModal');
			componentChooser.hide();

			$.ajax({
				data: {
					templateId: templateId,
					templateComponentId: templateComponentId,
				},
				type: 'POST',
				url: '/dashboard/unarchiveComponent',
				success: function(data) {

					let tempComp = data.templateComponent;

					console.log("Successfully added archived component.", data);
					let component = $("<li>", {"class": "Component ui-sortable-handle"});
					component.attr("id", templateComponentId);
					let type = $("<span>", {"class": "componentType"});
					type.text("" + tempComp.componentType);
					component.append(type);

					let compTitle = $("<input>", {"class": "componentTitle"});
					if (tempComp.componentTitle) {
						compTitle.attr("value", tempComp.componentTitle);
					}
					compTitle.attr("placeholder", "Component title");

					let descriptionBox = $("<textarea>", {"class": "componentDescription", "placeholder": "Describe the purpose of this component."});

					if (tempComp.componentDescription && tempComp.componentDescription.length) {
						descriptionBox.text(tempComp.componentDescription)
					}

					let dropDown = $("<div>", {"class": "drop-down2"});
					let dotsContainer = $("<div>", {"class": "dropDown drop-down__button2 unsortable"});
					let dots = $("<span>", {"class": "component-more"});
					dots.text('...');
					let dropdownContainer = $("<div>", {"class": "drop-down__menu-box2 unsortable"});
					let dropdownList = $("<ul>", {"class": "drop-down__menu2"});
					let removeDescription = $("<li>", {"class": "drop-down__item2 RemoveDescription"});
					removeDescription.text("Remove description");
					let addDescription = $("<li>", {"class": "drop-down__item2 AddDescription"});
					addDescription.text('Add description');
					let markRequired = $("<li>", {"class": "drop-down__item2 MarkRequired"});
					if (data.templateComponent.requiredState == true) {
						// if has been turned into required
						let requiredBtn = $("<div>", {"class": "IsRequired"});
						requiredBtn.text('Required');
						component.append(requiredBtn);
						markRequired.text("Unmark as required");
					} else {
						markRequired.text('Mark as required');
					}
					let archiveComponent = $("<li>", {"class": "drop-down__item2 ArchiveComponent"});
					archiveComponent.text('Archive component');

					if (tempComp.componentDescription && tempComp.componentDescription.length) {
						dropdownList.append(removeDescription);
					} else {
						dropdownList.append(addDescription);
					}
					dropdownList.append(markRequired);
					dropdownList.append(archiveComponent);
					dropdownContainer.append(dropdownList);
					dotsContainer.append(dots);
					dropDown.append(dotsContainer);
					dropDown.append(dropdownContainer);

					component.append(compTitle);
					if (tempComp.componentDescription && tempComp.componentDescription.length) {
						component.append(descriptionBox);
					}
					component.append(dropDown);

					if ($(".TestHandle").length) {
						$(".TestHandle").remove();
					}
					$('.sortable').append(component);
					initComponentTitleListening();
				    initComponentArchive();
				    initMarkAsRequired();
					initDropDown();
					initComponentTitleListening();
					initRemoveDescription();
					initAddDescription();
					$('.archiveContainer').empty();
					updateComponentOrderInDB();

				},
				error: function(err) {
					console.log("Couldn't add archived component: ", err);
				}
			})
		})
	}
	initUnarchiveComponent();

	function initMarkAsRequired() {
		// check for this later when editing, so that stuff without it can't be published
		$('.MarkRequired').off('click');
		$('.MarkRequired').on('click', function() {
			let templateId = $('.Template').attr('id');
			let component = $(this).closest('.Component');
			// because this function works both on template pages and existing entry template pages, it is necessary to keep these attributes consistent, where templateComponentId is preferably the id, and entryComponent id is always a 'data-' attribute;
			let templateComponentId = component.attr('id');
			let requiredState;

			let thisObj = $(this);

			let requiredMark = component.find('.IsRequired');

			// check if dealing with editing template for an existing entry
			let editingEntryTemplate = false;
			let entry = $('.entryId');
			let entryId = "N/A";

			if (entry.length) {
				entryId = entry.attr('data-entryId');

				if (entryId && entryId.length && entryId !== "N/A") {
					editingEntryTemplate = true;
				}
			}

			// Note from mistake: It is not safe to make marking this required or vice versa based on the existence of the button, for the button's existence on the website can be altered. Best to check the database.
			$.ajax({
				data: {
					templateComponentId,
					templateId
				},
				type: 'POST',
				url: '/dashboard/checkIfRequired',
				success: function(data) {
					console.log("Successfully checked required state: ", data);
					let state = data.component.requiredState;
					if (state == true) {
						// is required, turn to unrequired
						requiredState = false;
					} else {
						// is not required, turn to required
						requiredState = true;
					}


					if (entryId && entryId.length && entryId !== "N/A") {
						// editing en existing entry's template 
						$.ajax({
							data: {
								templateId: templateId,
								templateComponentId: templateComponentId,
								requiredState: requiredState,
								entryId: entryId
							},
							type: 'POST',
							url: '/dashboard/markComponentRequired',
							success: function(data) {
								console.log("Successfully marked required.");
								if (requiredState == true) {
									// if has been turned into required
									let requiredBtn = $("<div>", {"class": "IsRequired"});
									requiredBtn.text('Required');
									let drop = component.find('.drop-down2');
									drop.before(requiredBtn);
									thisObj.text("Unmark as required");
								} else {
									requiredMark.remove();
									thisObj.text("Mark as required");
								}
							},
							error: function(err) {
								console.log("Failed to mark required: ", err);
							}
						})
					} else {
						$.ajax({
							data: {
								templateId: templateId,
								templateComponentId: templateComponentId,
								requiredState: requiredState
							},
							type: 'POST',
							url: '/dashboard/markComponentRequired',
							success: function(data) {
								console.log("Successfully marked required.");
								if (requiredState == true) {
									let requiredBtn = $("<div>", {"class": "IsRequired"});
									requiredBtn.text('Required');
									let drop = component.find('.drop-down2');
									drop.before(requiredBtn);
									thisObj.text("Unmark as required");
								} else {
									requiredMark.remove();
									thisObj.text("Mark as required");
								}
							},
							error: function(err) {
								console.log("Failed to mark required: ", err);
							}
						})
					}
				},
				error: function(err) {
					console.log("Failed to check required state");
				}
			})
		})
	}
	initMarkAsRequired();

	function initPermaDeleteComponent() {

		let deleteBtn;

		$('.deleteArchivedComp').off('click');
		$('.deleteArchivedComp').on('click', function() {
			deleteConfirmationModal.show();
			deleteBtn = $(this);
		})

		$('.cancelComponentDelete').off('click');
		$('.cancelComponentDelete').on('click', function() {
			deleteConfirmationModal.hide();
		})

		$('.confirmBackground').off('click');
		$('.confirmBackground').on('click', function() {
			deleteConfirmationModal.hide();
		})

		// Press esc key to hide
		$(document).keydown(function(event) { 
		  if (event.keyCode == 27) { 
		  	if (deleteConfirmationModal.length) {
		  		let modalState = deleteConfirmationModal.css('display');
			  	if (modalState == "block") {
			  		deleteConfirmationModal.hide();
			  	}
		  	}
		  }
		});

		$('.confirmComponentDelete').off('click');
		$('.confirmComponentDelete').on('click', function() {

			let component = deleteBtn.closest('.archivedComp');
			let templateComponentId = component.attr('data-templateComponentId');
			let templateId = $('.Template').attr('id');
			let categoryArea = deleteBtn.closest('.componentsByCategory');

			$.ajax({
				data: {
					templateComponentId: templateComponentId,
					templateId: templateId
				},
				type: 'DELETE',
				url: '/dashboard/permaDeleteComponent',
				success: function(data) {
					console.log("Successfully deleted archived component with all related content.")
					deleteConfirmationModal.hide();
					component.remove();
					if (!categoryArea.has('.archivedComp').length) {
						categoryArea.remove();
					}
					if (!$('.archiveContainer').has('.archivedComp').length) {
						if ($('.emptyArchives').length) {
							return console.log("Empty archives notice already exists.");
						}
						let emptyArchives = $("<div>", {"class": "emptyArchives"});
						emptyArchives.text("This template doesn't have any archived components.");
						$('.wrapperWidth').append(emptyArchives);
					}
				},
				error: function(err) {
					console.log("Failed to delete archived component.");
				}
			})
		});
	}
	initPermaDeleteComponent();

	function initAddDescription() {
		$('.AddDescription').off('click');
		$('.AddDescription').on('click', function() {

			let component = $(this).closest('.Component');
			let cTitle = component.find('.componentTitle');

			let descriptionBox = $("<textarea>", {"class": "componentDescription", "placeholder": "Describe the purpose of this component."});

			cTitle.after(descriptionBox);
			initComponentDescriptionListening();

			$(this).removeClass('AddDescription');
			$(this).addClass('RemoveDescription');
			$(this).text("Remove description");
			initRemoveDescription();
		})
	}
	initAddDescription();

	function initRemoveDescription() {
		$('.RemoveDescription').off('click');
		$('.RemoveDescription').on('click', function() {

			let removeButton = $(this);

			let component = removeButton.closest('.Component');
			let templateId = $('.Template').attr('id');
			let templateComponentId = component.attr('id');

			let cDescription = component.find('.componentDescription');

			$.ajax({
			  data: {
			    templateComponentId: templateComponentId,
			    templateId: templateId
			  },
			  type: 'POST',
			  url: '/dashboard/removeTemplateComponentDescription',
			  success: function(Item){
			    console.log("Component description successfully removed.")
			    // Display success message?
				cDescription.remove();
				removeButton.removeClass('RemoveDescription');
				removeButton.addClass('AddDescription');
				removeButton.text("Add description");
				initAddDescription();
			  },
			  error: function(err){
			    console.log("Component description remove failed: ", err);
			    // Display error message?
			  }
			});
		})
	}
	initRemoveDescription();

	function initComponentDescriptionListening() {
		$('.componentDescription').off('input');
		$('.componentDescription').on('input', function() {
			let componentDescription = $(this).val();
			let component = $(this).closest('.Component');
			let templateComponentId = component.attr('id');
			let templateId = $('.Template').attr('id');

			$.ajax({
			  data: {
			    componentDescription: componentDescription,
			    templateComponentId: templateComponentId,
			    templateId: templateId
			  },
			  type: 'POST',
			  url: '/dashboard/UpdateTemplateComponentDescription',
			  success: function(Item){
			    console.log("Component description successfully updated.")
			    // Display success message?
			  },
			  error: function(err){
			    console.log("Component description update failed: ", err);
			    // Display error message?
			  }
			});

		});
	}
	initComponentDescriptionListening();

	function initComponentTitleListening() {
		$('.componentTitle').unbind('input change');
		$('.componentTitle').bind('input change', function() {

			let componentTitle = $(this).val();
			let component = $(this).closest('.Component');
			let templateComponentId = component.attr('id');
			let templateId = $('.Template').attr('id');

			$.ajax({
			  data: {
			    componentTitle: componentTitle,
			    templateComponentId: templateComponentId,
			    templateId: templateId
			  },
			  type: 'POST',
			  url: '/dashboard/UpdateTemplateComponentTitle',
			  success: function(Item){
			    console.log("Component title successfully updated.")
			    // Display success message?
			  },
			  error: function(err){
			    console.log("Component title update failed: ", err);
			    // Display error message?
			  }
			});

		});
	}
	initComponentTitleListening();




});