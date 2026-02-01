var hesitation = 0;
var mouse_movement_seconds = 0;
var scroll_seconds = 0;
var input_seconds = 0;

var mouse_movement_sleep = false;
var scroll_sleep = false;
var is_user_typing = false;
var typing_time = 0;

function updateUserInteractionData(msg_field_value)
{
    mouse_movement_sleep = false;
    scroll_sleep = false;

    if (msg_field_value != "") {
        if (!is_user_typing) {
            typing_time = 0;   
        }

        input_seconds++;
        is_user_typing = true;
        typing_time++;
    } 
    else
    {
        if (is_user_typing) {
            hesitation++;
            is_user_typing = false;
        }
    }
}

function resetInteractionsCounters()
{
    hesitation = 0;
    mouse_movement_seconds = 0;
    scroll_seconds = 0;
    input_seconds = 0;
}

window.addEventListener("mousemove", (e) => {
    if (!mouse_movement_sleep) {
        mouse_movement_seconds++;
        mouse_movement_sleep = true;
    }
});

window.addEventListener("scroll", (e) => {
    if (!scroll_sleep) {
        scroll_seconds++;
        scroll_sleep = true;
    }
});
