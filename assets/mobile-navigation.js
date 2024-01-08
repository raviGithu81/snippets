/**
* Mobile Navigation Drawer
*/
class MobileNavigation extends HTMLElement {
    constructor() {
      super();
      
      this.touchstartX = 0;
      this.touchendX = 0;
  
      this.openeBy = document.querySelector('#mobile-menu');
      this.closeBy = this.querySelector('.close-mobile--navbar');
      this.navDrawer = this.querySelector('#mobile-menu-drawer');
      this.bindEvents();
    }
  
    /**
     * Focus Out Event to close drawer
     *
     * @param {event} Event instance
     */
    focusOut(event){
      let isOpen = this.navDrawer.classList.contains('opened-drawer');
      if (!this.contains(event.relatedTarget) && isOpen == true) {
        this.closeBy.dispatchEvent(new Event('click'));
      }
    }
  
    /**
     * Escape Key Press to close drawer when focus is within the container
     *
     * @param {event} Event instance
     */
    onKeyUp(event) {
      if(event.code.toUpperCase() !== 'ESCAPE') return;
      this.closeBy.dispatchEvent(new Event('click'));
    }
  
    /**
     * bind click event to Menu Icon 
     * bind keyup event to Menu Drawer component
     */
    bindEvents() {
      this.openeBy.addEventListener('click', this.openMenuDrawer.bind(this));
      this.closeBy.addEventListener('click', this.closeMenuDrawer.bind(this));
      this.addEventListener('keyup', this.onKeyUp.bind(this));
    }
  
    /**
     * Open Menu Drawer
     *
     * @param {event} Event instance
     */
    openMenuDrawer(event) {
      this.navDrawer.classList.add('opened-drawer');
      siteOverlay.prototype.showOverlay();
      if(document.querySelector('cart-form.cart-drawer').classList.contains('opened-drawer')){
        document.querySelector('.close-ajax--cart').dispatchEvent(new Event('click'));
      }
      if(event){
        event.preventDefault();
        let openBy = event.currentTarget;
        openBy.setAttribute('aria-expanded', true);
        Utility.trapFocus(this.navDrawer, this.querySelector('.mobile-header--logo'));
        Utility.forceFocus(this.querySelector('.mobile-header--logo'));
      }
    }
  
    /**
     * Close Menu Drawer
     *
     * @param {event} Event instance
     */
    closeMenuDrawer(event, elementToFocus = false) {
      if (event !== undefined) {
        event.preventDefault();
        this.navDrawer.classList.remove('opened-drawer');
        siteOverlay.prototype.hideOverlay();
  
        let openDropdowns = Array.from(document.querySelectorAll('#mobile-menu-drawer .dropdown.open'));
        openDropdowns.forEach((ele) => {
          ele.classList.remove('open');
          ele.querySelector('[is="drop-down"]').setAttribute('aria-expanded', false);
        });
  
        this.openeBy.setAttribute('aria-expanded', false);
        Utility.forceFocus(this.openeBy);
      }
    }
  
    /**
     * To get User Touch action pattern (Swipe Left / Swipe Right)
     *
     */
    handleGesture() {
      if (this.touchendX < this.thistouchstartX)
        this.openeBy.dispatchEvent(new Event('click'));
      if (this.touchendX > this.touchstartX)
        this.closeBy.dispatchEvent(new Event('click'));
    }
  }
  customElements.define("mobile-nav", MobileNavigation);