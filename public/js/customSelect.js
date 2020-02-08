$(document).ready(function() {

  const coreURL = 'dashboard';
  let curataId = $('.curataId').attr('id');

  function create_custom_dropdowns() {
    let dropdown;
    $('select').each(function(i, select) {
      if (!$(this).next().hasClass('dropdown')) {
        $(this).after('<div class="dropdown ' + ($(this).attr('class') || '') + '" tabindex="0"><span class="currentCategorySelection"></span><div class="list"><ul class="optionList"></ul></div></div>');
        dropdown = $(this).next();
        var options = $(select).find('option');
        var selected = $(this).find('option:selected');
        dropdown.find('.currentCategorySelection').html(selected.data('display-text') || selected.text());
        options.each(function(j, o) {
          var display = $(o).data('display-text') || '';
          dropdown.find('ul').append('<li class="option ' + ($(o).is(':selected') ? 'selected' : '') + '" data-value="' + $(o).val() + '" data-display-text="' + display + '">' + $(o).text() + '</li>');
        });
      }
      dropdown = $(this).next();
      dropdown.find('.selected').addClass('doNotSortMe');
    });
  }
  create_custom_dropdowns();

  // Event listeners

  // Open/close

  function initDropdownOpenClose() {
    $(document).off('click', '.dropdown');
    $(document).on('click', '.dropdown', function(event) {
      $('.dropdown').not($(this)).removeClass('open');
      $(this).toggleClass('open');
      if ($(this).hasClass('open')) {
        $(this).find('.option').attr('tabindex', 0);
        $(this).find('.selected').focus();
      } else {
        $(this).find('.option').removeAttr('tabindex');
        $(this).focus();
      }
    });
  }
  initDropdownOpenClose();

  // Close when clicking outside
  function initDropdownClose() {
    $(document).on('click', function(event) {
      if ($(event.target).closest('.dropdown').length === 0) {
        $('.dropdown').removeClass('open');
        $('.dropdown .option').removeAttr('tabindex');
      }
      event.stopPropagation();
    });
  }
  initDropdownClose();

  // Option click
  function initDropdownOptions() {
    $(document).on('click', '.dropdown .option', function(event) {
      $(this).closest('.list').find('.selected').removeClass('selected');
      $(this).addClass('selected');
      var text = $(this).data('display-text') || $(this).text();
      let id = $(this).attr('data-value');
      $(this).closest('.dropdown').find('.currentCategorySelection').text(text);
      $(this).closest('.dropdown').find('.currentCategorySelection').attr("data-categoryId", id);
      $(this).closest('.dropdown').prev('select').val($(this).data('value')).trigger('change');
    });
  }
  initDropdownOptions();

  // Keyboard events
  function initKeyboardEvents() {
    $(document).on('keydown', '.dropdown', function(event) {
      var focused_option = $($(this).find('.list .option:focus')[0] || $(this).find('.list .option.selected')[0]);
      // Space or Enter
      if (event.keyCode == 32 || event.keyCode == 13) {
        if ($(this).hasClass('open')) {
          focused_option.trigger('click');
        } else {
          $(this).trigger('click');
        }
        return false;
        // Down
      } else if (event.keyCode == 40) {
        if (!$(this).hasClass('open')) {
          $(this).trigger('click');
        } else {
          focused_option.next().focus();
        }
        return false;
        // Up
      } else if (event.keyCode == 38) {
        if (!$(this).hasClass('open')) {
          $(this).trigger('click');
        } else {
          var focused_option = $($(this).find('.list .option:focus')[0] || $(this).find('.list .option.selected')[0]);
          focused_option.prev().focus();
        }
        return false;
      // Esc
      } else if (event.keyCode == 27) {
        if ($(this).hasClass('open')) {
          $(this).trigger('click');
        }
        return false;
      }
    });
  }
  initKeyboardEvents();


  function initCreateNewCategory() {
    $('.entryNewCategoryCreate__space').off('click');
    $('.entryNewCategoryCreate__space').on('click', function() {
      let clickObject = $(this);

      let category = $('.entryNewCategoryText__space').val();
      category = category[0].toUpperCase() + category.slice(1);
      category = category.replace(/^\s+|\s+$/g, "");

      let listId = $('.entryCurrentListSelector__space').attr('data-listId');

      clickObject.text('Creating...');


      let data = {};
      data.category = category;
      data.listId = listId;
      data.curataId = curataId;
      data.dateCreated = new Date();

      // create category in database
      $.ajax({
        data: data,
        type: 'POST',
        url: '/' + coreURL + '/curatas/' + curataId + '/lists/' + listId + '/createCategory',
        success: function(response) {
          console.log("Yoho! Successfully created new category!");
          let categoryId = response.categoryId;
          category = response.category.entryCategoryName
          // clear and hide category creator
          clickObject.text('Create');
          hideShowCategoryCreator(clickObject);
          $('.entryNewCategoryText__space').val('');
          $('.dropdown').css("float", "left");
          $('.dropdown').css("width", "55%");

          let listOption = $('<li>', {'class': 'option selected', 'data-value': categoryId})
          listOption.text(category);

          let categoryList = $('.dropdown').find('ul');
          categoryList.append(listOption);

          let dropdownList = $('.dropdown').find('.list');
          dropdownList.find('.selected').removeClass('selected');

          // set newly created category as default

          $('.dropdown').find('.currentCategorySelection').text(category);
          $('.dropdown').find('.currentCategorySelection').attr("data-categoryId", categoryId);

          $('.dropdown').prev('select').val(category).trigger('change');

          // sort alphabetically upon add, whilst keeping 'None' at start
          let optionList = $('.optionList');
          optionList.children().not('.doNotSortMe').detach().sort(function(a, b) {
              if (!$(a).hasClass('.doNotSortMe') && !$(b).hasClass('.doNotSortMe')) { 
                  return $(a).text().localeCompare($(b).text());
              }
          }).appendTo(optionList);

        },
        error: function(err) {
          console.log("Arrghh! Failed to publish entry!");
        }
      })	

    })
  }

  function hideShowCategoryCreator(clickObject) {
    clickObject.closest('.entryDetailsGroup').toggleClass('flex');
    $('.entryNewCategory__space').toggle();
    $('.entryCreateCategoryBlock__space').toggle();
  }

  function initNewCategoryCreation() {
    $('.entryNewCategory__space').on('click', function() {
      let clickObject = $(this);
      // $(this).closest('.entryDetailsGroup').removeClass('flex');
      $('.dropdown').css("float", "none");
      $('.dropdown').css("width", "100%");
      // $('.entryNewCategory__space').css("display", "none");
      // $('.entryCreateCategoryBlock__space').css("display", "block");
      hideShowCategoryCreator(clickObject);
      initCancelCategoryCreation();
      initCreateNewCategory();
    })
  }
  initNewCategoryCreation();

  function initCancelCategoryCreation() {
    $('.entryNewCategoryCancel__space').off('click');
    $('.entryNewCategoryCancel__space').on('click', function() {
      let clickObject = $(this);
      // $(this).closest('.entryDetailsGroup').addClass('flex');
      $('.dropdown').css("float", "left");
      $('.dropdown').css("width", "55%");
      // $('.entryNewCategory__space').css("display", "inline-block");
      // $('.entryCreateCategoryBlock__space').css("display", "none");
      $('.entryNewCategoryText__space').val('');
      hideShowCategoryCreator(clickObject);
    });
  }

});