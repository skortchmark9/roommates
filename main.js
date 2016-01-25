var URL = "https://api.particle.io/v1/devices/54ff72066678574918520767/";
var ACCESS_TOKEN = "eed4f06a335e6cdd895e6a212b0a426ed58138f1";

function markAsPresent(number) {
	$('.roommate').each(function(idx, elt) {
		$(elt).toggleClass('home', Boolean(number & (1 << idx)));
	});
}

function getPresence() {
	return $.get(URL + 'roommates', {access_token: ACCESS_TOKEN})
		.then(function(resp) {
			markAsPresent(resp.result)
		});
}

function toggleRoommate(number, elt) {
	$.post(URL + 'led', {
		access_token: ACCESS_TOKEN,
		args: number
	}).then(function(response) {
		$(elt).toggleClass('home', Boolean(response.return_value));
		updateCount($('.home').length);
		var name = $(elt).find('img').attr('class');
		updateMessage((response.return_value ? 'Welcome home ' :'Seeya ') + name + '!');

	}.bind(this));
}

function countOnes(n) {
    var count = 0
    while (n > 0) {
	        count++;
	        n &= (n-1)
	}
    return count
}

function updateCount(ct) {
	$('.occ-count').text(ct);
}

function updateMessage(txt) {
	$('.msg').text(txt).addClass('scroll');
	setTimeout(function() {
    	$('.msg').removeClass('scroll');
	}, 3000);
}

$(document).ready(function() {
	$('.roommate').each(function(idx, elt) {
		$(elt).click(function() {
			toggleRoommate(idx, this);
		});
	});

	getPresence().then(function(resp) {
		var ct = countOnes(resp.result);
		updateCount(ct);
	});
})
