var translations = JSON.parse(document.getElementById('data-from-django').dataset.translations.replaceAll("'",'"'));

var data_from_django = document.getElementById('data-from-django').dataset;
var user_name = data_from_django.nick;

var start_timestamp = parseInt(document.getElementById('data-from-django').dataset.startTimestamp);
var seconds = Math.floor(Date.now() / 1000) - start_timestamp;

var bots_messages = [];

if (document.getElementById('data-from-django').dataset.isPositive == "RESPECT") {
    //console.log("positive_bots_messages file");
    bots_messages = positive_bots_messages;
} else if (document.getElementById('data-from-django').dataset.isPositive == "NONRESPECT") {
    //console.log("negative_bots_messages file");
    bots_messages = negative_bots_messages;
} else {
    //console.log("control_bots_messages file");
    bots_messages = control_bots_messages;
}

const seconds_counter = document.getElementById('seconds-counter');
const submit_button = document.querySelector("#btn-submit");
const msg_field = document.querySelector("#msg_field");

var respect_reports_dict = {};
var hostile_reports_dict = {};

var reports_messages_size = 4;

for (let i = 0; i < bots_nicks.length; i++) {
    respect_reports_dict[bots_nicks[i]] = 0;
    hostile_reports_dict[bots_nicks[i]] = 0;
}

respect_reports_dict[user_name] = -99999;

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

var font_size_change = 0;
var act_layout = 1;

var responds_queue = [];
var reactions_queue = [];
var reports_remove_messages_queue = [];
var dict_draft_message_id_to_message_id = {};

var respond_message_div = "";
var opened_modal = "";

var prev_prev_message = "NONE";
var prev_message = "NONE";
var current_message = "NONE";

var seconds_from_last_message = 0;
var exit_poll_after_vote_seconds = 0;
var exit_poll_votings_possible_seconds = 0;
var exit_poll_opened = false;
var exit_poll_buttons_visible = false;
var exit_poll_user_voted = false;
var chatroom_poll_percantage = 50;

var chatroom_speed = parseInt(data_from_django.chatSpeedHidden);
var not_exit_chatroom_at_the_end = parseInt(data_from_django.notExitChatHidden) == 1;
var dont_scroll_chat_after_message = parseInt(data_from_django.dontScrollChatHidden) == 1;
var no_user_interaction = parseInt(data_from_django.noUserInteractionHidden) == 1;

var end_chatroom = false;

var last_user_msg_timestamp = -1000;
var last_curse_timestamp = -1000;

submit_button.addEventListener("click", sendUserMessage);

const chatroom = document.getElementById("chatroom");
const respond_input_box = document.getElementById("respond-input-box");
const dialog_box = document.getElementById("dialog-box");
const report_box = document.getElementById("report-box");
const change_font_size_button = document.querySelector("#change-font-size");
const change_color_button = document.querySelector("#change-color-button");

msg_field.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      submit_button.click();
    }
});

change_font_size_button.addEventListener("change", function() {
    const selectedIndex = change_font_size_button.selectedIndex;
    change_font_size(selectedIndex);
});

change_color_button.addEventListener("click", function() {
    change_layout_color(1);
});

// TODO remove chatroom interactions 
//sendDataToDatabase("nick", "", "", user_name);

document.getElementById("msg_field").focus();

jQuery.extend({
    generateRespond: function(user_message, message_timestamp, callback) {
        $.ajax({
            type: "GET",
            url: "../ajax/",
            async: true,
            data: {
                csrfmiddlewaretoken: data_from_django.token,
                message: user_message,
                prev_message_id: draft_bots_message_id,
                message_timestamp: message_timestamp
            },
            success: function (data) {
                callback(data.respond, data.respond_type, data.responding_bot);
            }
        });
    }
});

function sendDataThroughAjax(async, data)
{
    $.ajax({
        type: "POST",
        url: "../ajax/",
        async: async,
        data: data,
        success: function (response) {
            return response;
        }
    });
}

function sendDataThroughBeacon(data) {
    // Use FormData since sendBeacon prefers it for POST
    const formData = new FormData();
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            formData.append(key, data[key]);
        }
    }
    navigator.sendBeacon("../ajax/", formData);
}

function createAndSendMessageHTML(
    sending_user_name,
    message,
    is_bot,
    respond_message = "",
    respond_nick = "",
    is_respond_to_user = false,
    is_curiosity_question = false,
    is_moderator = false 
){
    prev_prev_message = prev_message;
    prev_message = current_message;

    current_message = "";
    
    if (is_curiosity_question) {
        current_message = "EXTRA: ";
    } else if (!is_bot) {
        current_message = "PARTICIPANT: ";
    } else if (is_respond_to_user) {
        current_message = "BOT_REPLY: ";
    } else if (is_moderator) {
        current_message = "MODERATOR: ";
    } else {
        current_message = "STABLE: ";
    }

    current_message += message;

    const date = new Date();

    let hour = date.getHours().toString();
    let min = date.getMinutes().toString();
    
    if (hour.length < 2) {
        hour = "0" + hour;
    }

    if (min.length < 2) {
        min = "0" + min;
    }

    var message_id;
    
    if (is_bot) {
        message_id = bots_message_id;
        bots_message_id++;

        if (!is_respond_to_user) {
            draft_bots_message_id++;
            dict_draft_message_id_to_message_id[draft_bots_message_id-1] = bots_message_id-1;
        }

    } else {             
        message_id = users_message_id;
        users_message_id--;
    }

    var outside_message_wrapper = document.createElement("div");
    outside_message_wrapper.classList.add(is_bot ? "wrapper-outside" : "wrapper-user-outside");

    if (respond_message != "") {
        var respond_container = document.createElement("div");
        respond_container.classList.add("container", "container-respond");
        if (!is_bot) {
            respond_container.classList.add("container-respond-user");
        }

        var respond_header = document.createElement("p");
        respond_header.textContent = translations.chatroom_respond_to_user + " " + respond_nick;

        var respond_text = document.createElement("p");
        respond_text.textContent = respond_message;

        respond_container.appendChild(respond_header);
        respond_container.appendChild(respond_text);

        outside_message_wrapper.appendChild(respond_container);
    }

    var message_wrapper = document.createElement("div");
    message_wrapper.classList.add(is_bot ? "wrapper" : "wrapper-user");

    var message_container = document.createElement("div");
    message_container.classList.add("container");
    if (!is_bot) {
        message_container.classList.add("user-container");
    }

    var nick_span = document.createElement("span");
    nick_span.classList.add("right", "span-bot");
    if (is_moderator) {
        nick_span.classList.add("moderator-nick");
    }
    nick_span.textContent = sending_user_name;

    var message_text = document.createElement("p");
    message_text.classList.add("message-p");
    message_text.setAttribute("data-index", message_id);
    message_text.textContent = message;

    var time_span = document.createElement("span");
    time_span.classList.add(is_bot ? "time-left" : "time-left-user");
    time_span.textContent = hour + ":" + min;

    var reactions_container = document.createElement("div");
    reactions_container.classList.add("reactions-container_scr", is_bot ? "reactions-container" : "reactions-container-user");

    if (is_bot) {
        message_container.appendChild(nick_span);
    }

    message_container.appendChild(message_text);
    message_container.appendChild(time_span);
    message_container.appendChild(reactions_container);

    message_wrapper.appendChild(message_container);

    var buttons_container = document.createElement("div");
    buttons_container.classList.add("container-buttons");
    
    var respond_button =  document.createElement("button");
    respond_button.classList.add("respond-button", "message-button");
    respond_button.addEventListener("click", (event) => respondToMessage(event.currentTarget));
    respond_button.innerHTML = respond_svg;

    if (no_user_interaction) {
        respond_button.classList.add("hidden");
    }

    var reaction_button =  document.createElement("button");
    reaction_button.classList.add("reaction-button", "message-button");
    reaction_button.addEventListener("click", (event) => openOrCloseModal(event.currentTarget, "reactions"));
    reaction_button.innerHTML = reaction_svg;

    if (no_user_interaction) {
        reaction_button.classList.add("hidden");
    }

    var report_button =  document.createElement("button");
    report_button.classList.add("report-button", "message-button");
    report_button.addEventListener("click", (event) => openOrCloseModal(event.currentTarget, "report"));
    report_button.innerHTML = report_svg;

    var reactions_modal = document.createElement("div");
    reactions_modal.classList.add("reactions-modal");
    reactions_modal.id = is_bot ? "reactions-modal" : "reactions-modal-user";

    var like_button =  document.createElement("button");
    like_button.classList.add("like-button", "message-button");
    like_button.addEventListener("click", (event) => addReaction(event.currentTarget, LIKE_REACTION_ID));
    like_button.innerHTML = like_svg;

    var heart_button =  document.createElement("button");
    heart_button.classList.add("heart-button", "message-button");
    heart_button.addEventListener("click", (event) => addReaction(event.currentTarget, HEART_REACTION_ID));
    heart_button.innerHTML = heart_svg;

    var angry_button =  document.createElement("button");
    angry_button.classList.add("angry-button", "message-button");
    angry_button.addEventListener("click", (event) => addReaction(event.currentTarget, ANGRY_REACTION_ID));
    angry_button.innerHTML = angry_svg;

    reactions_modal.appendChild(like_button);
    reactions_modal.appendChild(heart_button);
    reactions_modal.appendChild(angry_button);

    var report_modal = document.createElement("div");
    report_modal.classList.add("report-modal");
    report_modal.id = "report-modal-id";

    var report_modal_header = document.createElement("h3");
    report_modal_header.style.color = "black";
    report_modal_header.innerText = translations.chatroom_report_title;

    var report_respect_button =  document.createElement("button");
    report_respect_button.classList.add("report-button");
    report_respect_button.id = "report-button";
    report_respect_button.addEventListener("click", (event) => addReport(event.currentTarget, RESPECT_REPORT_ID_OR_RESPECT_NORM_CONFIRMED_ID));
    report_respect_button.innerText = translations.chatroom_report_respect_text;

    var report_hostile_button =  document.createElement("button");
    report_hostile_button.classList.add("report-button");
    report_hostile_button.id = "report-button";
    report_hostile_button.addEventListener("click", (event) => addReport(event.currentTarget, HOSTILE_REPORT_ID_OR_RESPECT_NORM_DENY_ID));
    report_hostile_button.innerText = translations.chatroom_report_hostile_text;

    /*
    var report_misinformation_button =  document.createElement("button");
    report_misinformation_button.classList.add("report-button");
    report_misinformation_button.id = "report-button";
    report_misinformation_button.addEventListener("click", (event) => addReport(event.currentTarget, MISINFORMATION_REPORT_ID));
    report_misinformation_button.innerText = translations.chatroom_report_misinformation_text;
    */

    report_modal.appendChild(report_modal_header);
    report_modal.appendChild(report_respect_button);
    report_modal.appendChild(report_hostile_button);
    //report_modal.appendChild(report_misinformation_button);

    buttons_container.appendChild(respond_button);
    buttons_container.appendChild(reaction_button);
    
    if (is_bot) {
        buttons_container.appendChild(report_button);
    }

    buttons_container.appendChild(reactions_modal);
    buttons_container.appendChild(report_modal);

    message_wrapper.appendChild(buttons_container);
    outside_message_wrapper.appendChild(message_wrapper);

    chatroom.appendChild(outside_message_wrapper);

    if (!dont_scroll_chat_after_message) {

        if (message_id % 2 == 0 || true) {
            window.scroll({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    change_font_size(font_size_change);
    change_layout_color(0);
}

function respondToMessage(message_dom) {
    var message_div = message_dom.parentNode.parentNode.querySelector('.container');

    if (message_div == respond_message_div) {
        respond_message_div = "";

        respond_input_box.style.display = "none";
    } else {
        respond_message_div = message_div;

        respond_input_box.style.display = "block";
        respond_input_box.querySelector("#respond-input-box-nick").innerText = translations.chatroom_user_responding_to; 
        respond_input_box.querySelector("#respond-input-box-nick").innerText += " " + message_div.querySelector(".right").innerText;
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

function openOrCloseModal(button_dom, modal_type) {
    closeAllModals();

    var modal = button_dom.parentNode.querySelector(`.${modal_type}-modal`);

    if (modal == opened_modal) {
        opened_modal = "";

        return;
    }

    modal.style.display = "inherit";
    opened_modal = modal;
}

function addReaction(reaction_button_dom, emotion_id) {
    var span_id = ["like-user", "heart-user", "angry-user"][emotion_id];
    var svg = [like_svg, heart_svg, angry_svg][emotion_id];

    var reactions_container = reaction_button_dom.parentNode.parentNode.parentNode.querySelector(".reactions-container_scr");
    var message_id = reaction_button_dom.parentNode.parentNode.parentNode.querySelector(".message-p").dataset.index;

    var reaction = reactions_container.querySelector("#" + span_id);

    if (reaction) {
        reaction.remove();

        switch (emotion_id) {
            case LIKE_REACTION_ID:
                like_reactions_memory.delete(message_id);
                break;
            case HEART_REACTION_ID:
                heart_reactions_memory.delete(message_id);
                break;
            case ANGRY_REACTION_ID:
                angry_reactions_memory.delete(message_id);
                break;
        }

    } else {
        reactions_container.innerHTML += "<span id=" + span_id + ">" + svg + "</span>";

        switch (emotion_id) {
            case LIKE_REACTION_ID:
                like_reactions_memory.add(message_id);
                break;
            case HEART_REACTION_ID:
                heart_reactions_memory.add(message_id);
                break;
            case ANGRY_REACTION_ID:
                angry_reactions_memory.add(message_id);
                break;
        }
    }
}

function addReport(report_button_dom, report_id) {
    var random_time = Math.floor(Math.random() * (25 - 15 + 1)) + 15;

    report_box.open = true;
    closeAllModals();

    var message_id = report_button_dom.parentNode.parentNode.parentNode.parentNode.querySelector(".message-p").dataset.index;
    var bot_nick = report_button_dom.parentNode.parentNode.parentNode.parentNode.querySelector(".span-bot").innerText;
    var message_text = report_button_dom.parentNode.parentNode.parentNode.parentNode.querySelector(".message-p").innerText;

    sendDataThroughAjax(true, {
        csrfmiddlewaretoken: data_from_django.token,
        action: "reports",
        message_id: message_id,
        message_text: message_text,
        report_id, report_id
    });

    reports_remove_messages_queue.push([random_time, message_id, bot_nick, report_id]);
    reports_remove_messages_queue.sort((a, b) => a[0] - b[0]);
}

function addBotReaction(message_dom, emotion_id) {
    var span_id = ["like-user-bot", "heart-user-bot", "angry-user-bot"][emotion_id];
    var svg = [like_svg, heart_svg, angry_svg][emotion_id];

    var message_elem = document.querySelector("[data-index='" + message_dom + "']");

    var reactions_container = message_elem.parentNode.querySelector(".reactions-container_scr");

    reactions_container.innerHTML += "<span id=" + span_id + ">" + svg + "</span>";
}

function sendDataToDatabase(action, message, message_time, nick, respond_message_id = 0, bot_response) {
    sendDataThroughAjax(action != "nick", {
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
    });
}

function sendUserMessage() {
    var user_message = document.getElementById("msg_field").value;
    document.getElementById("msg_field").value = "";

    var is_curse = false;

    for (var word of user_message.replace(/[^\w\s\']|_/g, "").replace(/\s+/g, " ").toLowerCase().split(" ")) {
        if (curse_words.has(word) && Math.ceil(seconds) - last_curse_timestamp > 60) {
            is_curse = true;

            last_curse_timestamp = Math.ceil(seconds);

            var random_time = Math.floor(Math.random() * (25 - 15 + 1)) + 15;

            reports_remove_messages_queue.push([random_time, -1, user_name, RESPECT_REPORT_ID_OR_RESPECT_NORM_CONFIRMED_ID]);
            reports_remove_messages_queue.sort((a, b) => a[0] - b[0]);
        }
    }

    if (user_message.match(/\w+/g).length > 1) {
        users_long_messages_counter++;
        
        curiosity_question_sended = true;
    }

    is_user_typing = false;

    if (user_message === null || user_message.match(/^ *$/) !== null) {
        return;
    }

    var respond_message_id = 0;

    if (respond_message_div == "") {
        createAndSendMessageHTML(user_name, user_message, false);
    } else {
        createAndSendMessageHTML(
            user_name,
            user_message,
            false,
            respond_message_div.querySelector(".message-p").innerText,
            respond_message_div.querySelector(".right").innerText
        );

        respond_message_id = respond_message_div.querySelector(".message-p").dataset.index;
        
        respond_message_div = "";
        respond_input_box.style.display = "none";
    }

    if (is_curse) {
        sendDataToDatabase("message", user_message, Math.ceil(seconds), user_name, respond_message_id, "NONE");

        return;
    }

    if (Math.ceil(seconds) - last_user_msg_timestamp < 4) {
        console.log("TOO SOON!");
        return;
    }

    last_user_msg_timestamp = Math.ceil(seconds);

    $.generateRespond(user_message, Math.ceil(seconds), function(respond, respond_type, responding_bot) {
        if (respond && respond != "") {
            var times = [0, 4, 4, 5, 5, 7, 7, 9, 10, 10, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12];

            if (!respond.includes("{{NEW_MESSAGE}}")) {
                var respond_len = 1;
                
                if (respond.match(/\w+/g) != null) {
                    respond_len = respond.match(/\w+/g).length;
                }

                respond_len = Math.min(respond_len, 12);

                responds_queue.push([times[respond_len], responding_bot, respond, user_message]);

            } else {
                var respond = respond.split("{{NEW_MESSAGE}}");

                var respond_len = 1;
                
                if (respond[0].match(/\w+/g) != null) {
                    respond_len = respond[0].match(/\w+/g).length;
                }

                respond_len = Math.min(respond_len, 12);

                responds_queue.push([times[respond_len], responding_bot, respond[0], user_message]);

                respond_len = 1;

                if (respond[1].match(/\w+/g) != null) {
                    respond_len = respond[1].match(/\w+/g).length;
                }

                respond_len = Math.min(respond_len, 12);

                responds_queue.push([times[respond_len] + 4, responding_bot, respond[1], user_message]);
            }

            responds_queue.sort((a, b) => a[0] - b[0]);

            if (users_long_messages_counter > 0 && users_long_messages_counter % 2 == 0 && user_message.match(/\w+/g).length > 1) {
                reactions_queue.push([3, users_message_id+1, 0]);
            }

            var respond_to_save_to_db = respond_type + ": " + respond;

            if (respond_to_save_to_db == "") {
                respond_to_save_to_db = "NONE";
            }

            sendDataToDatabase("message", user_message, Math.ceil(seconds), user_name, respond_message_id, respond_to_save_to_db);

            typing_time = 0;
        }
    });
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

function sendReactionsAndInteractionsData(is_chatroom_finished_1_0)
{
    // sendDataThroughAjax(true, {
    //     csrfmiddlewaretoken: data_from_django.token,
    //     action: "like_reactions",
    //     reactions: Array.from(like_reactions_memory).join(' ')
    // });

    // sendDataThroughAjax(true, {
    //     csrfmiddlewaretoken: data_from_django.token,
    //     action: "heart_reactions",
    //     reactions: Array.from(heart_reactions_memory).join(' ')
    // });

    // sendDataThroughAjax(true, {
    //     csrfmiddlewaretoken: data_from_django.token,
    //     action: "angry_reactions",
    //     reactions: Array.from(angry_reactions_memory).join(' ')
    // });

    sendDataThroughBeacon( {
        csrfmiddlewaretoken: data_from_django.token,
        action: "interactions",
        hesitation: hesitation,
        mouse_movement_seconds: mouse_movement_seconds,
        scroll_seconds: scroll_seconds,
        input_seconds: input_seconds,
        is_chatroom_finished: is_chatroom_finished_1_0,
        chatroom_exit_time: seconds
    });

    // sendDataThroughAjax(true, {
    //     csrfmiddlewaretoken: data_from_django.token,
    //     action: "interactions",
    //     hesitation: hesitation,
    //     mouse_movement_seconds: mouse_movement_seconds,
    //     scroll_seconds: scroll_seconds,
    //     input_seconds: input_seconds,
    //     is_chatroom_finished: is_chatroom_finished_1_0,
    //     chatroom_exit_time: seconds
    // });
}

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

function change_font_size(change_index) {
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

function change_layout_color(change_index) {
    act_layout = (act_layout + change_index) % 2;

    document.body.style.backgroundColor = layouts[act_layout];
    msg_field.style.background = msg_field_colors[act_layout];

    ele = document.getElementsByClassName('svg-icon');
    for (var i = 0; i < ele.length; i++) {
        ele[i].style.fill = colors_array[act_layout];
    }

    document.getElementById("user-writing").style.color = colors_array[act_layout];
    document.getElementById("header-text").style.color = colors_array[act_layout];
}

function updateUserInteractionData() {
    mouse_movement_sleep = false;
    scroll_sleep = false;

    if (document.getElementById("msg_field").value != "") {
        input_seconds++;
        is_user_typing = true;
        typing_time++;
    } else {
        if (is_user_typing) {
            hesitation++;
            is_user_typing = false;
        }

        typing_time = 0;
    }
}

function showTypingBotsNicks(seconds_integer) {
    var bots_typing = [];

    for (var i = SECONDS_UNTIL_SEND_BOT_MESSAGE_TO_SHOW_BOT_NAME_TYPING; i > 0; i--) {
        if (seconds_integer + i in bots_messages) {
            if (!bots_typing.includes(bots_messages[seconds_integer + i][0])) {
                bots_typing.push(bots_messages[seconds_integer + i][0]);
            }
        }
    }

    responds_queue.forEach((respond) => {
        if (!bots_typing.includes(respond[1])) {
            bots_typing.push(respond[1]);
        }
    });

    var typing_text = " " + translations.chatroom_user_singular_typing_text;

    if (bots_typing.length > 1) {
        typing_text = " " + translations.chatroom_user_plural_typing_text;
    }

    typing_text = bots_typing.join(", ") + typing_text;
    typing_text = typing_text.replace(/,([^,]*)$/, " i" + '$1');

    if (bots_typing.length > 0) {
        document.getElementById("stage").style.display = "block";
        document.getElementById("user-writing").innerHTML = typing_text;
    } else {
        document.getElementById("stage").style.display = "none";
    }
}

function sendCuriosityQuestion() {
    return;
    if (no_user_interaction) {
        return;
    }

    if (!curiosity_question_sended && draft_bots_message_id == 29) {
        curiosity_question_sended = true;

        curiosity_question = [
            translations.ai_curiosity_question_1.replace("{nick}", user_name),
            translations.ai_curiosity_question_2.replace("{nick}", user_name)
        ][0];

        createAndSendMessageHTML(
            bots_nicks[1],
            curiosity_question,
            true,
            "",
            "",
            false,
            true
        );
    }
}

function handleReports() {
    if (no_user_interaction || true) {
        return;
    }
    
    while (reports_remove_messages_queue.length > 0 && reports_remove_messages_queue[0][0] <= 0) {
        var report_data = reports_remove_messages_queue.shift();
        var reported_message_id = report_data[1];
        var reported_bot_nick = report_data[2];
        var report_type_id = report_data[3];

        if (report_type_id == RESPECT_REPORT_ID_OR_RESPECT_NORM_CONFIRMED_ID) {
            respect_reports_dict[reported_bot_nick] += 1

            var respect_translation_index = [
                "chatroom_moderator_respect_first_time_",
                "chatroom_moderator_respect_first_time_",
                "chatroom_moderator_respect_second_time_"
            ][respect_reports_dict[reported_bot_nick]];

            if (respect_reports_dict[reported_bot_nick] < 3) {
                createAndSendMessageHTML(
                    translations.chatroom_moderator_nick,
                    translations[respect_translation_index + (Math.floor(Math.random() * (reports_messages_size) + 1)).toString()].replace("{nick}", reported_bot_nick),
                    true,
                    "",
                    "",
                    false,
                    false,
                    true
                )
            }

            else {
                document.querySelector("[data-index='" + reported_message_id + "']").parentNode.parentNode.parentNode.style.display = 'none';
            }
        }
        
        if (report_type_id == HOSTILE_REPORT_ID_OR_RESPECT_NORM_DENY_ID) {
            hostile_reports_dict[reported_bot_nick] += 1
            
            var hostile_translation_index = ["", "chatroom_moderator_hostile_first_time_", "chatroom_moderator_hostile_second_time_"][hostile_reports_dict[reported_bot_nick]];

            if (hostile_reports_dict[reported_bot_nick] < 3) {
                createAndSendMessageHTML(
                    translations.chatroom_moderator_nick,
                    translations[hostile_translation_index + (Math.floor(Math.random() * (reports_messages_size) + 1)).toString()].replace("{nick}", reported_bot_nick),
                    true,
                    "",
                    "",
                    false,
                    false,
                    true
                )
            }

            else {
                document.querySelector("[data-index='" + reported_message_id + "']").parentNode.parentNode.parentNode.style.display = 'none';
            }
        }

        if (report_type_id == MISINFORMATION_REPORT_ID) {
            document.querySelector("[data-index='" + reported_message_id + "']").parentNode.parentNode.parentNode.style.display = 'none';
        }
    }
}

function chatroomPollBarMove(target) {
    return new Promise((resolve) => {
        var elem = document.getElementById("progress-bar");
        let remaining_text = document.getElementById("remaining-text");

        var id = setInterval(frame, 80);

        function frame() {
            if (chatroom_poll_percantage == target) {
                clearInterval(id);
                resolve(); // Resolve the promise when animation is complete
            } else {
                if (chatroom_poll_percantage < target) {
                    chatroom_poll_percantage++;
                } else {
                    chatroom_poll_percantage--;
                }

                elem.style.width = chatroom_poll_percantage + '%'; 
                elem.innerHTML = chatroom_poll_percantage + '% ' + translations.yes;

                remaining_text.innerText = (100 - chatroom_poll_percantage) + "% " + translations.no;
            }
        }
    });
}

function closeChatroomPollDialog() {
    document.getElementById("chatroom-poll-dialog-box").style.display = "none";
}

async function pollChangeUserAmount(user_amount) {
    document.getElementById("poll-users-amount").innerText = user_amount.toString() + " " + translations.out_of + " 6 " + translations.chatroom_poll_users_amount;
}

async function chatroomPollDialog() {
    document.getElementById("chatroom-poll-dialog-box").style.display = "block";

    if (document.getElementById('data-from-django').dataset.isPositive == "RESPECT") {
        pollChangeUserAmount(0);
        await new Promise(resolve => setTimeout(resolve, 2000));
        pollChangeUserAmount(1);
        await chatroomPollBarMove(100);
        await new Promise(resolve => setTimeout(resolve, 800));
        pollChangeUserAmount(2);
        await chatroomPollBarMove(100);
        await new Promise(resolve => setTimeout(resolve, 800));
        pollChangeUserAmount(3);
        await chatroomPollBarMove(67);
        await new Promise(resolve => setTimeout(resolve, 800));
        pollChangeUserAmount(4);
        await chatroomPollBarMove(75);
        await new Promise(resolve => setTimeout(resolve, 800));
        pollChangeUserAmount(5);
        await chatroomPollBarMove(80);
        //await new Promise(resolve => setTimeout(resolve, 800));
        //pollChangeUserAmount(6);
        //await chatroomPollBarMove(67);
    } else {
        pollChangeUserAmount(0);
        await new Promise(resolve => setTimeout(resolve, 2000));
        pollChangeUserAmount(1);
        await chatroomPollBarMove(0);
        await new Promise(resolve => setTimeout(resolve, 800));
        pollChangeUserAmount(2);
        await chatroomPollBarMove(50);
        await new Promise(resolve => setTimeout(resolve, 800));
        pollChangeUserAmount(3);
        await chatroomPollBarMove(33);
        await new Promise(resolve => setTimeout(resolve, 800));
        pollChangeUserAmount(4);
        await chatroomPollBarMove(25);
        await new Promise(resolve => setTimeout(resolve, 800));
        pollChangeUserAmount(5);
        await chatroomPollBarMove(20);
    }

    showPollButtons();
}

function showPollButtons() {
    // TODO remove voting in exit poll
    document.getElementById("chatroom-poll-yes").style.display = "inline";
    document.getElementById("chatroom-poll-no").style.display = "inline";
    // TODO remove voting in exit poll

    exit_poll_buttons_visible = true;
}

function removePollButtonsAndShowThanks() {
    document.getElementById("chatroom-poll-yes").style.display = "none";
    document.getElementById("chatroom-poll-no").style.display = "none";

    document.getElementById("chatroom-poll-thanks").style.display = "block";
}

async function chatroomPollDialogClick(is_yes) {
    exit_poll_user_voted = true;

    removePollButtonsAndShowThanks();
    pollChangeUserAmount(6);

    if (is_yes) {
        sendDataThroughAjax(true, {
            csrfmiddlewaretoken: data_from_django.token,
            action: "exit_poll",
            is_yes: "True",
            vote_seconds: exit_poll_votings_possible_seconds
        });

        if (document.getElementById('data-from-django').dataset.isPositive == "RESPECT") {
            await chatroomPollBarMove(83);
        } else {
            await chatroomPollBarMove(33);
        }
    } else {
        sendDataThroughAjax(true, {
            csrfmiddlewaretoken: data_from_django.token,
            action: "exit_poll",
            is_yes: "False",
            vote_seconds: exit_poll_votings_possible_seconds
        });

        if (document.getElementById('data-from-django').dataset.isPositive == "RESPECT") {
            await chatroomPollBarMove(67);
        } else {
            await chatroomPollBarMove(17);
        }
    }
}

function handleExitPoll() {
    // if (no_user_interaction) {
    //     exit_poll_after_vote_seconds += 999999;
        
    //     return;
    // }

    seconds_from_last_message++;

    if (seconds_from_last_message >= SECONDS_FROM_LAST_MESSAGE_TO_POLL_DIALOG && !exit_poll_opened) {
        exit_poll_opened = true;
        chatroomPollDialog();
    }

    if (exit_poll_buttons_visible && !exit_poll_user_voted) {
        // TODO remove voting in exit poll
        //exit_poll_user_voted = true
        //exit_poll_after_vote_seconds = 9999;
        // TODO remove voting in exit poll

        exit_poll_votings_possible_seconds++;
    }

    if (exit_poll_user_voted) {
        exit_poll_after_vote_seconds++;
    }
}

function incrementSeconds() {
    /*
    if (seconds > 490) {
        return;
    }
    */

    if (end_chatroom) {
        return;
    }

    if (exit_poll_after_vote_seconds > SECONDS_FROM_VOTE_TO_POLL_DIALOG_EXIT) {
        end_chatroom = true;
        sendReactionsAndInteractionsData(1);
        closeChatroomPollDialog();
        
        if (!not_exit_chatroom_at_the_end) {
            window.location.href = data_from_django.endUrl;
        }
    }

    if (exit_poll_votings_possible_seconds > SECONDS_FROM_START_POLL_VOTING_TO_FORCE_QUIT_DUE_TO_NOT_VOTE) {
        end_chatroom = true;
        sendReactionsAndInteractionsData(0);
        closeChatroomPollDialog();
        
        if (!not_exit_chatroom_at_the_end) {
            window.location.href = data_from_django.badEndNoExitpollUrl;
        }
    }

    if (bots_message_id >= 1 + Object.keys(bots_messages).length) {
        handleExitPoll();
        return;
    }

    seconds++;

    updateUserInteractionData();

    var seconds_integer = Math.ceil(seconds);

    responds_queue.every((respond) => respond[0]--);
    reactions_queue.every((reaction) => reaction[0]--);
    reports_remove_messages_queue.every((reports) => reports[0]--);

    showTypingBotsNicks(seconds_integer);

    if (seconds_integer in bots_messages && !seconds_messages_sent.has(seconds_integer)) {
        createAndSendMessageHTML(
            bots_messages[seconds_integer][0],
            bots_messages[seconds_integer][1],
            true,
            bots_messages[seconds_integer][3] ?? "",
            bots_messages[seconds_integer][2] ?? "",
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

        createAndSendMessageHTML(
            respond[1],
            respond[2],
            true,
            respond[3],
            user_name,
            true
        );
    }

    sendCuriosityQuestion();

    while (reactions_queue.length > 0 && reactions_queue[0][0] <= 0) {
        var reaction = reactions_queue.shift();

        addBotReaction(reaction[1], reaction[2]);
        change_layout_color(0);
    }

    handleReports();

    var time_to_left_chat = 420 - seconds_integer;

    printTimeToLeftChat(time_to_left_chat);

    if (time_to_left_chat == 7*60 || time_to_left_chat == 2*60) {
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

    if (time_to_left_chat == 0) {
        end_chatroom = true;
        sendReactionsAndInteractionsData(1);
        closeChatroomPollDialog();

        if (!not_exit_chatroom_at_the_end) {
            window.location.href = data_from_django.endUrl;
        }
    }
}

incrementSeconds();
setInterval(incrementSeconds, chatroom_speed);

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

    sendReactionsAndInteractionsData(0);

    hesitation = 0;
    mouse_movement_seconds = 0;
    scroll_seconds = 0;
    input_seconds = 0;

    e.preventDefault();
    e.returnValue = translations.chatroom_leaving_page_warning;

    return translations.chatroom_leaving_page_warning;
});
