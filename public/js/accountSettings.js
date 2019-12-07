 $(document).ready(function () { 

 	let deletionModal = $('.emptyModal');
 	let userId = $('.userId').attr('id');
	let username = $('.userId').attr('data-username');
 	const coreURL = 'dashboard';

	function initPasswordConfirmation__accountSettings() {
		$('.password__accountSettings').off('input change');
		$('.password__accountSettings').on('input change', function() {

			// 1. On click, show confirm password input
			let input = $(this);
			let inputValue = input.val();
			$('.passwordConfirmationBlock').show();
			$('.passwordBlock').css("margin-bottom", "15px");


			// 2. Upon input exit, if both empty, hide confirm password
			$('.password__accountSettings').off('blur');
			$('.password__accountSettings').on('blur', function() {
				let confirmationValue = $('.passwordConfirmation__accountSettings').val();
				if (!inputValue && !confirmationValue) {
					$('.passwordConfirmationBlock').hide();
					$('.passwordBlock').css("margin-bottom", "28px");
				}
			});

			$('.passwordConfirmation__accountSettings').off('blur');
			$('.passwordConfirmation__accountSettings').on('blur', function() {
				let confirmationValue = $('.passwordConfirmation__accountSettings').val();
				if (!inputValue && !confirmationValue) {
					$('.passwordConfirmationBlock').hide();
					$('.passwordBlock').css("margin-bottom", "28px");
				}
			});
		});
	}
	initPasswordConfirmation__accountSettings()

	function initChangePassword__accountSettings() {
		$('.changePasswordButton__accountSettings').off('click');
		$('.changePasswordButton__accountSettings').on('click', function() {


			let newPassword = $('.password__accountSettings').val();
			let newPasswordConfirmation = $('.passwordConfirmation__accountSettings').val();

			let emptyModal = $(".modal__changePassword");

			let errorNotifier = $('.passwordErrorNotifier__accountSettings');
			let errorNotifierText = $('.passwordError__accountSettings');
			let error;
			let isError = false;
			let errorArray = [];

			// in the future, iterate over error array and display all the errors

			function activatePasswordError(error) {
				let errorMessage = errorNotifierText.text();
				errorNotifier.css("display", "flex");
				errorNotifier.css("background-color", "#b63a3a");
				if (!errorMessage.length > 0 || errorMessage !== error) {
					errorNotifier.css("background-color", "#b63a3a");
					$('.passwordError__accountSettings').text(error);
				}
			}

			// check that passwords not empty
			if (!newPassword || !newPasswordConfirmation) {
				error = "Password field cannot be empty.";
				isError = true;
				errorArray.push(error);
				return activatePasswordError(error);
			} 
			// check if passwords match
			if (newPassword !== newPasswordConfirmation) {
				error = "Passwords do not match.";
				isError = true;
				errorArray.push(error);
				return activatePasswordError(error);
			}
			// check that password is at least 8 characters long
			if (newPassword.length < 8 || newPasswordConfirmation.length < 8) {
				error = "Password must be at least 8 characters long.";
				isError = true;
				errorArray.push(error);
				return activatePasswordError(error);
			}
			// check that password contains at least one number
        	if (!/\d/.test(newPassword)) {
        		error = "Password must contain at least one number.";
        		isError = true;
        		errorArray.push(error);
        		return activatePasswordError(error);
        	}
        	// check that password contains at least one lower case letter
        	if (!/[a-z]/.test(newPassword)) {
        		error = "Password must contain at least one lower case letter.";
        		isError = true;
        		errorArray.push(error);
        		return activatePasswordError(error);
        	}
        	// check that password contains at least one upper case letter
        	if (!/[A-Z]/.test(newPassword)) {
        		error = "Password must contain at least one upper case letter.";
        		isError = true;
        		errorArray.push(error);
        		return activatePasswordError(error);
        	}
        	// check that password only contains letters and numbers -- this seems to be advised against and as these never get rendered, then it doesn't matter too much
        	// if (/[^0-9a-zA-Z]/.test(newPassword)) {
        	// 	error = "Password must contain only letters and numbers.";
        	// 	isError = true;
        	// 	errorArray.push(error);
        	// 	return activatePasswordError(error);
        	// }
			

			if (!isError) {
				errorNotifier.hide();
				emptyModal.show();
			}

			$('.cancelChangePassword').off('click');
			$('.cancelChangePassword').on('click', function() {
				$('.passwordCurrent__accountSettings').val('');
				$('.passwordChangeErrorNotifier__accountSettings').hide();
				$('.passwordChangeError__accountSettings').text('');
				emptyModal.hide();
			})

			$('.modalBackground__changePassword').off('click');
			$('.modalBackground__changePassword').on('click', function() {
				$('.passwordCurrent__accountSettings').val('');
				$('.passwordChangeErrorNotifier__accountSettings').hide();
				$('.passwordChangeError__accountSettings').text('');
				emptyModal.hide();
			})

			// Press esc key to hide
			$(document).keydown(function(event) { 
			  if (event.keyCode == 27) { 
			  	if (emptyModal.length) {
			  		let modalState = emptyModal.css('display');
				  	if (modalState == "block") {
				  		$('.passwordCurrent__accountSettings').val('');
						$('.passwordChangeErrorNotifier__accountSettings').hide();
						$('.passwordChangeError__accountSettings').text('');
				  		emptyModal.hide();
				  	}
			  	}
			  }
			});

			$('.confirmChangePassword').off('click');
			$('.confirmChangePassword').on('click', function() {

				let oldPassword = $('.passwordCurrent__accountSettings').val();

				$.ajax({
					data: {
						oldPassword: oldPassword,
						newPassword: newPassword
					},
					type: 'POST',
					url: '/accounts/changePassword',
					success: function(response) {
						if (response.success) {
							emptyModal.hide();
							errorNotifier.hide();
							$('.defaultNotificationContainer').show();
							$('.defaultNotification').text("Password successfully changed.");
						    setTimeout(function() {
						    	$('.defaultNotification').text("");
						        $('.defaultNotificationContainer').hide();
						    }, 3500);
							$('.passwordConfirmationBlock').hide();
							errorNotifierText.text("");
							$('.passwordCurrent__accountSettings').val('');
							$('.password__accountSettings').val('');
							$('.passwordConfirmation__accountSettings').val('');
							$('.passwordChangeErrorNotifier__accountSettings').hide();
							$('.passwordChangeError__accountSettings').text('');
						} else if (response.fail) {
							$('.passwordChangeErrorNotifier__accountSettings').css("display", "flex");
							$('.passwordChangeError__accountSettings').text(response.fail);
						} else if (response.samePassFail) {
							$('.passwordChangeErrorNotifier__accountSettings').css("display", "flex");
							$('.passwordChangeError__accountSettings').text(response.samePassFail);
						}

					},
					error: function(err) {
						console.log("Failed to change password.");
					}
				})
			});
		})
	}
	initChangePassword__accountSettings();


	function initClearInputs__accountSettings() {
		$('*[data-fieldtype="username"]').off('keyup');
		$('*[data-fieldtype="username"]').on('keyup', function(event) {
			$(this).val($(this).val().replace(/[\r\n\v]+/g, ''));
		})

		$('*[data-fieldtype="firstName"], *[data-fieldtype="lastName"]').off('keypress');
		$('*[data-fieldtype="firstName"], *[data-fieldtype="lastName"]').on('keypress', function(event) {
			$(this).val($(this).val().replace(/[a-zA-Z \á-\ÿ]+/g, ''));
		})

		$('*[data-fieldtype="username"]').off('keypress');
		$('*[data-fieldtype="username"]').on('keypress', function(event) {
			if (event.keyCode === 13) {
				event.preventDefault();
				$(this).blur();
			}
		})

		$('*[data-fieldtype="username"], *[data-fieldtype="firstName"], *[data-fieldtype="lastName"]'
			).on('keypress', function(event) {
		    if(event.which === 32) 
		        return false;
		});
	}
	initClearInputs__accountSettings();


	function initSaveButtons__accountSettings() {
		$('.saveButton__accountSettings').off('click');
		$('.saveButton__accountSettings').on('click', function() {

			console.log("I AM HERE:");

			let saveButton = $(this);
			let settingsGroup = saveButton.closest('.block__accountSettings');
			let inputField = settingsGroup.find('.inputField__accountSettings');

			let inputFieldValue = inputField.val();
			let inputFieldType = inputField.attr('data-fieldtype');

			let notifier = settingsGroup.find('.availabilityNotifier__accountSettings');
			let status = notifier.find('.availabilityStatus__accountSettings');

			let inputError;

			function activateInputError(inputError) {
				notifier.css("display", "flex");
				notifier.css("background-color", "#b63a3a");
				status.text(inputError);
			    setTimeout(function() {
			    	status.text("");
			        notifier.hide();
			    }, 25000);
			}

			//- Make sure not empty
			//- Make sure username only has letters-numbers
			//- Make sure username max 64 characters long
			//- Make sure username has no spaces
			//- Make sure username contains no special characters and contains only letters and numbers
			//- Make sure first and last name only contain letters and no special characters other than one quote, one space, one hyphen
			//- Make sure to prevent any of that to be entered through pasting

			/* Input field validation and security */

			// Ensure none of this is bypassed through pasting or some other workaround
			// Get whitelist working

			// Ensure input field contains value
			console.log("I AM ALSO HERE:", inputFieldValue);
			if (!inputFieldValue) {
				inputError = "Input cannot be empty.";
				return activateInputError(inputError);
			}

			if (inputFieldValue == null || inputFieldValue == undefined) {
				inputError = "Input cannot be null.";
				return activateInputError(inputError);
			}

			if (/^(\w+\s?)*\s*$/.test(inputFieldValue)) {
				console.log("TROUBLE.");
				inputField.val(inputField.val().replace(/\s+$/, ''));
				inputFieldValue = inputField.val();

			}

			// Ensure no special characters appear (only letters for names, only letters and numbers for username)

			// if (inputFieldType == "firstName" || inputFieldType == "lastName") {
			// 	// Ensure firstName and lastName start with a capital letter and all the following letters after are uncapitalized (first uncapitalize all, then capitalize first letter)
			// 	// Ensure firstName, lastName only contain letters (no numbers, special characters)
			// }


			// if (inputFieldType == "firstName" || inputFieldType == "lastName" || inputFieldType == "username") {
			// 	// Ensure firstName, lastName and username are less than X characters long
			// 	// Ensure there are no spaces
			// }

			let data = {};
			let ajaxURL;

			// Indicate saving with save button
			saveButton.text("Saving...");
			saveButton.css("background-color", "#656565");
			saveButton.off('click');

			if (inputFieldType === "firstName") {
				data.firstName = inputFieldValue;
				ajaxURL = '/' + coreURL + '/updateFirstName';

				// ajax
				$.ajax({
					data: data,
					type: 'POST',
					url: '' + ajaxURL,
					success: function(data) {
						// change save button back
						saveButton.text("Save");
						saveButton.css("background-color", "#673AB7");
						$('.defaultNotificationContainer').show();
						$('.defaultNotification').text("Successfully saved first name.");
					    setTimeout(function() {
					    	$('.defaultNotification').text("");
					        $('.defaultNotificationContainer').hide();
					    }, 2500);
						initSaveButtons__accountSettings()
				    	status.text("");
				        notifier.hide();
					},
					error: function(err) {
						console.log("Update failed:", err);
						saveButton.text("Failed");
						saveButton.css("background-color", "#b73a3a");
						$('.defaultNotificationContainer').show();
						$('.defaultNotification').text("Failed to save first name.");
    					status.text("");
				        notifier.hide();

					}
				}) 
			}

			if (inputFieldType == "lastName") {
				data.lastName = inputFieldValue;
				ajaxURL = '/' + coreURL + '/updateLastName';

				// ajax
				$.ajax({
					data: data,
					type: 'POST',
					url: '' + ajaxURL,
					success: function(data) {
						// change save button back
						saveButton.text("Save");
						saveButton.css("background-color", "#673AB7");
						$('.defaultNotificationContainer').show();
						$('.defaultNotification').text("Successfully saved last name.");
					    setTimeout(function() {
					    	$('.defaultNotification').text("");
					        $('.defaultNotificationContainer').hide();
					    }, 2500);
						initSaveButtons__accountSettings()
					},
					error: function(err) {
						console.log("Update failed:", err);
						saveButton.text("Failed");
						saveButton.css("background-color", "#b73a3a");
						$('.defaultNotificationContainer').show();
						$('.defaultNotification').text("Failed to save last name.");

					}
				})
			}

			if (inputFieldType == "username") {
				data.username = inputFieldValue;
				ajaxURL = '/' + coreURL + '/updateUsername';

				let current = $('.userId').attr('data-username');

				if (inputFieldValue !== current) {
					// ajax
					$.ajax({
						data: data,
						type: 'POST',
						url: '' + ajaxURL,
						success: function(data) {
							// change save button back
							if (data.success) {
						    	status.text("");
						        notifier.hide();
								saveButton.text("Save");
								saveButton.css("background-color", "#673AB7");
								$('.defaultNotificationContainer').show();
								$('.defaultNotification').text("Successfully saved username.");
							    setTimeout(function() {
							    	$('.defaultNotification').text("");
							        $('.defaultNotificationContainer').hide();
							    }, 2500);
								initSaveButtons__accountSettings()
							} else if (data.fail) {
						    	status.text(data.fail);
						        notifier.hide();
								saveButton.text("Save");
								saveButton.css("background-color", "#673AB7");
								$('.defaultNotificationContainer').show();
								$('.defaultNotification').text("Successfully saved username.");
							    setTimeout(function() {
							    	$('.defaultNotification').text("");
							        $('.defaultNotificationContainer').hide();
							    }, 2500);
								initSaveButtons__accountSettings()
							}
						},
						error: function(err) {
					    	status.text("");
					        notifier.hide();
							console.log("Update failed:", err);
							saveButton.text("Failed");
							saveButton.css("background-color", "#b73a3a");
							$('.defaultNotificationContainer').show();
							$('.defaultNotification').text("Failed to save username.");
						}
					})
				} else {
					notifier.css("background-color", "#379cad");
					notifier.css("transform", "scale(1.04)");
					saveButton.text("Save");
					saveButton.css("background-color", "#673AB7");
				    setTimeout(function() {
				        notifier.css("transform", "scale(1)");
				        notifier.css("background-color", "#3aa4b6");
				    }, 1000);
				    setTimeout(function() {
				    	$('.defaultNotification').text("");
				        $('.defaultNotificationContainer').hide();
				    }, 2500);
					initSaveButtons__accountSettings()
				}
			}

			// if (inputFieldType == "email") {
			// 	// ajax
			// }
		})
	}
	initSaveButtons__accountSettings();

	function initUsernameChecking__accountSettings() {
		$('*[data-fieldtype="username"]').off('input change');
		$('*[data-fieldtype="username"]').on('input change', function() {
			// check if username already exists
			let input = $(this);
			input.val(input.val().replace(/[\r\n\v]+/g, ''));
			input.val(input.val().replace(/ /g, ""));
			input.val(input.val().replace(/[^a-zA-Z0-9]/g, ''));
			let username = input.val();
			username = $.trim(username);

			let inputContainer = input.closest('.block__accountSettings');

			let current = $('.userId').attr('data-username');

			let notifier = inputContainer.find('.availabilityNotifier__accountSettings');
			let status = notifier.find('.availabilityStatus__accountSettings');

			if (username === current) {
				notifier.css("display", "flex");
				notifier.css("background-color", "#3aa4b6");
				status.text("Your current username.");
			} else if (!username) {
				notifier.css("display", "flex");
				notifier.css("background-color", "#b63a3a");
				status.text("Input cannot be empty.");
			} else {
				let data = {};
				data.username = username;

				let ajaxURL = '/' + coreURL + '/checkUsername';

				$.ajax({
					data: data,
					type: 'POST',
					url: '' + ajaxURL,
					success: function(data) {

						if (data.success) {
							notifier.css("display", "flex");
							notifier.css("background-color", "#3aa4b6");
							status.text(data.success);
						} else if (data.fail) {
							notifier.css("display", "flex");
							notifier.css("background-color", "#b63a3a");
							status.text(data.fail);
							// let clownTest = notifier.find('.clownImage');
							// if (!clownTest.length) {
							// 	let clownImage = $('<img>', {"class": "clownImage"});
							// 	clownImage.attr('src', '/images/clown.jpg')
							// 	notifier.append(clownImage);
							// }
						}
					    setTimeout(function() {
					    	status.text("");
					        notifier.hide();
					    }, 25000);
					},
					error: function(err) {
						console.log("Something went wrong! Bwhahaha", err);
					    // setTimeout(function() {
					    // 	status.text("");
					    //     notifier.hide();
					    // }, 2500);
					}
				})
			}
		})
	}
	initUsernameChecking__accountSettings();

	function initDismissDefaultNotification() {
		$('.dismissDefaultNotification').on('click', function() {
			$('.defaultNotification').text("");
			$('.defaultNotificationContainer').hide();
		})
	}
	initDismissDefaultNotification();

	function initDeleteAccount__accountSettings() {

		let emptyModal = $(".modal__deleteAccount");

		// careful here, you mighty declare this once, and if this function is not established anew each click, then old values remain, causing difficult to spot errors later on

		$('.deleteAccountButton').off('click');
		$('.deleteAccountButton').on('click', function() {
			emptyModal.show();
		})

		$('.cancelPermaDeleteAccount').off('click');
		$('.cancelPermaDeleteAccount').on('click', function() {
			emptyModal.hide();
		})

		$('.modalBackground__deleteAccount').off('click');
		$('.modalBackground__deleteAccount').on('click', function() {
			emptyModal.hide();
		})

		// Press esc key to hide
		$(document).keydown(function(event) { 
		  if (event.keyCode == 27) { 
		  	if (emptyModal.length) {
		  		let modalState = emptyModal.css('display');
			  	if (modalState == "block") {
			  		emptyModal.hide();
			  	}
		  	}
		  }
		});

		$('.confirmPermaDeleteAccount').off('click');
		$('.confirmPermaDeleteAccount').on('click', function() {

			// Indicate 'deleting'
			emptyModal.hide();

			$.ajax({
				type: 'DELETE',
				url: '/' + coreURL + '/deleteAccount',
				success: function(response) {
					console.log('Account deleted. Redirecting.');
					window.location.href = '/';

				},
				error: function(err) {
					console.log("Failed to delete account.");
					//TODO: Display error message
				}
			})
		});
	}
	initDeleteAccount__accountSettings()




 });