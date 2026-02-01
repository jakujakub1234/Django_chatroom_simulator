var seconds_from_last_message = 0;

var exit_poll_after_vote_seconds = 0;
var exit_poll_votings_possible_seconds = 0;
var exit_poll_opened = false;
var exit_poll_buttons_visible = false;
var exit_poll_user_voted = false;
var exit_poll_user_vote_animation_finish = false;
var exit_poll_all_animations_finished = false;
var exit_poll_percantage = 50;
var exit_poll_votes_yes_counter = 0;

function handleExitPoll(poll_dialog_box)
{
    seconds_from_last_message++;

    if (seconds_from_last_message >= SECONDS_FROM_LAST_MESSAGE_TO_POLL_DIALOG && !exit_poll_opened) {
        exit_poll_opened = true;
        poll_dialog_box.style.display = "block";
        pollChangeUserAmount(0);
        showPollButtons();
    }

    if (exit_poll_buttons_visible && !exit_poll_user_voted) {
        exit_poll_votings_possible_seconds++;
    }

    if (exit_poll_user_voted && exit_poll_user_vote_animation_finish) {
        chatroomPollDialog();
    }
}

async function chatroomPollDialogClick(is_yes)
{
    sendReactionsAndInteractionsData(1, true);

    exit_poll_buttons_visible = false;

    removePollButtonsAndShowThanks();
    pollChangeUserAmount(1);

    if (is_yes) {
        exit_poll_votes_yes_counter++;

        sendDataThroughAjax({
            csrfmiddlewaretoken: token,
            action: "exit_poll",
            is_yes: "True",
            vote_seconds: exit_poll_votings_possible_seconds
        }, true);

       // await chatroomPollBarMove(100);
    } else {
        sendDataThroughAjax({
            csrfmiddlewaretoken: token,
            action: "exit_poll",
            is_yes: "False",
            vote_seconds: exit_poll_votings_possible_seconds
        }, true);

       // await chatroomPollBarMove(0);
    }

    exit_poll_user_vote_animation_finish = true;
}

function showPollButtons()
{
    document.getElementById("chatroom-poll-yes").style.display = "inline";
    document.getElementById("chatroom-poll-no").style.display = "inline";

    exit_poll_buttons_visible = true;
}

function removePollButtonsAndShowThanks()
{
    document.getElementById("chatroom-poll-yes").style.display = "none";
    document.getElementById("chatroom-poll-no").style.display = "none";

    document.getElementById("chatroom-poll-thanks").style.display = "block";
}

function closeChatroomPollDialog()
{
    document.getElementById("chatroom-poll-dialog-box").style.display = "none";
}

async function pollChangeUserAmount(user_amount)
{
    document.getElementById("poll-users-amount").innerText = user_amount.toString() + " " + translations.out_of + " 6 " + translations.chatroom_poll_users_amount;
}

async function chatroomPollDialog()
{
    exit_poll_user_voted = false;
    logDebugMessage("Bots are voting now");
    await new Promise(resolve => setTimeout(resolve, 5000));
    pollChangeUserAmount(6);

    if (document.getElementById('data-from-django').dataset.isPositive == "RESPECT") {
        await chatroomPollBarMove(83);

        // TODO Dynamic changes
        // FINAL 83

        // pollChangeUserAmount(1);
        // await new Promise(resolve => setTimeout(resolve, 0));
        // pollChangeUserAmount(2);
        // exit_poll_votes_yes_counter++;
        // await chatroomPollBarMove(Math.round((exit_poll_votes_yes_counter/2)*100));

        // await new Promise(resolve => setTimeout(resolve, 800));
        // pollChangeUserAmount(3);
        // if (exit_poll_votes_yes_counter == 1) {
        //     exit_poll_votes_yes_counter++;
        // }
        // await chatroomPollBarMove(Math.round((exit_poll_votes_yes_counter/3)*100));
        
        // await new Promise(resolve => setTimeout(resolve, 800));
        // pollChangeUserAmount(4);
        // exit_poll_votes_yes_counter++;
        // await chatroomPollBarMove(Math.round((exit_poll_votes_yes_counter/4)*100));
        
        // await new Promise(resolve => setTimeout(resolve, 800));
        // pollChangeUserAmount(5);
        // exit_poll_votes_yes_counter++;
        // await chatroomPollBarMove(Math.round((exit_poll_votes_yes_counter/5)*100));
        
        // await new Promise(resolve => setTimeout(resolve, 800));
        // pollChangeUserAmount(6);
        // exit_poll_votes_yes_counter++;
        // await chatroomPollBarMove(Math.round((exit_poll_votes_yes_counter/6)*100));
        //await new Promise(resolve => setTimeout(resolve, 800));
        //pollChangeUserAmount(6);
        //await chatroomPollBarMove(67);
    } else {
        await chatroomPollBarMove(17);

        // FINAL 17

        // pollChangeUserAmount(1);
        // await new Promise(resolve => setTimeout(resolve, 0));
        // pollChangeUserAmount(2);
        // if (exit_poll_votes_yes_counter == 0) {
        //     exit_poll_votes_yes_counter++;
        // }
        // await chatroomPollBarMove(Math.round((exit_poll_votes_yes_counter/2)*100));
        
        // await new Promise(resolve => setTimeout(resolve, 800));
        // pollChangeUserAmount(3);
        // await chatroomPollBarMove(Math.round((exit_poll_votes_yes_counter/3)*100));
        
        // await new Promise(resolve => setTimeout(resolve, 800));
        // pollChangeUserAmount(4);
        // await chatroomPollBarMove(Math.round((exit_poll_votes_yes_counter/4)*100));
        
        // await new Promise(resolve => setTimeout(resolve, 800));
        // pollChangeUserAmount(5);
        // await chatroomPollBarMove(Math.round((exit_poll_votes_yes_counter/5)*100));
        
        // await new Promise(resolve => setTimeout(resolve, 800));
        // pollChangeUserAmount(6);
        // await chatroomPollBarMove(Math.round((exit_poll_votes_yes_counter/6)*100));
    }

    logDebugMessage("Bots finished voting");
    exit_poll_all_animations_finished = true;
}

function chatroomPollBarMove(target)
{
    return new Promise((resolve) => {
        var elem = document.getElementById("progress-bar");
        let remaining_text = document.getElementById("remaining-text");

        var id = setInterval(frame, 80);

        function frame() {
            if (exit_poll_percantage == target) {
                clearInterval(id);
                resolve(); // Resolve the promise when animation is complete
            } else {
                if (exit_poll_percantage < target) {
                    exit_poll_percantage++;
                } else {
                    exit_poll_percantage--;
                }

                elem.style.width = exit_poll_percantage + '%'; 
                elem.innerHTML = exit_poll_percantage + '% ' + translations.yes;

                remaining_text.innerText = (100 - exit_poll_percantage) + "% " + translations.no;
            }
        }
    });
}
