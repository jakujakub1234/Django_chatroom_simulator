const data_from_django = document.getElementById('data-from-django').dataset;

const translations = JSON.parse(data_from_django.translations.replaceAll("'",'"'));
const chatroom_configuration = JSON.parse(data_from_django.chatroomConfiguration.replaceAll("'",'"').replaceAll(": True",': true').replaceAll(": False",': false'));
const chatroom_time = parseInt(data_from_django.chatroomTime);
const user_name = data_from_django.nick;
const is_debug = data_from_django.isDebugModeHidden == 1;
const bots_messages_json = data_from_django.botsMessagesJson;

// DEBUG MODE ONLY VARIABLES
const chatroom_speed = parseInt(data_from_django.chatSpeedHidden);
const not_exit_chatroom_at_the_end = parseInt(data_from_django.notExitChatHidden) == 1;
const dont_scroll_chat_after_message = parseInt(data_from_django.dontScrollChatHidden) == 1;
const no_user_interaction = parseInt(data_from_django.noUserInteractionHidden) == 1;
const instant_exit_poll = parseInt(data_from_django.instantExitPollHidden) == 1;
// DEBUG MODE ONLY VARIABLES

const LIKE_REACTION_ID = 0;
const HEART_REACTION_ID = 1;
const ANGRY_REACTION_ID = 2;

const WHITE_LAYOUT = 0;
const BLACK_LAYOUT = 1;

const RESPECT_REPORT_ID_OR_RESPECT_NORM_CONFIRMED_ID = 0;
const HOSTILE_REPORT_ID_OR_RESPECT_NORM_DENY_ID = 1; 
const MISINFORMATION_REPORT_ID = 2;

const AI_RESPONSE_MSG_ID_START_INDEX = 10000;

const bots_nicks = translations.bots_nicks.split(";");

const SECONDS_UNTIL_SEND_BOT_MESSAGE_TO_SHOW_BOT_NAME_TYPING = 16;

const layouts = ["#FFFFFF", "#222222"];
const msg_field_colors = ["#f3f3f5", "aliceblue"]
const colors_array = ["black", "white"];

const SECONDS_FROM_LAST_MESSAGE_TO_POLL_DIALOG = 9;
const SECONDS_FROM_VOTE_TO_POLL_DIALOG_EXIT = 8;
const SECONDS_FROM_START_POLL_VOTING_TO_FORCE_QUIT_DUE_TO_NOT_VOTE = 60;

const UNDIFINED_ENDING = 0;
const GOOD_ENDING = 1;
const BAD_ENDING = 2;

const SECONDS_TO_CHATROOM_END_TO_SHOW_WARNING_DIALOG = new Set([2*60]);

const GUARD_SECONDS_TO_WAIT_TO_ESCAPE_CHATROOM_WITH_GOOD_END_IF_SOMETHING_BROKE = -100;

const EXIT_POLL_BOT_VOTE_NO = 0;
const EXIT_POLL_BOT_VOTE_YES = 1;
const EXIT_POLL_BOT_VOTE_OPPOSITE_TO_USER = 10;
const EXIT_POLL_BOT_VOTE_SAME_AS_USER = 11;
