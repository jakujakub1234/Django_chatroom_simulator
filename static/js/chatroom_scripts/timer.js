export class Timer
{
    constructor()
    {
        var start_timestamp = parseInt(document.getElementById('data-from-django').dataset.startTimestamp);

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
}
