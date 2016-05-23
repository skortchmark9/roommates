var URL = "https://api.particle.io/v1/devices/54ff72066678574918520767/";
var ACCESS_TOKEN = "eed4f06a335e6cdd895e6a212b0a426ed58138f1";
var GRADUATED = true;

var roommates = [{
  name: "john",
  img:  "img/john.jpg"
}, {
  name: "wilson",
  img:  "img/wilson.jpg"
}, {
  name: "keillor",
  img:  "img/keillor.jpg"
}, {
  name: "jake",
  img:  "img/jake.jpg"
}, {
  name: "jack",
  img:  "img/jack.jpg"
}, {
  name: "giri",
  img:  "img/giri.jpg"
}, {
  name: "sam",
  img:  "img/sam.jpg"
}]

function renderRoommates() {
  var source   = $("#roommate-cards").html();
  var template = Handlebars.compile(source);

  var html = template({roommates: roommates});
  $('#container').append(html);
}

function markAsPresent(number) {
  $('input').each(function(idx, elt) {
    var wasHome = $(elt).prop('checked');
    var homeNow = Boolean(number & (1 << idx));

    if (!wasHome && homeNow) {
      notify(idx);
    }

    $(elt).prop('checked', homeNow);
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
      times.forEach(updateTime);
    }).fail(function() {
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

function poll() {
  getPresence().then(function(resp) {
    var ct = countOnes(resp.result);
    updateCount(ct);
  });

  getTimes();
  setTimeout(poll, 5000);
}


/* Messaging Stuff - Notifications */
function notify(idx) {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    console.error("Your browser does not support notifications");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    createNotification(idx);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        createNotification(idx);
      }
    });
  }

  // At last, if the user has denied notifications, and you 
  // want to be respectful there is no need to bother them any more.
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createNotification(idx) {
  var mate = roommates[idx];
  var n = new Notification(capitalize(mate.name) + "'s home!", {
    body: "A roommate checked in!",
    icon: mate.img
  });
}

$(document).ready(function() {
  renderRoommates();
  $('.card input').each(function(idx, elt) {
    if (GRADUATED) {
      $(elt).prop('checked', false);
    } else {
      $(elt).change(function() {
        toggleRoommate(idx, this);
      });      
    }
  });

  if (!GRADUATED) {
    poll();
  }
})
