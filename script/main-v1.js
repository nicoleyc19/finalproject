

// var xhr = new XMLHttpRequest();
//          xhr.open('GET', 'http://www.omdbapi.com/?t=' + userInput + '&y=&plot=short&r=json', false);
//          xhr.send();



$('.search-card').click(function(){
	$('.ui.search-field')
  	.modal('show', 'fade');
})

$('.episode-button').click(function(){
	$('.episode-list')
	.modal('show', 'fade');
})

$('.ui.dropdown')
  .dropdown()
;

$('.search-button').click(function(){
	let userInput = $('.js-search-input').val();
	$.get('https://www.omdbapi.com/?s=' + userInput + '&y=&plot=full&r=json', false)
		.done(function(data){
			$('div.js-container').html('');
			console.log( data );
			for (let i = 0; i < data.Search.length; i++) {
				const div = $('<div class="item"/>');
				if ( data.Search[i].Poster === 'N/A' ) {
					data.Search[i].Poster = 'https://media.giphy.com/media/SKhY68jqzkQFO/giphy.gif'
				}

				const htmlStr = `
	<div class="image">
	  <img src="${data.Search[i].Poster}">
	</div>
    <div class="content">
      <a class="header">${data.Search[ i ].Title}</a>
      <div class="meta">
        <span class="date">${data.Search[i].Year}</span>
      </div>
      <div class="description">
        <button class = "button ui primary js-choose-${i}">Choose</button>
      </div>
    </div>`;
				div.html( htmlStr );
				$('div.js-container').append(div);

				$('.js-choose-'+i).click(function(){
					alert(i);
				});
			};



		});
});




