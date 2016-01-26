var URL = "https://api.particle.io/v1/devices/54ff72066678574918520767/";
var ACCESS_TOKEN = "eed4f06a335e6cdd895e6a212b0a426ed58138f1";

function markAsPresent(number) {
	$('input').each(function(idx, elt) {
		$(elt).prop('checked', Boolean(number & (1 << idx)));
	});
}

function getPresence() {
	return $.get(URL + 'roommates', {access_token: ACCESS_TOKEN})
		.then(function(resp) {
			markAsPresent(resp.result)
		});
}

function getTimes() {
	return $.get(URL + 'dates', {access_token: ACCESS_TOKEN})
		.then(function(resp) {
			var times = resp.result.split(",");
			console.log(times);
			times.forEach(updateTime);
		});
}

function toggleRoommate(number, elt) {
	$.post(URL + 'led', {
		access_token: ACCESS_TOKEN,
		args: number
	}).then(function(response) {
		$(elt).prop('checked', Boolean(response.return_value));
		updateCount($('input:checked').length);
		var name = $(elt).attr('name');
		updateMessage((response.return_value ? 'Welcome home ' :'Seeya ') + name + '!');
		updateTime('', number);
	});
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

function updateTime(timestamp, idx) {
	console.log(arguments);
	timestamp = timestamp.trim();
	var m = timestamp ? moment(timestamp) : moment();
	$('.last-time').eq(idx).text(m.calendar());
	$('.time-since').eq(idx).text("(" + m.fromNow() + ")");
}

function updateMessage(txt) {
	$('.msg').text(txt).addClass('scroll');
	setTimeout(function() {
    	$('.msg').removeClass('scroll');
	}, 3000);
}

$(document).ready(function() {
	$('.card input').each(function(idx, elt) {
		$(elt).change(function() {
			toggleRoommate(idx, this);
		});
	});

	getPresence().then(function(resp) {
		var ct = countOnes(resp.result);
		updateCount(ct);
	});

	getTimes();
})
