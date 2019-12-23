$(document).ready(function () {	

	function getToken() {
		let url = window.location.href;
		url = url.split('/');
		return url[url.length - 1];
	}

	function initResetPass() {
		console.log('here');
		$('.form__resetPass').on('submit', function(event) {
			event.preventDefault();
			let password = $('input[name="password"]').val();
			let passcheck = $('input[name="passcheck"]').val();
			$('.button__resetPass').attr('disabled', 'disabled');
			$('.button__resetPass').attr('value', 'Processing...');
			$.ajax({
				type: 'POST',
				data: {
					password,
					passcheck,
					token: getToken()
				},
				url: '/accounts/reset',
				success: function(response, status) {
					window.location.replace('/accounts/loginForm?reset');
				},
				error: function(err) {
					$('.inputErrorText').empty();
					//err.responseJSON.errors
					$('.inputErrorText').show().text(err.responseJSON.err);
					$('.button__resetPass').removeAttr('disabled');
					$('.button__resetPass').attr('value', 'Submit');
					// display error message
				}
			})
		})
	}
	initResetPass();

});