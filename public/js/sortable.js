$(document).ready(function () {	

// setting flag
let receiveInProgress = false;

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
		url: '/curatas/updateComponentPosition',
		success: function(response) {
			console.log("Successfully updated positions.");
		},
		error: function(err) {
			console.log("Failed to update positions: ", err);
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
				let deleteBtn = $("<div>", {"class": "deleteComponent"});
				deleteBtn.text("Delete");
				$(newItem).append(placeholderBtn);
				$(newItem).append(requiredBtn);
				$(newItem).append(deleteBtn);
			}


			let componentOrder = newItem.index();

			let TemplateId = $('.Template').attr('id');

			$.ajax({
				data: {
					componentOrder: componentOrder,
					componentType: componentType,
					// componentTitle: componentTitle,
					// placeholder: placeholder,
					TemplateId:  TemplateId
				},
				type: 'POST',
				url: '/curatas/CreateTemplateWithComponents',
				success: function(response) {
					console.log("Successfully created template: ", response.template);
					if (response.component._id) {
						$(newItem).attr('id', response.component._id);
						updateComponentOrderInDB();
						receiveInProgress = false;
						// give item an id (such as for deleting later)
						// if no id, don't let delete
					} else {
						console.log("Component ID missing.");
					}
				},
				error: function(err) {
					console.log("Failed to create template: ", err);
				}
			})

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

$( ".draggable" ).draggable({
	connectToSortable: ".sortable",
	helper: "clone",
	revert: "invalid"
});

});