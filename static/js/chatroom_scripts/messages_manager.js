import { UserMessageManager } from "./user_message_manager.js";

export class MessagesManager
{
    constructor({ db_manager, reactions_manager, gui_customization_manager, reports_manager, interactions_manager, timer, token })
    {
        this.db_manager = db_manager;
        this.reactions_manager = reactions_manager;
        this.gui_customization_manager = gui_customization_manager;
        this.reports_manager = reports_manager;
        this.timer = timer;
        this.token = token;

        this.user_message_manager = new UserMessageManager({ db_manager, messages_manager: this, interactions_manager, reactions_manager, timer })

        this.chatroom = document.getElementById("chatroom");

        /*
        bots_messages:
        dict, where keys are seconds in which msg should be send (measuring from the beggining of chat)
        and value is array with crucial data about this message: [bots_nick, message, nick_of_which_bot_this_message_is reply_to, message_to_reply, emojis_ids_to_be_add_to_msg, seonds_when_each_emoji_will_be_added]
        */
        this.bots_messages = {};

        if (document.getElementById('data-from-django').dataset.isPositive == "RESPECT") {
            logDebugMessage("Chosen bots message: RESPECT");
            this.bots_messages = positive_bots_messages;
        } else if (document.getElementById('data-from-django').dataset.isPositive == "NONRESPECT") {
            logDebugMessage("Chosen bots message: NON RESPECT");
            this.bots_messages = negative_bots_messages;
        } else {
            logDebugMessage("Chosen bots message: CONTROL");
            this.bots_messages = control_bots_messages;
        }

        this.responds_queue = [];

        // We need to store seconds of sended messages to not send it twice (exactly when refreshing site)
        this.seconds_messages_sent = new Set();

        // We need different ids to store id from real messages (from excel) and gemini ones
        this.bots_message_id = 1;
        this.draft_bots_message_id = 1;

        // which draft message id is assigned to which id of real message in website. We need this map to send emojis properly.
        // Eg. if gemini responds was sended before draft messages, "shifting" it's real id upwards 
        this.dict_draft_message_id_to_message_id = {};

        this.last_processed_message = "";

        // We iterate users_messages_ids backwards (--1) because we need to differ this ids from bots messages ids
        this.users_message_id = -1;

        jQuery.extend({
            generateRespond: function(token, user_message, draft_bots_message_id, message_timestamp, callback) {
                $.ajax({
                    type: "GET",
                    url: "../ajax/",
                    async: true,
                    data: {
                        csrfmiddlewaretoken: token,
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
    }

    showTypingBotsNicks(seconds_integer)
    {
        var nicks_of_typing_bots = [];

        for (var i = SECONDS_UNTIL_SEND_BOT_MESSAGE_TO_SHOW_BOT_NAME_TYPING; i > 0; i--) {
            if (seconds_integer + i in this.bots_messages) {
                if (!nicks_of_typing_bots.includes(this.bots_messages[seconds_integer + i][0])) {
                    nicks_of_typing_bots.push(this.bots_messages[seconds_integer + i][0]);
                }
            }
        }

        this.responds_queue.forEach((respond) => {
            if (!nicks_of_typing_bots.includes(respond[1])) {
                nicks_of_typing_bots.push(respond[1]);
            }
        });

        var typing_nicks_text = " " + translations.chatroom_user_singular_typing_text;

        if (nicks_of_typing_bots.length > 1) {
            typing_nicks_text = " " + translations.chatroom_user_plural_typing_text;
        }

        typing_nicks_text = nicks_of_typing_bots.join(", ") + typing_nicks_text;
        typing_nicks_text = typing_nicks_text.replace(/,([^,]*)$/, " i" + '$1');

        if (nicks_of_typing_bots.length > 0) {
            document.getElementById("stage").style.display = "block";
            document.getElementById("user-writing").innerHTML = typing_nicks_text;
        } else {
            document.getElementById("stage").style.display = "none";
        }
    }

    createAndSendMessageHTML(
        sending_user_name,
        message,
        is_bot,
        respond_message = "",
        respond_nick = "",
        is_respond_to_user = false,
        is_curiosity_question = false,      // Legacy code start and end
        is_moderator = false                // Legacy code start and end
    ){
        this.db_manager.updateMessagesHistory(this.last_processed_message);

        this.last_processed_message = "";
        
        if (is_curiosity_question) {
            this.last_processed_message = "EXTRA: ";        // Legacy code start and end
        } else if (!is_bot) {
            this.last_processed_message = "PARTICIPANT: ";
        } else if (is_respond_to_user) {
            this.last_processed_message = "BOT_REPLY: ";
        } else if (is_moderator) {
            this.last_processed_message = "MODERATOR: ";    // Legacy code start and end
        } else {
            this.last_processed_message = "STABLE: ";
        }

        this.last_processed_message += message;

        var message_id;
        
        if (is_bot) {
            message_id = this.bots_message_id;
            this.bots_message_id++;

            if (!is_respond_to_user) {
                this.draft_bots_message_id++;
                this.dict_draft_message_id_to_message_id[this.draft_bots_message_id-1] = this.bots_message_id-1;
            }
        } else {             
            message_id = this.users_message_id;
            this.users_message_id--;
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

        // Legacy code start
        if (is_moderator) {
            nick_span.classList.add("moderator-nick");
        }
        // Legacy code end

        nick_span.textContent = sending_user_name;

        var message_text = document.createElement("p");
        message_text.classList.add("message-p");
        message_text.setAttribute("data-index", message_id);
        message_text.textContent = message;

        var time_span = document.createElement("span");

        time_span.classList.add("message-sent-time");
        time_span.textContent = this.timer.getCurrentTimeInReadableFormat();

        if (is_bot) {
            message_container.appendChild(nick_span);
        }

        message_container.appendChild(message_text);
        message_container.appendChild(time_span);
        message_container.appendChild(this.reactions_manager.createDomWithReactionsContainer(is_bot));

        message_wrapper.appendChild(message_container);

        var buttons_container = document.createElement("div");
        buttons_container.classList.add("container-buttons");
        
        var respond_button =  document.createElement("button");
        respond_button.classList.add("respond-button", "message-button");
        respond_button.addEventListener("click", (event) => this.user_message_manager.showRespondToMessageModal(event.currentTarget));
        respond_button.innerHTML = respond_svg;

        if (no_user_interaction) {
            respond_button.classList.add("hidden");
        }

        buttons_container.appendChild(respond_button);
        buttons_container.appendChild(this.reactions_manager.createDomWithReactionsButton());
        
        if (is_bot) {
            buttons_container.appendChild(this.reports_manager.createDomWithReportButton());
        }

        buttons_container.appendChild(this.reactions_manager.createDomWithReactionsModal(is_bot));
        buttons_container.appendChild(this.reports_manager.createDomWithReportModal());

        message_wrapper.appendChild(buttons_container);
        outside_message_wrapper.appendChild(message_wrapper);

        this.chatroom.appendChild(outside_message_wrapper);

        if (!dont_scroll_chat_after_message) {

            if (message_id % 2 == 0 || true) {
                window.scroll({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }

        this.gui_customization_manager.changeFontSize(this.gui_customization_manager.font_size_change);
        this.gui_customization_manager.changeLayoutColor(0);
    }

    sendScriptedMessage(seconds_integer)
    {
        if (seconds_integer in this.bots_messages && !this.seconds_messages_sent.has(seconds_integer)) {
            this.createAndSendMessageHTML(
                this.bots_messages[seconds_integer][0],
                this.bots_messages[seconds_integer][1],
                true,
                this.bots_messages[seconds_integer][3] ?? "",
                this.bots_messages[seconds_integer][2] ?? "",
            );

            this.seconds_messages_sent.add(seconds_integer);

            if (this.bots_messages[seconds_integer][4] != "") {
                var emojis_ids = this.bots_messages[seconds_integer][4].split(',');
                var emojis_times = this.bots_messages[seconds_integer][5].split(',');

                for (var i = 0; i < emojis_ids.length; i++) {
                    this.reactions_manager.addReactionToQueue(emojis_times[i], this.dict_draft_message_id_to_message_id[this.draft_bots_message_id-1], emojis_ids[i]);
                }
            }
        }
    }

    addBotRespondMessageToQueue(seconds_to_wait_before_send, bot_nick, message, text_of_responded_message)
    {
        this.responds_queue.push([seconds_to_wait_before_send, bot_nick, message, text_of_responded_message]);
    }

    sendBotRespondMessagesFromQueue()
    {
        while (this.responds_queue.length > 0 && this.responds_queue[0][0] <= 0) {
            var respond = this.responds_queue.shift();

            this.createAndSendMessageHTML(
                respond[1],
                respond[2],
                true,
                respond[3],
                user_name,
                true
            );
        }
    }
}
