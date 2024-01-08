/**
 * Product Form Components
 *
 */
class ProductForm extends HTMLElement {
  constructor() {
    super();

    this.form = this.querySelector('form');
    this.qtyBtns = this.querySelectorAll('[data-qty-btn]');
    this.cartElement = document.querySelector('cart-form');   
  }

  connectedCallback() {
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    if(this.querySelector('[data-qty-container]')){
      this.qtyBtns.forEach(qtyBtn => qtyBtn.addEventListener('click', this.manageQtyBtn.bind(this)));
    }
  }

  /**
   * Product Form Submit event
   *
   * @param {evt} Event instance
   */
  onSubmitHandler(evt) {
    evt.preventDefault();
    const addItems = [];
    const submitButton = this.querySelector('[type="submit"]');
    const qtyInput = this.querySelector('[data-qty-input]');
    
    submitButton.setAttribute('disabled', true);
    submitButton.classList.add('loading');

    addItems.push(JSON.parse(serializeForm(this.form)));
    const body = JSON.stringify({
      items: addItems
    });
    
    fetch(`${routes.cart_add_url}`, { ...fetchConfig(), body })
    .then((response) => response.json())
    .then((res) => {
      let dataJSON = ((typeof res == 'object') ? res : JSON.parse(res));
      if(dataJSON.errors){
        window.notificationEle.updateNotification('Add to Cart', dataJSON.errors, {
          type: 'error',
          timeout: 5000
        });
      }

      if(document.querySelector('#PopupModal-quickshop')){
        document.querySelector('#PopupModal-quickshop .close-quickshop').dispatchEvent(new Event('click'))
      }
      if(qtyInput) qtyInput.value = 1;
      if(this.cartElement){
        this.cartElement.getCartData('open_drawer');
      }else{
        window.location.href = window.routes.cart_fetch_url;
      }      
    })
    .catch((e) => {
      window.notificationEle.updateNotification('Error', e, {
        type: 'error',
        timeout: 5000
      });
      console.error(e);
    })
    .finally(() => {
      submitButton.classList.remove('loading');
      submitButton.removeAttribute('disabled');
    });
  }

  /**
   * Product Form Quantity Input update action
   *
   * @param {event} Event instance
   */
  manageQtyBtn(event) {
    event.preventDefault();
    let currentTarget = event.currentTarget;
    let action = currentTarget.dataset.for || 'increase';
    let $qtyInput = currentTarget.closest('[data-qty-container]').querySelector('[data-qty-input]');
    let currentQty = parseInt($qtyInput.value) || 1;
    let finalQty = 1;
    let decreaseQtyBtn = currentTarget.closest('[data-qty-container]').querySelector('[data-for="decrease"]');

    if(action == 'decrease' && currentQty <= 1){
      if(decreaseQtyBtn) decreaseQtyBtn.classList.add('disabled');
      return false;
    }else if(action == 'decrease'){
      finalQty = currentQty - 1;
      finalQty == 1 ? decreaseQtyBtn.classList.add('disabled') : decreaseQtyBtn.classList.remove('disabled');
    }else{
      if(decreaseQtyBtn) decreaseQtyBtn.classList.remove('disabled');
      finalQty = currentQty + 1;
    }

    $qtyInput.value = finalQty;
  }
}
customElements.define('product-form', ProductForm);

/**
 * Dropdown selection for options
 */
class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.form = this.closest('form') || this.closest('.form-element');
    this.formType = this.form.dataset.format;
    this.addBtn = this.form.querySelector('[name="add"]');
    this.variant_json = this.form.querySelector('[data-variantJSON]');
    this.variantPicker = this.dataset.type;
  }

  connectedCallback() {
    // Element Connected callback
    if(this.formType == 'product-page') this.onVariantChange('load');
    this.addEventListener('change', this.onVariantChange.bind(this));
  }

  /**
   * Trigger this function variant is changed
   * @param {event} _event 
   */
  onVariantChange(_event) {
    this.setCurrentVariant();
    
    if(this.formType == 'product-page') window.globalVariables.product.currentVariant = this.currentVariant;
    document.dispatchEvent(new Event('variant:changed'));
    
    if (!this.currentVariant) {
      this.toggleAddButton('disable');
      this.updateOptionLabel(this.form); 
    } else {
      if(this.formType == 'grid'){
        const productGrid = this.closest('[data-product-grid]');
        this.renderProductInfo(this.currentVariant, productGrid);
        this._updateLinks(productGrid); 
      }else{
        const productPage = this.closest('[data-product-container]');
        this.renderProductInfo(this.currentVariant, productPage);
      }
      this.updateURLandID(this.currentVariant);
      this.toggleAddButton('enable');
    }
  }

  /**
   * Change product variant url link in product card when variant is being updated
   * @param {element} productGrid 
   */
  _updateLinks(productGrid){
    if(!this.currentVariant || !productGrid) return;
    const variantURL = `?variant=${this.currentVariant.id}`;
    const formLinks = productGrid.querySelectorAll('.product-link');
    formLinks.forEach(link => {
      let href = link.href.split('?')[0];
      link.href = href + variantURL;
    });
  }

  /**
   * Fetch selected options from dropdown
   */
  _getOptionsFromSelect() {
    let options = [];
    this.querySelectorAll('.variant_selector').forEach((selector)=>{
      options.push(selector.value);
    });
    return options;
  }

  /**
   * Fetch selected options from radio
   */
  _getOptionsFromRadio() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset:not(.addon-fieldset)'));
    return fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input:not(.addon-swatch)')).find((radio) => radio.checked).value;
    });
  }

  /**
   * change value of currentVariant when variant being changed 
   */
  setCurrentVariant() {
    this.currentVariant = false;
    let options = (this.variantPicker == 'variant-select') ? this._getOptionsFromSelect() : this._getOptionsFromRadio();

    let variantsArray = this._getVariantData();
    variantsArray.find((variant) => {
      let mappedValues = variant.options.map((option, index) => {
        return options[index] === option;
      });

      if(!mappedValues.includes(false)){
        this.currentVariant = variant;
      }
    });
  }

  /**
   * Update selected option name label
   */
  updateOptionLabel(form){
    let options = form.querySelectorAll('[data-optionindex]');
    options.forEach(option => {
      let lableID = 'option'+option.dataset.optionindex;
      const lable = option.querySelector('.selected-option');
      if(!lable || !lableID) return;
      lable.innerHTML = this.currentVariant[lableID];
    });
  }

  /**
   * Update URL on variant change event
   * @param {JSON} currentVariant 
   */
  updateURLandID(currentVariant) {
    if (!currentVariant) return;

    if(this.formType == 'product-page') window.history.replaceState({ }, '', `${this.dataset.url}?variant=${currentVariant.id}`);

    const input = this.form.querySelector('input[name="id"]');
    input.value = currentVariant.id;
  }

  /**
   * Render Price details based on current variant
   */
  priceUpdate(currentVariant, container){
    let price = Utility.formatMoney(currentVariant.price, window.globalVariables.money_format);
    let compare_price = Utility.formatMoney(currentVariant.compare_at_price, window.globalVariables.money_format);
    let priceElement = container.querySelector('[data-currentPrice]');
    let comparePriceElement = container.querySelector('[data-comparePrice]');

    if(priceElement) priceElement.innerHTML = price;
    if(comparePriceElement) {
      comparePriceElement.innerHTML = compare_price;
      if(currentVariant.compare_at_price <= 0){
        comparePriceElement.style.display = 'none';
      }else{
        comparePriceElement.style.display = 'block';
      }
    }
  }

  /**
   * Render Product data based on current variant
   * @param {object} currentVariant 
   * @param {element} container 
   */
  renderProductInfo(currentVariant, container) {
    if(!currentVariant || !container) return;
   
    this.priceUpdate(currentVariant, container);
    this.updateOptionLabel(this.form); 

    const featured_image = currentVariant.featured_image || null;
    if(featured_image != null){
      if(this.formType == 'grid'){
        const featuredImage = container.querySelector('[data-feauredImage]');
        featuredImage.src = currentVariant.featured_image.src;
        featuredImage.srcset = currentVariant.featured_image.src;
      }else{
        let imageSlide = document.querySelector(`.product--media[data-mediaID="${currentVariant.featured_media.id}"]`);
        if(this.formType == 'quickshop'){
          imageSlide = document.querySelector(`.quickshop-slider .product--media[data-mediaID="${currentVariant.featured_media.id}"]`);
        }
        if(!imageSlide) return;
  
        let slideIndex = Array.from(imageSlide.parentNode.children).indexOf(imageSlide);
        if(this.formType == 'quickshop' && quickShopSlider){
          quickShopSlider.slideTo(slideIndex, 0, false);
        }else if(productSlider){
          productSlider.slideTo(slideIndex, 0, false);
        }
      }
    }
  }

  /**
   * Toggle the button based on product availability ( add to cart / soldOut )
   * @param {*} status enable / disable
   */
  toggleAddButton(status) {
    if (!this.addBtn) return;

    if (status == 'disable') {
      this.addBtn.setAttribute('disabled', true);
      if(this.addBtn.querySelector('.add-text'))
        this.addBtn.querySelector('.add-text').textContent = window.variantStrings.unavailable;
    } else if(this.currentVariant && !this.currentVariant.available) {
      this.addBtn.setAttribute('disabled', true);
      if(this.addBtn.querySelector('.add-text'))
        this.addBtn.querySelector('.add-text').textContent = window.variantStrings.soldOut;
    } else {
      this.addBtn.removeAttribute('disabled');
      if(this.form.classList.contains('cart-upsell-form')){
        this.addBtn.querySelector('.add-text').textContent = window.variantStrings.upsellAddText;
      }else{
        this.addBtn.querySelector('.add-text').textContent = window.variantStrings.addToCart;
      }
    }
  }

  /**
   * Store the all the variants json
   */
  _getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.variant_json.textContent);
    return this.variantData;
  }
}
customElements.define('variant-selects', VariantSelects);

/**
 * Radio Button swatch
 */
class VariantRadios extends VariantSelects {
  constructor() {
    super();

    this.form = this.closest('form') || this.querySelector('.form-element');
    this.formType = this.form.dataset.format;

    const colorSwatchContainer = this.querySelector('.color-swatch');
    if(colorSwatchContainer){
      const colorSwatches = colorSwatchContainer.querySelectorAll('.swatch');
      colorSwatches.forEach(swatch => {
        let colorHandle = swatch.querySelector('input[type="radio"]').dataset.handle;
        let swatchStyle = Utility.getSwatchStyle(colorHandle);
        swatch.querySelector('.swatch-label').setAttribute('style', swatchStyle);
      });
    }
  }
}
customElements.define('variant-radios', VariantRadios);