export class DomElementsMessagesManager
{
    constructor({ messages_manager, db_manager, reports_manager, reactions_manager, gui_customization_manager, timer })
    {
        this.messages_manager = messages_manager;
        this.db_manager = db_manager;
        this.reports_manager = reports_manager;
        this.reactions_manager = reactions_manager;
        this.gui_customization_manager = gui_customization_manager;
        this.timer = timer;

        this.last_processed_message = "";

        this.ai_response_message_id = AI_RESPONSE_MSG_ID_START_INDEX;

        this.chatroom = document.getElementById("chatroom");
    }

    increaseAiResponseMessageIdIfNecessary()
    {
        if (AI_RESPONSE_MSG_ID_START_INDEX <= (this.messages_manager.bots_messages_manager.bots_messages_queue).length) {
            this.ai_response_message_id = (this.messages_manager.bots_messages_manager.bots_messages_queue).length + 100;
        }
    }

    createMessageDom(
        sending_user_name,
        message,
        is_bot,
        respond_message = "",
        respond_nick = "",
        is_ai_respond_to_user = false,
        is_curiosity_question = false,      // Legacy code start and end
        is_moderator = false                // Legacy code start and end
    ){
        this.db_manager.updateMessagesHistory(this.last_processed_message);

        this.last_processed_message = "";
        
        if (is_curiosity_question) {
            this.last_processed_message = "EXTRA: ";        // Legacy code start and end
        } else if (!is_bot) {
            this.last_processed_message = "PARTICIPANT: ";
        } else if (is_ai_respond_to_user) {
            this.last_processed_message = "BOT_REPLY: ";
        } else if (is_moderator) {
            this.last_processed_message = "MODERATOR: ";    // Legacy code start and end
        } else {
            this.last_processed_message = "STABLE: ";
        }

        this.last_processed_message += message;

        var message_id;

        if (is_ai_respond_to_user) {
            message_id = this.ai_response_message_id;
            this.ai_response_message_id++;
        }
        else if (is_bot) {
            message_id = this.messages_manager.bots_messages_manager.draft_bots_message_id;
            this.messages_manager.bots_messages_manager.draft_bots_message_id++;
        }
        else {             
            message_id = this.messages_manager.bots_messages_manager.users_message_id;
            this.messages_manager.bots_messages_manager.users_message_id--;
        }

        logDebugMessage("DOM MESSAGE ID: " + message_id);

        var outside_message_wrapper = document.createElement("div");

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
        message_wrapper.classList.add(is_bot ? "msg-wrapper" : "msg-wrapper-user");

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
        respond_button.addEventListener("click", (event) => this.messages_manager.user_message_manager.showRespondToMessageModal(event.currentTarget));
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
            if (message_id % 2 == 0 || true) { // Legacy code start and end
                window.scroll({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }

        this.gui_customization_manager.changeFontSize(this.gui_customization_manager.font_size_change);
        this.gui_customization_manager.changeLayoutColor(0);
    }
}
