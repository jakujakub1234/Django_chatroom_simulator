export class BotsMessagesManager
{
    constructor({ messages_manager, db_manager, reactions_manager, token })
    {
        this.messages_manager = messages_manager;
        this.db_manager = db_manager;
        this.reactions_manager = reactions_manager;
        this.token = token;

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
        this.draft_bots_message_id = 1;

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
            if (!nicks_of_typing_bots.includes(respond.bot_nick)) {
                nicks_of_typing_bots.push(respond.bot_nick);
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

    progressRespondsQueue()
    {
        this.responds_queue.every((respond) => respond.seconds_to_wait_before_send--);
    }

    sendScriptedMessage(seconds_integer)
    {
        if (seconds_integer in this.bots_messages && !this.seconds_messages_sent.has(seconds_integer)) {
            this.messages_manager.dom_elements_messages_manager.createMessageDom(
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
                    this.reactions_manager.addReactionToQueue(emojis_times[i], this.draft_bots_message_id - 1, emojis_ids[i]);
                }
            }
        }
    }

    addBotAiRespondMessageToQueue(seconds_to_wait_before_send, bot_nick, message, text_of_responded_message)
    {
        this.responds_queue.push({
            seconds_to_wait_before_send: seconds_to_wait_before_send,
            bot_nick: bot_nick,
            message: message,
            text_of_responded_message: text_of_responded_message
        });
        
        this.responds_queue.sort((a, b) => a.seconds_to_wait_before_send - b.seconds_to_wait_before_send);
    }

    sendBotRespondMessagesFromQueue()
    {
        while (this.responds_queue.length > 0 && this.responds_queue[0].seconds_to_wait_before_send <= 0) {
            var respond = this.responds_queue.shift();

            this.messages_manager.dom_elements_messages_manager.createMessageDom(
                respond.bot_nick,
                respond.message,
                true,
                respond.text_of_responded_message,
                user_name,
                true
            );
        }
    }
}
