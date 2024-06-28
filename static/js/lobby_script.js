/*
TODO*/
var start_timestamp = parseInt(document.getElementById('data-from-django').dataset.startTimestamp);
//var seconds = 0;

var seconds = Math.floor(Date.now() / 1000) - start_timestamp;

var wait_time = 19;

var timer_text = document.getElementById('seconds-counter');
var users_counter = document.getElementById('users-counter');

var users_actual_amount = 2;
var time_to_another_users = [
    0,
    0,
    3,
    4,
    7,
    13,
    15,
];

for (let i = 0; i < 7; i++) {
    if (time_to_another_users[i] > seconds) {
        users_counter.innerText = "lość osób w lobby: " + i;
        break;
    }
}

var data_from_django = document.getElementById('data-from-django').dataset;

function incrementSeconds() {
    seconds += 1;

    if (seconds == 1) {
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
    }

    var seconds_text = " sekund";

    if (seconds == 1) {
        seconds_text = " sekunda";
    } else if (seconds < 5) {
        seconds_text = " sekundy";
    }

    timer_text.innerText = "Czas oczekiwania: " + seconds + seconds_text;

    if (seconds == time_to_another_users[users_actual_amount]) {
        users_actual_amount++;
        users_counter.innerText = "lość osób w lobby: " + users_actual_amount;
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