const LOG_WITHOUT_DEBUG = false;

function logDebugMessage(msg)
{
    if (is_debug || LOG_WITHOUT_DEBUG) {
        console.log(msg);
    }
}
