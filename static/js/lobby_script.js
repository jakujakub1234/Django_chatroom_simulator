const data_from_django = document.getElementById('data-from-django').dataset;

var translations = JSON.parse(data_from_django.translations.replaceAll("'",'"'));
var start_timestamp = parseInt(data_from_django.startTimestamp);
var lobby_time = parseInt(data_from_django.lobbyTime);

var seconds = Math.floor(Date.now() / 1000) - start_timestamp;

var timer_text = document.getElementById('seconds-counter');
var users_counter = document.getElementById('users-counter');

var users_actual_amount = 2;

var time_to_another_users = translations.bots_lobby_times_to_appear.split(";").map(Number);

const bots_nicks = translations.bots_nicks.split(";");
bots_nicks.splice(1, 0, data_from_django.nick);

const loading_circle = `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`;

createTableWithBotsNames(bots_nicks, loading_circle);

for (let i = 0; i < bots_nicks.length; i++) {
    if (time_to_another_users[i] > seconds) {
        users_counter.innerText = translations.lobby_users_counter + i;
        break;
    }
}

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

function createTableWithBotsNames(bots_nicks, loading_circle)
{
    const cols = 3;
    const table = document.getElementById("bots-table").querySelector("tbody");

    var current_index = 0;

    table.innerHTML = "";

    for (let i = 0; i < bots_nicks.length; i += cols) {
        const row = document.createElement("tr");

        bots_nicks.slice(i, i + cols).forEach(name => {
            const td = document.createElement("td");
            td.id = "bot-" + current_index.toString();

            if (current_index < 2) {
                td.innerHTML = avatar_svg + "<br>" + bots_nicks[current_index];
            }
            else {
                td.innerHTML = loading_circle;
            }

            current_index++;
            row.appendChild(td);
        });

        table.appendChild(row);
    }
}

function incrementSeconds()
{   
    if (seconds > lobby_time) {
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

        document.getElementById('bot-' + (users_actual_amount-1).toString()).innerHTML = avatar_svg + "<br>" + bots_nicks[users_actual_amount-1];
    }

    if (seconds > lobby_time) {
        window.location.href = data_from_django.chatroomUrl;
    }
}

document.getElementById("data-from-django").remove();

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
