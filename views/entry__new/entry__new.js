$(document).ready(function () {
    console.log("Hellllllo.");

    // function initCancelAndTrashEntry() {

    //     $('.trashEntry').off('click');
    //     $('.trashEntry').on('click', function() {
    //         deletionModal.show();
    //     })

    //     $('.cancelTrashEntry').off('click');
    //     $('.cancelTrashEntry').on('click', function() {
    //         deletionModal.hide();
    //     })

    //     $('.modalBackground').off('click');
    //     $('.modalBackground').on('click', function() {
    //         deletionModal.hide();
    //     })

    //     // Press esc key to hide
    //     $(document).keydown(function(event) { 
    //     if (event.keyCode == 27) { 
    //         if (deletionModal.length) {
    //             let modalState = deletionModal.css('display');
    //             if (modalState == "block") {
    //                 deletionModal.hide();
    //             }
    //         }
    //     }
    //     });

    //     $('.confirmTrashEntry').off('click');
    //     $('.confirmTrashEntry').on('click', function() {

    //         $.ajax({
    //             data: {
    //                 entryId: entryId
    //             },
    //             type:'POST',
    //             url: '/' + coreURL + '/trashEntry',
    //             success: function(response) {
    //                 // take person to all entries
    //                 window.location.href = response.redirectTo;
    //             },
    //             error: function(err) {
    //                 console.log("Failed to trash entry: ", err);
    //                 // Display error not being able to publish
    //             }
    //         });
    //     });
    // }
    // initCancelAndTrashEntry();

});