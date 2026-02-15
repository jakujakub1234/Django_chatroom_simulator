export class BotsMessagesManager
{
    constructor({ messages_manager, db_manager, reactions_manager, token })
    {
        this.messages_manager = messages_manager;
        this.db_manager = db_manager;
        this.reactions_manager = reactions_manager;
        this.token = token;

        this.bots_messages_queue = JSON.parse(bots_messages_json);

        logDebugMessage("DRAFT MESSAGES: ");
        logDebugMessage(this.bots_messages_queue);

        // We need different ids to store id from real messages (from excel) and gemini ones. Gemini starts from AI_RESPONSE_MSG_ID_START_INDEX
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

        for (var bot_message of this.bots_messages_queue) {
            if (bot_message.seconds_to_wait_before_send <= seconds_integer + SECONDS_UNTIL_SEND_BOT_MESSAGE_TO_SHOW_BOT_NAME_TYPING) {
                if (!nicks_of_typing_bots.includes(bot_message.bot_nick)) {
                    nicks_of_typing_bots.push(bot_message.bot_nick);
                }
            }
        }

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

    progressBotsMessagesQueue()
    {
        this.bots_messages_queue.every((respond) => respond.seconds_to_wait_before_send--);
    }

    sendBotMessageFromQueue()
    {
        while (this.bots_messages_queue.length > 0 && this.bots_messages_queue[0].seconds_to_wait_before_send <= 0) {
            var bot_message = this.bots_messages_queue.shift();

            this.messages_manager.dom_elements_messages_manager.createMessageDom(
                bot_message.bot_nick,
                bot_message.message,
                true,
                bot_message.text_of_responded_message,
                bot_message.name_respond_to,
                bot_message.is_ai_respond_to_user
            );

            if (bot_message.emoji_ids.length > 0) {
                for (var i = 0; i < bot_message.emoji_ids.length; i++) {
                    this.reactions_manager.addReactionToQueue(bot_message.emoji_times[i], this.draft_bots_message_id - 1, bot_message.emoji_ids[i]);
                }
            }
        }
    }

    addBotAiRespondMessageToQueue(seconds_to_wait_before_send, bot_nick, message, text_of_responded_message)
    {
        this.bots_messages_queue.push({
            seconds_to_wait_before_send: seconds_to_wait_before_send,
            bot_nick: bot_nick,
            message: message,
            name_respond_to: user_name,
            text_of_responded_message: text_of_responded_message,
            emoji_ids: [],
            emoji_times: [],
            is_ai_respond_to_user: true
        });
        
        // TODO replace all sorts like this with efficient inserting
        this.bots_messages_queue.sort((a, b) => a.seconds_to_wait_before_send - b.seconds_to_wait_before_send);
    }
}
