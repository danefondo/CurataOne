 $(document).ready(function () {

 	let savingInProgress = false;
 	let enableDisableInProgress = false;

 	// let userId = $('.userId').attr('id');
	// let username = $('.userId').attr('data-username');

	// let entryId = $('.TemplateHolder').attr('id');
	// let curataId = $('.curataId').attr('id');

	// let coreURL = 'dashboard';

	// function checkIfMainImageExists() {
	// 	let imageCheck = $('.imageBlock').attr('data-image-key');
	// 	if (typeof imageCheck !== typeof undefined && imageCheck !== false) {
	// 		$('.image-upload-wrap').hide();
	// 		$('.file-upload-content').show();
	// 		enableImageDelete();
	// 	} else {
	// 		enableImageUpload();
	// 	}
	// }
	// checkIfMainImageExists();

	// function enableImageUpload() {

	// 	$('.image-upload-wrap').off('dragover');
	// 	$('.image-upload-wrap').on('dragover', function () {
	// 		$('.image-upload-wrap').addClass('image-dropping');
	// 	});

	// 	$('.image-upload-wrap').off('dragleave');
	// 	$('.image-upload-wrap').on('dragleave', function () {
	// 		$('.image-upload-wrap').removeClass('image-dropping');
	// 	});

	// 	$('.file-upload-btn').off('click');
	// 	$('.file-upload-btn').on('click', function() {
	// 		$('.file-upload-input').trigger( 'click' );
	// 	})

	// 	$('.file-upload-input').off('change');
	// 	$('.file-upload-input').on('change', function() {

	// 		readURL(this);
	// 		// setup upload failed instead and set the image later and until then set uploading image

	// 		const files = $(this).files;
	// 		// const file = files[0];

	// 		let file = $(this).prop('files')[0];

	// 		const imageBlock = $(this).closest('.imageBlock');
	// 		const dateUpdated = new Date();

	// 		let uploadData = {};
	// 		uploadData.imageBlock = imageBlock;
	// 		uploadData.dateUpdated = dateUpdated;

	// 		if (file === null) {
	// 			return alert('No file selected.');
	// 		}

	// 		getSignedRequest(file, uploadData);

	// 	});
	// }

	// function disableImageUpload() {
	// 	$('.file-upload-btn').off('click');
	// 	$('.file-upload-input').off('change');
	// 	$('.image-upload-wrap').off('dragover');
	// 	$('.image-upload-wrap').off('dragleave');
	// }

	// function enableImageDelete() {
	// 	$('.remove-image').off('click');
	// 	$('.remove-image').on('click', function() {
	// 		let obj = this;
	// 		removeUpload(obj);
	// 		// fix this shit
	// 	})
	// }

	// function disableImageDelete() {
	// 	$('.remove-image').off('click');
	// }

	// function launchUploadingIcon() {

	// }

	// function readURL(input) {
	//   if (input.files && input.files[0]) {

	//     var reader = new FileReader();

	//     reader.onload = function(e) {
	//       $('.image-upload-wrap').hide();

	//       $('.file-upload-image').attr('src', e.target.result);
	//       $('.file-upload-content').show();

	//       $('.image-title').html(input.files[0].name);
	//     };

	//     reader.readAsDataURL(input.files[0]);
	//     return 

	//   } else {
	//     removeUpload(input);
	//   }
	// }

	// function removeUpload(obj) {

	// 	let image = $(obj).closest('.imageBlock')
	// 	let imageKey = image.attr('data-image-key');
	// 	let isMainImage = "true";
	// 	let dateUpdated = new Date();

    // 	$.ajax({
    // 		data: {
    // 			imageKey: imageKey,
    // 			entryId: entryId,
    // 			isMainImage: isMainImage,
    // 			dateUpdated: dateUpdated
    // 		},
    // 		type:'DELETE',
    // 		url: '/' + coreURL + '/DeleteImage',
    // 		success: function(response) {
    // 			console.log("Deleted image from database.");
    // 			image.removeAttr('data-image-key');
    // 			image.removeAttr('data-image-url');
	// 			$('.file-upload-input').replaceWith($('.file-upload-input').clone());
	// 			$('.file-upload-content').hide();
	// 			$('.image-upload-wrap').show();
    // 			enableImageUpload();
    // 		},
    // 		error: function(err) {
    // 			console.log("Failed to delete image from database: ", err);
    // 			enableImageUpload();
    // 			// Display error not being able to delete note
    // 		}
    // 	});
	// }

	// function saveFileReference(uploadData) {

	// 	uploadData.entryId = entryId;
	// 	uploadData.curataId = curataId;

	// 	let imageBlock = uploadData.imageBlock;
	// 	delete uploadData.imageBlock;

	// 	$.ajax({
	// 		url: '/' + coreURL + '/saveFileReference',
	// 		type: 'POST',
	// 		data: JSON.stringify(uploadData),
	// 		processData: false,
	// 		contentType: 'application/json',
	// 		success: function(data) {
	// 			let imageKey = uploadData.fileName;
	// 			let imageURL = uploadData.fileURL;
	// 			imageBlock.attr('data-image-key', imageKey);
	// 			imageBlock.attr('data-image-url', imageURL);
	// 		},
	// 		error: function(err) {
	// 			console.log("Could not save file reference.", err);
	// 		}
	// 	})
	// }

	// function uploadFile(file, signedRequest, url, uploadData) {

	// 	$.ajax({
	// 		url: signedRequest,
	// 		type: 'PUT',
	// 		processData: false,
	// 		contentType: false,
	// 		data: file,
	// 		success: function(data) {
	// 			saveFileReference(uploadData);
	// 		},
	// 		error: function(err) {
	// 			console.log("Could not upload file", err);
	// 		}
	// 	})
	// }

	// function getSignedRequest(file, uploadData) {
	// 	// const fileName = file.name + '-' + Date.now().toString();
	// 	// to not need to parse strings or remove spaces, etc:
	// 	const fileName = Date.now().toString();
	// 	const fileType = file.type;

	// 	$.ajax({
	// 		url: '/' + coreURL + `/sign-s3?file-name=${fileName}&file-type=${file.type}`,
	// 		type: 'GET',
	// 		data: {
	// 			fileName: fileName,
	// 			fileType: fileType
	// 		},
	// 		processData: false,
	// 		contentType: false,
	// 		success: function(data) {
	// 			const response = data.returnData;
	// 			const signedRequest = response.signedRequest;
	// 			const responseURL = response.url;
	// 			uploadData.fileName = data.fileName;
	// 			uploadData.fileURL = response.url;
	// 			uploadFile(file, signedRequest, responseURL, uploadData);
	// 		},
	// 		error: function(err) {
	// 			console.log("Could not get signed URL.", err);
	// 		}
	// 	})
	// }

	function initEntryLinkSave() {
		$('.entryLink').off('input change');
		$('.entryLink').on('input change', function() {

			let link = $(this).val();
			let container = $(this).closest('.linkContainer');
			let linkPreview = container.find('.entryLinkPreview');
			let parsedLink = (link.indexOf('://') === -1) ? 'http://' + link : link;
			let dateUpdated = new Date();

			let hiddenCheck = linkPreview.hasClass('hidden');
			if (hiddenCheck) {
				linkPreview.removeClass('hidden');
			}

			linkPreview.attr('href', parsedLink);
			// linkPreview.text(parsedLink);

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
			    // Display success message?

			  },
			  error: function(err){
			    console.log("Entry link update failed: ", err);
			    // Display error message?
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
	initEntryLinkExit();


	function initDescriptionListening(descElement, ajaxURL, ajaxType, group) {
		descElement.on('input selectionchange propertychange', function() {

			let content = $(this).val();
			let data = {};
			const dateUpdated = new Date();

			if (group == "entryDescription") {
				data.entryText = content;
				data.entryId = entryId;
				data.dateUpdated = dateUpdated;
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

	let entryDescription = $('.postDescription')
	let entryDescriptionURL = '/' + coreURL + '/UpdateEntryText'
	initDescriptionListening(entryDescription, entryDescriptionURL, 'POST', 'entryDescription')

	//   document.getElementById("file-input").onchange = () => {
	//     const files = document.getElementById('file-input').files;
	//     const file = files[0];
	//     if(file == null){
	//       return alert('No file selected.');
	//     }
	//     getSignedRequest(file);
	//   };

	// function getSignedRequest(file){
	//   const xhr = new XMLHttpRequest();
	//   xhr.open('GET', `http://localhost:3000/dashboard/sign-s3?file-name=${file.name}&file-type=${file.type}`);
	//   xhr.onreadystatechange = () => {
	//     if(xhr.readyState === 4){
	//       if(xhr.status === 200){
	//         const response = JSON.parse(xhr.responseText);
	//         uploadFile(file, response.signedRequest, response.url);
	//       }
	//       else{
	//         alert('Could not get signed URL.');
	//       }
	//     }
	//   };
	//   xhr.send();
	// }

	// function uploadFile(file, signedRequest, url){
	//   const xhr = new XMLHttpRequest();
	//   xhr.open('PUT', signedRequest);
	//   xhr.onreadystatechange = () => {
	//     if(xhr.readyState === 4){
	//       if(xhr.status === 200){
	//         document.getElementById('preview').src = url;
	//         document.getElementById('avatar-url').value = url;
	//       }
	//       else{
	//         alert('Could not upload file.');
	//       }
	//     }
	//   };
	//   xhr.send(file);
	// }

	// function updateEntryMainImage(entryId, imageKey, imageURL) {
	// 	$.ajax({
	// 		url: '/' + coreURL + '/UpdateEntryMainImage',
	// 		type:  'POST',
	// 		data: {
	// 			entryId: entryId,
	// 			ComponentURL: ComponentURL,
	// 			ComponentImageKey: ComponentImageKey
	// 		},
	// 		success: function(data) {
	// 			console.log('Success: ', data);
	// 			responseData = data;
	// 		},
	// 		error: function(err) {
	// 			console.log('Error ', err);
	// 		}
	// 	})
	// }

	// function addImageToFiles() {
	// 	let imageKey = responseData.entry.entryImageKey;
	// 	let imageURL = responseData.entry.entryImageURL;
	// 	console.log("TEST imageKey: ", imageKey);
	// 	console.log("TEST imageURL: ", imageURL);
	// 	$.ajax({
	// 		data: {
	// 			entryId: entryId,
	// 			imageKey: imageKey,
	// 			imageURL: imageURL
	// 		},
	// 		url: '/' + coreURL + '/AddImageToCurataFiles',
	// 		type: 'POST',
	// 		success: function(data) {
	// 			console.log('Successfully added image to Curata.');
	// 		},
	// 		error: function(err) {
	// 			console.log('Failed to add image to Curata: ', err)
	// 		}
	// 	})		
	// }

});

