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
	console.log( season.Episodes )
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
	// get the data-current
	const current = $episode.attr('data-current');
	const currentVal = parseInt( current, 10) ;
	// get the data-total
	const total = $episode.attr('data-total');
	const totalVal = parseInt( total, 10 );

	const percentVal = (currentVal / totalVal) * 100;

	$episode.find('.js-progress-bar').css('width', percentVal + '%');
}







