$(document).ready(function () {	


	let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,20})+$/;
	let usernameRegex = /^[A-Za-z0-9]+$/;
	// let emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2, 63}$/;
	// let usernameRegex = /[^\w|\d]/;


	//on keyup, start the countdown
	function initUsernameCheck() {
		//setup before functions
		let typingTimer;                //timer identifier
		let doneTypingInterval = 1500;  //time in ms (5 seconds)

		$('input[name="username"]').on('input', function() {
			let inputField = $(this);
			let data = {
				field: 'username',
				value: inputField.val(),
				inputField
			};
		    clearTimeout(typingTimer);
		    if (inputField.val()) {
		        typingTimer = setTimeout(doneTyping, doneTypingInterval, data);
		    }
		});
	}
	initUsernameCheck();

	//on keyup, start the countdown
	function initEmailCheck() {
		//setup before functions
		let typingTimer;                //timer identifier
		let doneTypingInterval = 1500;  //time in ms (5 seconds)

		$('input[name="email"]').on('input', function() {
			let inputField = $(this);
			let data = {
				field: 'email',
				value: inputField.val(),
				inputField
			};
			//data.field = field;
			//data.checkType = 'checkEmail';
		    clearTimeout(typingTimer);
		    if (inputField.val()) {
		        typingTimer = setTimeout(doneTyping, doneTypingInterval, data);
		    }
		});
	}
	initEmailCheck();


	//user is "finished typing," do something
	function doneTyping(data) {
		console.log(data);

		let input = data.inputField;
		delete data.inputField;
		//let checkType = data.checkType;

    	//let value = input.val();
    	//console.log("value: ", value);
		$.ajax({
			data,
			type: 'POST',
			url: '/accounts/checkUnique',
			success: function(response) {
				console.log("resp. ", response);
				if (response.fail === true) {
					input.siblings('.inputErrorContainer').children('.inputErrorText').show().text(response.message);
				} else {
					input.siblings('.inputErrorContainer').children('.inputErrorText').hide().text("");
				}
			},
			error: function(err) {
				console.log("Couldn't do check for " + checkType + ".");
				// display error message
			}
		});
	}

	function initShowPass() {
		$('.showPassContainer').on('click', function() {
			let input = $(this).siblings('input');
			if (input.attr('type') === 'text') {
				$(this).children('.showPass').attr('src', '/images/light-eye-unbox.png');
				return input.attr('type', 'password');
			}
			input.attr('type', 'text');
			$(this).children('.showPass').attr('src', '/images/light-eye-check.png');

		})
	}
	initShowPass();

	// function initInputToggle() {
	// 	$('.input__registration').on('focus', function() {
	// 		// registration form title
	// 		let input = $(this);
	// 		input.siblings('.inputTitleContainer').show();
	// 		// registration input focus
	// 		$(this).parent().addClass('registration-input-focus');
	// 	})

	// 	$('.input__registration').on('blur', function() {
	// 		let input = $(this);
	// 		input.siblings('.inputTitleContainer').hide();
	// 		$(this).parent().removeClass('registration-input-focus');
	// 	})
	// }
	// initInputToggle();

	// function validatePassword(password, passcheck, username, email) {

	// 		let error;
	// 		let isError = false;
	// 		let errorArray = [];

	// 		// in the future, iterate over error array and display all the errors

	// 		function activatePasswordError(error, input) {
	// 			let errorContainer = input.siblings('.inputErrorContainer');

	// 			//let errorMessage = errorNotifierText.text();
	// 			// if (!errorMessage.length > 0 || errorMessage !== error) {
	// 				//errorContainer.css("background-color", "#b63a3a");
	// 				errorContainer.show();
	// 				errorContainer.children('.inputErrorText').text(error);
	// 			// }
	// 		}

	// 		// check that passwords not empty
	// 		if (!password || !passcheck) {
	// 			error = "Password fields cannot be empty.";
	// 			isError = true;
	// 			errorArray.push(error);
	// 			return activatePasswordError(error);
	// 		} 
	// 		// check if passwords match
	// 		if (password !== passcheck) {
	// 			error = "Passwords do not match.";
	// 			isError = true;
	// 			errorArray.push(error);
	// 			return activatePasswordError(error);
	// 		}
	// 		// check if passwords don't equal username or email
	// 		if (password === username || password === email) {
	// 			error = "Password cannot be the same as your username or email.";
	// 			isError = true;
	// 			errorArray.push(error);
	// 			return activatePasswordError(error);
	// 		}
	// 		// check that password is at least 8 characters long
	// 		if (password.length < 8 || passcheck.length < 8) {
	// 			error = "Password must be at least 8 characters long.";
	// 			isError = true;
	// 			errorArray.push(error);
	// 			return activatePasswordError(error);
	// 		}

	// 		// check that password is less than 64 characters long
	// 		if (password.length > 64 || passcheck.length > 64) {
	// 			error = "Password must be less than 64 characters long.";
	// 			isError = true;
	// 			errorArray.push(error);
	// 			return activatePasswordError(error);
	// 		}

	// 		// check that password is less than 64 characters long
	// 		if (username.length > 35) {
	// 			error = "Username must be less than 35 characters.";
	// 			isError = true;
	// 			errorArray.push(error);
	// 			return activatePasswordError(error);
	// 		}

	// 		// IF PASSTYPE && PASSTYPE == RESET --> check that not previous pass
	// }

	function validateEmail(input, regex) {
		// if no mistakes, we want maximum speed validation
		if (input.match(regex)) {
			return true;
		} else {
			let errorClass = "incorrectEmailFormat";
			let errorMessage = "Please enter a valid email address.";
			let emailInput = $('input[name="email"]');
			emailInput.siblings('.inputErrorContainer').css("display", "flex");
			emailInput.siblings('.inputErrorContainer').children('.inputErrorText').empty();
			emailInput.siblings('.inputErrorContainer').children('.inputErrorText').append("<p class=" + errorClass + ">" + errorMessage +"</p>");
			return false;
		}
	}

	function validateUsername(input, regex) {
		// if no mistakes, we want maximum speed validation
		let usernameInput = $('input[name="username"]');
		if (input.match(regex)) {
			usernameInput.css("border", "3px solid green");
			return true;
		} else if (!input) {
			let errorClass = "usernameEmpty";
			let errorMessage = "Username cannot be empty.";
			usernameInput.css("border", "3px solid red");
			usernameInput.siblings('.inputErrorContainer').css("display", "flex");
			usernameInput.siblings('.inputErrorContainer').children('.inputErrorText').empty();
			usernameInput.siblings('.inputErrorContainer').children('.inputErrorText').append("<p class=" + errorClass + ">" + errorMessage +"</p>");
			return false;
		} else {
			let errorClass = "incorrectUsernameFormat";
			let errorMessage = "Username can only contain letters (Aa-Zz) and numbers (0-9). Spaces and special characters are not allowed.";
			usernameInput.css("border", "3px solid red");
			usernameInput.siblings('.inputErrorContainer').css("display", "flex");
			usernameInput.siblings('.inputErrorContainer').children('.inputErrorText').empty();
			usernameInput.siblings('.inputErrorContainer').children('.inputErrorText').append("<p class=" + errorClass + ">" + errorMessage +"</p>");
			return false;
		}
	}

	function displayRelevantErrors() {
		// take here, if mistakes
		$('.notifier__register').show();

		// identify specific errors
		
		// detect individual email errors
		// detect individual username errors
		// detect individual password errors

		// show email errors
		// show username errors
		// show password errors
	}

	function initRegisterAccount(){
		$('.form-register').on('submit', function(e) {
			e.preventDefault();
			$('.register-button').attr('disabled', 'disabled');
			$('.register-button').attr('value', 'Creating account...');
			// forms are not to be used; ajax is superior.

			// rather than preventing certain typing, simply don't allow it to pass until in correct format; however, users could potentially disable the frontend JavaScript, therefore this correct format should still be validated with the backend
			let email = $('input[name="email"]').val();
			let username = $('input[name="username"]').val();
			let password = $('input[name="password"]').val();
			let passcheck = $('input[name="passcheck"]').val();
			attemptRegister(email, username, password, passcheck);


/*
			// pre-validate; if no errors, quickpass; else, check individual errors.
			let emailValidation = validateEmail(email, emailRegex);
			let usernameValidation = validateUsername(username, usernameRegex);
			// let passwordValidation = validatePassword(password, passcheck, username, email);


			// if (emailValidation === true && usernameValidation === true && passwordValidation === true) {
			if (emailValidation === true && usernameValidation === true) {
				console.log("All pass. Attempt create user.");
				attemptRegister(email, username, password);
			} else {
				console.log("Incorrect format. Here are the errors.");
				displayRelevantErrors();
			}

*/

			/* TODO
			- on success, redirect
			- on fail, remove disabled, change text value, show error
			*/

			// $.ajax({
			// 	data: {
			// 		email,
			// 		username,
			// 		password,
			// 		passcheck
			// 	},
			// 	type: 'POST',
			// 	url: '/browse/curatas/' + spaceId + '/addLike',
			// 	success: function(response) {
			// 		// set site count to match db count in case more people have liked it
			// 		likeCountContainer.text(response.newCount);
			// 	},
			// 	error: function(err) {
			// 		likeCount = likeCount - 1;
			// 		likeCountContainer.text(likeCount);
			// 		// display error message
			// 	}
			// });

			// validate form
				// does email pass validation
				// does username pass validation
				// do passwords match & pass basic validation
			// if not
				// display error box
					// display relevant errors
			// grab form
			// access server
			// check server if
				// username is unique && sanitized
				// email is unique && sanitized

				// if not, simply display as one of the errors
		})
	}
	initRegisterAccount()

	function attemptRegister(email, username, password, passcheck) {
		$.ajax({
			data: {
				email,
				username,
				password,
				passcheck
			},
			url: '/accounts/register',
			type: 'POST',
			success: function(response) {
				window.location.replace(response.redirectURL);
			},
			error: function(err) {
				$('.inputErrorText').empty();

				err.responseJSON.errors.forEach(eachError => {
					$(`input[name="${eachError.param}"]`).siblings('.inputErrorContainer').children('.inputErrorText').show().text(eachError.msg);
				});
				$('.register-button').removeAttr('disabled');
				$('.register-button').attr('value', 'Create account');
				// display error message
			}
		})
	}

});