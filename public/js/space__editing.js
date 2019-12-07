 $(document).ready(function () { 

 	let deletionModal = $('.emptyModal');
 	let userId = $('.userId').attr('id');
	let username = $('.userId').attr('data-username');
 	const coreURL = 'dashboard';

	let curataId = $('.curataId').attr('id');


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

		// $('.createNewTemplate').on('click', function() {

		// 	let curataId = $('.currentCurataSwitch').attr('id');
		// 	window.location.href = '/' + coreURL + '/' + username +'/curatas/' + curataId + '/templates/newTemplate';

		// 	// $.ajax({
		// 	// 	data: {
		// 	// 		curataId: curataId
		// 	// 	},
		// 	// 	type: 'POST',
		// 	// 	url: '/' + coreURL + '/' + username +'/curatas/' + curataId + '/templates/newTemplate',
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

	function initCreateEntry() {
		$('.addEntry__space, listChoicesContainer__space').off('click');
		$('.addEntry__space, listChoicesContainer__space').on('click', function() {
			let entryButton = $(this);
			let creationTime = new Date();
			let listId = entryButton.closest('.listChoicesContainer__space').attr('data-id');
			console.log("This is the list id: ", listId);
			$.ajax({
				data: {
					creationTime: creationTime,
					listId: listId,
					curataId: curataId
				},
				type: 'POST',
				url: '/' + coreURL + '/' + username +'/curatas/' + curataId + '/lists/' + listId + '/createNewEntry',
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
	initCreateEntry();


 });