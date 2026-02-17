import { Timer } from "./timer.js";

import { ModalsManager } from "./modals_manager.js";

import { GuiCustomizationManager } from "./gui_customization_manager.js";
import { DatabaseManager } from "./database_manager.js";
import { InteractionsDataGatheringManager } from "./interactions_data_gathering_manager.js";
import { ExitPollManager } from "./exit_poll_manager.js";
import { ReactionsManager } from "./reactions_manager.js";
import { ReportsManager } from "./reports_manager.js";
import { MessagesManager } from "./messages_managers/messages_manager.js";

const timer = new Timer();

const modals_manager = new ModalsManager(); 

const gui_customization_manager = new GuiCustomizationManager({});
const interactions_manager = new InteractionsDataGatheringManager({});
const reactions_manager = new ReactionsManager({ modals_manager, gui_customization_manager });
const db_manager = new DatabaseManager({ token: data_from_django.token, timer, interactions_manager, reactions_manager });
const reports_manager = new ReportsManager({ db_manager, modals_manager });
const exit_poll_manager = new ExitPollManager({ db_manager });
const messages_manager = new MessagesManager({ db_manager, reactions_manager, gui_customization_manager, reports_manager, interactions_manager, timer, token: data_from_django.token });

const seconds_counter = document.getElementById('seconds-counter');
const submit_button = document.querySelector("#btn-submit");
const msg_field = document.querySelector("#msg_field");

var ending = UNDIFINED_ENDING;

// guard variable to always redirect user to good ending page if chatroom is ended and user was not redirected (for some reason)
var is_chatroom_ended = false;

submit_button.addEventListener("click", () => {
    messages_manager.user_message_manager.sendUserMessage();
});

msg_field.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      submit_button.click();
    }
});

document.getElementById("msg_field").focus();

function endChatroomIfEverythingSaved()
{
    logDebugMessage("State of saving interaction and reactions to DB: " + db_manager.reaction_and_interaction_data_saved.toString());
    logDebugMessage("State of saving poll vote to DB: " + db_manager.exit_poll_vote_saved.toString());

    if (ending == GOOD_ENDING) {
        if (db_manager.isAllDataSaved()) {
            if (!not_exit_chatroom_at_the_end) {
                window.location.href = data_from_django.endUrl;
                ending = UNDIFINED_ENDING;
            }
        }
    }
    
    if (ending == BAD_ENDING) {
        if (db_manager.isAllDataSaved()) {
            if (!not_exit_chatroom_at_the_end) {
                window.location.href = data_from_django.badEndNoExitpollUrl;
                ending = UNDIFINED_ENDING;
            }
        }
    }
}

function showDialogWithTimeWarning(time_to_left_chat)
{
    var minutes = Math.floor(time_to_left_chat / 60);
    var minutes_text = translations.minutes_many;

    if (minutes < 5) {
        minutes_text = translations.minutes_few;
    }
    if (minutes == 1) {
        minutes_text = translations.minutes_singular;
    }

    modals_manager.openDialogWithTimeWarning(translations.chatroom_end_dialog_text + " " + minutes.toString() + " " + minutes_text);
}

function incrementSeconds() {
    if (is_chatroom_ended) {
        endChatroomIfEverythingSaved();

        return;
    }

    if (exit_poll_manager.isReadyToEndChatroomIfUserVoted()) {
        is_chatroom_ended = true;
        ending = GOOD_ENDING;
    }

    if (exit_poll_manager.isReadyToEndChatroomIfUserNotVoted()) {
        is_chatroom_ended = true;

        db_manager.sendReactionsAndInteractionsData(false, true);
        db_manager.exit_poll_vote_saved = true;
        
        ending = BAD_ENDING;
    }

    if (messages_manager.scriptEndedAndReadyForExitPoll()) {
        exit_poll_manager.handleExitPoll(document.getElementById("chatroom-poll-dialog-box"));
        return;
    }
    
    timer.tick();
    var seconds_integer = timer.getSeconds();

    interactions_manager.updateUserInteractionData(document.getElementById("msg_field").value);

    messages_manager.bots_messages_manager.progressBotsMessagesQueue();
    reactions_manager.progressReactionsQueue();

    // Legacy code start
    // reports_remove_messages_queue.every((reports) => reports[0]--);
    // Legacy code end

    messages_manager.bots_messages_manager.showTypingBotsNicks();
    messages_manager.bots_messages_manager.sendBotMessageFromQueue();

    reactions_manager.addReactionsFromQueue();
    
    // Legacy code start
    // sendCuriosityQuestion();
    // handleReports();
    // Legacy code end

    var time_to_left_chat = chatroom_time - seconds_integer;

    seconds_counter.innerText = timer.getTimeToLeftChatInReadableFormat(time_to_left_chat);

    if (SECONDS_TO_CHATROOM_END_TO_SHOW_WARNING_DIALOG.has(time_to_left_chat)) {
        showDialogWithTimeWarning(time_to_left_chat);
    }

        if (time_to_left_chat < GUARD_SECONDS_TO_WAIT_TO_ESCAPE_CHATROOM_WITH_GOOD_END_IF_SOMETHING_BROKE) {
        is_chatroom_ended = true;
        
        db_manager.sendReactionsAndInteractionsData(true, true);
        db_manager.exit_poll_vote_saved = true;

        this.exit_poll_manager.closeChatroomPollDialog();

        ending = GOOD_ENDING;
    }
}

document.getElementById("data-from-django").remove();

incrementSeconds();
setInterval(incrementSeconds, chatroom_speed);

// Reload on browser "previous" button
window.addEventListener( "pageshow", function ( event ) {
    var historyTraversal = event.persisted || 
                           ( typeof window.performance != "undefined" && 
                                window.performance.navigation.type === 2 );
    if ( historyTraversal ) {
      window.location.reload();
    }
});

// Show modal and save everything to database when user close browser
window.addEventListener('beforeunload', function(e) {
    if (is_chatroom_ended) {
        return;
    }

    db_manager.sendReactionsAndInteractionsData(false, false);

    interactions_manager.resetInteractionsCounters();

    e.preventDefault();
    e.returnValue = translations.chatroom_leaving_page_warning;

    return translations.chatroom_leaving_page_warning;
});
