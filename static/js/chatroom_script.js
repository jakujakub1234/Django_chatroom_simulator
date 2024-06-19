function sendMessageHTML(user_name, message, is_bot, respond_message = "", respond_nick = "")
{
    const date = new Date();

    let hour = date.getHours().toString();
    let min = date.getMinutes().toString();
    if (hour.lengt < 2) hour = "0" + hour;
    if (min.length < 2) min = "0" + min;

    var span_class;
    var span_user;

    var extra_class;
    var wrapper_class;
    var respond_class;
    var extra_style;
    
    if (is_bot) {
        span_class = "time-left";
        span_user = `<span alt="Avatar" class="right" style="width:100%; font-style: italic;">` + user_name + `</span>`;

        respond_class = "";
        extra_class = "";
        wrapper_class = "wrapper";
        extra_style = "style=\"background-color: #f7f7f7\"";
    } else {
        span_class = "time-left-user";
        span_user = `<span alt="Avatar" class="right" style="width:100%; font-style: italic; display:none">` + user_name + `</span>`;
        
        respond_class = "container-respond-user";
        wrapper_class = "wrapper-user";
        extra_class = "user-container";
        extra_style = "";
    }

    var new_message = "";

    if (respond_message != "") {
        new_message = `
            <div class="container container-respond ` + respond_class + `">
            <p>Odpowiedź do użytkownika ` + respond_nick + `</p>
                <p>` + respond_message + `</p>
            </div> 
        `;
    }
    
    new_message += `
    <div class="` + wrapper_class + `">

      <div class="container ` + extra_class + `" ` + extra_style + `>
        ` + span_user + `
        <p class="message-p" style="font-size: large; ">` + message + `</p>
        <span class="` + span_class + `">` + hour + ":" + min + `</span>
      </div>

      <div class="container-buttons">
        <button class="respond-button message-button" onclick="respondToMessage(this)">
            <svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M607.856 320.112l-335.536-0.016 138.08-138.272-56.56-56.576L119.248 359.872l234.48 234.512 56.56-56.576-137.856-138.016 335.376 0.016c114.704 0 208.112 93.472 208.112 208.16s-95.92 208-207.92 208v80c160 0 287.92-129.2 287.92-288s-129.264-287.84-288.064-287.84z"/></svg>
        </button>
        <button class="reaction-button message-button">
            <svg class="svg-icon" width="1em" height="1em" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 7.5c0 .169-.01.336-.027.5h1.005A5.5 5.5 0 1 0 8 12.978v-1.005A4.5 4.5 0 1 1 12 7.5zM5.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm2 2.5c.712 0 1.355-.298 1.81-.776l.707.708A3.49 3.49 0 0 1 7.5 10.5a3.49 3.49 0 0 1-2.555-1.108l.707-.708A2.494 2.494 0 0 0 7.5 9.5zm2-2.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm2.5 3h1v2h2v1h-2v2h-1v-2h-2v-1h2v-2z"/></svg>
        </button>
      </div>

    </div>
    `;

    chatroom.innerHTML += new_message;

    window.scroll({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });}

function respondToMessage(el) {
    var message_div = el.parentNode.parentNode.querySelector('.container');

    if (message_div == respond_message_div) {
        respond_message_div = "";

        respond_input_box.style.display = "none";
    } else {
        respond_message_div = message_div;

        respond_input_box.style.display = "block";
        respond_input_box.querySelector("#respond-input-box-nick").innerText = "Odpowiadasz użytkownikowi " + message_div.querySelector(".right").innerText;
        respond_input_box.querySelector("#respond-input-box-message").innerText = message_div.querySelector(".message-p").innerText;
    }

    document.getElementById("msg_field").focus();
    document.getElementById("msg_field").select();
}

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

    var true_responding_bot = "";

    if (respond_message_div == "") {
        sendMessageHTML(user_name, user_message, false);
    } else {
        sendMessageHTML(
            user_name,
            user_message,
            false,
            respond_message_div.querySelector(".message-p").innerText,
            respond_message_div.querySelector(".right").innerText
        );

        true_responding_bot = respond_message_div.querySelector(".right").innerText;
        
        respond_message_div = "";
        respond_input_box.style.display = "none";
    }


    var respond = $.generateRespond(user_message);

    var responding_bot = respond[1];
    respond = respond[0];

    if (true_responding_bot != "" && true_responding_bot != user_name) {
        responding_bot = true_responding_bot;
    }

    responds_queue.push([5, responding_bot, respond, user_message]);

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

var respond_message_div = "";

submitButton.addEventListener("click", sendUserMessage);

const chatroom = document.getElementById("chatroom");
const respond_input_box = document.getElementById("respond-input-box");

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
            true
            //"style=\"background-color: " + colors[bots_messages[seconds_integer][0]] + "\""
        );
    }

    if (responds_queue.length > 0 && responds_queue[0][0] <= 0) {
        var respond = responds_queue.shift();

        sendMessageHTML(
            respond[1],
            respond[2],
            true,
            respond[3],
            user_name
            //"style=\"background-color: " + colors[respond[1]] + "\""
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