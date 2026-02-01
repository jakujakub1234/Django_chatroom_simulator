/*

Legacy code for handling reports mechanism: dealing with multiple reports on same message etc.
Messages that went againts code of conduct

Depending on amount and type of report messages moderated on diffrent reposne.

*/
var data_from_django_reports = document.getElementById('data-from-django').dataset;
var user_name_reports = data_from_django_reports.nick;

var respect_reports_dict = {};
var hostile_reports_dict = {};

var reports_messages_size = 4;

var reports_remove_messages_queue = [];

for (let i = 0; i < bots_nicks.length; i++) {
    respect_reports_dict[bots_nicks[i]] = 0;
    hostile_reports_dict[bots_nicks[i]] = 0;
}

respect_reports_dict[user_name_reports] = -99999;

function handleReports() {
    if (no_user_interaction || true) {
        return;
    }
    
    while (reports_remove_messages_queue.length > 0 && reports_remove_messages_queue[0][0] <= 0) {
        var report_data = reports_remove_messages_queue.shift();
        var reported_message_id = report_data[1];
        var reported_bot_nick = report_data[2];
        var report_type_id = report_data[3];

        if (report_type_id == RESPECT_REPORT_ID_OR_RESPECT_NORM_CONFIRMED_ID) {
            respect_reports_dict[reported_bot_nick] += 1

            var respect_translation_index = [
                "chatroom_moderator_respect_first_time_",
                "chatroom_moderator_respect_first_time_",
                "chatroom_moderator_respect_second_time_"
            ][respect_reports_dict[reported_bot_nick]];

            if (respect_reports_dict[reported_bot_nick] < 3) {
                createAndSendMessageHTML(
                    translations.chatroom_moderator_nick,
                    translations[respect_translation_index + (Math.floor(Math.random() * (reports_messages_size) + 1)).toString()].replace("{nick}", reported_bot_nick),
                    true,
                    "",
                    "",
                    false,
                    false,
                    true
                )
            }

            else {
                document.querySelector("[data-index='" + reported_message_id + "']").parentNode.parentNode.parentNode.style.display = 'none';
            }
        }
        
        if (report_type_id == HOSTILE_REPORT_ID_OR_RESPECT_NORM_DENY_ID) {
            hostile_reports_dict[reported_bot_nick] += 1
            
            var hostile_translation_index = ["", "chatroom_moderator_hostile_first_time_", "chatroom_moderator_hostile_second_time_"][hostile_reports_dict[reported_bot_nick]];

            if (hostile_reports_dict[reported_bot_nick] < 3) {
                createAndSendMessageHTML(
                    translations.chatroom_moderator_nick,
                    translations[hostile_translation_index + (Math.floor(Math.random() * (reports_messages_size) + 1)).toString()].replace("{nick}", reported_bot_nick),
                    true,
                    "",
                    "",
                    false,
                    false,
                    true
                )
            }

            else {
                document.querySelector("[data-index='" + reported_message_id + "']").parentNode.parentNode.parentNode.style.display = 'none';
            }
        }

        if (report_type_id == MISINFORMATION_REPORT_ID) {
            document.querySelector("[data-index='" + reported_message_id + "']").parentNode.parentNode.parentNode.style.display = 'none';
        }
    }
}
