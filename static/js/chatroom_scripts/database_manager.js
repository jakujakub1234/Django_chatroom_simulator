var reaction_and_interaction_data_saved = [false, false, false, false];

function sendDataThroughAjax(data, is_exit_poll = false, reactions_and_interactions_index = -1)
{
    $.ajax({
        type: "POST",
        url: "../ajax/",
        async: true,
        data: data,
        complete: function (response) {
            if (is_exit_poll) {
                exit_poll_user_voted = true;
            }

            if (reactions_and_interactions_index > -1) {
                reaction_and_interaction_data_saved[reactions_and_interactions_index] = true;
            }

            return response;
        },
        timeout: 15000
    });
}

function sendUserMessageDataToDatabase(
    message,
    message_time,
    nick,
    respond_message_id = 0,
    bot_response
) {
    sendDataThroughAjax({
        csrfmiddlewaretoken: token,
        action: "message",
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

function sendReactionsAndInteractionsData(is_chatroom_finished_1_0, is_this_true_end)
{
    var indexes = [-1, -1, -1, -1];

    if (is_this_true_end) {
        indexes = [0, 1, 2, 3];
    }

    sendDataThroughAjax({
        csrfmiddlewaretoken: token,
        action: "like_reactions",
        reactions: Array.from(like_reactions_memory).join(' ')
    }, false, indexes[0]);

    sendDataThroughAjax({
        csrfmiddlewaretoken: token,
        action: "heart_reactions",
        reactions: Array.from(heart_reactions_memory).join(' ')
    }, false, indexes[1]);

    sendDataThroughAjax({
        csrfmiddlewaretoken: token,
        action: "angry_reactions",
        reactions: Array.from(angry_reactions_memory).join(' ')
    }, false, indexes[2]);

    sendDataThroughAjax({
        csrfmiddlewaretoken: token,
        action: "interactions",
        hesitation: hesitation,
        mouse_movement_seconds: mouse_movement_seconds,
        scroll_seconds: scroll_seconds,
        input_seconds: input_seconds,
        is_chatroom_finished: is_chatroom_finished_1_0,
        chatroom_exit_time: seconds
    }, false, indexes[3]);
}
