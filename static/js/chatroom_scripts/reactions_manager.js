var reactions_queue = [];

var like_reactions_memory = new Set();
var heart_reactions_memory = new Set();
var angry_reactions_memory = new Set();

function addReaction(reaction_button_dom, emotion_id)
{
    var span_id = ["like-user", "heart-user", "angry-user"][emotion_id];
    var svg = [like_svg, heart_svg, angry_svg][emotion_id];

    var reactions_container = reaction_button_dom.parentNode.parentNode.parentNode.querySelector(".reactions-container-selector");
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

    logDebugMessage("Current like reactions:");
    logDebugMessage(like_reactions_memory);
    logDebugMessage("Current heart reactions:");
    logDebugMessage(heart_reactions_memory);
    logDebugMessage("Current angry reactions:");
    logDebugMessage(angry_reactions_memory);
}

function addBotReaction(message_dom, emotion_id)
{
    var span_id = ["like-user-bot", "heart-user-bot", "angry-user-bot"][emotion_id];
    var svg = [like_svg, heart_svg, angry_svg][emotion_id];

    var message_elem = document.querySelector("[data-index='" + message_dom + "']");

    var reactions_container = message_elem.parentNode.querySelector(".reactions-container-selector");

    reactions_container.innerHTML += "<span id=" + span_id + ">" + svg + "</span>";
}

function createDomWithReactionsContainer(is_bot)
{
    var reactions_container = document.createElement("div");
    reactions_container.classList.add("reactions-container-selector", is_bot ? "reactions-container" : "reactions-container-user");

    return reactions_container;
}

function createDomWithReactionsButton()
{
    var reaction_button =  document.createElement("button");
    
    reaction_button.classList.add("reaction-button", "message-button");
    reaction_button.addEventListener("click", (event) => openOrCloseModal(event.currentTarget, "reactions"));
    reaction_button.innerHTML = reaction_svg;

    if (no_user_interaction) {
        reaction_button.classList.add("hidden");
    }

    return reaction_button;
}

function createDomWithReactionsModal(is_bot)
{
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

    return reactions_modal;
}
