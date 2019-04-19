 $(document).ready(function () {

	// function initDropDown() {
	// 	// reapply upon creating new component
	// 	$('#create-button').off('click');
	// 	$('#create-button').on('click', function(){
	// 	    $('#create').toggleClass('drop-down--active');
	// 	});
	// }
	// initDropDown();

	let editorCount = 0;
	let editors = {};
	let creatingListItem = false;

	$(".DropdownX").on("click", function(){
	  $(this).toggleClass('is-expanded');
	});


	function initQuestionBlocks() {
		$('.collapsible').off('click');
		$('.collapsible').each(function(index, obj) {
			$(this).on('click', function() {
				$(this).toggleClass('active');
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

	$('.addNewListItemButton').on('click', function() {

		if (creatingListItem == true) {
			return console.log("Last list item was still being created, try again.")
		} else {

			// set flag
			creatingListItem = true;

			// declare html blocks to insert
			let listItem = $("<li>", {"class": "listItem", "id": "tempItemId"});
			let listInput = $("<input>", {"class": "listItemInput"});

			listItem.append(listInput);

			// append to unordered list
			let listItems = $(this).closest('.Component').find('.listItems');
			listItems.append(listItem);


			let componentId = $(this).closest('.Component').attr('id');
			let entryId = $('.TemplateHolder').attr('id');

			let componentOrder = $(this).closest('.Component').index();
			let itemOrder = $('#tempItemId').index();
			console.log("itemOrder: ", itemOrder);

			// create new list item in database
			$.ajax({
			  data: {
			    entryId: entryId,
			    componentId: componentId,
			    itemOrder: itemOrder
			  },
			  type: 'POST',
			  url: '/curatas/CreateNewListItem',
			  success: function(response){
			    console.log("Component item successfully created: ", response);
			    // Display success message?

			    let listItemId = response._id;
			    $('#tempItemId').attr('id', listItemId);
			    creatingListItem = false;

				// add list item id to list item  -- Item.
				// init sortable for list items
					// upon change push change to database
				// init listening to each list item
					// upon change push change to database

			  },
			  error: function(err){
			    console.log("Component item creation failed: ", err);
			    creatingListItem = false;
			    // Display error message?
			  }
			});
		}
	})

	$('.addNewButton').on('click', function() {

		let questionBlock = $("<div>", {"class": "questionBlock"});
		let question = $("<input>", {"class": "ElementTitle", "placeholder": "Question", "data-type": "question"});
		let questionBtn = $('<button>', {'class': 'collapsible unsortable'})

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


		simpleEditor.append(editorText);
		simpleEditor.append(editorTools);

		editorBlock.append(simpleEditor);
		contentBlock.append(editorBlock);

		questionBlock.append(question);
		questionBlock.append(questionBtn);
		questionBlock.append(contentBlock);

		let questions = $(this).closest('.Component').find('.questions');
		questions.append(questionBlock);
		initQuestionBlocks();
		findAndInitSimpleEditors();
		initTitleListening();
		initComponentTitleExit();
	})


	function initializeEditor(editorID, toolbarID) {
	    DecoupledEditor
	        .create( document.querySelector( editorID ), {
	        removePlugins: [ 'FontSize', 'MediaEmbed', 'insertTable', 'Heading', 'alignment', 'Undo', 'Redo', 'FontFamily' ],
	        toolbar: ['bold', 'italic', 'highlight', '|' ,'bulletedList', 'numberedList', 'Link', 'blockQuote' ]
	    }  )
	        .then( editor => {
	            const toolbarContainer = document.querySelector( toolbarID );

	            toolbarContainer.appendChild( editor.ui.view.toolbar.element );

	            // Editor initialization
	            // myEditor = editor;
	            editors[editorID] = editor;

				editor.model.document.on( 'change:data', function() {
				    console.log( 'The data has changed!' );
				} );

	        } )
	        .catch( error => {
	            console.error( error );
	        } );
	}

	function initializeSimpleEditor(editorID, toolbarID) {
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

				editor.model.document.on( 'change:data', function() {
				    console.log( 'The data has changed!' );
				    // editor.getData() --> send to server & update component
				} );

	        } )
	        .catch( error => {
	            console.error( error );
	        } );
	}

	function findAndInitEditors() {
		$('.editor').each(function(index, obj) {

			let editorID = $(this).find('.editorText').attr('id');
			let toolbarID = $(this).find('.editorTools').attr('id');

			editorID = '#' + editorID;
			toolbarID = '#' + toolbarID;

			console.log("regular editorID: ",  editorID);
			console.log("regular toolbarID: ", toolbarID);
			initializeEditor(editorID, toolbarID);
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
				editorID = '#' + editorID;
				toolbarID = '#' + toolbarID;
				$(this).find('.editorTools').hide();
				console.log("editorID: ",  editorID);
				console.log("toolbarID: ", toolbarID);
				initializeSimpleEditor(editorID, toolbarID);

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

	// upon adding new question
		// create new subdocument in entry for 'question' with title and content and questionOrderPosition

	// listen to change for editors and inputs
		// if editor && is_not_inside_questions
			// find closest component
				// ajax update entry value
		// if editor && is_inside_questions
			// get question order position (index)
				// find closest component
					// ajax update entry value (specific subdoc for question with that index value)

	// create new entry

	// choose what info is displayed in lists (configure the meta-data)
		// choose to make each item only direct elsewhere (e.g. like an affiliate product listing)

	function initTitleListening() {
		$('.ElementTitle').unbind('input change');
		$('.ElementTitle').bind('input change', function() {

			let ComponentId = $(this).closest('.Component').attr('id');
			let ComponentTitle = $(this).val();
			let EntryId = $('.TemplateHolder').attr('id');
			console.log("component id: ", ComponentId);
			console.log("title: ", ComponentTitle);

			let dataType = $(this).attr('data-type');
			if (dataType == 'question') {
				console.log("This is a question.");
			} else {
				console.log("This is not a question.");

				$.ajax({
				  data: {
				    ComponentId: ComponentId,
				    ComponentTitle: ComponentTitle,
				    EntryId: EntryId
				  },
				  type: 'POST',
				  url: '/curatas/UpdateComponentTitle',
				  success: function(Item){
				    console.log("Component title successfully updated.")
				    // Display success message?

				  },
				  error: function(err){
				    console.log("Component title update failed: ", err);
				    // Display error message?
				  }
				});
			}

		});
	}
	initTitleListening();

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
