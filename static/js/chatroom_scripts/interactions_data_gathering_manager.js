export class InteractionsDataGatheringManager
{
    constructor({})
    {
        this.hesitation = 0;
        this.mouse_movement_seconds = 0;
        this.scroll_seconds = 0;
        this.input_seconds = 0;

        this.mouse_movement_sleep = false;
        this.scroll_sleep = false;
        this.is_user_typing = false;
        this.typing_time = 0;

        this.onMouseMove = this.onMouseMove.bind(this);
        this.onScroll = this.onScroll.bind(this);

        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("scroll", this.onScroll);
    }

    updateUserInteractionData(msg_field_value)
    {
        if (msg_field_value != "") {
            if (!this.is_user_typing) {
                this.typing_time = 0;   
            }

            this.input_seconds++;
            this.is_user_typing = true;
            this.typing_time++;
        } 
        else
        {
            if (this.is_user_typing) {
                this.hesitation++;
                this.is_user_typing = false;
            }
        }
    }

    resetInteractionsCounters()
    {
        this.hesitation = 0;
        this.mouse_movement_seconds = 0;
        this.scroll_seconds = 0;
        this.input_seconds = 0;
    }

    onMouseMove() {
        if (!this.mouse_movement_sleep) {
            this.mouse_movement_seconds++;
            this.mouse_movement_sleep = true;

            // reset sleep after 1 second
            setTimeout(() => {
                this.mouse_movement_sleep = false;
            }, 1000);
        }
    }

    onScroll() {
        if (!this.scroll_sleep) {
            this.scroll_seconds++;
            this.scroll_sleep = true;

            setTimeout(() => {
                this.scroll_sleep = false;
            }, 1000);
        }
    }

    destroy() {
        window.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener("scroll", this.onScroll);
    }
}
