var translations = JSON.parse(document.getElementById('data-from-django').dataset.translations.replaceAll("'",'"'));

function sendMessageHTML(sending_user_name, message, is_bot, respond_message = "", respond_nick = "", is_respond_to_user=false, is_curiosity_question = false)
{
    prev_prev_message = prev_message;
    prev_message = current_message;

    current_message = "";
    
    if (is_curiosity_question) {
        current_message = "EXTRA: ";
    } else if (!is_bot) {
        current_message = "PARTICIPANT: ";
    } else if (is_respond_to_user) {
        current_message = "BOT_REPLY: ";
    } else {
        current_message = "STABLE: ";
    }

    current_message += message;

    const date = new Date();

    let hour = date.getHours().toString();
    let min = date.getMinutes().toString();
    if (hour.lengt < 2) hour = "0" + hour;
    if (min.length < 2) min = "0" + min;

    var span_class;
    var span_user;

    var extra_class;
    var reactions_container_class;
    var reaction_modal_id;
    var wrapper_class;
    var respond_class;
    var extra_style;
    var message_id;
    var report_modal_box = "";
    
    if (is_bot) {
        span_class = "time-left";
        span_user = `<span alt="Avatar" class="right span-bot">` + sending_user_name + `</span>`;

        reactions_container_class = "reactions-container";
        reaction_modal_id = "reactions-modal";
        respond_class = "";
        extra_class = "";
        wrapper_class = "wrapper";
        //extra_style = "style=\"background-color: #f7f7f7\"";
        //extra_style = "style=\"background-color: " + colors[sending_user_name] + "\""
        extra_style = "";

        message_id = bots_message_id;
        bots_message_id++;

        if (!is_respond_to_user) {
            draft_bots_message_id++;
            dict_draft_message_id_to_message_id[draft_bots_message_id-1] = bots_message_id-1;
        }

        report_modal_box = `<button class="report-button message-button" onclick="openReportModal(this)">
            <svg class="svg-icon svg-icon-main" width="1em" height="1em" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.852 14.372h10.325c1.14 0 1.852 -0.819 1.852 -1.852 0 -0.309 -0.081 -0.624 -0.248 -0.912L9.609 2.597c-0.349 -0.611 -0.96 -0.939 -1.59 -0.939 -0.624 0 -1.241 0.329 -1.597 0.939l-5.173 9.017a1.775 1.775 0 0 0 -0.248 0.906c0 1.033 0.718 1.852 1.852 1.852m0.014 -1.053c-0.47 0 -0.779 -0.382 -0.779 -0.799 0 -0.121 0.02 -0.262 0.088 -0.402l5.166 -9.011c0.148 -0.255 0.416 -0.376 0.678 -0.376s0.516 0.114 0.664 0.376l5.166 9.017c0.067 0.135 0.1 0.275 0.1 0.396 0 0.416 -0.322 0.799 -0.785 0.799Zm5.152 -3.469c0.322 0 0.51 -0.188 0.516 -0.537l0.094 -3.536c0.007 -0.342 -0.262 -0.597 -0.617 -0.597 -0.362 0 -0.617 0.248 -0.611 0.59l0.087 3.543c0.006 0.342 0.195 0.537 0.53 0.537m0 2.18c0.389 0 0.724 -0.309 0.724 -0.697 0 -0.396 -0.329 -0.698 -0.724 -0.698 -0.396 0 -0.725 0.309 -0.725 0.698 0 0.382 0.335 0.697 0.725 0.697"/></svg>
        </button>`;

    } else {
        span_class = "time-left-user";
        span_user = `<span alt="Avatar" class="right" style="width:100%; font-style: italic; display:none">` + sending_user_name + `</span>`;
     
        reactions_container_class = "reactions-container-user";
        reaction_modal_id = "reactions-modal-user";
        respond_class = "container-respond-user";
        wrapper_class = "wrapper-user";
        extra_class = "user-container";
        extra_style = "";
        
        message_id = users_message_id;
        users_message_id--;
    }

    var new_message = "";

    if (respond_message != "") {
        new_message = `
            <div class="container container-respond ` + respond_class + `">
            <p>` + translations.chatroom_respond_to_user + ` ` + respond_nick + `</p>
                <p>` + respond_message + `</p>
            </div> 
        `;
    }
    
    new_message += `
    <div class="` + wrapper_class + `">

      <div class="container ` + extra_class + `" ` + extra_style + `>
        ` + span_user + `
        <p data-index="` + message_id + `" class="message-p">` + message + `</p>
        <span class="` + span_class + `">` + hour + ":" + min + `</span>

        <div class="reactions-container_scr ` + reactions_container_class + `">
        </div>
      </div>

      <div class="container-buttons">
        <button class="respond-button message-button" onclick="respondToMessage(this)">
            <svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: white;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M607.856 320.112l-335.536-0.016 138.08-138.272-56.56-56.576L119.248 359.872l234.48 234.512 56.56-56.576-137.856-138.016 335.376 0.016c114.704 0 208.112 93.472 208.112 208.16s-95.92 208-207.92 208v80c160 0 287.92-129.2 287.92-288s-129.264-287.84-288.064-287.84z"/></svg>
        </button>
        <button class="reaction-button message-button" onclick="openReactionsModal(this)">
            <svg class="svg-icon svg-icon-main" width="1em" height="1em" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 7.5c0 .169-.01.336-.027.5h1.005A5.5 5.5 0 1 0 8 12.978v-1.005A4.5 4.5 0 1 1 12 7.5zM5.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm2 2.5c.712 0 1.355-.298 1.81-.776l.707.708A3.49 3.49 0 0 1 7.5 10.5a3.49 3.49 0 0 1-2.555-1.108l.707-.708A2.494 2.494 0 0 0 7.5 9.5zm2-2.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm2.5 3h1v2h2v1h-2v2h-1v-2h-2v-1h2v-2z"/></svg>
        </button>

        ` + report_modal_box + `

        <div class="reactions-modal" id="` + reaction_modal_id + `">
            <button class="like-button message-button" onclick="addReaction(this, 0)">
            ` + like_svg + `
            </button>
            <button class="heart-button message-button" onclick="addReaction(this, 1)">
            ` + heart_svg + `
            </button>
            <button class="angry-button message-button" onclick="addReaction(this, 2)">
            ` + angry_svg + `
            </button>
        </div>

        <div class="report-modal" id="report-modal-id">
            <h3 style="color: black">` + translations.chatroom_report_title + `</h3>
            <button class="report-button" id="report-button" onclick="addReport(this, 0)">
            ` + translations.chatroom_report_respect_text + `
            </button>
            <button class="report-button" id="report-button" onclick="addReport(this, 1)">
            ` + translations.chatroom_report_hostile_text + `
            </button>
            <button class="report-button" id="report-button" onclick="addReport(this, 2)">
            ` + translations.chatroom_report_misinformation_text + `
            </button>
        </div>

      </div>
    </div>
    `;

    chatroom.innerHTML += new_message;

    window.scroll({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });

    xd(font_size_change);
    xd2(0);
}

function respondToMessage(el) {
    var message_div = el.parentNode.parentNode.querySelector('.container');

    if (message_div == respond_message_div) {
        respond_message_div = "";

        respond_input_box.style.display = "none";
    } else {
        respond_message_div = message_div;

        respond_input_box.style.display = "block";
        respond_input_box.querySelector("#respond-input-box-nick").innerText = translations.chatroom_user_responding_to + " " + message_div.querySelector(".right").innerText;
        respond_input_box.querySelector("#respond-input-box-message").innerText = message_div.querySelector(".message-p").innerText;
    }

    document.getElementById("msg_field").focus();
}

function closeAllModals() {
    var all_modals = document.getElementsByClassName('reactions-modal');
    
    for (var i = 0; i < all_modals.length; ++i) {
        all_modals[i].style.display = "none";  
    }

    all_modals = document.getElementsByClassName('report-modal');
    
    for (var i = 0; i < all_modals.length; ++i) {
        all_modals[i].style.display = "none";  
    }

}

function openReactionsModal(el) {
    closeAllModals();

    var modal = el.parentNode.querySelector('.reactions-modal');

    if (modal == opened_modal) {
        opened_modal = "";

        return;
    }

    modal.style.display = "inherit";
    opened_modal = modal;
}

function openReportModal(el) {
    closeAllModals();

    var modal = el.parentNode.querySelector('.report-modal');

    if (modal == opened_modal) {
        opened_modal = "";

        return;
    }

    modal.style.display = "inherit";
    opened_modal = modal;
}

function addReaction(el, emotion_id) {
    /*
        EMOTIONS ID:
            0 -> like
            1 -> heart
            2 -> angry
    */
    var span_id = ["like-user", "heart-user", "angry-user"][emotion_id];
    var svg = [like_svg, heart_svg, angry_svg][emotion_id];

    var reactions_container = el.parentNode.parentNode.parentNode.querySelector(".reactions-container_scr");
    var message_id = el.parentNode.parentNode.parentNode.querySelector(".message-p").dataset.index;

    var reaction = reactions_container.querySelector("#" + span_id);

    if (reaction) {
        reaction.remove();

        switch (emotion_id) {
            case 0:
                like_reactions_memory.delete(message_id);
                break;
            case 1:
                heart_reactions_memory.delete(message_id);
                break;
            case 2:
                angry_reactions_memory.delete(message_id);
                break;
        }
    } else {
        reactions_container.innerHTML += "<span id=" + span_id + ">" + svg + "</span>";

        switch (emotion_id) {
            case 0:
                like_reactions_memory.add(message_id);
                break;
            case 1:
                heart_reactions_memory.add(message_id);
                break;
            case 2:
                angry_reactions_memory.add(message_id);
                break;
        }
    }
}

function addReport(el, report_id) {
    /*
        REPORT ID:
            0 -> message contains content with is not respectful
            1 -> message contains hostile and agressive content
            2 -> message spreads misinformation
    */
    
    // TODO dodac logowanie do bazy i (moze) usuwanie wiadomosci

    report_box.open = true;
    closeAllModals();
}

function addBotReaction(el_id, emotion_id) {
    /*
        EMOTIONS ID:
            0 -> like
            1 -> heart
            2 -> angry
    */
    var span_id = ["like-user-bot", "heart-user-bot", "angry-user-bot"][emotion_id];
    var svg = [like_svg, heart_svg, angry_svg][emotion_id];

    var message_elem = document.querySelector("[data-index='" + el_id + "']");

    var reactions_container = message_elem.parentNode.querySelector(".reactions-container_scr");

    reactions_container.innerHTML += "<span id=" + span_id + ">" + svg + "</span>";
}

function sendDataToDatabase(action, message, message_time, nick, respond_message_id = 0, bot_response) {
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
            prev_message: prev_message,
            prev_prev_message: prev_prev_message,
            bot_response: bot_response,
            message_time: message_time,
            nick: nick,
            respond_message_id: respond_message_id,
            typing_time: typing_time
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
                message: user_message,
                prev_message_id: draft_bots_message_id
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

    if (user_message.match(/\w+/g).length > 1) {
        users_long_messages_counter++;
        
        curiosity_question_sended = true;
    }

    is_user_typing = false;

    if (user_message === null || user_message.match(/^ *$/) !== null) {
        return;
    }

    var true_responding_bot = "";
    var respond_message_id = 0;

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

        respond_message_id = respond_message_div.querySelector(".message-p").dataset.index;

        true_responding_bot = respond_message_div.querySelector(".right").innerText;
        
        respond_message_div = "";
        respond_input_box.style.display = "none";
    }

    var respond = $.generateRespond(user_message);

    var responding_bot = respond[1];
    respond = respond[0];

    if (respond != "") {
        if (true_responding_bot != "" && true_responding_bot != user_name) {
            responding_bot = true_responding_bot;
        }

        var times = [0, 2, 2, 3, 3, 7, 7, 9, 10, 10, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12];

        if (!respond.includes("{{NEW_MESSAGE}}")) {
            var respond_len = 1;
            
            if (respond.match(/\w+/g) != null) {
                respond_len = respond.match(/\w+/g).length;
            }

            responds_queue.push([times[respond_len], responding_bot, respond, user_message]);

        } else {
            var respond = respond.split("{{NEW_MESSAGE}}");

            var respond_len = 1;
            
            if (respond[0].match(/\w+/g) != null) {
                respond_len = respond[0].match(/\w+/g).length;
            }

            responds_queue.push([times[respond_len], responding_bot, respond[0], user_message]);

            respond_len = 1;

            if (respond[1].match(/\w+/g) != null) {
                respond_len = respond[1].match(/\w+/g).length;
            }

            responds_queue.push([times[respond_len] + 4, responding_bot, respond[1], user_message]);
        }

        responds_queue.sort((a, b) => a[0] - b[0]);
    }

    if (users_long_messages_counter > 0 && users_long_messages_counter % 2 == 0 && user_message.match(/\w+/g).length > 1) {
        reactions_queue.push([3, users_message_id+1, 0]);
    }

    var respond_to_save_to_db = respond;

    if (respond_to_save_to_db == "") {
        respond_to_save_to_db = "NONE";
    }

    sendDataToDatabase("message", user_message, Math.ceil(seconds), user_name, respond_message_id, respond_to_save_to_db);

    typing_time = 0;
}

function printTimeToLeftChat(time_to_left_chat)
{
    var new_time = translations.chatroom_time_to_end + " ";
    var minutes_to_end = Math.floor(time_to_left_chat / 60);
    var seconds_to_end = time_to_left_chat % 60;

    if (minutes_to_end > 0) {
        var minutes_text = translations.minutes_many;

        if (minutes_to_end == 1) {
            minutes_text = translations.minutes_singular;
        }
        else if (minutes_to_end < 5) {
            minutes_text = translations.minutes_few;
        }

        new_time += minutes_to_end + " " + minutes_text;
    }

    if (seconds_to_end > 0) {
        var seconds_text = translations.seconds_many;

        if (seconds_to_end == 1) {
            seconds_text = translations.seconds_singular;
        }
        else if (seconds_to_end < 5) {
            seconds_text =  translations.seconds_few;
        }

        if (minutes_to_end > 0) {
            new_time += " " + translations.and + " ";
        }

        new_time += seconds_to_end + " " + seconds_text;
    }

    seconds_counter.innerText = new_time;
}

var data_from_django = document.getElementById('data-from-django').dataset;
var user_name = data_from_django.nick;
var end_chat_alert_displayed = false;

var start_timestamp = parseInt(document.getElementById('data-from-django').dataset.startTimestamp);
//var seconds = 0;

var seconds = Math.floor(Date.now() / 1000) - start_timestamp;

var is_positive = document.getElementById('data-from-django').dataset.isPositive;

bots_messages = [];

if (is_positive == "True") {
    bots_messages = positive_bots_messages;
} else {
    bots_messages = negative_bots_messages;
}

var seconds_counter = document.getElementById('seconds-counter');
var submitButton = document.querySelector("#btn-submit");
var msgField = document.querySelector("#msg_field");

const bots_nicks = translations.bots_nicks.split(";");

const only_colors = [
    "#000080",
    "#272757",
    "#305CDE",
    "#B5C7EB",
    "#909EAE",
    "#B3EBF2"
]

var colors = {};

for (let i = 0; i < bots_nicks.length; i++) {
    colors[bots_nicks[i]] = only_colors[i];
}

var bots_message_id = 1;
var draft_bots_message_id = 1;
var users_message_id = -1;
var like_reactions_memory = new Set();
var heart_reactions_memory = new Set();
var angry_reactions_memory = new Set();

var seconds_messages_sent = new Set();

var hesitation = 0;
var mouse_movement_seconds = 0;
var scroll_seconds = 0;
var input_seconds = 0;

var mouse_movement_sleep = false;
var scroll_sleep = false;
var is_user_typing = false;
var typing_time = 0;

var users_long_messages_counter = 0;
var curiosity_question_sended = false;

const heart_svg = `<?xml version="1.0" encoding="iso-8859-1"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg class="svg-icon" fill="#000000" width="1em" height="1em" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 471.701 471.701" xml:space="preserve">
<g>
	<path d="M433.601,67.001c-24.7-24.7-57.4-38.2-92.3-38.2s-67.7,13.6-92.4,38.3l-12.9,12.9l-13.1-13.1
		c-24.7-24.7-57.6-38.4-92.5-38.4c-34.8,0-67.6,13.6-92.2,38.2c-24.7,24.7-38.3,57.5-38.2,92.4c0,34.9,13.7,67.6,38.4,92.3
		l187.8,187.8c2.6,2.6,6.1,4,9.5,4c3.4,0,6.9-1.3,9.5-3.9l188.2-187.5c24.7-24.7,38.3-57.5,38.3-92.4
		C471.801,124.501,458.301,91.701,433.601,67.001z M414.401,232.701l-178.7,178l-178.3-178.3c-19.6-19.6-30.4-45.6-30.4-73.3
		s10.7-53.7,30.3-73.2c19.5-19.5,45.5-30.3,73.1-30.3c27.7,0,53.8,10.8,73.4,30.4l22.6,22.6c5.3,5.3,13.8,5.3,19.1,0l22.4-22.4
		c19.6-19.6,45.7-30.4,73.3-30.4c27.6,0,53.6,10.8,73.2,30.3c19.6,19.6,30.3,45.6,30.3,73.3
		C444.801,187.101,434.001,213.101,414.401,232.701z"/>
</g>
</svg>`;

const like_svg = `<?xml version="1.0" encoding="iso-8859-1"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg class="svg-icon" fill="#000000" width="1em" height="1em" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 490.1 490.1" xml:space="preserve">
<g>
	<path d="M201.9,21.018c-18.6,13.6-28,36.9-28,69v76.2H68.3c-37.6,0-68.3,30.6-68.3,68.3v2.1c0,0.6,0.1,1.3,0.2,1.9l28.1,176.5
		c5.2,42.4,34.8,66.8,81.1,66.8h209.2c37.6,0,68.3-30.6,68.3-68.3v-196.1c0-5.9,4.8-10.7,10.7-10.7h57.3c5.9,0,10.7,4.8,10.7,10.7
		v207.9c0,5.9-4.8,10.7-10.7,10.7h-33.1c-6.8,0-12.3,5.5-12.3,12.3s5.5,12.3,12.3,12.3h33.1c19.4,0,35.2-15.8,35.2-35.2v-208
		c0-19.4-15.8-35.2-35.2-35.2h-57.3c-13.8,0-25.8,8-31.6,19.6c-0.8-0.5-1.7-0.8-2.7-1.1c-3.3-0.9-81.4-23.8-81.4-91.2v-85.6
		c0-5.4-3.5-10.1-8.6-11.7C271.7,11.718,231.3-0.582,201.9,21.018z M356.8,224.218c1.9,0.5,3.8,0.6,5.6,0.2v189.1
		c0,24.1-19.6,43.8-43.8,43.8h-66.4H109.4c-34,0-53.1-15.2-56.9-45.7l-28-176v-1.1c0-24.1,19.6-43.8,43.8-43.8h117.9
		c6.8,0,12.3-5.5,12.3-12.3v-88.4c0-23.9,6-40.4,17.9-49.2c12.9-9.6,30.7-8.7,41.1-7v75.6
		C257.5,195.418,352.7,223.118,356.8,224.218z"/>
</g>
</svg>`;

const angry_svg = `<?xml version="1.0" encoding="iso-8859-1"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg class="svg-icon" width="1em" height="1em" fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 295.996 295.996" xml:space="preserve">
<g>
	<path d="M147.998,0C66.392,0,0,66.392,0,147.998c0,81.606,66.392,147.998,147.998,147.998c81.606,0,147.998-66.392,147.998-147.998
		C295.996,66.392,229.604,0,147.998,0z M147.998,279.996c-36.257,0-69.143-14.696-93.023-38.44
		c-9.536-9.482-17.631-20.41-23.934-32.42C21.442,190.847,16,170.047,16,147.998C16,75.214,75.214,16,147.998,16
		c34.523,0,65.987,13.328,89.533,35.102c12.208,11.288,22.289,24.844,29.558,39.996c8.27,17.239,12.907,36.538,12.907,56.9
		C279.996,220.782,220.782,279.996,147.998,279.996z"/>
	<circle cx="98.666" cy="114.998" r="16"/>
	<circle cx="197.666" cy="114.998" r="16"/>
	<path d="M214.247,202.729c1.227,2.176,2.358,4.438,3.363,6.724l14.648-6.436c-1.218-2.771-2.589-5.513-4.075-8.148
		c-17.022-30.189-50.399-48.544-85.014-46.744c-34.383,1.779-65.563,23.325-79.435,54.892l14.648,6.438
		c11.461-26.08,37.215-43.881,65.613-45.351C172.568,162.618,200.18,177.782,214.247,202.729z"/>
	<rect x="97.331" y="67.997" transform="matrix(0.8104 0.5859 -0.5859 0.8104 66.0127 -51.9888)" width="32" height="16.001"/>
	<rect x="174.663" y="59.997" transform="matrix(0.5859 0.8104 -0.8104 0.5859 137.2266 -116.5569)" width="16.001" height="32"/>
</g>
</svg>`;

var bots_names = Object.keys(colors);

var responds_queue = [];
var reactions_queue = [];
var dict_draft_message_id_to_message_id = {};

var respond_message_div = "";
var opened_modal = "";

var prev_prev_message = "NONE";
var prev_message = "NONE";
var current_message = "NONE";

var end_chatroom = false;

submitButton.addEventListener("click", sendUserMessage);

const chatroom = document.getElementById("chatroom");
const respond_input_box = document.getElementById("respond-input-box");
const dialog_box = document.getElementById("dialog-box");
const report_box = document.getElementById("report-box");

//sendDataToDatabase("nick", "", "", user_name);

document.getElementById("msg_field").focus();

function incrementSeconds() {
    if (seconds > 490) {
        return;
    }

    mouse_movement_sleep = false;
    scroll_sleep = false;

    if (document.getElementById("msg_field").value != "") {
        seconds ++;
        input_seconds++;
        is_user_typing = true;
        typing_time++;
    } else {
        seconds ++;

        if (is_user_typing) {
            hesitation++;
            is_user_typing = false;
        }

        typing_time = 0;
    }

    var seconds_integer = Math.ceil(seconds);

    responds_queue.every((respond) => respond[0]--);
    reactions_queue.every((reaction) => reaction[0]--);

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

    var typing_text = " " + translations.chatroom_user_singular_typing_text;

    if (users_typing.length > 1) {
        typing_text = " " + translations.chatroom_user_plural_typing_text;
    }

    typing_text = users_typing.join(", ") + typing_text;
    typing_text = typing_text.replace(/,([^,]*)$/, " i" + '$1');

    if (users_typing.length > 0) {
        document.getElementById("stage").style.display = "block";
        document.getElementById("user-writing").innerHTML = typing_text;
    } else {
        document.getElementById("stage").style.display = "none";
    }

    if (seconds_integer in bots_messages && !seconds_messages_sent.has(seconds_integer)) {
        sendMessageHTML(
            bots_messages[seconds_integer][0],
            bots_messages[seconds_integer][1],
            true,
            bots_messages[seconds_integer][3] ?? "",
            bots_messages[seconds_integer][2] ?? "",
            //"style=\"background-color: " + colors[bots_messages[seconds_integer][0]] + "\""
        );

        seconds_messages_sent.add(seconds_integer);

        if (bots_messages[seconds_integer][4] != "") {
            emojis_ids = bots_messages[seconds_integer][4].split(',');
            emojis_times = bots_messages[seconds_integer][5].split(',');

            for (var i = 0; i < emojis_ids.length; i++) {
                reactions_queue.push([emojis_times[i], dict_draft_message_id_to_message_id[draft_bots_message_id-1], emojis_ids[i]]);
            }
        }
    }

    while (responds_queue.length > 0 && responds_queue[0][0] <= 0) {
        var respond = responds_queue.shift();

        var respond_len = 1;
        
        if (respond[2].match(/\w+/g) != null) {
            respond_len = respond[2].match(/\w+/g).length;
        }

        sendMessageHTML(
            respond[1],
            respond[2],
            true,
            respond[3],
            user_name,
            true
        );

        /*
        if (respond_len > 5) {
            sendMessageHTML(
                respond[1],
                respond[2],
                true,
                respond[3],
                user_name,
                true
            );
        } else {
            sendMessageHTML(
                respond[1],
                respond[2],
                true,
                "",
                "",
                true
            );
        }*/
    }

    if (!curiosity_question_sended && draft_bots_message_id == 29) {
        curiosity_question_sended = true;

        curiosity_question = [
            translations.ai_curiosity_question_1.replace("{nick}", user_name),
            translations.ai_curiosity_question_2.replace("{nick}", user_name)
        ][0];

        sendMessageHTML(
            bots_names[1],
            curiosity_question,
            true,
            "",
            "",
            false,
            true
        );
    }

    while (reactions_queue.length > 0 && reactions_queue[0][0] <= 0) {
        var reaction = reactions_queue.shift();

        addBotReaction(reaction[1], reaction[2]);
    }

    var time_to_left_chat = 490 - seconds_integer;

    printTimeToLeftChat(time_to_left_chat);

    if (time_to_left_chat == 7*60 || time_to_left_chat == 2*60) {
        end_chat_alert_displayed = true;

        var minutes = Math.floor(time_to_left_chat / 60);
        var minutes_text = translations.minutes_many;

        if (minutes < 5) {
            minutes_text = translations.minutes_few;
        }
        if (minutes == 1) {
            minutes_text = translations.minutes_singular;
        }

        dialog_box.querySelector("p").innerText = translations.chatroom_end_dialog_text + " " + minutes.toString() + " " + minutes_text;
        openDialog();
    }

    if (false && time_to_left_chat == 30 && !end_chat_alert_displayed) {
        end_chat_alert_displayed = true;
        dialog_box.querySelector("p").innerText = translations.chatroom_end_dialog_text + " 30 " + translations.seconds_many;
        openDialog();
    }

    if (time_to_left_chat == 0) {
        end_chatroom = true;
        $.ajax({
            type: "POST",
            url: "../ajax/",
            async: true,
            data: {
                csrfmiddlewaretoken: data_from_django.token,
                action: "like_reactions",
                reactions: Array.from(like_reactions_memory).join(' ')
            },
            success: function (response) {
                return response;
            }
        });

        $.ajax({
            type: "POST",
            url: "../ajax/",
            async: true,
            data: {
                csrfmiddlewaretoken: data_from_django.token,
                action: "heart_reactions",
                reactions: Array.from(heart_reactions_memory).join(' ')
            },
            success: function (response) {
                return response;
            }
        });

        $.ajax({
            type: "POST",
            url: "../ajax/",
            async: true,
            data: {
                csrfmiddlewaretoken: data_from_django.token,
                action: "angry_reactions",
                reactions: Array.from(angry_reactions_memory).join(' ')
            },
            success: function (response) {
                return response;
            }
        });

        $.ajax({
            type: "POST",
            url: "../ajax/",
            async: true,
            data: {
                csrfmiddlewaretoken: data_from_django.token,
                action: "interactions",
                hesitation: hesitation,
                mouse_movement_seconds: mouse_movement_seconds,
                scroll_seconds: scroll_seconds,
                input_seconds: input_seconds,
                is_chatroom_finished: 1
            },
            success: function (response) {
                return response;
            }
        });

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

window.addEventListener("mousemove", (e) => {
    if (!mouse_movement_sleep) {
        mouse_movement_seconds++;
        mouse_movement_sleep = true;
    }
});

window.addEventListener("scroll", (e) => {
    if (!scroll_sleep) {
        scroll_seconds++;
        scroll_sleep = true;
    }
});

window.addEventListener('beforeunload', function(e) {
    if (end_chatroom) {
        return;
    }

    $.ajax({
        type: "POST",
        url: "../ajax/",
        async: true,
        data: {
            csrfmiddlewaretoken: data_from_django.token,
            action: "like_reactions",
            reactions: Array.from(like_reactions_memory).join(' ')
        },
        success: function (response) {
            return response;
        }
    });

    $.ajax({
        type: "POST",
        url: "../ajax/",
        async: true,
        data: {
            csrfmiddlewaretoken: data_from_django.token,
            action: "heart_reactions",
            reactions: Array.from(heart_reactions_memory).join(' ')
        },
        success: function (response) {
            return response;
        }
    });

    $.ajax({
        type: "POST",
        url: "../ajax/",
        async: true,
        data: {
            csrfmiddlewaretoken: data_from_django.token,
            action: "angry_reactions",
            reactions: Array.from(angry_reactions_memory).join(' ')
        },
        success: function (response) {
            return response;
        }
    });

    $.ajax({
        type: "POST",
        url: "../ajax/",
        async: true,
        data: {
            csrfmiddlewaretoken: data_from_django.token,
            action: "interactions",
            hesitation: hesitation,
            mouse_movement_seconds: mouse_movement_seconds,
            scroll_seconds: scroll_seconds,
            input_seconds: input_seconds,
            is_chatroom_finished: 0
        },
        success: function (response) {
            return response;
        }
    });

    hesitation = 0;
    mouse_movement_seconds = 0;
    scroll_seconds = 0;
    input_seconds = 0;

    e.preventDefault();
    e.returnValue = translations.chatroom_leaving_page_warning;

    return translations.chatroom_leaving_page_warning;
  });

function openDialog() {
    dialog_box.open = true;
}

function closeDialog() {
    dialog_box.open = false;
}

function closeReportDialog() {
    report_box.open = false;
}


function closeRespond() {
    respond_message_div = "";
    respond_input_box.style.display = "none";
}

var input = document.getElementById("myInput");

msgField.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    submitButton.click();
  }
});

// TODO prototyp
var xdd = document.querySelector("#change-font-size");
var font_size_change = 0;
xdd.addEventListener("change", function() {
    const selectedIndex = xdd.selectedIndex;
    xd(selectedIndex);
  });

function xd(change_index) {
    font_size_change = change_index;

    var ele = document.getElementsByClassName('time-left');
    for (var i = 0; i < ele.length; i++) {
        if (font_size_change == 0) {
            ele[i].style.fontSize = "10pt";
        }
        if (font_size_change == 1) {
            ele[i].style.fontSize = "13pt";
        }
        if (font_size_change == 2) {
            ele[i].style.fontSize = "16pt";
        }
    }

    ele = document.getElementsByClassName('time-left-user');
    for (var i = 0; i < ele.length; i++) {
        if (font_size_change == 0) {
            ele[i].style.fontSize = "10pt";
        }
        if (font_size_change == 1) {
            ele[i].style.fontSize = "13pt";
        }
        if (font_size_change == 2) {
            ele[i].style.fontSize = "16pt";
        }
    }

    ele = document.getElementsByClassName('container-respond');
    for (var i = 0; i < ele.length; i++) {
        if (font_size_change == 0) {
            ele[i].style.fontSize = "10pt";
        }
        if (font_size_change == 1) {
            ele[i].style.fontSize = "13pt";
        }
        if (font_size_change == 2) {
            ele[i].style.fontSize = "16pt";
        }
    }

    ele = document.getElementsByClassName('message-p');
    for (var i = 0; i < ele.length; i++) {
        if (font_size_change == 0) {
            ele[i].style.fontSize = "13.5pt";
        }
        if (font_size_change == 1) {
            ele[i].style.fontSize = "16.5pt";
        }
        if (font_size_change == 2) {
            ele[i].style.fontSize = "19.5pt";
        }
    }

    ele = document.getElementsByClassName('span-bot');
    for (var i = 0; i < ele.length; i++) {
        if (font_size_change == 0) {
            ele[i].style.fontSize = "12pt";
        }
        if (font_size_change == 1) {
            ele[i].style.fontSize = "15pt";
        }
        if (font_size_change == 2) {
            ele[i].style.fontSize = "17pt";
        }
    }
}

var xdd2 = document.querySelector("#btn-prototype-2");
xdd2.addEventListener("click", function() {
    xd2(1);
  });
//var layouts = ["linear-gradient(to top, #cfd9df 0%, #a6dfff 100%)", "linear-gradient(to top, #1e2323 0%, #274455 100%)"];
var layouts = ["#FFFFFF", "#222222"];
var msg_field_colors = ["#f3f3f5", "aliceblue"]
var xd_colors = ["black", "white"];
var act_layout = 1;

function xd2(change_index) {
    act_layout = (act_layout + change_index) % 2;

    //document.body.style.backgroundImage = layouts[act_layout];
    document.body.style.backgroundColor = layouts[act_layout];
    //document.body.style.color = xd_colors[act_layout];
    msgField.style.background = msg_field_colors[act_layout];

    ele = document.getElementsByClassName('svg-icon');
    for (var i = 0; i < ele.length; i++) {
        ele[i].style.fill = xd_colors[act_layout];
    }

    document.getElementById("user-writing").style.color = xd_colors[act_layout];
    document.getElementById("header-text").style.color = xd_colors[act_layout];
}
