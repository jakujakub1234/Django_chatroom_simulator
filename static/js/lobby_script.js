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

const bots_nicks = [
    "Michal",
    "Ania",
    "Agnieszka",
    "Arek",
    "Kasia",
    "Piotrek",
    "Bartek"
];

const avatar_svg = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="80px" height="80px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="m 8 1 c -1.65625 0 -3 1.34375 -3 3 s 1.34375 3 3 3 s 3 -1.34375 3 -3 s -1.34375 -3 -3 -3 z m -1.5 7 c -2.492188 0 -4.5 2.007812 -4.5 4.5 v 0.5 c 0 1.109375 0.890625 2 2 2 h 8 c 1.109375 0 2 -0.890625 2 -2 v -0.5 c 0 -2.492188 -2.007812 -4.5 -4.5 -4.5 z m 0 0" fill="#2e3436"/>
</svg>`;

const loading_circle = `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`;

document.getElementById('bot-0').innerHTML = avatar_svg + "<br>" + bots_nicks[0];
document.getElementById('bot-1').innerHTML = avatar_svg + "<br>" + bots_nicks[1];
document.getElementById('bot-2').innerHTML = avatar_svg + "<br>" + data_from_django.nick;

document.getElementById('bot-3').innerHTML = loading_circle;
document.getElementById('bot-4').innerHTML = loading_circle;
document.getElementById('bot-5').innerHTML = loading_circle;
document.getElementById('bot-6').innerHTML = loading_circle;
document.getElementById('bot-7').innerHTML = loading_circle;

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

        document.getElementById('bot-' + users_actual_amount.toString()).innerHTML = avatar_svg + "<br>" + bots_nicks[users_actual_amount-1];
        //if (users_actual_amount < 8) {
        //    document.getElementById('bot-' + (users_actual_amount + 1).toString()).innerHTML = loading_circle;
        //}
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