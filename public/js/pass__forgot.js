$(document).ready(function () {	

	function initForgotPass() {
		console.log('here');
		$('.form__forgotPass').on('submit', function(event) {
			event.preventDefault();
			let email = $('input[name="email"]').val();
			console.log(email);
			$.ajax({
				type: 'POST',
				data: {
					email
				},
				url: '/accounts/sendResetPass',
				success: function(response) {
					console.log("resp. ", response);
					$('.successMessage').text(response.message);
					$('.successMessage').css("display", "block");
					$('.inputErrorText').hide()
				},
				error: function(err) {
					console.log("err: ", err);
					$('.inputErrorText').empty();
					// $('.inputErrorText').show().text(err.responseJSON.error);
					$('.inputErrorText').show().text(err.responseJSON.message);
				}

			})
		})
	}
	initForgotPass();

});