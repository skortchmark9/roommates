var URL = "https://api.particle.io/v1/devices/54ff72066678574918520767/";
var ACCESS_TOKEN = "eed4f06a335e6cdd895e6a212b0a426ed58138f1";

var roommates = [{
  name: "john",
  img: "https://scontent-lga3-1.xx.fbcdn.net/hphotos-xpl1/v/t1.0-9/12235134_10207223224315541_6578481381795502192_n.jpg?oh=8aa4b158e50d8292acc066b43f30d46c&oe=5744DAC5"
}, {
  name: "wilson",
  img: "https://scontent-lga3-1.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/10418933_10153444318637354_1503719334026912776_n.jpg?oh=ec097536410f298a8cc5502973b230d4&oe=57444326"
}, {
  name: "keillor",
  img: "https://scontent-lga3-1.xx.fbcdn.net/hphotos-xat1/v/t1.0-9/12239664_979233302135971_3740230771862943349_n.jpg?oh=faff4760ac56ce368909c6977e66a042&oe=573F54E9"
}, {
  name: "jake",
  img: "https://scontent-lga3-1.xx.fbcdn.net/hphotos-xtf1/v/t1.0-9/1545548_10205409118331504_4122527430582864375_n.jpg?oh=194099e1984f4587e5ea34f0ef58c645&oe=5731DF8F"
}, {
  name: "jack",
  img: "https://scontent-lga3-1.xx.fbcdn.net/hphotos-xat1/t31.0-8/12593732_1688984238013587_7810453752081299890_o.jpg"
}, {
  name: "giri",
  img: "https://scontent-lga3-1.xx.fbcdn.net/hphotos-xta1/v/t1.0-9/11217976_10153263229330892_6836622202502034979_n.jpg?oh=122c3b7e12231833c19aef20f99438ab&oe=57454A34"
}, {
  name: "sam",
  img: "https://scontent-lga3-1.xx.fbcdn.net/hphotos-xtf1/t31.0-8/11999824_10206356458263921_8411561731393689914_o.jpg"
}]

function renderRoommates() {
  var source   = $("#roommate-cards").html();
  var template = Handlebars.compile(source);

  var html = template({roommates: roommates});
  $('#container').append(html);
}


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

$(document).ready(function() {
  renderRoommates();
  $('.card input').each(function(idx, elt) {
    $(elt).change(function() {
      toggleRoommate(idx, this);
    });
  });

  poll();
})
