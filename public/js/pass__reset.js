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
			if (password !== passcheck) {
				return alert('Passwords do not match');
			}
			$.ajax({
				type: 'POST',
				data: {
					password,
					token: getToken()
				},
				url: '/accounts/reset',
				success: function(response, status) {
					window.location.replace('/accounts/loginForm?reset');
				},
				error: function(err) {
					console.log("err: ", err);
					// display error message
				}
			})
		})
	}
	initResetPass();

});