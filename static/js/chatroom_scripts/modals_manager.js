export class ModalsManager
{
    constructor()
    {
        // holding opened modal (alerts, warning mesasages, 5 minutes left etc.) 
        this.opened_modal = "";
    }

    closeAllModals() {
        var all_modals = document.getElementsByClassName('reactions-modal');
        
        for (var i = 0; i < all_modals.length; ++i) {
            all_modals[i].style.display = "none";  
        }

        all_modals = document.getElementsByClassName('report-modal');
        
        for (var i = 0; i < all_modals.length; ++i) {
            all_modals[i].style.display = "none";  
        }
    }

    openOrCloseModal(button_dom, modal_type) {
        this.closeAllModals();

        var modal = button_dom.parentNode.querySelector(`.${modal_type}-modal`);

        if (modal == this.opened_modal) {
            this.opened_modal = "";

            return;
        }

        modal.style.display = "inherit";
        this.opened_modal = modal;
    }
} 