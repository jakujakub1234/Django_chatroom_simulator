export class GuiCustomizationManager
{
    constructor({})
    {
        const change_font_size_button = document.querySelector("#change-font-size");
        const change_color_button = document.querySelector("#change-color-button");

        this.font_size_change = 0;
        this.act_layout = BLACK_LAYOUT;

        change_font_size_button.addEventListener("change", (event) => {
            const selectedIndex = event.target.selectedIndex;
            this.changeFontSize(selectedIndex);
        });

        change_color_button.addEventListener("click", () => {
            this.changeLayoutColor(1);
        });
    }
    
    changeFontSize(change_index)
    {
        this.font_size_change = change_index;

        var ele = document.getElementsByClassName('time-left');
        for (var i = 0; i < ele.length; i++) {
            if (this.font_size_change == 0) {
                ele[i].style.fontSize = "10pt";
            }
            if (this.font_size_change == 1) {
                ele[i].style.fontSize = "13pt";
            }
            if (this.font_size_change == 2) {
                ele[i].style.fontSize = "16pt";
            }
        }

        ele = document.getElementsByClassName('time-left-user');
        for (var i = 0; i < ele.length; i++) {
            if (this.font_size_change == 0) {
                ele[i].style.fontSize = "10pt";
            }
            if (this.font_size_change == 1) {
                ele[i].style.fontSize = "13pt";
            }
            if (this.font_size_change == 2) {
                ele[i].style.fontSize = "16pt";
            }
        }

        ele = document.getElementsByClassName('container-respond');
        for (var i = 0; i < ele.length; i++) {
            if (this.font_size_change == 0) {
                ele[i].style.fontSize = "10pt";
            }
            if (this.font_size_change == 1) {
                ele[i].style.fontSize = "13pt";
            }
            if (this.font_size_change == 2) {
                ele[i].style.fontSize = "16pt";
            }
        }

        ele = document.getElementsByClassName('message-p');
        for (var i = 0; i < ele.length; i++) {
            if (this.font_size_change == 0) {
                ele[i].style.fontSize = "13.5pt";
            }
            if (this.font_size_change == 1) {
                ele[i].style.fontSize = "16.5pt";
            }
            if (this.font_size_change == 2) {
                ele[i].style.fontSize = "19.5pt";
            }
        }

        ele = document.getElementsByClassName('span-bot');
        for (var i = 0; i < ele.length; i++) {
            if (this.font_size_change == 0) {
                ele[i].style.fontSize = "12pt";
            }
            if (this.font_size_change == 1) {
                ele[i].style.fontSize = "15pt";
            }
            if (this.font_size_change == 2) {
                ele[i].style.fontSize = "17pt";
            }
        }
    }

    changeLayoutColor(change_index)
    {
        this.act_layout = (this.act_layout + change_index) % 2;

        document.body.style.backgroundColor = layouts[this.act_layout];
        msg_field.style.background = msg_field_colors[this.act_layout];

        var ele = document.getElementsByClassName('svg-icon');

        for (var i = 0; i < ele.length; i++) {
            ele[i].style.fill = colors_array[this.act_layout];
        }

        document.getElementById("user-writing").style.color = colors_array[this.act_layout];
        document.getElementById("header-text").style.color = colors_array[this.act_layout];
    }
}
