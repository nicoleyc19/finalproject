

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
	$.get('https://www.omdbapi.com/?s=' + userInput + '&y=&plot=short&r=json', false)
		.done(function(data){
			console.log( data );
			for (let i = 0; i < data.Search.length; i++) {
				const div = $('<div/>');
				div.html(`<div class = 'container segment ui'><img class = 'ui image rounded middle aligned' src="${data.Search[i].Poster}"> <b>${data.Search[ i ].Title}</b> - ${data.Search[i].Year}</div>`);
				$('div.js-container').append(div);
			}
			if(typeof data.Search[i].Poster === undefined){
				return "<img src ='../assets/index.png'>"
			};

		});

});



