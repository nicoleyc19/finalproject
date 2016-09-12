'use strict';

$('.js-signup').on('submit', function (e) {
	e.preventDefault();
	var userEmail = $('.js-email').val();
	var userPassword = $('.js-password').val();

	console.log(userEmail, userPassword);
	firebase.auth().createUserWithEmailAndPassword(userEmail, userPassword).then(function () {
		window.location = 'sign-in.html';
	}).catch(function (error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		// ...

		alert(errorMessage);
	});
});

$('.js-signin').on('submit', function (e) {
	e.preventDefault();
	var userEmail = $('.js-email').val();
	var userPassword = $('.js-password').val();

	firebase.auth().signInWithEmailAndPassword(userEmail, userPassword).then(function () {
		window.location = 'index.html';
	}).catch(function (error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		// ...

		alert(errorMessage);
	});
});

if ($('.home-page').length) {
	firebase.auth().onAuthStateChanged(function (user) {
		console.log(user);
		if (user) {
			// User is signed in.
			app(user);
		} else {
			// No user is signed in.
			window.location = 'sign-in.html';
		}
	});
}

function app(user) {

	var allData = null;
	var userRef = firebase.database().ref('users/' + user.uid);

	function getDataFromFB() {
		return userRef.once('value');
	}

	getDataFromFB().then(function (data) {
		var $container = $('div.js-container');
		console.log(data.val());
		data = data.val();
		if (data === null) return;

		var keys = Object.keys(data);

		var _loop = function _loop(j) {
			var currentItem = data[keys[j]].data;

			var i = currentItem.imdbID;
			var $currentShowCard = generateShowCard(currentItem, i);
			$currentShowCard.insertAfter('.js-last-card');

			var title = currentItem.Title;

			var count = data[keys[j]].count;
			var total = data[keys[j]].total;

			console.log(count, total, $currentShowCard);

			$currentShowCard.attr('data-total', total);
			$currentShowCard.attr('data-current', count);
			updateProgress($currentShowCard);

			$('.js-episode-button-' + i).click(function () {
				if ($currentShowCard.find('.js-episode-list').css('display') === 'none') {
					$currentShowCard.find('.js-episode-list').slideDown(500);
					return;
				}
				if ($currentShowCard.find('.js-episode-list').height() > 10) {
					$currentShowCard.find('.js-episode-list').slideUp(500);
					$currentShowCard.attr('data-opened-once', true);
					return;
				}

				if ($currentShowCard.attr('data-opened-once') === "true") {
					$currentShowCard.find('.js-episode-list').slideDown(500);
					return;
				}

				$currentShowCard.find('.js-episode-list').html('');
				$currentShowCard.find('.js-episode-list').slideDown(500);

				grabAllEpisodes(title).then(function (episodes) {

					var total = 0;
					for (var _i = 0; _i < episodes.length; _i++) {
						total += episodes[_i].Episodes.length;
						var $seasonList = generateSeasons(episodes[_i], _i);
						$currentShowCard.find('.js-episode-list').append($seasonList);
					}

					console.info(total);

					$currentShowCard.attr('data-total', total);
					$currentShowCard.attr('data-current', 0);

					var seasons = Object.keys(data[keys[j]].seasons);
					var watched = 0;
					for (var _i2 = 0; _i2 < seasons.length; _i2++) {
						var currentSeason = seasons[_i2];
						var episodesWatched = Object.keys(data[keys[j]].seasons[currentSeason]);

						for (var k = 0; k < episodesWatched.length; k++) {
							watched++;
							console.log(k, '.js-episode-' + currentSeason + '-' + episodesWatched[k]);
							$('.js-episode-' + currentSeason + '-' + episodesWatched[k]).attr('data-clicked-on', true);
						}
					}

					$currentShowCard.attr('data-current', watched);
					updateProgress($currentShowCard);
				}); //grab all episodes
			}); // js-episode-button
		};

		for (var j = 0; j < keys.length; j++) {
			_loop(j);
		} // for loop
	});
	// <-------------------- Website implementation --------------------->
	// get the modals init
	// toggleModal('.search-card', '.ui.search-field');
	// toggleModal('.episode-button', '.episode-list' );

	// init the dropdowns
	// $('.ui.accordion').accordion('close others');

	// on search, hit OMDB for search results
	$('.search-button').click(getSearchResults);

	$('.js-search').click(function () {
		$('.js-search-content').slideDown();
	});
	// <-------------------- FUNCTIONS DEFINED BELOW --------------------->


	function toggleModal(actionSelector, modalSelector) {
		var $actionEl = $(actionSelector);
		var $modalEl = $(modalSelector);

		$actionEl.click(function () {
			$modalEl.modal('show', 'fade');
		});
	} // toggleModal

	// hit the OMDB api
	function getSearchResults() {
		var userInput = $('.js-search-input').val();
		$.get('https://www.omdbapi.com/?s=' + userInput + '&y=&plot=full&r=json').done(function (data) {

			var $container = $('div.js-container');

			// empty the container
			$container.html('');

			var _loop2 = function _loop2(i) {
				var $currentShowItem = generateShowRow(data.Search[i], i);
				$container.append($currentShowItem);

				$('.js-choose-' + i).click(function () {
					var title = data.Search[i].Title;
					$.get('https://www.omdbapi.com/?t=' + title + '&y=&plot=short&r=json').done(function (data) {
						var $currentShowCard = generateShowCard(data, i);

						firebase.database().ref('users/' + user.uid + '/' + data.Title + '/data').set(data);
						$currentShowCard.insertAfter('.js-last-card');
						// $('.search-field').modal('hide');
						$('.js-search-content').slideUp(500);

						$('.js-episode-button-' + i).click(function () {
							$('.js-episode-list').html('');
							$('.js-episode-list').slideDown(500);

							grabAllEpisodes(title).then(function (episodes) {

								var total = 0;
								for (var _i3 = 0; _i3 < episodes.length; _i3++) {
									total += episodes[_i3].Episodes.length;
									console.info(episodes[_i3]);
									var $seasonList = generateSeasons(episodes[_i3], _i3);
									$('.js-episode-list').append($seasonList);
								}

								console.info(total);

								$currentShowCard.attr('data-total', total);
								$currentShowCard.attr('data-current', 0);
							}); //grab all episodes
						}); // js-episode-button
					}); // done
				}); //.js-choose
			};

			for (var i = 0; i < data.Search.length; i++) {
				_loop2(i);
			} // for
		});
	} // getSearchResults

	function generateShowCard(show, index) {
		var $div = $('<div class="ui segment show-watch mobile-episodes" />');
		if (show.Poster === 'N/A') {
			show.Poster = '../assets/index.png';
		}
		var htmlString = '\n\t            <div class="image">\n\t                <img class = "show-poster" src="' + show.Poster + '">\n\t            </div>\n\t            <div class="content">\n\t\t           \n\t\t            <div class="content">\n\t\t                <div class="header"><b>' + show.Title + '</b></div>\n\t\t                <div class="description">' + show.Plot + '</div>\n\t\t            </div>\n\t\t            \n\t            </div>\n\t             <div class="ui tiny progress blue">\n\t\t                <div class="bar js-progress-bar episode-progress"></div>\n\t\t            </div>\n\t\t            <div class="js-episode-list ui"></div>   \n\t            <div class="ui two bottom attached buttons">\n\t\t                <div class="ui blue button js-episode-button-' + index + '">\n\t\t                    <i class="play icon"></i> Episode List\n\t\t                </div>\n\t\t            </div>\n\t        </div>';

		$div.html(htmlString);

		return $div;
	} //generateShowCard

	function generateShowRow(show, index) {
		var $div = $('<div class="item"/>');

		if (show.Poster === 'N/A') {
			show.Poster = 'https://media.giphy.com/media/xiJXFeua9tMqc/giphy.gif';
		}
		var htmlStr = '<div class="image">\n\t\t\t<img src="' + show.Poster + '">\n\t\t</div>\n\t\t<div class="content">\n\t\t\t<a class="header">' + show.Title + '</a>\n\t\t\t<div class="meta">\n\t\t\t\t<span class="date">' + show.Year + '</span>\n\t\t\t</div>\n\t\t\t<div class="description">\n\t\t\t\t<button class = "button ui primary js-choose-' + index + '">Choose</button>\n\t\t\t</div>\n\t\t</div>';

		$div.html(htmlStr);

		return $div;
	} // generateShowRow

	function grabAllEpisodes(title) {
		return new Promise(function (resolve, reject) {
			$.get('https://www.omdbapi.com/?t=' + title + '&y=&plot=full&r=json').done(function (showData) {
				var _$;

				var totalSeasons = parseInt(showData.totalSeasons, 10);
				var url = 'https://www.omdbapi.com/?t=' + title + '&y=&plot=full&r=json&season=';
				var getRequests = [];
				// console.log( totalSeasons )
				for (var i = 1; i < totalSeasons + 1; i++) {
					var currentUrl = url + i;

					getRequests.push($.get(currentUrl));
				}

				(_$ = $).when.apply(_$, getRequests).done(function () {
					for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
						rest[_key] = arguments[_key];
					}

					var episodes = rest.map(function (currentData) {
						return currentData[0];
					});

					resolve(episodes);
				});
			});
		});
	} // grabAllEpisodes

	function generateSeasons(season, index) {
		$('.ui.accordion').accordion();
		// console.log( season.Episodes )
		var $div = $('<div class="ui styled fluid accordion" />');
		var htmlStr1 = '\n\t          <div class="title">\n\t            <i class="dropdown icon"></i>\n\t            Season ' + season.Season + '\n\t          </div>\n\t          <div class="content">\n\t          \t<div class="transition hidden">\n\t\t\t  ';

		var _loop3 = function _loop3(i) {
			var htmlStr2 = '\n\t\t\t\t<div class="ui segment segment-pointer js-episode-' + index + '-' + i + ' episode-listing">\t\n\t            ' + season.Episodes[i].Episode + ' - ' + season.Episodes[i].Title + '\n\t            </div>\n\t          \n\t\t';
			$('body').on('click', '.js-episode-' + index + '-' + i, function () {

				if ($(this).attr('data-clicked-on') === "true") {
					return;
				}

				// find the mobile-episodes parent
				var $parent = $(this).parents('.mobile-episodes');

				getDataFromFB().then(function (data) {
					data = data.val();

					var seasons = data[season.Title].seasons;
					if (typeof seasons === "undefined") {
						seasons = {};
					}

					if (typeof seasons[index] === "undefined") {
						seasons[index] = {};
					}

					seasons[index][i] = true;

					data[season.Title].seasons = seasons;

					var count = data[season.Title].count;
					if (typeof count === "undefined") {
						count = 0;
					}
					count++;

					var total = parseInt($parent.attr('data-total'), 10);

					firebase.database().ref('users/' + user.uid + '/' + season.Title + '/seasons').set(seasons);
					firebase.database().ref('users/' + user.uid + '/' + season.Title + '/count').set(count);
					firebase.database().ref('users/' + user.uid + '/' + season.Title + '/total').set(total);
				});

				// first get data-current
				var current = $parent.attr('data-current');
				var currentVal = parseInt(current, 10);
				// add one to data-current
				var newVal = currentVal + 1;
				// update data-current to be new value
				$parent.attr('data-current', newVal);

				updateProgress($parent);

				$(this).attr('data-clicked-on', 'true');
			});

			htmlStr1 += htmlStr2;
		};

		for (var i = 0; i < season.Episodes.length; i++) {
			_loop3(i);
		}

		htmlStr1 += '</div>\n\t\t</div>';

		$div.html(htmlStr1);

		return $div;
	} //generateSeasons


	function updateProgress($episode) {
		console.log("HERE", $episode.find('.js-progress-bar'));
		// get the data-current
		var current = $episode.attr('data-current');
		var currentVal = parseInt(current, 10);
		// get the data-total
		var total = $episode.attr('data-total');
		var totalVal = parseInt(total, 10);

		var percentVal = currentVal / totalVal * 100;

		console.log(percentVal);

		$episode.find('.js-progress-bar').css('width', percentVal + '%');
	}
}