var translations = JSON.parse(document.getElementById('data-from-django').dataset.translations.replaceAll("'",'"'));

var start_timestamp = parseInt(document.getElementById('data-from-django').dataset.startTimestamp);

var seconds = Math.floor(Date.now() / 1000) - start_timestamp;

var wait_time = 14;

var timer_text = document.getElementById('seconds-counter');
var users_counter = document.getElementById('users-counter');

var users_actual_amount = 2;
var time_to_another_users = [
    0,
    3,
    4,
    7,
    13,
];

for (let i = 0; i < 6; i++) {
    if (time_to_another_users[i] > seconds) {
        users_counter.innerText = translations.lobby_users_counter + i;
        break;
    }
}

var data_from_django = document.getElementById('data-from-django').dataset;

const bots_nicks = translations.bots_nicks.split(";");
const loading_circle = `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`;

document.getElementById('bot-0').innerHTML = avatar_svg + "<br>" + bots_nicks[0];
document.getElementById('bot-1').innerHTML = avatar_svg + "<br>" + data_from_django.nick;

document.getElementById('bot-2').innerHTML = loading_circle;
document.getElementById('bot-3').innerHTML = loading_circle;
document.getElementById('bot-4').innerHTML = loading_circle;
document.getElementById('bot-5').innerHTML = loading_circle;
//document.getElementById('bot-6').innerHTML = loading_circle;

$.ajax({
    type: "POST",
    url: "../ajax/",
    async: true,
    data: {
        csrfmiddlewaretoken: data_from_django.token,
        action: "nick",
        nick: data_from_django.nick
    },
    success: function (response) {
        return response;
    }
});

function incrementSeconds() {   
    if (seconds > wait_time) {
        return;
    }

    seconds += 1;

    var seconds_text = " " + translations.seconds_many;

    if (seconds == 1) {
        seconds_text = " " + translations.seconds_singular;
    } else if (seconds < 5) {
        seconds_text = " " + translations.seconds_few;
    }

    timer_text.innerText = translations.lobby_timer + seconds + seconds_text;

    while (seconds >= time_to_another_users[users_actual_amount-1]) {
        users_actual_amount++;
        users_counter.innerText = translations.lobby_users_counter + users_actual_amount;

        document.getElementById('bot-' + (users_actual_amount-1).toString()).innerHTML = avatar_svg + "<br>" + bots_nicks[users_actual_amount-2];
    }

    if (seconds > wait_time) {
        window.location.href = document.getElementById('data-from-django').dataset.chatroomUrl;
    }
}

incrementSeconds();
setInterval(incrementSeconds, 1000);

// Reload on browser "previous" button
window.addEventListener( "pageshow", function ( event ) {
    var historyTraversal = event.persisted || 
                           ( typeof window.performance != "undefined" && 
                                window.performance.navigation.type === 2 );
    if ( historyTraversal ) {
      window.location.reload();
    }
});