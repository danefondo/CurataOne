$(document).ready(function () { 

    function isFromDeleteEntry() {
        return window.location.href.includes('?entrydelete');
    }

    if (isFromDeleteEntry()) {
        $('.dashboardSuccessContainer').css("display", "flex");
    }

	setTimeout(function() {
		$('.dashboardSuccessContainer').hide();
    }, 3000)
    
    $('.dashboardSuccessClose').on('click', function() {
        $('.dashboardSuccessContainer').hide();
    })

});