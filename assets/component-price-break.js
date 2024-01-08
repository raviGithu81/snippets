/**
* Custom element representing a price break component.
*/
class priceBreak extends HTMLElement {
    constructor() {
      super();
      
      // DOM elements variables
      this.volumePriceListWrapper = this.querySelector('[data-volume-price-list-wrapper]');
      this.volumePriceListEle = this.querySelector('[data-volume-price-list]');
      this.quantityInput = this.querySelector('[data-qty-input]');
      this.quantityActions = this.querySelectorAll('[data-qty-btn]');
      this.quantityRuleCaption = this.querySelector('[data-quantity-rule-caption]');
      this.currentPriceEle = this.querySelector('[data-current-price]');
      this.currentVariant = window.globalVariables.product.currentVariant;

      // Event listeners for quantity buttons
      if (this.quantityActions.length > 0) {
        this.quantityActions.forEach(btn => btn.addEventListener('click', this.manageQuantity.bind(this)));
      }
      
      // Parsing and storing price break data
      this.priceBreakData = this.querySelector('[data-price-break-json]');
      if (this.priceBreakData) {
        this.priceBreakData = JSON.parse(this.priceBreakData.textContent);
      }
    }
    
    connectedCallback() {
      // Initializing the component
      this.init();
    }

    /**
    * Event handler triggered upon variant change.
    * Updates displayed information based on the selected variant.
    */
    variantChanged = () => {
      // Listens for the 'variant:changed' event
      document.addEventListener('variant:changed', (evt) => {
        // Retrieves variant ID and initializes variables
        if(window.globalVariables.product.currentVariant == null) return;
        this.currentVariant = window.globalVariables.product.currentVariant;

        let varID = this.currentVariant.id;
        let priceList = '';
        
        // Fetches price list for the current variant if available
        if (this.priceBreakData && varID in this.priceBreakData) {
          priceList = this.priceBreakData[varID];
        }
        let html = '';

        // Sets the minimum quantity in the quantity input field if available
        if (this.quantityInput) {
          this.quantityInput.value = this.currentVariant.quantity_rule?.min;
          this.quantityActions.forEach(btn => {
            if (btn.dataset.for == "increase") {
              btn.classList.remove('disabled')
            }
          })
        };
        
        // Checks if the volume price list wrapper exists, if not, exits the function
        if (!this.volumePriceListWrapper) return;
        
        // Handles displaying price list information if available
        if (priceList) {
          let minQty = this.currentVariant?.quantity_rule.min;
          let maxQty = this.currentVariant?.quantity_rule.max;
          let incQty = this.currentVariant?.quantity_rule.increment;
          
          let quantityRuleCaptions = '';
          // Constructs quantity rule captions based on available rules
          if (incQty > 1) quantityRuleCaptions += `<li>${window.volumePricingStrings.multiples_of.replace('{{ quantity }}', incQty)}</li>`;
          if (minQty > 1) quantityRuleCaptions += `<li>${window.volumePricingStrings.minimum_of.replace('{{ quantity }}', minQty)}</li>`;
          if (maxQty) quantityRuleCaptions += `<li>${window.volumePricingStrings.maximum_of.replace('{{ quantity }}', maxQty)}</li>`;

          // Displays quantity rule captions if available, else hides the caption
          if(this.quantityRuleCaption != null){
            if (quantityRuleCaptions != '') {
              this.quantityRuleCaption.style.display = 'inline-flex';
              this.quantityRuleCaption.innerHTML = quantityRuleCaptions;
            } else {
              this.quantityRuleCaption.style.display = 'none';
            }
          }
          
          // Displays the volume price list wrapper and constructs HTML for price list items
          this.volumePriceListWrapper.style.display = '';
          priceList.forEach(priceBreak => {
            html += `<li class="d-flex justify-content-between p-2">
            <span>${window.volumePricingStrings.minimum.replace('{{ quantity }}', priceBreak.minimum_quantity)}</span>
            <span>${Utility.formatMoney(priceBreak.price, window.globalVariables.money_format)}</span>
            </li>`;
          });
        } else {
          // Hides the volume price list wrapper and quantity rule caption if no price list is available
          if(this.volumePriceListWrapper != null) this.volumePriceListWrapper.style.display = 'none';
          if(this.quantityRuleCaption != null) this.quantityRuleCaption.style.display = 'none';
        }
        // Updates the volume price list element with constructed HTML
        this.volumePriceListEle.innerHTML = html;
      });
    }
    
    /**
    * Event handler for managing quantity changes.
    * Adjusts the quantity based on the button clicked and updates value accordingly.
    * @param {Event} event - The click event on a quantity button.
    */
    manageQuantity = (event) => {
      // Fetches the price list based on the current variant and price break data availability
      event.preventDefault();

      let priceList = '';
      if (this.priceBreakData && this.currentVariant.id in this.priceBreakData) {
        priceList = this.priceBreakData[this.currentVariant.id];
      }
      
      // Retrieves quantity rules and current quantity values
      let currQty = parseInt(this.quantityInput.value);
      let minQty = this.currentVariant?.quantity_rule.min || 1;
      let maxQty = this.currentVariant?.quantity_rule.max;
      let incQty = this.currentVariant?.quantity_rule.increment || 1;
      let finalQty = currQty;

      // Buttons for increasing and decreasing quantity
      let decreaseQtyBtn = event.currentTarget.closest('[data-b2b-qty-container]').querySelector('[data-for="decrease"]');
      let increaseQtyBtn = event.currentTarget.closest('[data-b2b-qty-container]').querySelector('[data-for="increase"]');
      
      // Adjusts quantity based on the button clicked
      if (event.currentTarget.dataset.for == 'increase') {
        // Increases quantity by the defined increment
        finalQty = currQty + incQty;
        this.quantityInput.value = finalQty;
        
        // Manages the disabled state of buttons based on quantity limits
        decreaseQtyBtn.classList.remove('disabled');
        
        if (maxQty && finalQty >= maxQty) {
          event.currentTarget.classList.add('disabled');
        } else {
          event.currentTarget.classList.remove('disabled');
        }
      } else if (event.currentTarget.dataset.for == 'decrease') {
        // Disables decrease button if minimum quantity is reached
        if (finalQty == minQty) {
          decreaseQtyBtn.classList.add('disabled');
          return;
        } else {
          decreaseQtyBtn.classList.remove('disabled');
        }
        
        // Decreases quantity by the defined increment
        finalQty = currQty - incQty;
        this.quantityInput.value = finalQty;
        
        // Manages the disabled state of buttons based on quantity limits
        increaseQtyBtn.classList.remove('disabled');
        
        if (minQty && (finalQty <= minQty || finalQty == minQty)) {
          event.currentTarget.classList.add('disabled');
        } else {
          event.currentTarget.classList.remove('disabled');
        }
      }
      
      let quantityFound = false;
      // Checks if the quantity matches the minimum required for a price break
      if (priceList) {
        priceList.map(item => {
          if (finalQty >= item.minimum_quantity) {
            // Updates the displayed price based on the quantity
            this.currentPriceEle.innerHTML = window.volumePricingStrings.price_at_each.replace('{{ price }}', Utility.formatMoney(item.price, window.globalVariables.money_format));
            quantityFound = true;
            return;
          }
        });
      }
      
      // Sets default price if quantity doesn't meet any price break criteria
      if (!quantityFound) {
        this.currentPriceEle.innerHTML = window.volumePricingStrings.price_at_each.replace('{{ price }}', Utility.formatMoney(this.currentVariant.price, window.globalVariables.money_format));
      }
    }
    
    /**
    * Initialization function, sets up event listeners and initial state.
    */
    init = () => {
      this.variantChanged();
    }
  }
  
// Defined the custom element as 'price-break'
customElements.define('price-break', priceBreak);