export class ExitPollManager
{
    constructor({ db_manager })
    {
        this.db_manager = db_manager;

        this.seconds_from_last_message = 0;

        this.exit_poll_after_vote_seconds = 0;
        this.exit_poll_votings_possible_seconds = 0;
        this.exit_poll_opened = false;
        this.exit_poll_buttons_visible = false;
        this.exit_poll_user_vote_animation_finish = false;
        this.exit_poll_animations_started = false;
        this.exit_poll_all_animations_finished = false;
        this.exit_poll_percantage = 50;
        this.exit_poll_votes_yes_counter = 0;

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
            this.exit_poll_after_vote_seconds = 99999;

            this.db_manager.sendReactionsAndInteractionsData(true, true);
            this.db_manager.exit_poll_vote_saved = true;
        }

        this.seconds_from_last_message++;

        if (this.seconds_from_last_message >= SECONDS_FROM_LAST_MESSAGE_TO_POLL_DIALOG && !this.exit_poll_opened) {
            this.exit_poll_opened = true;
            poll_dialog_box.style.display = "block";

            if (chatroom_configuration.exit_poll_is_user_voting_first) {
                this.pollChangeUserAmount(0);
            }
            else {
                this.pollChangeUserAmount(bots_nicks.length);
            }
            this.showPollButtons();
        }

        if (this.exit_poll_buttons_visible) {
            this.exit_poll_votings_possible_seconds++;
        }

        if (this.exit_poll_user_vote_animation_finish && !this.exit_poll_animations_started) {
            this.handleChatroomPollDialogAnimation();
        }
    }

    async chatroomPollDialogClick(is_yes)
    {
        this.db_manager.sendReactionsAndInteractionsData(true, true);

        this.exit_poll_buttons_visible = false;

        this.removePollButtonsAndShowThanks();
       
        if (chatroom_configuration.exit_poll_is_user_voting_first) {
            this.pollChangeUserAmount(1);
        }
        else {
            this.pollChangeUserAmount(bots_nicks.length + 1);
        }

        if (is_yes) {
            this.exit_poll_votes_yes_counter++;

            this.db_manager.sendDataThroughAjax({
                action: "exit_poll",
                is_yes: "True",
                vote_seconds: this.exit_poll_votings_possible_seconds
            }, true);
        }
        else {
            this.db_manager.sendDataThroughAjax({
                action: "exit_poll",
                is_yes: "False",
                vote_seconds: this.exit_poll_votings_possible_seconds
            }, true);
        }

        if (chatroom_configuration.exit_poll_real_time_voting) {
            await this.chatroomPollBarMove(Math.round((this.exit_poll_votes_yes_counter)*100));
        }

        this.exit_poll_user_vote_animation_finish = true;
    }

    showPollButtons()
    {
        document.getElementById("chatroom-poll-yes").style.display = "inline";
        document.getElementById("chatroom-poll-no").style.display = "inline";

        this.exit_poll_buttons_visible = true;
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

    async handleChatroomPollDialogAnimation()
    {
        this.exit_poll_animations_started = true;

        logDebugMessage("Bots are voting now");

        if (chatroom_configuration.exit_poll_is_user_voting_first) {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        this.pollChangeUserAmount(bots_nicks.length + 1);

        if (data_from_django.manipulationType == "RESPECT") {
            if (!chatroom_configuration.exit_poll_real_time_voting) {
                await this.chatroomPollBarMove(Math.floor(chatroom_configuration.exit_poll_final_percentage_respect_condition));
            }
            else {
                // TODO Dynamic changes
                // FINAL 83

                this.pollChangeUserAmount(1);
                await new Promise(resolve => setTimeout(resolve, 0));
                this.pollChangeUserAmount(2);
                this.exit_poll_votes_yes_counter++;
                await this.chatroomPollBarMove(Math.round((this.exit_poll_votes_yes_counter/2)*100));

                await new Promise(resolve => setTimeout(resolve, 800));
                this.pollChangeUserAmount(3);
                if (this.exit_poll_votes_yes_counter == 1) {
                    this.exit_poll_votes_yes_counter++;
                }
                await this.chatroomPollBarMove(Math.round((this.exit_poll_votes_yes_counter/3)*100));
                
                await new Promise(resolve => setTimeout(resolve, 800));
                this.pollChangeUserAmount(4);
                this.exit_poll_votes_yes_counter++;
                await this.chatroomPollBarMove(Math.round((this.exit_poll_votes_yes_counter/4)*100));
                
                await new Promise(resolve => setTimeout(resolve, 800));
                this.pollChangeUserAmount(5);
                this.exit_poll_votes_yes_counter++;
                await this.chatroomPollBarMove(Math.round((this.exit_poll_votes_yes_counter/5)*100));
                
                await new Promise(resolve => setTimeout(resolve, 800));
                this.pollChangeUserAmount(6);
                this.exit_poll_votes_yes_counter++;
                await this.chatroomPollBarMove(Math.round((this.exit_poll_votes_yes_counter/6)*100));
                await new Promise(resolve => setTimeout(resolve, 800));
                this.pollChangeUserAmount(6);
            }
        } else {
            if (!chatroom_configuration.exit_poll_real_time_voting) {
                await this.chatroomPollBarMove(Math.floor(chatroom_configuration.exit_poll_final_percentage_nonrespect_condition));
            }
            else {
                // FINAL 17

                this.pollChangeUserAmount(1);
                await new Promise(resolve => setTimeout(resolve, 0));
                this.pollChangeUserAmount(2);
                if (this.exit_poll_votes_yes_counter == 0) {
                    this.exit_poll_votes_yes_counter++;
                }
                await this.chatroomPollBarMove(Math.round((this.exit_poll_votes_yes_counter/2)*100));
                
                await new Promise(resolve => setTimeout(resolve, 800));
                this.pollChangeUserAmount(3);
                await this.chatroomPollBarMove(Math.round((this.exit_poll_votes_yes_counter/3)*100));
                
                await new Promise(resolve => setTimeout(resolve, 800));
                this.pollChangeUserAmount(4);
                await this.chatroomPollBarMove(Math.round((this.exit_poll_votes_yes_counter/4)*100));
                
                await new Promise(resolve => setTimeout(resolve, 800));
                this.pollChangeUserAmount(5);
                await this.chatroomPollBarMove(Math.round((this.exit_poll_votes_yes_counter/5)*100));
                
                await new Promise(resolve => setTimeout(resolve, 800));
                this.pollChangeUserAmount(6);
                await this.chatroomPollBarMove(Math.round((this.exit_poll_votes_yes_counter/6)*100));
            }
        }

        logDebugMessage("Bots finished voting");
        this.exit_poll_all_animations_finished = true;
    }

    chatroomPollBarMove(target)
    {
        return new Promise((resolve) => {
            var elem = document.getElementById("progress-bar");
            let remaining_text = document.getElementById("progress-bar-remaining-text");

            const id = setInterval(() => {
                if (this.exit_poll_percantage === target) {
                    clearInterval(id);
                    resolve();
                } else {
                    if (this.exit_poll_percantage < target) {
                        this.exit_poll_percantage++;
                    } else {
                        this.exit_poll_percantage--;
                    }

                    elem.style.width = this.exit_poll_percantage + '%';
                    elem.innerHTML = this.exit_poll_percantage + '% ' + translations.yes;

                    remaining_text.innerText = (100 - this.exit_poll_percantage) + '% ' + translations.no;
                }
            }, 80);
        });
    }

    isReadyToEndChatroomIfUserVoted()
    {
        if (this.exit_poll_all_animations_finished) {
            this.exit_poll_after_vote_seconds += 1;
            logDebugMessage("Time passed after voting: " + this.exit_poll_after_vote_seconds.toString());
        }

        if (this.exit_poll_after_vote_seconds > SECONDS_FROM_VOTE_TO_POLL_DIALOG_EXIT) {
            this.closeChatroomPollDialog();

            return true;
        }

        return false;
    }

    isReadyToEndChatroomIfUserNotVoted()
    {
        if (this.exit_poll_votings_possible_seconds > SECONDS_FROM_START_POLL_VOTING_TO_FORCE_QUIT_DUE_TO_NOT_VOTE) {
            this.closeChatroomPollDialog();

            return true;
        }

        return false;
    }
}
