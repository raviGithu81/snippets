// Ajax cart JS for Drawer and Cart Page
const drawerSelectors = {
  cartIcons: document.querySelectorAll('.header__icon--cart'),
  cartIconDesktop: document.querySelector('#cart-icon-desktop'),
  cartIconMobile: document.querySelector('#cart-icon-mobile'),
  cartCloseBtn: document.querySelector('.close-ajax--cart'),
  cartTotal: document.querySelector('#ajax-cart [data-cart-total]')
};

class AjaxCart extends HTMLElement {
    constructor() {
      super();
  
      this.openeBy = drawerSelectors.cartIcons;
      this.isOpen =  this.classList.contains('open--drawer');
      this.cartForm = this.querySelector('form');
      this.sectionID = 'component-cart-drawer';

      if(window.globalVariables.template == 'cart'){
        this.style.visibility = 'visible';
        this.sectionID = document.getElementById('cart--items').dataset.id;
      }else{
        this.addAccessibilityAttributes(this.openeBy);
        this.getCartData();
      }

      if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
    }
  
    connectedCallback() {
      this.bindEvents();
      this.cartNoteInput();
    }

    /**
     * Observe attribute of component
     * 
     * @returns {array} Attributes to Observe
     */
    static get observedAttributes() {
      return ['updating'];
    }
  
    /**
     * To Perform operation when attribute is changed
     * Calls attributeChangedCallback() with params when attribute value is updated
     * 
     * @param {string} name attribute name
     * @param {string} oldValue attribute Old value
     * @param {string} newValue attribute latest value
     */
    attributeChangedCallback(name, _oldValue, newValue) {
      // called when one of attributes listed above is modified
      if(name === 'updating' && newValue === 'false'){
        this.updateEvents();
      }
    }
  
    /**
     * Add accessibility attributes to Open Drawer buttons
     * 
     * @param {Node Array} openDrawerButtons Cart Icons
     */
    addAccessibilityAttributes(openDrawerButtons) {
      let _this = this;
      openDrawerButtons.forEach(element => {
        element.setAttribute('role', 'button');
        element.setAttribute('aria-expanded', false);
        element.setAttribute('aria-controls', _this.id);
      });
    }
  
    /**
     * Escape Click event to close drawer when focused within Cart Drawer
     *
     * @param {event} Event instance
     */
    onKeyUp(event) {
      if(event.code.toUpperCase() !== 'ESCAPE') return;
      drawerSelectors.cartCloseBtn.dispatchEvent(new Event('click'));
    }
  
    /**
     * bind dclick and keyup event to Cart Icons
     * bind keyUp event to Cart drawer component
     * bind Other inside element events
     *
     */
    bindEvents() {
      if(window.globalVariables.template !== 'cart'){
        this.openeBy.forEach(cartBtn => cartBtn.addEventListener('click', this.openCartDrawer.bind(this)));
        this.addEventListener('keyup', this.onKeyUp.bind(this));
        drawerSelectors.cartCloseBtn.addEventListener('click', this.closeCartDrawer.bind(this));
      }
      this.updateEvents();
    }

    /**
     * bind Other inside element events to DOM
     *
     */
    updateEvents(){
      this.querySelectorAll('[data-item-remove]').forEach(button => button.addEventListener('click', this.removeItem.bind(this)));
      this.querySelectorAll('[data-qty-btn]').forEach(button => button.addEventListener('click', this.manageQtyBtn.bind(this)));
      this.querySelectorAll('[data-qty-input]').forEach(button => button.addEventListener('change', this.onQtyChange.bind(this)));
    }
  
    /**
     * Open Cart drawer and add focus to drawer container
     *
     * @param {event} Event instance
     */
    openCartDrawer(event) {
      if(!window.globalVariables.cart_drawer){
        window.location.href = window.routes.cart_fetch_url || '/cart';
        return;
      }
  
      if(document.querySelector('#mobile-menu-drawer').classList.contains('opened-drawer')){
        document.querySelector('.close-mobile--navbar').dispatchEvent(new Event('click'));
      }
  
      this.classList.add('opened-drawer');
      siteOverlay.prototype.showOverlay();
      Utility.forceFocus(this.querySelector('.cart-title'));
      Utility.trapFocus(this, drawerSelectors.cartCloseBtn);
  
      if(event){
        event.preventDefault();
        let openBy = event.currentTarget;
        openBy.setAttribute('aria-expanded', true);
      }
    }
  
    /**
     * Close Cart drawer and Remove focus from drawer container
     *
     * @param {event} Event instance
     */
    closeCartDrawer(event, elementToFocus = false) {
      if (event == undefined) return;

      event.preventDefault();
      this.classList.remove('opened-drawer');
      siteOverlay.prototype.hideOverlay();

      let openByEle = event.currentTarget;
      openByEle.setAttribute('aria-expanded', false);
      Utility.removeTrapFocus(elementToFocus);

      let actionBtn = drawerSelectors.cartIconDesktop;
      if(window.innerWidth < 1024){
        actionBtn = drawerSelectors.cartIconMobile;
      }
      Utility.forceFocus(actionBtn);
    }
  
    /**
     * Update cart HTML and Trigger Open Drawer event
     *
     * @param {string} cartHTML String formatted response from fetch cart.js call
     * @param {string} action Open Drawer as value if need to Open Cart drawer
     */
    _updateCart(response, action){
      if(response === null) return;

      this.setAttribute('updating', true);

      // Convert the HTML string into a document object
      let cartHTML = response[this.sectionID];
      let parser = new DOMParser();
      cartHTML = parser.parseFromString(cartHTML, 'text/html');

      let cartJSONEle = cartHTML.querySelector('[data-cartScriptJSON]');
      window.globalVariables.cart = JSON.parse(cartJSONEle.textContent);

      let cartElement = cartHTML.querySelector('form');
      this.cartForm.innerHTML = cartElement.innerHTML;

      let cartTotal = Utility.formatMoney(window.globalVariables.cart.total_price, window.globalVariables.money_format);
      drawerSelectors.cartTotal.innerHTML = cartTotal;

      let cart_items_count = cartHTML.querySelector('[data-item-count]');
      if(cart_items_count) this.querySelector('[data-item-count]').innerHTML = cart_items_count.innerHTML;

      let elements = this.querySelectorAll('[data-checkoutBtns], [data-cartnote]');
      let cart_container = this.querySelector('.cart-form-container');
      if(window.globalVariables.cart.item_count <= 0){
        elements.forEach((div)=>{
          div.classList.add('d-none');
        });
        cart_container.classList.add('empty_cart');
      }else{
        elements.forEach((div)=>{
          div.classList.remove('d-none');
        });
        cart_container.classList.remove('empty_cart');
      }

      this.setAttribute('updating', false);

      let headerHTML = new DOMParser().parseFromString(response['header'], 'text/html');
      let cartIcon = headerHTML.getElementById('cart-icon-desktop');
      if(drawerSelectors.cartIconDesktop) drawerSelectors.cartIconDesktop.innerHTML = cartIcon.innerHTML;
      if(drawerSelectors.cartIconMobile) drawerSelectors.cartIconMobile.innerHTML = cartIcon.innerHTML;

      if(window.globalVariables.template !== 'cart' && window.globalVariables.cart_drawer && action === 'open_drawer'){
        this.openCartDrawer();
      }
    }

    /**
     * Fetch latest cart data 
     *
     * @param {string} action Open Drawer as value if need to Open Cart drawer or else let it be empty
     */
    getCartData(action){
      let cartRoute = `${window.location.pathname}?sections=${this.sectionID},header`;
      fetch(cartRoute).then(response => {
        return response.json();
      }).then(response => {
          this._updateCart(response, action);
      }).catch((e) => {
          console.error(e);
      }).finally(() => {
          // Cart HTML fetch done
      });
    }
  
     /**
     * Update Quantity API call 
     *
     * @param {string} line Line Index value of cart Item (Starts from 1)
     * @param {integer} quantity Quantity to update
     */
    updateItemQty(line, quantity){
      let lineItem = document.querySelectorAll('[data-cart-item]')[line-1];

      if(lineItem){ lineItem.classList.add('updating'); }
      const body = JSON.stringify({
        line,
        quantity
      });

      fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body }})
      .then((response) => {
          return response.text();
      })
      .then((_state) => {
        let dataJSON = ((typeof res == 'object') ? _state : JSON.parse(_state));
        if(dataJSON.errors){
          window.notificationEle.updateNotification('Cart Update', dataJSON.errors, {
            type: 'error',
            timeout: 5000
          });
        }
        this.getCartData();
      }).catch((error) => {
        window.notificationEle.updateNotification('Cart Update', error, {
          type: 'error',
          timeout: 5000
        });
      }).finally(() => {
        setTimeout(() => {
          if(lineItem){ lineItem.classList.remove('updating'); }
        }, 500);
      });
    }
  
    /**
     * Remove Item Event
     *
     * @param {event} Event instance
     */
    removeItem(event){
      event.preventDefault();
      let currentTarget = event.currentTarget;
      let itemIndex = currentTarget.dataset.index || null;
      if(itemIndex !== null){
          this.updateItemQty(itemIndex, 0);
      }
    }
  
    /**
     * Cart Item Qunatity Increment/Decrement Button event
     *
     * @param {event} Event instance
     */
    manageQtyBtn(event){
      event.preventDefault();
      let currentTarget = event.currentTarget;
      let action = currentTarget.dataset.for || 'increase';
      let $qtyInput = currentTarget.closest('[data-qty-container]').querySelector('[data-qty-input]');
      let itemIndex = $qtyInput.dataset.index || 1;

      let stepQty = ($qtyInput.step) ? parseInt($qtyInput.step) : 1;
      let minQty = ($qtyInput.min) ? parseInt($qtyInput.min) : 1;
      let maxQty = ($qtyInput.max) ? parseInt($qtyInput.max) : null;

      let currentQty = parseInt($qtyInput.value) || minQty;
      let finalQty = currentQty;
  
      if(action === 'decrease' && currentQty <= minQty){
        return false;
      }else if(action === 'decrease'){
        finalQty = currentQty - stepQty;
      }else{
        finalQty = currentQty + stepQty;
      }

      this.updateItemQty(itemIndex, finalQty);
      
      // if(maxQty != null && finalQty <= maxQty && finalQty >= minQty){
      //   this.updateItemQty(itemIndex, finalQty);
      // }else if(finalQty >= minQty){ 
        
      // }
    }

    /**
     * Cart Item Qunatity Input change event
     *
     * @param {event} Event instance
     */
    onQtyChange(event){
      const $qtyInput = event.currentTarget;
      const qtyValue = $qtyInput.value;
      const itemIndex = $qtyInput.dataset.index || null;
      if(itemIndex) this.updateItemQty(itemIndex, qtyValue);
    }

    /**
     * Manage Cart Notes
     */
    cartNoteInput(){
      const cartNoteEle = document.querySelector('[data-cartNote] [name="note"]');
      if(!cartNoteEle) return;

      const cartNoteSave = document.querySelector('[data-saveNote]');
      let cartNoteEvents = ['input', 'paste'];
      cartNoteEvents.forEach((eventName)=>{
        cartNoteEle.addEventListener( eventName, (evt)=> {
          const defaultNote = cartNoteEle.dataset.default;
          if(defaultNote !== cartNoteEle.value){
            cartNoteSave.style.display = 'block';
          }else{
            cartNoteSave.style.display = 'none';
          }
        }, false);
      });

      //  Cart Note Change event
      cartNoteSave.addEventListener( "click", evt => {
        evt.preventDefault();
        const cartNoteContainer = evt.currentTarget.closest('[data-cartNote]');
        const cartNote = cartNoteContainer.querySelector('[name="note"]').value.trim();
        if(cartNote.length <= 0){
          alert('Add Note before proceeding');
          return;
        }
        
        const submitBtn = cartNoteContainer.querySelector('[data-saveNote]');
        const waitText = (submitBtn.dataset.adding_txt) ? submitBtn.dataset.adding_txt : 'Saving...';
        submitBtn.innerHTML = waitText;
        submitBtn.disabled = true;
        this.updateCartNote(cartNoteContainer);
      });
    }

    /**
     * Update Cart Note
     * @param {element} cartNoteContainer 
     */
    updateCartNote(cartNoteContainer){
      const _this = this;
      const cartNoteEle = cartNoteContainer.querySelector('[name="note"]');
      const cartNote = cartNoteEle.value.trim();
      const resultEle = cartNoteContainer.querySelector('[data-resultMsg]');
      const submitBtn = cartNoteContainer.querySelector('[data-saveNote]');
      const defaultText = (submitBtn.dataset.default) ? submitBtn.dataset.default : 'Save';

      let body = JSON.stringify({
        note: cartNote
      });
      fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body }
      }).then(function (data) {
        if (data.status === 200) {
          if(resultEle){
            resultEle.innerText = 'Added note to Order!';
            _this.manageResponseText(resultEle);
          }
          if(cartNoteEle){
            cartNoteEle.dataset.default = cartNote;
          }
          submitBtn.style.display = 'none';
          submitBtn.innerHTML = defaultText;
          submitBtn.disabled = false;
        }
        else {
          console.error('Request returned an error', data);
          if(resultEle){
            resultEle.innerText = data;
            _this.manageResponseText(resultEle);
          }
          submitBtn.innerHTML = defaultText;
          submitBtn.disabled = false;
        }
      }).catch(function (error) {
          console.error('Request failed', error);
          if(resultEle){
            resultEle.innerText = error;
            _this.manageResponseText(resultEle);
          }
          submitBtn.innerHTML = defaultText;
          submitBtn.disabled = false;
      });
    }

    /**
     * fade effect on reponse
     * @param {element} element 
     */
    manageResponseText(element){
      Utility.fadeEffect(element, 'fadeIn');
      setTimeout(() => {
          Utility.fadeEffect(element, 'fadeOut');
      }, 3000);
    }
}
customElements.define("cart-form", AjaxCart);