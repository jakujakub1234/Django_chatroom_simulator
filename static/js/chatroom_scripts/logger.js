const LOG_WITHOUT_DEBUG_MODE = false;

function logDebugMessage(msg)
{
    if (is_debug_mode || LOG_WITHOUT_DEBUG_MODE) {
        console.log(msg);
    }
}
