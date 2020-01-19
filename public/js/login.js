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


	function initLogin() {
		$('.login-button').on('click', function(e){
			e.preventDefault();
			$('.login-button').attr('disabled', 'disabled');
			$('.login-button').attr('value', 'Logging in...');
			let username = $('input[name="username"]').val();
			let password = $('input[name="password"]').val();

			$.ajax({
				data: {
					username,
					password,
				},
				url: '/accounts/login',
				type: 'POST',
				success: function(response) {
					console.log("res", response);
					window.location.replace(response.redirectURL);
				},
				error: function(err) {
					console.log("er", err);
					$('.inputErrorText').empty();
					$('.inputErrorText').show().text(err.responseJSON.error);
					$('.login-button').removeAttr('disabled');
					$('.login-button').attr('value', 'Login');
				}
			})
		})
	}
	initLogin();

});