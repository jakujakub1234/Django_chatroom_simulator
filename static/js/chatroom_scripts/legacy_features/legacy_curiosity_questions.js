/*

Mechanism to activate participation in inactive participate

*/

/*

var curiosity_question_sended = false;

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

        createMessageDom(
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

*/