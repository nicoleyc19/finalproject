// <-------------------- Website implementation --------------------->
// get the modals init
toggleModal('.search-card', '.ui.search-field');
toggleModal('.episode-button', '.episode-list' );

// init the dropdowns
$('.ui.accordion').accordion();

// on search, hit OMDB for search results
$('.search-button').click( getSearchResults );


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

							$currentShowCard.insertBefore('.js-last-card');
							$('.search-field').modal('hide');

							$('.js-episode-button-'+i).click(function() {
								$('.js-episode-list').html('');
								$('.js-episode-list').modal('show', 'fade')
								
								grabAllEpisodes( title )
									.then(function(episodes){
										
										console.log( episodes, data );
										for(let i = 0; i < episodes.length; i ++){
											const $seasonList = generateSeasons(episodes[ i ]);
											$('.js-episode-list').append($seasonList);
										
										}
										

									});
								
							}); // js-episode-button

						}); // done

				}); //.js-choose

			} // for

		});
} // getSearchResults

function generateShowCard(show, index){
	const $div = $('<div class="ui card show-watch" />')
	if ( show.Poster === 'N/A'){
		show.Poster = '../assets/index.png'
	}
	const htmlString =   `
            <div class="image">
                <img class = "show-poster" src="${show.Poster}">
            </div>
            <div class="ui tiny progress blue">
                <div class="bar"></div>
            </div>
            <div class="content">
                <div class="header">${show.Title}</div>
                <div class="description">${show.Plot}</div>
            </div>
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
	console.log( season.Episodes )

	for(let i = 0; i < season.Episodes.length; i++){
		console.log(season.Episodes[i]);
	}

	const $div = $('<div class="ui styled fluid accordion" />')
	const htmlStr1 = `
          <div class="title">
            <i class="dropdown icon"></i>
            ${season.Season}
            </div>
          <div class="content">
            <p class="transition hidden js-allEpisodes">${season.Episode} - ${season.Title}</p>
          </div>
		  `
		  $div.html( htmlStr1 );

		  return $div;
}//generateSeasons

function generateEpisodes(episodes, index){
	for( let i = 0; i < episodes.Episode.length; i++){
		console.log(episodes.Episode[i]);
	}
}







