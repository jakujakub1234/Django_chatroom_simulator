var translations = JSON.parse(document.getElementById('data-from-django').dataset.translations.replaceAll("'",'"'));

const LIKE_REACTION_ID = 0;
const HEART_REACTION_ID = 1;
const ANGRY_REACTION_ID = 2;

const RESPECT_REPORT_ID = 0;
const HOSTILE_REPORT_ID = 1;
const MISINFORMATION_REPORT_ID = 2;

const bots_nicks = translations.bots_nicks.split(";");

const SECONDS_UNTIL_SEND_BOT_MESSAGE_TO_SHOW_BOT_NAME_TYPING = 16;

const layouts = ["#FFFFFF", "#222222"];
const msg_field_colors = ["#f3f3f5", "aliceblue"]
const colors_array = ["black", "white"];

const SECONDS_FROM_LAST_MESSAGE_TO_POLL_DIALOG = 2;
const SECONDS_FROM_VOTE_TO_POLL_DIALOG_EXIT = 2;
const SECONDS_FROM_START_POLL_VOTING_TO_FORCE_QUIT_DUE_TO_NOT_VOTE = 60;
