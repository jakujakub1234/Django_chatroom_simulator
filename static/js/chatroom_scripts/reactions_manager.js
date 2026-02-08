export class ReactionsManager
{
    constructor({ modals_manager, gui_customization_manager })
    {
        this.modals_manager = modals_manager;
        this.gui_customization_manager = gui_customization_manager;

        this.like_reactions_memory = new Set();
        this.heart_reactions_memory = new Set();
        this.angry_reactions_memory = new Set();

        this.reactions_queue = [];
    }

    addReactionToQueue(seconds_to_wait_before_send, message_id, emoji_id)
    {
        this.reactions_queue.push([seconds_to_wait_before_send, message_id, emoji_id]);
    }

    progressReactionsQueue()
    {
        this.reactions_queue.every((reaction) => reaction[0]--);
    }

    addReactionToMessage(reaction_button_dom, emoji_id)
    {
        var span_id = ["like-user", "heart-user", "angry-user"][emoji_id];
        var svg = [like_svg, heart_svg, angry_svg][emoji_id];

        var reactions_container = reaction_button_dom.parentNode.parentNode.parentNode.querySelector(".reactions-container-selector");
        var message_id = reaction_button_dom.parentNode.parentNode.parentNode.querySelector(".message-p").dataset.index;

        var reaction = reactions_container.querySelector("#" + span_id);

        if (reaction) {
            reaction.remove();

            switch (emoji_id) {
                case LIKE_REACTION_ID:
                    this.like_reactions_memory.delete(message_id);
                    break;
                case HEART_REACTION_ID:
                    this.heart_reactions_memory.delete(message_id);
                    break;
                case ANGRY_REACTION_ID:
                    this.angry_reactions_memory.delete(message_id);
                    break;
            }

        } else {
            reactions_container.innerHTML += "<span id=" + span_id + ">" + svg + "</span>";

            switch (emoji_id) {
                case LIKE_REACTION_ID:
                    this.like_reactions_memory.add(message_id);
                    break;
                case HEART_REACTION_ID:
                    this.heart_reactions_memory.add(message_id);
                    break;
                case ANGRY_REACTION_ID:
                    this.angry_reactions_memory.add(message_id);
                    break;
            }
        }

        logDebugMessage("Current like reactions:");
        logDebugMessage(this.like_reactions_memory);
        logDebugMessage("Current heart reactions:");
        logDebugMessage(this.heart_reactions_memory);
        logDebugMessage("Current angry reactions:");
        logDebugMessage(this.angry_reactions_memory);
    }

    addBotReaction(message_dom, emoji_id)
    {
        var span_id = ["like-user-bot", "heart-user-bot", "angry-user-bot"][emoji_id];
        var svg = [like_svg, heart_svg, angry_svg][emoji_id];

        var message_elem = document.querySelector("[data-index='" + message_dom + "']");

        var reactions_container = message_elem.parentNode.querySelector(".reactions-container-selector");

        reactions_container.innerHTML += "<span id=" + span_id + ">" + svg + "</span>";
    }

    createDomWithReactionsContainer(is_bot)
    {
        var reactions_container = document.createElement("div");
        reactions_container.classList.add("reactions-container-selector", is_bot ? "reactions-container" : "reactions-container-user");

        return reactions_container;
    }

    createDomWithReactionsButton()
    {
        var reaction_button = document.createElement("button");
        
        reaction_button.classList.add("message-button");
        reaction_button.addEventListener("click", (event) => this.modals_manager.openOrCloseModal(event.currentTarget, "reactions"));
        reaction_button.innerHTML = reaction_svg;

        if (no_user_interaction) {
            reaction_button.classList.add("hidden");
        }

        return reaction_button;
    }

    createDomWithReactionsModal(is_bot)
    {
        var reactions_modal = document.createElement("div");
        reactions_modal.classList.add("reactions-modal");
        reactions_modal.id = is_bot ? "reactions-modal" : "reactions-modal-user";

        var like_button =  document.createElement("button");
        like_button.classList.add("like-button", "message-button");
        like_button.addEventListener("click", (event) => this.addReactionToMessage(event.currentTarget, LIKE_REACTION_ID));
        like_button.innerHTML = like_svg;

        var heart_button =  document.createElement("button");
        heart_button.classList.add("heart-button", "message-button");
        heart_button.addEventListener("click", (event) => this.addReactionToMessage(event.currentTarget, HEART_REACTION_ID));
        heart_button.innerHTML = heart_svg;

        var angry_button =  document.createElement("button");
        angry_button.classList.add("angry-button", "message-button");
        angry_button.addEventListener("click", (event) => this.addReactionToMessage(event.currentTarget, ANGRY_REACTION_ID));
        angry_button.innerHTML = angry_svg;

        reactions_modal.appendChild(like_button);
        reactions_modal.appendChild(heart_button);
        reactions_modal.appendChild(angry_button);

        return reactions_modal;
    }

    addReactionsFromQueue()
    {
        while (this.reactions_queue.length > 0 && this.reactions_queue[0][0] <= 0) {
            var reaction = this.reactions_queue.shift();

            this.addBotReaction(reaction[1], reaction[2]);
            this.gui_customization_manager.changeLayoutColor(0);
        }
    }
}
