// var xhr = new XMLHttpRequest();
//         xhr.open('GET', 'http://www.omdbapi.com/?t=' + userInput + '&y=&plot=short&r=json', false);
//         xhr.send();

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



