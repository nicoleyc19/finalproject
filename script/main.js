$('.js-signup').on('submit', function(e) {
	e.preventDefault();
	let userEmail = $('.js-email').val();
	let userPassword = $('.js-password').val();

console.log( userEmail, userPassword )
	firebase.auth().createUserWithEmailAndPassword(userEmail, userPassword)
		.then(function() {
			window.location = 'sign-in.html';
		})
		.catch(function(error) {
		  // Handle Errors here.
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  // ...

		  alert( errorMessage );
		});
})

$('.js-signin').on('submit', function(e){
	e.preventDefault();
	let userEmail = $('.js-email').val();
	let userPassword = $('.js-password').val();

	firebase.auth().signInWithEmailAndPassword(userEmail, userPassword)
	.then(function() {
		window.location = 'index.html';
	})
	.catch(function(error) {
	  // Handle Errors here.
	  var errorCode = error.code;
	  var errorMessage = error.message;
	  // ...

	  alert( errorMessage );
	});

});

if ( $('.home-page').length ) {
	firebase.auth().onAuthStateChanged(function(user) {
		console.log(user)
	  if (user) {
	    // User is signed in.
	    app( user );

	  } else {
	    // No user is signed in.
	    window.location = 'sign-in.html'
	  }
	});
}

function app( user ) {

	let allData = null;
	const userRef = firebase.database().ref(`users/${user.uid}`);

	function getDataFromFB() {
		return userRef.once('value');
	}

	getDataFromFB().then(function(data) {
		const $container = $('div.js-container');
		console.log( data.val() )
		data = data.val();
		if ( data === null ) return;

		const keys = Object.keys( data );
		for( let j = 0; j < keys.length; j++ ) {
			const currentItem = data[ keys[ j ]  ].data;
			
			const i = currentItem.imdbID;
			const $currentShowCard = generateShowCard( currentItem, i );
			$currentShowCard.insertAfter('.js-last-card');

			const title = currentItem.Title;

			const count = data[ keys[ j ]  ].count;
			const total = data[ keys[ j ] ].total;

			console.log( count, total, $currentShowCard )

			$currentShowCard.attr('data-total', total);
			$currentShowCard.attr('data-current', count);
			updateProgress( $currentShowCard );

			$('.js-episode-button-'+i).click(function() {
				if ( $currentShowCard.find('.js-episode-list').css('display') === 'none' ) {
					$currentShowCard.find('.js-episode-list').slideDown(500)
					return;
				}
				if ( $currentShowCard.find('.js-episode-list').height() > 10 ) {
					$currentShowCard.find('.js-episode-list').slideUp(500);
					$currentShowCard.attr('data-opened-once', true);
					return;
				}

				if ( $currentShowCard.attr('data-opened-once') === "true" ) {
					$currentShowCard.find('.js-episode-list').slideDown(500)
					return;
				}
				
				$currentShowCard.find('.js-episode-list').html('');
				$currentShowCard.find('.js-episode-list').slideDown(500)
				
				grabAllEpisodes( title )
					.then(function(episodes){
						
						
						let total = 0;
						for(let i = 0; i < episodes.length; i ++){
							total += episodes[i].Episodes.length;
							const $seasonList = generateSeasons(episodes[ i ], i);
							$currentShowCard.find('.js-episode-list').append($seasonList);
						}

						console.info( total )

						$currentShowCard.attr('data-total', total);
						$currentShowCard.attr('data-current', 0);

						const seasons = Object.keys( data[ keys[ j ] ].seasons )
						let watched = 0;
						for ( let i = 0; i < seasons.length; i++ ) {
							const currentSeason = seasons[ i ];
							const episodesWatched = Object.keys( data[ keys[ j ] ].seasons[ currentSeason ] );

							for ( let k = 0; k < episodesWatched.length; k++ ) {
								watched++;
								console.log(k, `.js-episode-${currentSeason}-${episodesWatched[ k ]}`);
								$(`.js-episode-${currentSeason}-${episodesWatched[ k ]}`).attr('data-clicked-on', true);
							}
						}

						$currentShowCard.attr('data-current', watched);
						updateProgress( $currentShowCard )
						
					});//grab all episodes
				
			}); // js-episode-button
		} // for loop
	});
	// <-------------------- Website implementation --------------------->
	// get the modals init
	// toggleModal('.search-card', '.ui.search-field');
	// toggleModal('.episode-button', '.episode-list' );

	// init the dropdowns
	// $('.ui.accordion').accordion('close others');

	// on search, hit OMDB for search results
	$('.search-button').click( getSearchResults );

	$('.js-search').click(function() {
		$('.js-search-content').slideDown();
	});
	// <-------------------- FUNCTIONS DEFINED BELOW --------------------->


	function toggleModal( actionSelector, modalSelector ) {
		const $actionEl = $( actionSelector );
		const $modalEl = $( modalSelector );

		$actionEl.click(function() {
			$modalEl.modal('show', 'fade');
		});
	} // toggleModal

	// hit the OMDB api
	function getSearchResults() {
		let userInput = $('.js-search-input').val();
		$.get('https://www.omdbapi.com/?s=' + userInput + '&y=&plot=full&r=json')
			.done(function(data){

				const $container = $('div.js-container');

				// empty the container
				$container.html('');

				for( let i = 0; i < data.Search.length; i++ ) {
					const $currentShowItem = generateShowRow( data.Search[i], i );
					$container.append( $currentShowItem );

					$('.js-choose-'+i).click(function(){
						const title = data.Search[i].Title;
						$.get('https://www.omdbapi.com/?t=' + title + '&y=&plot=short&r=json')
							.done(function(data){
								const $currentShowCard = generateShowCard( data, i );

								firebase.database().ref(`users/${user.uid}/${data.Title}/data`).set(data)
								$currentShowCard.insertAfter('.js-last-card');
								// $('.search-field').modal('hide');
								$('.js-search-content').slideUp(500);

								$('.js-episode-button-'+i).click(function() {
									$('.js-episode-list').html('');
									$('.js-episode-list').slideDown(500)
									
									grabAllEpisodes( title )
										.then(function(episodes){
											
											
											let total = 0;
											for(let i = 0; i < episodes.length; i ++){
												total += episodes[i].Episodes.length;
												console.info( episodes[i])
												const $seasonList = generateSeasons(episodes[ i ], i);
												$('.js-episode-list').append($seasonList);
											}

											console.info( total )

											$currentShowCard.attr('data-total', total);
											$currentShowCard.attr('data-current', 0);

											
										});//grab all episodes
									
								}); // js-episode-button

							}); // done

					}); //.js-choose

				} // for

			});
	} // getSearchResults

	function generateShowCard(show, index){
		const $div = $('<div class="ui segment show-watch mobile-episodes" />')
		if ( show.Poster === 'N/A'){
			show.Poster = '../assets/index.png'
		}
		const htmlString =   `
	            <div class="image">
	                <img class = "show-poster" src="${show.Poster}">
	            </div>
	            <div class="content">
		           
		            <div class="content">
		                <div class="header"><b>${show.Title}</b></div>
		                <div class="description">${show.Plot}</div>
		            </div>
		            
	            </div>
	             <div class="ui tiny progress blue">
		                <div class="bar js-progress-bar episode-progress"></div>
		            </div>
		            <div class="js-episode-list ui"></div>   
	            <div class="ui two bottom attached buttons">
		                <div class="ui blue button js-episode-button-${index}">
		                    <i class="play icon"></i> Episode List
		                </div>
		            </div>
	        </div>`;

	        $div.html( htmlString );

	        return $div;

	}//generateShowCard

	function generateShowRow( show, index ) {
		const $div = $('<div class="item"/>');

		if ( show.Poster === 'N/A' ) {
			show.Poster = 'https://media.giphy.com/media/xiJXFeua9tMqc/giphy.gif'
		}
		const htmlStr = `<div class="image">
			<img src="${show.Poster}">
		</div>
		<div class="content">
			<a class="header">${show.Title}</a>
			<div class="meta">
				<span class="date">${show.Year}</span>
			</div>
			<div class="description">
				<button class = "button ui primary js-choose-${index}">Choose</button>
			</div>
		</div>`;

		$div.html( htmlStr );

		return $div;
	} // generateShowRow

	function grabAllEpisodes( title ) {
		return new Promise((resolve, reject) => {
			$.get('https://www.omdbapi.com/?t=' + title + '&y=&plot=full&r=json')
				.done(function( showData ){
					const totalSeasons = parseInt( showData.totalSeasons, 10 );
					const url = 'https://www.omdbapi.com/?t=' + title + '&y=&plot=full&r=json&season=';
					const getRequests = [];
					// console.log( totalSeasons )
					for( let i = 1; i < totalSeasons + 1; i++ ) {
						const currentUrl = url + i;

						getRequests.push( $.get(currentUrl) );
					}

					$.when( ...getRequests ).done(function( ...rest ) {
						const episodes = rest.map(function( currentData ) {
							return currentData[0];
						});

						resolve( episodes );
					});
				})
		});
	} // grabAllEpisodes

	function generateSeasons(season, index){
		$('.ui.accordion').accordion();
		// console.log( season.Episodes )
		const $div = $('<div class="ui styled fluid accordion" />')
		let htmlStr1 = `
	          <div class="title">
	            <i class="dropdown icon"></i>
	            Season ${season.Season}
	          </div>
	          <div class="content">
	          	<div class="transition hidden">
			  `
			for(let i = 0; i < season.Episodes.length; i++){
				const htmlStr2 = `
				<div class="ui segment segment-pointer js-episode-${index}-${i} episode-listing">	
	            ${season.Episodes[i].Episode} - ${season.Episodes[i].Title}
	            </div>
	          
		`
			$('body').on('click', `.js-episode-${index}-${i}`, function() {

				if ( $( this ).attr('data-clicked-on') === "true" ) {
					return;
				}

				// find the mobile-episodes parent
				const $parent = $( this ).parents('.mobile-episodes');

				getDataFromFB().then(function(data) {
					data = data.val();

					let seasons = data[ season.Title ].seasons;
					if ( typeof seasons === "undefined" ) {
						seasons = {};
					}

					if ( typeof seasons[ index ] === "undefined" ) {
						seasons[ index ] = {};
					}

					seasons[ index ][ i ] = true;

					data[ season.Title ].seasons = seasons;

					let count = data[ season.Title ].count;
					if ( typeof count === "undefined" ) {
						count = 0;
					}
					count++;

					const total = parseInt($parent.attr('data-total'), 10)

					firebase.database().ref(`users/${user.uid}/${season.Title}/seasons`).set(seasons)
					firebase.database().ref(`users/${user.uid}/${season.Title}/count`).set(count)
					firebase.database().ref(`users/${user.uid}/${season.Title}/total`).set(total)

				});


				

				// first get data-current
				const current = $parent.attr('data-current');
				const currentVal = parseInt( current, 10 );
				// add one to data-current
				const newVal = currentVal + 1;
				// update data-current to be new value
				$parent.attr('data-current', newVal);

				updateProgress( $parent );

				$( this ).attr('data-clicked-on', 'true')
			});

			htmlStr1 += htmlStr2;
		}

		htmlStr1 += `</div>
		</div>`;

			  $div.html( htmlStr1 );

			  return $div;
	}//generateSeasons


	function updateProgress( $episode ) {
		console.log("HERE", $episode.find('.js-progress-bar') )
		// get the data-current
		const current = $episode.attr('data-current');
		const currentVal = parseInt( current, 10) ;
		// get the data-total
		const total = $episode.attr('data-total');
		const totalVal = parseInt( total, 10 );

		const percentVal = (currentVal / totalVal) * 100;

		console.log( percentVal )

		$episode.find('.js-progress-bar').css('width', percentVal + '%');
	}


}




