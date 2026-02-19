export class ExitPollManager
{
    constructor({ db_manager })
    {
        this.db_manager = db_manager;

        this.seconds_from_last_message = 0;

        this.after_vote_seconds = 0;
        this.votings_possible_seconds = 0;
        this.dialog_opened = false;
        this.buttons_visible = false;
        this.user_vote_animation_finish = false;
        this.animations_started = false;
        this.all_animations_finished = false;
        this.current_percantage = 50;
        this.user_voted_yes = false;
        this.votes_yes_counter = 0;
        this.votes_counter = 0;

        document
            .getElementById("chatroom-poll-yes")
            .addEventListener("click", () => this.chatroomPollDialogClick(true));

            document
            .getElementById("chatroom-poll-no")
            .addEventListener("click", () => this.chatroomPollDialogClick(false));
    }

    handleExitPoll(poll_dialog_box)
    {
        if (!chatroom_configuration.exit_poll_active) {
            this.after_vote_seconds = 99999;

            this.db_manager.sendReactionsAndInteractionsData(true, true);
            this.db_manager.exit_poll_vote_saved = true;
        }

        this.seconds_from_last_message++;

        if (this.seconds_from_last_message >= SECONDS_FROM_LAST_MESSAGE_TO_POLL_DIALOG && !this.dialog_opened) {
            this.dialog_opened = true;
            poll_dialog_box.style.display = "block";

            if (chatroom_configuration.exit_poll_is_user_voting_first || !chatroom_configuration.exit_poll_real_time_voting) {
                if (chatroom_configuration.exit_poll_is_user_voting_first) {
                    this.pollChangeUserAmount(0);
                }
                else {
                    this.pollChangeUserAmount(bots_nicks.length);
                    this.votes_counter = bots_nicks.length;
                }
                this.showPollButtons();
            }
            else {
                this.handleChatroomPollDialogAnimation();
            }
        }

        if (this.buttons_visible) {
            this.votings_possible_seconds++;
        }

        if (this.user_vote_animation_finish && !this.animations_started) {
            this.handleChatroomPollDialogAnimation();
        }
    }

    async chatroomPollDialogClick(is_yes)
    {
        logDebugMessage("EXIT POLL CLICKED!");

        this.db_manager.sendReactionsAndInteractionsData(true, true);

        this.buttons_visible = false;
        this.votes_counter++;

        this.removePollButtonsAndShowThanks();
        this.pollChangeUserAmount(this.votes_counter);

        if (is_yes) {
            this.votes_yes_counter++;
            this.user_voted_yes = true;

            this.db_manager.sendDataThroughAjax({
                action: "exit_poll",
                is_yes: "True",
                vote_seconds: this.votings_possible_seconds
            }, true);
        }
        else {
            this.user_voted_yes = false;

            this.db_manager.sendDataThroughAjax({
                action: "exit_poll",
                is_yes: "False",
                vote_seconds: this.votings_possible_seconds
            }, true);
        }

        if (chatroom_configuration.exit_poll_real_time_voting) {
            await this.chatroomPollBarMove(Math.round((this.votes_yes_counter/this.votes_counter)*100));
            
            if (!chatroom_configuration.exit_poll_is_user_voting_first) {
                this.all_animations_finished = true;
            }
        }

        this.user_vote_animation_finish = true;
    }

    showPollButtons()
    {
        document.getElementById("chatroom-poll-yes").style.display = "inline";
        document.getElementById("chatroom-poll-no").style.display = "inline";

        this.buttons_visible = true;
    }

    removePollButtonsAndShowThanks()
    {
        document.getElementById("chatroom-poll-yes").style.display = "none";
        document.getElementById("chatroom-poll-no").style.display = "none";

        document.getElementById("chatroom-poll-thanks").style.display = "block";
    }

    closeChatroomPollDialog()
    {
        document.getElementById("chatroom-poll-dialog-box").style.display = "none";
    }

    async pollChangeUserAmount(user_amount)
    {
        document.getElementById("poll-users-amount").innerText = user_amount.toString() + " " + translations.out_of + " " + (bots_nicks.length + 1).toString() + " " + translations.chatroom_poll_users_amount;
    }

    async handleDynamicBotsVoting(bots_votes)
    {
        await new Promise(resolve => setTimeout(resolve, 1200));
        this.pollChangeUserAmount(this.votes_counter);

        for (var bot_vote of bots_votes) {
            await new Promise(resolve => setTimeout(resolve, 800));
            this.votes_counter++;
            this.pollChangeUserAmount(this.votes_counter);

            if (bot_vote == EXIT_POLL_BOT_VOTE_YES || 
                (bot_vote == EXIT_POLL_BOT_VOTE_SAME_AS_USER && this.user_voted_yes) ||
                (bot_vote == EXIT_POLL_BOT_VOTE_OPPOSITE_TO_USER && !this.user_voted_yes)
            ) {
                this.votes_yes_counter++;
            }
            await this.chatroomPollBarMove(Math.round((this.votes_yes_counter/this.votes_counter)*100));
        }
    }

    async handleChatroomPollDialogAnimation()
    {
        this.animations_started = true;

        logDebugMessage("Bots are voting now");

        if (chatroom_configuration.exit_poll_is_user_voting_first && !chatroom_configuration.exit_poll_real_time_voting) {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        this.pollChangeUserAmount(bots_nicks.length + 1);

        if (data_from_django.manipulationType == "RESPECT") {
            if (!chatroom_configuration.exit_poll_real_time_voting) {
                await this.chatroomPollBarMove(Math.floor(chatroom_configuration.exit_poll_final_percentage_respect_condition));
            }            
            else {
                await this.handleDynamicBotsVoting(translations.bots_respect_exit_poll_real_time_votings.split(";").map(Number));
            }
        }
        else {
            if (!chatroom_configuration.exit_poll_real_time_voting) {
                await this.chatroomPollBarMove(Math.floor(chatroom_configuration.exit_poll_final_percentage_nonrespect_condition));
            }
            else {
                await this.handleDynamicBotsVoting(translations.bots_nonrespect_exit_poll_real_time_votings.split(";").map(Number));
            }
        }

        logDebugMessage("Bots finished voting");

        if (!chatroom_configuration.exit_poll_is_user_voting_first && chatroom_configuration.exit_poll_real_time_voting) {
            this.showPollButtons();
        }
        else {
            this.all_animations_finished = true;
        }
    }

    chatroomPollBarMove(target)
    {
        return new Promise((resolve) => {
            var elem = document.getElementById("progress-bar");
            let remaining_text = document.getElementById("progress-bar-remaining-text");

            const id = setInterval(() => {
                if (this.current_percantage === target) {
                    clearInterval(id);
                    resolve();
                } else {
                    if (this.current_percantage < target) {
                        this.current_percantage++;
                    } else {
                        this.current_percantage--;
                    }

                    elem.style.width = this.current_percantage + '%';
                    elem.innerHTML = this.current_percantage + '% ' + translations.yes;

                    remaining_text.innerText = (100 - this.current_percantage) + '% ' + translations.no;
                }
            }, 80);
        });
    }

    isReadyToEndChatroomIfUserVoted()
    {
        if (this.all_animations_finished) {
            this.after_vote_seconds += 1;
            logDebugMessage("Time passed after voting: " + this.after_vote_seconds.toString());
        }

        if (this.after_vote_seconds > SECONDS_FROM_VOTE_TO_POLL_DIALOG_EXIT) {
            this.closeChatroomPollDialog();

            return true;
        }

        return false;
    }

    isReadyToEndChatroomIfUserNotVoted()
    {
        if (this.votings_possible_seconds > SECONDS_FROM_START_POLL_VOTING_TO_FORCE_QUIT_DUE_TO_NOT_VOTE) {
            this.closeChatroomPollDialog();

            return true;
        }

        return false;
    }
}
