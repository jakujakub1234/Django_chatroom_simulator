export class Timer
{
    constructor()
    {
        var start_timestamp = parseInt(data_from_django.startTimestamp);

        this.seconds = Math.floor(Date.now() / 1000) - start_timestamp;
    }

    tick()
    {
        this.seconds++;
    }

    getSeconds()
    {
        return Math.ceil(this.seconds);
    }

    getCurrentTimeInReadableFormat()
    {
        return new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    getTimeToLeftChatInReadableFormat(time_to_left_chat)
    {
        var time_to_end = translations.chatroom_time_to_end + " ";
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

            time_to_end += minutes_to_end + " " + minutes_text;
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
                time_to_end += " " + translations.and + " ";
            }

            time_to_end += seconds_to_end + " " + seconds_text;
        }

        return time_to_end;
    }
}
