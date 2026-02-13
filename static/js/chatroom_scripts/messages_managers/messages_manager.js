import { BotsMessagesManager } from "./bots_messages_manager.js";
import { DomElementsMessagesManager } from "./dom_elements_messages_manager.js";
import { UserMessageManager } from "./user_message_manager.js";

export class MessagesManager
{
    constructor({ db_manager, reactions_manager, gui_customization_manager, reports_manager, interactions_manager, timer, token })
    {
        this.bots_messages_manager = new BotsMessagesManager({ messages_manager: this, db_manager, reactions_manager, token });
        this.dom_elements_messages_manager = new DomElementsMessagesManager({ messages_manager: this, db_manager, reports_manager, reactions_manager, gui_customization_manager, timer });
        this.user_message_manager = new UserMessageManager({ messages_manager: this, db_manager, interactions_manager, reactions_manager, timer, token })
    
        this.updateDraftBotsMessageIdAfterReload(timer.getSeconds());
    }

    updateDraftBotsMessageIdAfterReload(seconds_integer)
    {
        for (let seconds_to_wait_before_send_msg of Object.keys(this.bots_messages_manager.bots_messages)) {
            if (Number(seconds_to_wait_before_send_msg) <= seconds_integer) {
                this.bots_messages_manager.draft_bots_message_id++;
            }
            else {
                break;
            }
        }
    }

    scriptEndedAndReadyForExitPoll(seconds_integer)
    {
        if (instant_exit_poll) {
            if (this.bots_messages_manager.draft_bots_message_id >= 1) {
                return true;
            }
        }
        else if (chatroom_speed != 1000) {
            if (this.bots_messages_manager.draft_bots_message_id >= 1 + Object.keys(this.bots_messages_manager.bots_messages).length) {
                return true;
            }
        }
        else
        {
            if (seconds_integer >= 1 + Number(Object.keys(this.bots_messages_manager.bots_messages)[Object.keys(this.bots_messages_manager.bots_messages).length-1])) {
                return true;
            }
        }

        return false;
    }
}
