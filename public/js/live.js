 $(document).ready(function () {

 	let coreURL = 'dashboard';
 	let entryId = $('.entryContainer__space').attr('data-entryformid');
	let tempId = $('.TemplateId').attr('id');
	let userId = $('.userId').attr('id');
	let username = $('.userId').attr('data-username');

	function initSpaceLikes() {
		$('.likeSpace__liveCurata').off('click');
		$('.likeSpace__liveCurata').on('click', function() {
			let likeButton = $(this);

			// check if user has already liked it

			let likeCountContainer = likeButton.find('.likeCount');
			let likeCountText = likeCountContainer.text();
			let likeCount = parseInt(likeCountText);
			likeCount = likeCount + 1;

			if (likeCount )

			// if no number then...
			// if it is 0 and becomes 1, make span 'Hearts' - s
			// if it is 1 and becomes 2 or more, make span 'Heart' +  s

			likeCountContainer.text(likeCount);

			let spaceId = $('.curataId').attr('data-curataId');

			$.ajax({
				data: {
					userId: userId
				},
				type: 'POST',
				url: '/browse/curatas/' + spaceId + '/addLike',
				success: function(response) {
					// set site count to match db count in case more people have liked it
					likeCountContainer.text(response.newCount);
				},
				error: function(err) {
					likeCount = likeCount - 1;
					likeCountContainer.text(likeCount);
					// display error message
				}
			});
		})
	}
	initSpaceLikes();



 });