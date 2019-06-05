$(document).ready(function () {	

// setting flag
let receiveInProgress = false;
let tempBeingCreated = false;

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


	let TemplateId = $('.Template').attr('id');

	$.ajax({
		data: {
			indexArray: JSON.stringify(indexArray),
			TemplateId: TemplateId
		},
		type: 'POST',
		url: '/curatas/UpdateComponentPosition',
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


			$(".TestHandle").remove();
			$(newItem).removeAttr("class style");

			let customStyle = originalItem.attr('data-css');
			$(newItem).attr("class", "Component componentStyling " + customStyle);

			if (componentType !== "section-break") {
				let placeholderBtn = $("<div>", {"class": "addPlaceholder"});
				placeholderBtn.text("+ Placeholder");
				let requiredBtn = $("<div>", {"class": "checkRequired"});
				requiredBtn.text("Required?");
				$(newItem).append(placeholderBtn);
				$(newItem).append(requiredBtn);
			}

			let deleteBtn = $("<div>", {"class": "deleteComponent"});
			deleteBtn.text("Delete");
			$(newItem).append(deleteBtn);

			let componentOrder = newItem.index();

			let TemplateId = $('.Template').attr('id');
			if (!TemplateId) {
				console.log("Template does not exist yet or has not yet finished being created. Will auto-update later.");

				let curataId = $('.curataId').attr('data-curataId');

				if (!curataId) {
					return console.log("Curata id not loaded.");
				}

				if (tempBeingCreated == true) {
					// Template is being created.
					console.log("Template still being created. Will auto-update once done.");
				} else {
					// Template does not exist and is not being created.
					// Create template and component
					tempBeingCreated = true;
					$.ajax({
					  data: {
					    componentOrder: componentOrder,
					    componentType: componentType,
					    curataId: curataId
					  },
					  type: 'POST',
					  url: '/curatas/createNewTemplateWithComponent',
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
				$.ajax({
					data: {
						componentOrder: componentOrder,
						componentType: componentType,
						// componentTitle: componentTitle,
						// placeholder: placeholder,
						TemplateId:  TemplateId
					},
					type: 'POST',
					url: '/curatas/updateTemplateComponent',
					success: function(response) {
						console.log("Successfully updated template: ", response.template);
						if (response.component._id) {
							$(newItem).attr('id', response.component._id);
							updateComponentOrderInDB();
						} else {
							console.log("Component ID missing.");
							receiveInProgress = false;
						}
					},
					error: function(err) {
						console.log("Failed to update template: ", err);
						receiveInProgress = false;
					}
				})
			}

			// send ajax post for Template
				// for each component in list
					// get componentOrder
					// get componentType
						// this create id for each component after
			// this should be done at 'create template'
				// after get template, take to creating entry

			// per component save, animate 'saved' notification in green and then fade away

		// most things, snackk, crowd, curata, etc. can be taken to great levels with just a few hours of intense focus with a timer and only focusing on something specific

		// humans forget a lot of stuff and don't have it in their awareness; as such, it is necessary to have some reminders of variables I might forget about life; 

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



});