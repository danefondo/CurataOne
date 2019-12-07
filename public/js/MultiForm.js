$(document).ready(function () {

  var curataName = '',
      curataDescription = '',
      curataAddress = '',
      currentForm = 0,
      forms = $('body').find('fieldset'),
      maxForms = forms.length -1,
      backBtn = $('.back-btn'),
      nextBtn = $('.next-btn')
  // the -1 for maxForms is done to account later for index position and finding of elements, given computers begin counting from 0
  // currentForm is declared at 0 as it is later used for index position, finding elements

  function showCurrent() {
    $('.currentForm').removeClass('currentForm');
    $("body").find(".form-group").eq(currentForm).addClass("currentForm");
    updateProgressBar();
  }
  showCurrent();

  function showHideBackButton() {
    if (currentForm === 0) {
      backBtn.hide();
    } else if (backBtn.is(':hidden')) {
      backBtn.show();
    }
  }
  showHideBackButton();

  function initNextButton() {
    nextBtn.on('click', function() {
      if (validateInput() === false) {
        return;
      }
      // if next step is finish, aka one step before finish
      // this -1 is to account that currentForm starts from 0
      if (currentForm === maxForms - 1) {
        createCurata();
        return;
      }

      if (currentForm === maxForms - 2) {
        nextBtn.text('Create space');
      }

      currentForm++;
      showCurrent();
      showHideBackButton();
    })
  }
  initNextButton();

  function initBackButton() {
    backBtn.off('click');
    backBtn.on('click', function() {

      currentForm--;

      if (nextBtn.text !== 'Continue') {
        nextBtn.text('Continue');
      }

      showCurrent();
      showHideBackButton();
    })
  }
  initBackButton();

  function updateProgressBar(){
    $('.progress-bar').css({
      'width': (currentForm + 1) / (maxForms + 1) * 100 +'%'
    });
  }

  function initInputListening() {
    $('.CurationNameInput').on('change paste keyup', function() {
      curataName = $(this).val();
    })

    $('.CurationDescriptionInput').on('change paste keyup', function() {
      curataDescription = $(this).val();
    })

    $('.CurationAddressInput').on('change paste keyup', function() {
      curataAddress = $(this).val();
    })
  }
  initInputListening();

  function validateInput(){
    let inputs = forms.eq(currentForm).find('input, textarea');
    let choice = $(".ChoiceInput");
    if (currentForm == 1 && choice.is(':checked')) {
      console.log("Checked");
      return true;

    } else {

      for (var i = 0; i < inputs.length; i++) {
        if (!$(inputs[i]).val()){
            $(inputs[i]).addClass('is-invalid');
            return false;
        }
        else {
          $(inputs[i]).removeClass('is-invalid');
          $(inputs[i]).addClass('is-valid');
        }
      }
      return true;
    }
  }

  function createCurata() {
    $('.CurataCreatedField').removeClass('form-group');
    $('.CurataCreatedField').addClass('currentForm');
    $('.BackupView').addClass('zeroSideMargins');
    $('fieldset.form-group').remove();
    $('.back-btn').remove();
    $('.next-btn').remove();
    $('.progress-bar').css('width', '100%');

    // ajax create curata, list, template, components, entries
    // create ref in user for curata
    // create ref in curata for list
    // create ref in list for template + entries
    // create ref in template for components

    // as such, send enough information to create all of those
    let currentDateTime = new Date();
    
    $.ajax({
      data: {
        curataName: curataName,
        curataDescription: curataDescription,
        curataAddress: curataAddress,
        dateCreated: currentDateTime
      },
      type: 'POST',
      url: '/dashboard/createNewCurata',
      success: function(response) {
        let listId = response.listId;
        let curataId = response.curataId;
        initCreateEntry(listId, curataId);
      },
      error: function(err) {
        console.log(err);
      }
    });

  }

  function initAddressCheck() {
    $(".ChoiceInput").change(function() {
        if (this.checked) {
          $(".containerX").toggleClass('CheckedContainer');
          $(".containerX h2").toggleClass('CheckedContainerHeader');
          $(".tooltiptext").toggleClass('visible');
          $('.CurationAddressInput').removeClass('is-invalid');
          $(".CurationAddressHolder").hide("fast");
          $(".next-btn").css("margin-top", "100px");
          curataAddress = 'no-address';
        } else {
          $(".containerX").toggleClass('CheckedContainer');
          $(".containerX h2").toggleClass('CheckedContainerHeader');
          $(".tooltiptext").toggleClass('visible');
          $(".CurationAddressHolder").show("slow");
          $(".next-btn").css("margin-top", "50px");
          curataAddress = $('.CurationAddressInput').val();
        }
    });
  }
  initAddressCheck();

  function initCreateEntry(list_id, curata_id) {
    $('.createEntryButton').on('click', function() {

      // let TemplateId = $('.Template').attr('id');
      let currentDateTime = new Date();
      let listId = list_id;
      let curataId = curata_id;

      $.ajax({
        data: {
          // TemplateId: TemplateId,
          creationTime: currentDateTime,
          listId: listId,
          curataId: curataId
        },
        type: 'POST',
        url: '/dashboard/curataLists/CreateNewEntry',
        success: function(response){
          window.location.href = response.redirectTo;
          // Display success message?

        },
        error: function(err){
          console.log("Entry draft creation failed: ", err);
          // Display error message?
        }
      })
    });
  }



});
