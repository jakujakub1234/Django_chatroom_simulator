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
    }

    scriptEndedAndReadyForExitPoll()
    {
        if (instant_exit_poll) {
            if (this.bots_messages_manager.draft_bots_message_id >= 1) {
                return true;
            }
        }
        else
        {
            if (this.bots_messages_manager.draft_bots_message_id >= 1 + Object.keys(this.bots_messages_manager.bots_messages).length) {
                return true;
            }
        }

        return false;
    }
}
