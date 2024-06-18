function sendMessageHTML(user_name, message, extra_class = "", extra_style = "")
{
    const date = new Date();

    let hour = date.getHours().toString();
    let min = date.getMinutes().toString();
    if (hour.lengt < 2) hour = "0" + hour;
    if (min.length < 2) min = "0" + min;

    var span_class = "time-left";
    var span_user = `<span alt="Avatar" class="right" style="width:100%; font-style: italic;">` + user_name + `</span>`;
    if (extra_style == "") {
        span_class = "time-left-user";
        span_user = ``;
    }
    
    let new_message = `
      <div class="container ` + extra_class + `" ` + extra_style + `>
        ` + span_user + `
          <p style="font-size: large; ">` + message + `</p>
        <span class="` + span_class + `">` + hour + ":" + min + `</span>
      </div>
    `;

    chatroom.innerHTML += new_message;

    window.scroll({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });}

function sendDataToDatabase(action, message, message_time, nick) {
    var async_bool = true;

    if (action == "nick") {
        async_bool = false;
    }

    $.ajax({
        type: "POST",
        url: "../ajax/",
        async: async_bool,
        data: {
            csrfmiddlewaretoken: data_from_django.token,
            action: action,
            message: message,
            message_time: message_time,
            nick: nick
        },
        success: function (response) {
            return response;
        }
    });
}

jQuery.extend({
    generateRespond: function(user_message) {
        var result = null;
        $.ajax({
            type: "GET",
            url: "../ajax/",
            async: false,
            data: {
                csrfmiddlewaretoken: data_from_django.token,
                message: user_message
            },
            success: function (data) {
                result = data.respond;
                responding_bot = data.responding_bot
            }
        });
       return [result, responding_bot];
    }
});

function sendUserMessage() {
    var user_message = document.getElementById("msg_field").value;
    document.getElementById("msg_field").value = "";

    if (user_message === null || user_message.match(/^ *$/) !== null) {
        return;
    }

    sendMessageHTML(user_name, user_message, "user-container");

    var respond = $.generateRespond(user_message);

    var responding_bot = respond[1];
    respond = respond[0];

    responds_queue.push([5, responding_bot, respond]);

    sendDataToDatabase("message", user_message, Math.ceil(seconds), user_name);
}

function printTimeToLeftChat(time_to_left_chat) //TODO będzie można usunąć
{
    var new_time = "Czas do zakończenia czatu: "
    var minutes_to_end = Math.floor(time_to_left_chat / 60);
    var seconds_to_end = time_to_left_chat % 60;

    if (minutes_to_end > 0) {
        var minutes_text = " minut";

        if (minutes_to_end == 1) {
            minutes_text = " minuta";
        }
        else if (minutes_to_end < 5) {
            minutes_text = " minuty";
        }

        new_time += minutes_to_end + " " + minutes_text;
    }

    if (seconds_to_end > 0) {
        var seconds_text = " sekund";

        if (seconds_to_end == 1) {
            seconds_text = " sekunda";
        }
        else if (seconds_to_end < 5) {
            seconds_text = " sekundy";
        }

        if (minutes_to_end > 0) {
            new_time += " i ";
        }

        new_time += seconds_to_end + " " + seconds_text;
    }

    seconds_counter.innerText = new_time;
}

var data_from_django = document.getElementById('data-from-django').dataset;
var user_name = data_from_django.nick;
var end_chat_alert_displayed = false;

/*
TODO*/
var start_timestamp = parseInt(document.getElementById('data-from-django').dataset.startTimestamp);
//var seconds = Math.floor(Date.now() / 1000) - start_timestamp;

var seconds = 0;

var seconds_counter = document.getElementById('seconds-counter');
var submitButton = document.querySelector("#btn-submit")

const colors = {
    "Ania": "aquamarine",
    "Kasia": "beige",
    "Piotrek": "silver",
    "Agnieszka": "darkseagreen",
    "Michal": "powderblue",
    "Arek": "thistle",
    "Bartek": "tan",
}

var bots_names = Object.keys(colors);

var responds_queue = [];

submitButton.addEventListener("click", sendUserMessage);

const chatroom = document.getElementById("chatroom");

sendDataToDatabase("nick", "", "", user_name);

document.getElementById("msg_field").focus();
document.getElementById("msg_field").select();

function incrementSeconds() {
    if (seconds > 30) {
        return;
    }

    if (document.getElementById("msg_field").value != "") {
        seconds += 0.5;
    } else {
        seconds ++;
    }

    var seconds_integer = Math.ceil(seconds);

    responds_queue.every((respond) => respond[0]--);

    var users_typing = [];

    for (var i = 16; i > 0; i--) {
        if (seconds_integer + i in bots_messages) {
            if (!users_typing.includes(bots_messages[seconds_integer + i][0])) {
                users_typing.push(bots_messages[seconds_integer + i][0]);
            }
        }
    }

    responds_queue.forEach((respond) => {
        if (!users_typing.includes(respond[1])) {
            users_typing.push(respond[1]);
        }
    });

    var typing_text = " pisze";

    if (users_typing.length > 1) {
        typing_text = " piszą";
    }

    typing_text = users_typing.join(", ") + typing_text;
    typing_text = typing_text.replace(/,([^,]*)$/, " i" + '$1');

    if (users_typing.length > 0) {
        document.getElementById("stage").style.display = "block";
        document.getElementById("user-writing").innerHTML = typing_text;
    } else {
        document.getElementById("stage").style.display = "none";
    }

    if (seconds_integer in bots_messages) {
        sendMessageHTML(
            bots_messages[seconds_integer][0],
            bots_messages[seconds_integer][1],
            "",
            //"style=\"background-color: " + colors[bots_messages[seconds_integer][0]] + "\""
            "style=\"background-color: #f7f7f7\""
        );
    }

    if (responds_queue.length > 0 && responds_queue[0][0] <= 0) {
        var respond = responds_queue.shift();

        sendMessageHTML(
            respond[1],
            respond[2],
            "",
            //"style=\"background-color: " + colors[respond[1]] + "\""
            "style=\"background-color: #f7f7f7\""
        );
    }

    var time_to_left_chat = 270 - seconds_integer;

    printTimeToLeftChat(time_to_left_chat);

    if (time_to_left_chat == 30 && !end_chat_alert_displayed) {
        end_chat_alert_displayed = true;
        openDialog();
    }

    if (time_to_left_chat < 0) {
        window.location.href = data_from_django.endUrl;
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

function openDialog() {
    const element = document.getElementById("dialog-box");
    element.open = true;
  }
  
  function closeDialog() {
    const element = document.getElementById("dialog-box");
    element.open = false;
  }