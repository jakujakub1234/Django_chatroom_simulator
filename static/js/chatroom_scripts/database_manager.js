export class DatabaseManager
{
    constructor({ token, timer, interactions_manager })
    {
        this.timer = timer;
        this.token = token;
        this.interactions_manager = interactions_manager;

        this.reaction_and_interaction_data_saved = [false, false, false, false];
        this.exit_poll_vote_saved = false
        
        this.prev_prev_message = "NONE";
        this.prev_message = "NONE";
    }

    sendDataThroughAjax(data, is_exit_poll = false, reactions_and_interactions_index = -1)
    {
        data.csrfmiddlewaretoken = this.token;        

        $.ajax({
            type: "POST",
            url: "../ajax/",
            async: true,
            data: data,
            complete: (response) => {
                if (is_exit_poll) {
                    this.exit_poll_vote_saved = true;
                }

                if (reactions_and_interactions_index > -1) {
                    this.reaction_and_interaction_data_saved[reactions_and_interactions_index] = true;
                }

                return response;
            },
            timeout: 15000
        });
    }

    sendUserMessageDataToDatabase(
        message,
        message_time,
        nick,
        respond_message_id = 0,
        bot_response
    ) {
        this.sendDataThroughAjax({
            action: "message",
            message: message,
            prev_message: this.prev_message,
            prev_prev_message: this.prev_prev_message,
            bot_response: bot_response,
            message_time: message_time,
            nick: nick,
            respond_message_id: respond_message_id,
            typing_time: typing_time
        });
    }

    sendReactionsAndInteractionsData
    (
        is_chatroom_finished_1_0,
        is_this_true_end,
        like_reactions_memory,
        heart_reactions_memory,
        angry_reactions_memory
    )
    {
        var indexes = [-1, -1, -1, -1];

        if (is_this_true_end) {
            indexes = [0, 1, 2, 3];
        }

        this.sendDataThroughAjax({
            action: "like_reactions",
            reactions: Array.from(like_reactions_memory).join(' ')
        }, false, indexes[0]);

        this.sendDataThroughAjax({
            action: "heart_reactions",
            reactions: Array.from(heart_reactions_memory).join(' ')
        }, false, indexes[1]);

        this.sendDataThroughAjax({
            action: "angry_reactions",
            reactions: Array.from(angry_reactions_memory).join(' ')
        }, false, indexes[2]);

        this.sendDataThroughAjax({
            action: "interactions",
            hesitation: this.interactions_manager.hesitation,
            mouse_movement_seconds: this.interactions_manager.mouse_movement_seconds,
            scroll_seconds: this.interactions_manager.scroll_seconds,
            input_seconds: this.interactions_manager.input_seconds,
            is_chatroom_finished: is_chatroom_finished_1_0,
            chatroom_exit_time: this.timer.getSeconds()
        }, false, indexes[3]);
    }

    isAllDataSaved()
    {
        return this.reaction_and_interaction_data_saved.every(Boolean) && this.exit_poll_vote_saved;
    }
}
