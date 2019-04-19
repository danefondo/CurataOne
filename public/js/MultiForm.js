$(document).ready(function () {

  var curataName = '',
      curataDescription = '',
      curataAddress = '',
      image = '',
      currentForm=0,
      forms=$('.scroll-view').find('fieldset'),
      maxForms=forms.length -1,
      backBtn = $('.back-btn'),
      nextBtn = $('.next-btn'),
      scrolling = false;

  backBtn.click(()=>{
   if (scrolling == true || currentForm === 0){
      return;
    }
    currentForm--;

    if (currentForm !== maxForms){
      nextBtn.text('CONTINUE');
    }
   scrollToCurrent('-=');
   ShowHideBackButton();
  });

  function ShowHideBackButton() {
    if (currentForm === 0) {
      backBtn.hide();
    } else if (backBtn.is(':hidden')) {
      backBtn.show();
    }
  }
  ShowHideBackButton();

  nextBtn.click(()=>{
    if (scrolling == true){
      return;
    }
    if (validateInput() == false){
      return;
    }
    if (currentForm === maxForms - 1){
      createCurata();
      return;
    }
    
    if (currentForm === 0){
      nextBtn.text('CONTINUE');
    }
    if (currentForm === maxForms - 2){
      nextBtn.text('CREATE CURATA');
    }
    currentForm++;
   scrollToCurrent('+=');
   ShowHideBackButton();
  });

  function scrollToCurrent(add){
    scrolling = true;
    console.log('scroll to '+forms.eq(currentForm).find('h1').text());
     $('.scroll-view').stop(true, true).delay(200).animate({
              scrollTop: add+forms.eq(currentForm).outerHeight()
          }, 300, 'swing', function (){
       scrolling = false;
     });
    updateProgressBar();
  }

  function updateProgressBar(){
    $('.progress-bar').css({
      'width': (currentForm + 1) / (maxForms + 1) * 100 +'%'
    });
  }

  $('.CurationNameInput').on('change paste keyup', function() {
    curataName = $(this).val();
    console.log(curataName);
  })

  $('.CurationDescriptionInput').on('change paste keyup', function() {
    curataDescription = $(this).val();
  })

  $('.CurationAddressInput').on('change paste keyup', function() {
    curataAddress = $(this).val();
  })


  function readURL(input) {
    if (input.files && input.files[0]) {
      let reader = new FileReader();

      reader.onload = function (e) {
        $('.img-picker-div')
          .css({
          'background-image': 'url(\''+e.target.result+'\')'
          }).addClass('hide-children');
        image = e.target.result;
      };

      reader.readAsDataURL(input.files[0]);
    }
   }

  function validateInput(){
    console.log(currentForm);
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
    $('fieldset.form-group').remove();
    $('.scroll-view').removeClass('scroll-view');
    $('.back-btn').remove();
    $('.next-btn').remove();
    $('.progress-bar').css('width', '100%');

    // ajax create curata, list, template, components, entries
    // create ref in user for curata
    // create ref in curata for list
    // create ref in list for template + entries
    // create ref in template for components

    // as such, send enough information to create all of those
    
    $.ajax({
      data: {
        curataName: curataName,
        curataDescription: curataDescription,
        curataAddress: curataAddress
      },
      type: 'POST',
      url: '/curatas/createNewCurata',
      success: function(response) {
        $(".UserCurataTitle").text(curataName);
        $(".TemplateTitle").val(curataName + ' Template');
        $(".Template").attr('id', response.template._id);
        console.log("Success response: ", response);
        // let hrefLink = '/curatas/curate/templates/' + response.template._id;
        // let hrefLink = 'curatas/curataLists/CreateNewEntry'
        // console.log(hrefLink);
        createEntry();
        // $('.CreateTemplateButton').attr('href', hrefLink);
      },
      error: function(err) {
        console.log(err);
      }
    });

  }


  $(".ChoiceInput").change(function() {
      if (this.checked) {
        $(".containerX").toggleClass('CheckedContainer');
        $(".containerX h2").toggleClass('CheckedContainerHeader');
        $(".tooltiptext").toggleClass('visible');
        $('.CurationAddressInput').removeClass('is-invalid');
        $(".CurationAddressHolder").hide("fast");
        curataAddress = 'no-address';
      } else {
        $(".containerX").toggleClass('CheckedContainer');
        $(".containerX h2").toggleClass('CheckedContainerHeader');
        $(".tooltiptext").toggleClass('visible');
        $(".CurationAddressHolder").show("slow");
        curataAddress = $('.CurationAddressInput').val();
      }
  });


  function initTemplateTitleUpdate() {
    $('.TemplateTitle').bind('input change', function() {

      let TemplateId = $(this).closest('.Template').attr('id');
      let TemplateTitle = $(this).val();

      $.ajax({
        data: {
          TemplateId: TemplateId,
          TemplateTitle: TemplateTitle,
        },
        type: 'POST',
        url: '/curatas/UpdateComponentTitle',
        success: function(Item){
          console.log("Template title successfully updated.")
          // Display success message?

        },
        error: function(err){
          console.log("Template title update failed: ", err);
          // Display error message?
        }
      });

    });
  }
  initTemplateTitleUpdate();

  function initComponentTitleUpdate() {
    $('.ComponentTitle').bind('input change', function() {

      let TemplateId = $(this).closest('.Template').attr('id');
      let TemplateTitle = $(this).val();

      $.ajax({
        data: {
          TemplateId: TemplateId,
          TemplateTitle: TemplateTitle,
        },
        type: 'POST',
        url: '/curatas/UpdateTemplateTitle',
        success: function(Item){
          console.log("Template title successfully updated.")
          // Display success message?

        },
        error: function(err){
          console.log("Template title update failed: ", err);
          // Display error message?
        }
      });

    });
  }

  function createEntry() {
    $('.CreateTemplateButton').on('click', function() {

      let TemplateId = $('.Template').attr('id');


      $.ajax({
        data: {
          TemplateId: TemplateId
        },
        type: 'POST',
        url: '/curatas/curataLists/CreateNewEntry',
        success: function(response){
          console.log("Entry draft successfully created.");
          window.location.href = response.redirectTo;
          console.log("Response: ", response);
          console.log("Entry: ", response.entry);
          // Display success message?

        },
        error: function(err){
          console.log("Entry draft creation failed: ", err);
          // Display error message?
        }
      })
    });
  }

/*
TASKS:
- Listen to editors and get their data per change
- Lists
- Checklists
- Change order of list & checklist items and update in database
- Change order of questions in a questionBox
- Listen to question & expandable titles
- Listen to question & expandable editors
- Create lists with option to have a title, basically expandable lists & checklists


*/


});
