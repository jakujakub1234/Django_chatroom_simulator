export class UserMessageManager
{
    constructor({ db_manager, messages_manager, interactions_manager, reactions_manager, timer })
    {
        this.db_manager = db_manager;
        this.messages_manager = messages_manager;
        this.interactions_manager = interactions_manager;
        this.reactions_manager = reactions_manager;
        this.timer = timer;
        
        this.last_curse_timestamp = -1000;
        this.users_messages_counter = 0;

        // variable used to not respond spamming user
        this.last_user_msg_timestamp = -1000;

        // holding reply box texts
        this.respond_message_div = "";
        this.respond_input_box = document.getElementById("respond-input-box");

        document
            .getElementById("close-respond")
            .addEventListener("click", () => this.closeRespondToMessageModal());
    }

    showRespondToMessageModal(message_dom) {
        var message_div = message_dom.parentNode.parentNode.querySelector('.container');

        if (message_div == this.respond_message_div) {
            this.respond_message_div = "";

            this.respond_input_box.style.display = "none";
        } else {
            this.respond_message_div = message_div;

            var to_responding_bot = user_name;

            if (message_div.querySelector(".right") != null) {
                to_responding_bot = message_div.querySelector(".right").innerText;
            }

            this.respond_input_box.style.display = "block";
            this.respond_input_box.querySelector("#respond-input-box-nick").innerText = translations.chatroom_user_responding_to; 
            this.respond_input_box.querySelector("#respond-input-box-nick").innerText += " " + to_responding_bot;
            
            if (this.respond_input_box.querySelector("#respond-input-box-message") != null) {
                this.respond_input_box.querySelector("#respond-input-box-message").innerText = message_div.querySelector(".message-p").innerText;
            } else {
                this.respond_input_box.querySelector("#respond-input-box-message").innerText = user_name;
            }
        }

        document.getElementById("msg_field").focus();
    }

    closeRespondToMessageModal() {
        this.respond_message_div = "";
        this.respond_input_box.style.display = "none";
    }

    countWordsInMessage(message)
    {
        if (message.match(/\w+/g) == null) {
            return 0;
        }

        return message.match(/\w+/g).length;
    }

    sendUserMessage()
    {
        // needed because generating respond may took some time
        var message_sent_time = this.timer.getSeconds();

        var user_message = document.getElementById("msg_field").value;
        document.getElementById("msg_field").value = "";

        var is_curse = false;

        for (var word of user_message.replace(/[^\w\s\']|_/g, "").replace(/\s+/g, " ").toLowerCase().split(" ")) {
            if (curse_words.has(word) && message_sent_time - this.last_curse_timestamp > 60) {
                is_curse = true;

                this.last_curse_timestamp = message_sent_time;

                // Legacy code start
                var random_time = Math.floor(Math.random() * (25 - 15 + 1)) + 15;

                reports_remove_messages_queue.push([random_time, -1, user_name, RESPECT_REPORT_ID_OR_RESPECT_NORM_CONFIRMED_ID]);
                reports_remove_messages_queue.sort((a, b) => a[0] - b[0]);
                // Legacy code end
            }
        }

        if (this.countWordsInMessage(user_message) > 1) {
            this.users_messages_counter++;
            
            // Legacy code start
            curiosity_question_sended = true;
            // Legacy code end
        }

        this.interactions_manager.is_user_typing = false;

        if (user_message === null || user_message.match(/^ *$/) !== null) {
            return;
        }

        var respond_message_id = 0;
        var reply_to_who_nick = "";

        if (this.respond_message_div == "") {
            this.messages_manager.createAndSendMessageHTML(user_name, user_message, false);
        } else {
            if (this.respond_message_div.querySelector(".right") != null) {
                // is users message was respond to bots message
                reply_to_who_nick = this.respond_message_div.querySelector(".right").innerText;
            } else {
                // or to another users message
                reply_to_who_nick = user_name;
            }
            
            this.messages_manager.createAndSendMessageHTML(
                user_name,
                user_message,
                false,
                this.respond_message_div.querySelector(".message-p").innerText,
                reply_to_who_nick
            );

            respond_message_id = this.respond_message_div.querySelector(".message-p").dataset.index;

            this.respond_message_div = "";
            this.respond_input_box.style.display = "none";
        }

        if (is_curse) {
            this.db_manager.sendUserMessageDataToDatabase(user_message, message_sent_time, user_name, respond_message_id, "NONE");

            return;
        }

        if (message_sent_time - this.last_user_msg_timestamp < 4) {
            this.db_manager.sendUserMessageDataToDatabase(user_message, message_sent_time, user_name, respond_message_id, "NONE");
            logDebugMessage("Bots will not reply because user is spamming messages");
            return;
        }

        this.last_user_msg_timestamp = message_sent_time;

        $.generateRespond(this.messages_manager.token, user_message, this.messages_manager.draft_bots_message_id, message_sent_time, (respond, respond_type, responding_bot) => {
            this.processRespondMessageFromAi(user_message, respond, respond_type, responding_bot, reply_to_who_nick, respond_message_id, message_sent_time);
        });
    }

    processRespondMessageFromAi(user_message, respond, respond_type, responding_bot, reply_to_who_nick, respond_message_id, message_sent_time)
    {
        if (respond && respond != "") {
            var times_to_send_respond_due_to_number_of_words = [1, 7, 7, 8, 8, 10, 10, 12, 13, 13, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15];

            if (reply_to_who_nick != "" && reply_to_who_nick != user_name) {
                responding_bot = reply_to_who_nick;
            }

            if (!respond.includes("{{NEW_MESSAGE}}")) {
                var words_amount_in_respond = this.countWordsInMessage(respond);
                words_amount_in_respond = Math.min(words_amount_in_respond, 12);

                this.messages_manager.addBotRespondMessageToQueue(times_to_send_respond_due_to_number_of_words[words_amount_in_respond], responding_bot, respond, user_message);

            } else { // Legacy code, reachable only when respond is generating by algorithm (not by LLM) and responding message is designed to be sens as 2 messages
                var respond = respond.split("{{NEW_MESSAGE}}");

                var words_amount_in_respond = this.countWordsInMessage(respond[0]);
                words_amount_in_respond = Math.min(words_amount_in_respond, 12);

                this.messages_manager.addBotRespondMessageToQueue(times_to_send_respond_due_to_number_of_words[words_amount_in_respond], responding_bot, respond[0], user_message);

                words_amount_in_respond = this.countWordsInMessage(respond[1]);
                words_amount_in_respond = Math.min(words_amount_in_respond, 12);
                
                this.messages_manager.addBotRespondMessageToQueue(times_to_send_respond_due_to_number_of_words[words_amount_in_respond] + 4, responding_bot, respond[1], user_message);
            }

            this.messages_manager.responds_queue.sort((a, b) => a[0] - b[0]);

            if (this.users_messages_counter > 0 && this.users_messages_counter % 2 == 0 && this.countWordsInMessage(user_message) > 1) {
                this.reactions_manager.addReactionToQueue(3, this.messages_manager.users_message_id + 1, LIKE_REACTION_ID);
            }

            var respond_to_save_to_db = respond_type + ": " + respond;

            this.db_manager.sendUserMessageDataToDatabase(user_message, message_sent_time, user_name, respond_message_id, respond_to_save_to_db);

            this.interactions_manager.typing_time = 0;
        } else {
            this.db_manager.sendUserMessageDataToDatabase(user_message, message_sent_time, user_name, respond_message_id, "NONE");
        }
    }
}
