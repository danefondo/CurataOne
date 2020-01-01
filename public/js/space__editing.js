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

	function initNewCategoryCreation() {
		$('.entryNewCategory__space').on('click', function() {
			$(this).closest('.entryDetailsGroup').removeClass('flex');
			$('.dropdown').css("float", "none");
			$('.entryNewCategory__space').css("display", "none");
			$('.entryCreateCategoryBlock__space').css("display", "block");
			initCancelCategoryCreation();
			initCreateNewCategory();
		})
	}
	initNewCategoryCreation();

	function initCancelCategoryCreation() {
		$('.entryNewCategoryCancel__space').off('click');
		$('.entryNewCategoryCancel__space').on('click', function() {
			$(this).closest('.entryDetailsGroup').addClass('flex');
			$('.dropdown').css("float", "left");
			$('.entryNewCategory__space').css("display", "inline-block");
			$('.entryCreateCategoryBlock__space').css("display", "none");
			$('.entryNewCategoryText__space').val('');
		});
	}

	function initCreateNewCategory() {
		$('.entryNewCategoryCreate__space').off('click');
		$('.entryNewCategoryCreate__space').on('click', function() {
			let category = $('.entryNewCategoryText__space').val();
			category = category[0].toUpperCase() + category.slice(1);

			// ajax create category
			// clear and hide category creation
			// set newly created category as default

			$('<div>', {'class': 'curataEntryImage'})
			let listOption = $('<li>', {'class': 'option' ,'data-value': '12345'})
			listOption.text(category);

			let categoryList = $('.dropdown').find('ul');
			categoryList.append(listOption);

		})
	}

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
		$('.modalBackground').off('click');
		$('.modalBackground').on('click', function() {
			creationModal.hide();
		})

		// Press esc key to hide
		$(document).keydown(function(event) { 
		  if (event.keyCode == 27) { 
		  	if (creationModal.length) {
		  		let modalState = creationModal.css('display');
			  	if (modalState == "block") {
			  		creationModal.hide();
			  	}
		  	}
		  }
		});

	}
	initAddNewList();

	function checkIfEntryExists() {
		let entryId = $('.modalEntryId').attr('id');
		if (typeof entryId == typeof undefined || entryId == false) {
			return false;
		} else if (typeof entryId !== typeof undefined && entryId !== false) {
			return true;
		}
	}

	function initCreateEntry() {
		$('.createEntry__space').off('click');
		$('.createEntry__space').on('click', function() {

			let entryButton = $(this);
			let entryCreator = entryButton.closest('.createEntryModal__space');

			let entryCheck = checkIfEntryExists();
			if (entryCheck) {
				let listId = entryCreator.find('.current').attr('listid');
				let entryId = $('.modalEntryId').attr('id');
				$.ajax({
					type: 'POST',
					url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/' + entryId + '/publish',
					success: function(response) {
						console.log("Yoho! Successfully created new entry!");
						// window.location.href = response.redirectTo;
						let newEntry = $('<div>', {'class': 'entry__liveCurata', 'id': entryId});
						let entryTitleBlock = $('<a>', {'class': 'entryTitle__liveCurata'})
						entryTitleBlock.text(response.entry.entryTitle);
						let entryImageBlock = $('<div>', {'class': 'curataEntryImage'})
						entryImageBlock.attr("data-image-key", response.entry.entryImageKey);
						entryImageBlock.attr("data-image-url", response.entry.entryImageURL);
						entryImageBlock.css("background-image", "url(" + response.entry.entryImageURL + ")");
						newEntry.append(entryTitleBlock);
						newEntry.append(entryImageBlock);
						$('.lists__liveCurata').find('#' + listId).append(newEntry);
						deletionModal.hide();
						$('.createEntryModal__space').find('input, textarea').val('');
						$('.modalEntryId').removeAttr('id');
					},
					error: function(err) {
						console.log("Arrghh! Failed to publish entry!");
					}
				})				
			} else {
				// if entry already exists but is draft, just send call to publish and then return to add dynamically
				let data = {}
				let creationTime = new Date();

				let entryCategory = entryCreator.find('.current').text();
				let listId = entryCreator.find('.current').attr('listid');
				let entryTitle = entryCreator.find('.EntryTitle').val();
				let entryDescription = entryCreator.find('.postDescription').val();
				let entryLink = entryCreator.find('.entryLink').val();

				let imageBlock = entryCreator.find('.imageBlock');
				let imageKey = imageBlock.attr('data-image-key');
				let imageURL = imageBlock.attr('data-image-url');

				data.entryCategory = entryCategory;
				data.entryTitle = entryTitle;
				data.entryDescription = entryDescription;
				data.entryLink = entryLink;
				data.imageKey = imageKey;
				data.imageURL = imageURL;
				data.creationTime = creationTime;
				data.curataId = curataId;

				data.listId = listId;


				$.ajax({
					data: data,
					type: 'POST',
					url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/newEntry',
					success: function(response) {
						console.log("Yoho! Successfully created new entry!");
						// window.location.href = response.redirectTo;
						let newEntry = $('<div>', {'class': 'entry__liveCurata', 'id': entryId});
						let entryTitleBlock = $('<a>', {'class': 'entryTitle__liveCurata'})
						entryTitleBlock.text(response.entry.entryTitle);
						let entryImageBlock = $('<div>', {'class': 'curataEntryImage'})
						entryImageBlock.attr("data-image-key", response.entry.entryImageKey);
						entryImageBlock.attr("data-image-url", response.entry.entryImageURL);
						entryImageBlock.css("background-image", "url(" + response.entry.entryImageURL + ")");
						newEntry.append(entryTitleBlock);
						newEntry.append(entryImageBlock);
						$('.lists__liveCurata').find('#' + listId).append(newEntry);
						deletionModal.hide();
						$('.createEntryModal__space').find('input, textarea').val('');
						$('.modalEntryId').removeAttr('id');
						// find appropriate list by id
						// create divs w/content
						// append div to list
					},
					error: function(err) {
						console.log("Arrghh! Failed to create entry!");
					}
				})
			}
		})
	}
	initCreateEntry();


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

			const imageBlock = $(this).closest('.imageBlock');
			const dateUpdated = new Date();

			let uploadData = {};
			uploadData.imageBlock = imageBlock;
			uploadData.dateUpdated = dateUpdated;

			if (file === null) {
				$('.createEntry__space').text("Create entry");
				$('.createEntry__space').css("background-color", "#673ab7");
				return alert('No file selected.');
			}

			getSignedRequest(file, uploadData);

		});
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
			// fix this shit
		})
	}

	function disableImageDelete() {
		$('.remove-image').off('click');
	}

	function launchUploadingIcon() {

	}

	function readURL(input) {
	  if (input.files && input.files[0]) {

	    var reader = new FileReader();

	    reader.onload = function(e) {
	      $('.image-upload-wrap').hide();

	      $('.file-upload-image').attr('src', e.target.result);
	      $('.file-upload-content').show();

	      $('.image-title').html(input.files[0].name);
	    };

	    reader.readAsDataURL(input.files[0]);
	    return 

	  } else {
	    removeUpload(input);
	  }
	}

	function removeUpload(obj) {

		let entryId = $('.modalEntryId').attr('id');
		if (typeof entryId == typeof undefined || entryId == false) {
			return alert("Entry does not exist yet or entry id is not available.");
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
				$('.file-upload-input').replaceWith($('.file-upload-input').clone());
				$('.file-upload-content').hide();
				$('.image-upload-wrap').show();
    			enableImageUpload();
				$('.createEntry__space').text("Create entry");
				$('.createEntry__space').css("background-color", "#673ab7");
    		},
    		error: function(err) {
    			console.log("Failed to delete image from database: ", err);
    			enableImageUpload();
				$('.createEntry__space').text("Create entry");
				$('.createEntry__space').css("background-color", "#673ab7");
    			// Display error not being able to delete note
    		}
    	});
	}

	function saveFileReference(uploadData) {

		let entryId = $('.modalEntryId').attr('id');

		if (typeof entryId !== typeof undefined && entryId !== false) {
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
					let imageKey = uploadData.fileName;
					let imageURL = uploadData.fileURL;
					imageBlock.attr('data-image-key', imageKey);
					imageBlock.attr('data-image-url', imageURL);
				},
				error: function(err) {
					console.log("Could not save file reference.", err);
					$('.createEntry__space').text("Create entry");
					$('.createEntry__space').css("background-color", "#673ab7");
				}
			})
		} else {
			// create entry, setup entryId, then save reference
			let data = {}
			let entryCreator = $('.createEntryModal__space');
			let creationTime = new Date();

			let entryCategory = entryCreator.find('.current').text();
			let listId = entryCreator.find('.current').attr('listid');
			let entryTitle = entryCreator.find('.EntryTitle').val();
			let entryDescription = entryCreator.find('.postDescription').val();
			let entryLink = entryCreator.find('.entryLink').val();
			let imageKey = uploadData.fileName;
			let imageURL = uploadData.fileURL;

			data.entryCategory = entryCategory;
			data.entryTitle = entryTitle;
			data.entryDescription = entryDescription;
			data.entryLink = entryLink;
			data.imageKey = imageKey;
			data.imageURL = imageURL;
			data.creationTime = creationTime;
			data.curataId = curataId;

			data.listId = listId;


			$.ajax({
				data: data,
				type: 'POST',
				url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/newDraft',
				success: function(response) {
					console.log("Yoho! Successfully created draft!");
					$('.modalEntryId').attr('id', response.entryId);
					entryId = response.entryId;

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
							console.log("Successfully uploaded image.");
							$('.createEntry__space').text("Create entry");
							$('.createEntry__space').css("background-color", "#673ab7");
							let imageKey = uploadData.fileName;
							let imageURL = uploadData.fileURL;
							imageBlock.attr('data-image-key', imageKey);
							imageBlock.attr('data-image-url', imageURL);
						},
						error: function(err) {
							console.log("Could not save file reference.", err);
							$('.createEntry__space').text("Create entry");
							$('.createEntry__space').css("background-color", "#673ab7");
						}
					})
				},
				error: function(err) {
					console.log("Arrghh! Failed to create draft!");
					$('.createEntry__space').text("Create entry");
					$('.createEntry__space').css("background-color", "#673ab7");
				}
			})

		}
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
				console.log("Could not upload file", err);
				$('.createEntry__space').text("Create entry");
				$('.createEntry__space').css("background-color", "#673ab7");
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
				console.log("Could not get signed URL.", err);
				$('.createEntry__space').text("Create entry");
				$('.createEntry__space').css("background-color", "#673ab7");
			}
		})
	}


 });