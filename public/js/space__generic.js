$(document).ready(function () { 

    const coreURL = 'dashboard';

	function initCurataDropdown() {
		// reapply upon creating new component
		$('.currentCurataSwitch').off('click');
		$('.currentCurataSwitch').on('click', function(){
		    $('.curataSwitcher').toggleClass('drop-down--active');
		});
	}
    initCurataDropdown();
    
	function initMakeDefaultCurata() {
		$('.makeDefault').off('click');
		$('.makeDefault').on('click', function() {
			let btn = this
			let curataId = $('.currentCurataSwitch').attr('id');

	    	$.ajax({
	    		data: {
	    			curataId: curataId
	    		},
	    		type:'POST',
	    		url: '/' + coreURL + '/makeDefaultCurata',
	    		success: function(response) {
	    			$(btn).removeClass('makeDefault').addClass('defaultCurata');
	    			$(btn).text('Default Curata');
	    			$('.dashboardBtn').attr('href', '/' + coreURL + '/curatas/' + curataId);
	    		},
	    		error: function(err) {
	    			console.log("Failed to make Curata default: ", err);
	    			// Display error not being able to publish
	    		}
	    	});
		})
	}
	initMakeDefaultCurata();

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

	function hideShowListsWithCurrentStateEntries(newState) {
		// hide all lists
		// for each list, find entries and their state
			// if list has any correct match entries, show

		let allLists = $('.listContainer__liveCurata');
		allLists.hide();
		allLists.each(function(i, obj) {
			let listContainer = $(obj);
			let list = listContainer.children('.list__liveCurata');

			// if list has element with newState attr equivalent, show / remove hidden
			if (list.children('div[data-entrystate=' + newState + ']').length > 0) {
				listContainer.removeClass('hidden');
				listContainer.show();
			}
		});
	}

	function hideShowEntriesByCurrentState(newState) {
		let allEntries = $('.entry__liveCurata');
		allEntries.hide();
		allEntries.each(function(i, obj) {
			let entry = $(obj);
			let entryAttr = entry.attr('data-entryState');
			console.log("attttr", entryAttr);
			if (entryAttr == newState) {
				entry.removeClass('hidden');
				entry.show();
			}
		})
	}

	function initEntryStateChange() {
		$('.entryStateSelector').off('click');
		$('.entryStateSelector').on('click', function() {
			$('.entryStateSelector').removeClass('currentState');
			let clickObject = $(this);
			clickObject.addClass('currentState');

			let newState = clickObject.attr('data-stateType');

			hideShowListsWithCurrentStateEntries(newState);

			hideShowEntriesByCurrentState(newState);

		})
	}
	initEntryStateChange();


 });