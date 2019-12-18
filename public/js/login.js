$(document).ready(function () {	

	function isFromReset() {
		return window.location.href.includes('?reset');
	}

	if (isFromReset()) {
		$('.successMessage').show();
	}

	setTimeout(function() {
		$('.successMessage').hide();
	}, 3000)

});