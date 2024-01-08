const passwordPageSelectors = {

};

class templatePasswordJS {
    constructor() {
        this.checkForSubmission();
    }

    checkForSubmission(){
        let windowURL = window.location.href;
        let triggerLoginModal = document.querySelector('[data-modal-opener="passowrd-modal"]');
        const passwordModal = document.querySelector('#passowrd-modal')
        if(windowURL.indexOf('?login_attempt') > -1){
            openModal(passwordModal, triggerLoginModal);
        }
    }
}

typeof templatePasswordJS !== 'undefined' && new templatePasswordJS()