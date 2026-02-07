import { Timer } from "./timer.js";

import { ModalsManager } from "./modals_manager.js";

import { GuiCustomizationManager } from "./gui_customization_manager.js";
import { DatabaseManager } from "./database_manager.js";
import { InteractionsDataGatheringManager } from "./interactions_data_gathering_manager.js";
import { ExitPollManager } from "./exit_poll_manager.js";
import { ReactionsManager } from "./reactions_manager.js";
import { ReportsManager } from "./reports_manager.js";
import { MessagesManager } from "./messages_manager.js";

const timer = new Timer();

const modals_manager = new ModalsManager(); 

const gui_customization_manager = new GuiCustomizationManager({});
const interactions_manager = new InteractionsDataGatheringManager({});
const reactions_manager = new ReactionsManager({ modals_manager, gui_customization_manager });
const db_manager = new DatabaseManager({ token: data_from_django.token, timer, interactions_manager, reactions_manager });
const reports_manager = new ReportsManager({ db_manager, modals_manager });
const exit_poll_manager = new ExitPollManager({ db_manager });
const messages_manager = new MessagesManager({ db_manager, reactions_manager, gui_customization_manager, interactions_manager, reports_manager, timer, token: data_from_django.token });

const seconds_counter = document.getElementById('seconds-counter');
const submit_button = document.querySelector("#btn-submit");
const msg_field = document.querySelector("#msg_field");

var ending = UNDIFINED_ENDING;

// guard variable to always redirect user to good ending page if chatroom is ended and user was not redirected (for some reason)
var end_chatroom = false;

submit_button.addEventListener("click", () => {
    messages_manager.sendUserMessage();
});

msg_field.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      submit_button.click();
    }
});

document.getElementById("msg_field").focus();

function printTimeToLeftChat(time_to_left_chat)
{
    var new_time = translations.chatroom_time_to_end + " ";
    var minutes_to_end = Math.floor(time_to_left_chat / 60);
    var seconds_to_end = time_to_left_chat % 60;

    if (minutes_to_end > 0) {
        var minutes_text = translations.minutes_many;

        if (minutes_to_end == 1) {
            minutes_text = translations.minutes_singular;
        }
        else if (minutes_to_end < 5) {
            minutes_text = translations.minutes_few;
        }

        new_time += minutes_to_end + " " + minutes_text;
    }

    if (seconds_to_end > 0) {
        var seconds_text = translations.seconds_many;

        if (seconds_to_end == 1) {
            seconds_text = translations.seconds_singular;
        }
        else if (seconds_to_end < 5) {
            seconds_text =  translations.seconds_few;
        }

        if (minutes_to_end > 0) {
            new_time += " " + translations.and + " ";
        }

        new_time += seconds_to_end + " " + seconds_text;
    }

    seconds_counter.innerText = new_time;
}

function handleEndOfChatroom()
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
    if (exit_poll_manager.exit_poll_all_animations_finished) {
        exit_poll_manager.exit_poll_after_vote_seconds += 1;
        logDebugMessage("Time passed after voting: " + exit_poll_manager.exit_poll_after_vote_seconds.toString());
    }

    if (end_chatroom) {
        handleEndOfChatroom();

        return;
    }

    if (exit_poll_manager.exit_poll_after_vote_seconds > SECONDS_FROM_VOTE_TO_POLL_DIALOG_EXIT) {
        end_chatroom = true;
        exit_poll_manager.closeChatroomPollDialog();
        
        ending = GOOD_ENDING;
    }

    if (exit_poll_manager.exit_poll_votings_possible_seconds > SECONDS_FROM_START_POLL_VOTING_TO_FORCE_QUIT_DUE_TO_NOT_VOTE) {
        end_chatroom = true;

        db_manager.sendReactionsAndInteractionsData(false, true);
        db_manager.exit_poll_vote_saved = true;
        
        exit_poll_manager.closeChatroomPollDialog();
        
        ending = BAD_ENDING;
    }

    if (instant_exit_poll) {
        if (messages_manager.draft_bots_message_id >= 1) {
            exit_poll_manager.handleExitPoll(document.getElementById("chatroom-poll-dialog-box"));
            return;
        }
    }
    else
    {
        if (messages_manager.draft_bots_message_id >= 1 + Object.keys(messages_manager.bots_messages).length) {
            exit_poll_manager.  handleExitPoll(document.getElementById("chatroom-poll-dialog-box"));
            return;
        }
    }
    
    timer.tick();

    interactions_manager.updateUserInteractionData(document.getElementById("msg_field").value);

    var seconds_integer = timer.getSeconds();

    messages_manager.responds_queue.every((respond) => respond[0]--);
    reactions_manager.reactions_queue.every((reaction) => reaction[0]--);
    reports_remove_messages_queue.every((reports) => reports[0]--);

    messages_manager.showTypingBotsNicks(seconds_integer);
    messages_manager.sendScriptedMessage(seconds_integer);
    messages_manager.sendMessagesFromQueue();

    reactions_manager.addReactionsFromQueue();
    
    sendCuriosityQuestion();

    handleReports();

    var time_to_left_chat = chatroom_time - seconds_integer;

    printTimeToLeftChat(time_to_left_chat);

    if (time_to_left_chat == 2*60) {
        showDialogWithTimeWarning(time_to_left_chat);
    }

    if (time_to_left_chat < -100) {
        end_chatroom = true;
        db_manager.sendReactionsAndInteractionsData(true, true);

        closeChatroomPollDialog();

        ending = GOOD_ENDING;
    }
}

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

window.addEventListener('beforeunload', function(e) {
    if (end_chatroom) {
        return;
    }

    db_manager.sendReactionsAndInteractionsData(false, false);

    interactions_manager.resetInteractionsCounters();

    e.preventDefault();
    e.returnValue = translations.chatroom_leaving_page_warning;

    return translations.chatroom_leaving_page_warning;
});
