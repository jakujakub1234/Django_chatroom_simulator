const report_box = document.getElementById("report-box");

function addReport(report_button_dom, report_id)
{
    var random_time = Math.floor(Math.random() * (25 - 15 + 1)) + 15;

    report_box.open = true;
    closeAllModals();

    var message_id = report_button_dom.parentNode.parentNode.parentNode.parentNode.querySelector(".message-p").dataset.index;
    var bot_nick = report_button_dom.parentNode.parentNode.parentNode.parentNode.querySelector(".span-bot").innerText;
    var message_text = report_button_dom.parentNode.parentNode.parentNode.parentNode.querySelector(".message-p").innerText;

    sendDataThroughAjax({
        csrfmiddlewaretoken: token,
        action: "reports",
        message_id: message_id,
        message_text: message_text,
        report_id, report_id
    });

    reports_remove_messages_queue.push([random_time, message_id, bot_nick, report_id]);
    reports_remove_messages_queue.sort((a, b) => a[0] - b[0]);

    closeReportDialog();
}

function closeReportDialog()
{
    report_box.open = false;
}

function createDomWithReportModal()
{
    var report_modal = document.createElement("div");
    report_modal.classList.add("report-modal");
    report_modal.id = "report-modal-id";

    var report_modal_header = document.createElement("h3");
    report_modal_header.style.color = "black";
    report_modal_header.innerText = translations.chatroom_report_title;

    var report_respect_button =  document.createElement("button");
    report_respect_button.classList.add("report-button");
    report_respect_button.id = "report-button";
    report_respect_button.addEventListener("click", (event) => addReport(event.currentTarget, RESPECT_REPORT_ID_OR_RESPECT_NORM_CONFIRMED_ID));
    report_respect_button.innerText = translations.chatroom_report_respect_text;

    var report_hostile_button =  document.createElement("button");
    report_hostile_button.classList.add("report-button");
    report_hostile_button.id = "report-button";
    report_hostile_button.addEventListener("click", (event) => addReport(event.currentTarget, HOSTILE_REPORT_ID_OR_RESPECT_NORM_DENY_ID));
    report_hostile_button.innerText = translations.chatroom_report_hostile_text;

    /*
    var report_misinformation_button =  document.createElement("button");
    report_misinformation_button.classList.add("report-button");
    report_misinformation_button.id = "report-button";
    report_misinformation_button.addEventListener("click", (event) => addReport(event.currentTarget, MISINFORMATION_REPORT_ID));
    report_misinformation_button.innerText = translations.chatroom_report_misinformation_text;
    */

    report_modal.appendChild(report_modal_header);
    report_modal.appendChild(report_respect_button);
    report_modal.appendChild(report_hostile_button);
    //report_modal.appendChild(report_misinformation_button);

    return report_modal;
}

function createDomWithReportButton()
{
    var report_button = document.createElement("button");

    report_button.classList.add("report-button", "message-button");
    report_button.addEventListener("click", (event) => openOrCloseModal(event.currentTarget, "report"));
    report_button.innerHTML = report_svg;

    return report_button;
}
