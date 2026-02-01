const change_font_size_button = document.querySelector("#change-font-size");
const change_color_button = document.querySelector("#change-color-button");

var font_size_change = 0;
var act_layout = BLACK_LAYOUT;

change_font_size_button.addEventListener("change", function() {
    const selectedIndex = change_font_size_button.selectedIndex;
    changeFontSize(selectedIndex);
});

change_color_button.addEventListener("click", function() {
    changeLayoutColor(1);
});

function changeFontSize(change_index)
{
    font_size_change = change_index;

    var ele = document.getElementsByClassName('time-left');
    for (var i = 0; i < ele.length; i++) {
        if (font_size_change == 0) {
            ele[i].style.fontSize = "10pt";
        }
        if (font_size_change == 1) {
            ele[i].style.fontSize = "13pt";
        }
        if (font_size_change == 2) {
            ele[i].style.fontSize = "16pt";
        }
    }

    ele = document.getElementsByClassName('time-left-user');
    for (var i = 0; i < ele.length; i++) {
        if (font_size_change == 0) {
            ele[i].style.fontSize = "10pt";
        }
        if (font_size_change == 1) {
            ele[i].style.fontSize = "13pt";
        }
        if (font_size_change == 2) {
            ele[i].style.fontSize = "16pt";
        }
    }

    ele = document.getElementsByClassName('container-respond');
    for (var i = 0; i < ele.length; i++) {
        if (font_size_change == 0) {
            ele[i].style.fontSize = "10pt";
        }
        if (font_size_change == 1) {
            ele[i].style.fontSize = "13pt";
        }
        if (font_size_change == 2) {
            ele[i].style.fontSize = "16pt";
        }
    }

    ele = document.getElementsByClassName('message-p');
    for (var i = 0; i < ele.length; i++) {
        if (font_size_change == 0) {
            ele[i].style.fontSize = "13.5pt";
        }
        if (font_size_change == 1) {
            ele[i].style.fontSize = "16.5pt";
        }
        if (font_size_change == 2) {
            ele[i].style.fontSize = "19.5pt";
        }
    }

    ele = document.getElementsByClassName('span-bot');
    for (var i = 0; i < ele.length; i++) {
        if (font_size_change == 0) {
            ele[i].style.fontSize = "12pt";
        }
        if (font_size_change == 1) {
            ele[i].style.fontSize = "15pt";
        }
        if (font_size_change == 2) {
            ele[i].style.fontSize = "17pt";
        }
    }
}

function changeLayoutColor(change_index)
{
    act_layout = (act_layout + change_index) % 2;

    document.body.style.backgroundColor = layouts[act_layout];
    msg_field.style.background = msg_field_colors[act_layout];

    ele = document.getElementsByClassName('svg-icon');
    for (var i = 0; i < ele.length; i++) {
        ele[i].style.fill = colors_array[act_layout];
    }

    document.getElementById("user-writing").style.color = colors_array[act_layout];
    document.getElementById("header-text").style.color = colors_array[act_layout];
}
