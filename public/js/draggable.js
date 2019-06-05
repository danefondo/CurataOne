$(document).ready(function () {	

	function initDraggable() {
		$( ".draggable" ).draggable({
			connectToSortable: ".sortable",
			helper: "clone",
			revert: "invalid"
		});
	}
	initDraggable();

});