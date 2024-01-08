const filterNodes = {
  quickShopModal: document.querySelector('quick-shop'),
  parent: document.getElementById('collectionFilters'),
  gridsContainer: document.getElementById('products-listing'),
  collectionBanner: document.querySelector('[data-collectionBanner]'),
  subCollectionLinks: Array.from(document.getElementsByClassName('subcollection-links')),
  openDrawerBtns: document.querySelectorAll('[data-openFilterDrawer]'),
  paginationParent: document.querySelector('[data-paginationParent]'),
  closeDrawer: document.querySelector('.collection-filters-close')
}

class CollectionFilters {
  constructor() {
    this.filterForm = filterNodes.parent.querySelector('form');

    filterNodes.parent.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE'){ filterNodes.closeDrawer.dispatchEvent(new Event('click')); }
    });

    this.debouncedOnSubmit = Utility.debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    if(this.filterForm){
      this.filterForm.addEventListener('input', this.debouncedOnSubmit.bind(this));
      this.filterForm.addEventListener('submit', this.debouncedOnSubmit.bind(this));
      window.addEventListener('popstate', this.onHistoryChange.bind(this));
    }
    
    this.bindEvents();
    this.dynamicEleEvents();
  }

  /**
   * bind dclick and keyup event to Cart Icons
   * bind keyUp event to Cart drawer component
   * bind Other inside element events
   *
  */
  bindEvents() {
    /** There are two open drawer buttons, one for Open filter drawer other for open sortby drawer **/
    if(filterNodes.openDrawerBtns.length > 0){
      filterNodes.openDrawerBtns.forEach(button => button.addEventListener('click', this.toggleFilterDrawer.bind(this)));
    }
    if(filterNodes.closeDrawer) filterNodes.closeDrawer.addEventListener('click', this.toggleFilterDrawer.bind(this));

    let sortby_desktop = document.querySelectorAll('[data-sortByDesktop] .sortby_options');
    sortby_desktop.forEach(input => input.addEventListener('change', this.updateSortBy.bind(this)));

    let paginateByValues = document.querySelectorAll('[data-custom-pagination] [name="paginateBy"]');
    paginateByValues.forEach(input => input.addEventListener('change', this.paginateProductsBy.bind(this)));

    /** Only for horizontal filters - Close filters when clicked outside container **/
    const filterType = filterNodes.parent.dataset.filtertype;
    if(filterType == 'horizontal-filters'){
      document.body.addEventListener('click', (_event)=>{
        const openFilters = document.querySelectorAll('.filter__container.open');
        openFilters.forEach((target) => {
          target.querySelector('.filter__toggle').click();
        })
      });
  
      const filterContainers = document.querySelectorAll('.filter__container');
      filterContainers.forEach((target) => {
        target.addEventListener('click', (event)=>{
          event.stopPropagation();
        });
      });
    }
  }

  dynamicEleEvents() {
    /** Toggle each filter block container containing values for dropdown effect **/
    const toggleBtns = Array.from(filterNodes.parent.getElementsByClassName('filter__toggle'));
    toggleBtns.forEach(button => button.addEventListener('click', this.toggleFilterBlock.bind(this)));

    filterNodes.subCollectionLinks = Array.from(document.getElementsByClassName('subcollection-links'));
    filterNodes.subCollectionLinks.forEach(link => link.addEventListener('click', this._manageSubCollections.bind(this)));

    if(filterNodes.quickShopModal && typeof filterNodes.quickShopModal.updateEvents == 'function'){ 
      filterNodes.quickShopModal.updateEvents(); 
    }

    const applyBtn = filterNodes.parent.querySelector('[data-applyFilters]');
    if(applyBtn){
      applyBtn.addEventListener('click', () => {
        this.filterForm.dispatchEvent(new Event('submit', {'bubbles' : true, 'cancelable' : true }));
        setTimeout(() => {
          filterNodes.closeDrawer.dispatchEvent(new Event('click'));
        }, 1000);
      });
    }

    const paginationLinks = document.querySelectorAll('[data-pagelinks]');
    paginationLinks.forEach(link => link.addEventListener('click', this._managePagination.bind(this)));

    this.colorOptionsStyling();
    this.bindActiveFilterButtonEvents();
  }

  /**
   * Collection filter form Input event
   * @param {event} event Event Instance
   */
  onSubmitHandler(event) {
    event.preventDefault();
    if(event.type == 'input' && filterNodes.parent.classList.contains('filter-active')){
      return;
    }

    const searchParams = this._createQueryString(this.filterForm)
    this.renderPage(searchParams);
  }

  /**
   * click event To Remove current selections
   * @param {element} form Collection page filter form
   */
  _createQueryString(form){
    const formData = Array.from(new FormData(form)).filter(function([k, v]) { return v });
    return new URLSearchParams(formData).toString();
  }

  /**
   * 
   * @param {String} searchParams Query Parameters
   * @param {String} updateURLHash true/false
  */
  renderPage(searchParams, updateURLHash = true) {
    filterNodes.gridsContainer.classList.add('loading');

    const url = `${window.location.pathname}?${searchParams}`;
    this.renderGridFromFetch(url, 'filter');

    if (updateURLHash) this.updateURLHash(searchParams);
  }

  /**
   * Add background color in label of Color options
   */
  colorOptionsStyling(){
    const colorSwatchContainer = filterNodes.parent.querySelector('[data-colorFilter]');
    if(colorSwatchContainer){
      const colorSwatches = colorSwatchContainer.querySelectorAll('.color-options');
      colorSwatches.forEach(swatch => {
        let colorHandle = swatch.querySelector('input[type="checkbox"]').dataset.handle;
        let swatchStyle = Utility.getSwatchStyle(colorHandle);
        swatch.querySelector('.option-label').setAttribute('style', swatchStyle);
      });
    }
  }

  /**
   * click event To Remove current selections
   * @param {event} event Event Instance
   */
   onActiveFilterClick(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    let URLString = new URL(event.currentTarget.href).searchParams.toString();
    if(URLString != null) this.renderPage(URLString);
  }

   /**
   * Update Window URL as per active filters
   * @param {event} event Event Instance
   */
  onHistoryChange(event) {
    const searchParams = event.state?.searchParams || '';
    this.renderPage(searchParams, false);
  }

  /**
   * 
   * @param {String} url URL for fetching results
   * @param {String} type filter / pagination / sub_collection
   */
  renderGridFromFetch(url, type) {
    if(!url) return;

    let sectionID = document.getElementById('products-listing').dataset.id;
    if(type == 'sub_collection'){
      url += `&sections=${sectionID},template-collection-banner`;
    }else{
      url += `&sections=${sectionID}`;
    }
   
    fetch(url)
      .then(response => response.json())
      .then((response) => {
        let gridHTML = response[sectionID];
        let bannerHTML = response['template-collection-banner'];
        this.renderProductGrid(type, gridHTML, bannerHTML);
      });
  }

  /**
   * 
   * @param {HTMlResponse} html 
   * @param {String} type filter / pagination / sub_collection
   */
  renderProductGrid(type, grid, banner) {
    const openFilters = document.querySelectorAll('.filter__container.open');
    const collectionParent = new DOMParser().parseFromString(grid, 'text/html');
    
    // We have used individuals components replacement code because of load more feature
    let paginationType = 'numbers';
    if(filterNodes.paginationParent){
      paginationType = filterNodes.paginationParent.dataset.type || 'numbers';
    }

    if(type == 'pagination' && paginationType == 'loadmore'){
      let productGrids = filterNodes.gridsContainer.querySelector('#product-grids');
      productGrids.insertAdjacentHTML('beforeend', collectionParent.getElementById('product-grids').innerHTML);

      let loadMoreBtn = document.getElementById('load-more');
      let new_loadMoreBtn = collectionParent.getElementById('load-more');      

      if(new_loadMoreBtn && loadMoreBtn){   
        loadMoreBtn.parentNode.replaceChild(new_loadMoreBtn, loadMoreBtn); 
      }else if(loadMoreBtn){
        loadMoreBtn.remove();
      }
    }else{
      const gridsHTML = collectionParent.getElementById('products-listing').innerHTML;
      filterNodes.gridsContainer.innerHTML = gridsHTML;
    }
    
    const filterInnerHTML = collectionParent.getElementById('CollectionFiltersForm').innerHTML;
    this.filterForm.innerHTML = filterInnerHTML;

    const activeFilters = collectionParent.querySelector('[data-activeFilters]');
    if(activeFilters) document.querySelector('[data-activeFilters]').innerHTML = activeFilters.innerHTML;
    this.dynamicEleEvents();

    /******** Change banner on subcollection **********/
    if(type == 'sub_collection' && filterNodes.collectionBanner){
      const bannerNode = new DOMParser().parseFromString(banner, 'text/html');
      let bannerHTML = bannerNode.querySelector('[data-collectionBanner]').innerHTML;
      filterNodes.collectionBanner.innerHTML = bannerHTML;
    }

    /********  reopen filter blocks which are active before HTML update **********/
    openFilters.forEach(openFilter => {
      let filterBlock = document.querySelector('.filter__container[data-index="'+openFilter.dataset.index+'"]');
      filterBlock.classList.add('open');
      filterBlock.querySelector('.filter__block').classList.add('open');
    });

    /********  refresh yotpo review widget to display star rating **********/
    if (typeof Yotpo !== 'undefined') {
      var api = new Yotpo.API(yotpo);
      api.refreshWidgets();
    }
  }

  /**
   * Re-Binding events on active filters after ajax request
   */
  bindActiveFilterButtonEvents() {
    let removeActiveFilters = Array.from(document.getElementsByClassName('filter-option-clear'));
    removeActiveFilters.forEach((element) => {
      element.addEventListener('click', this.onActiveFilterClick.bind(this), { once: true });
    });
  }

  /**
   * Update the url
   * @param {String} searchParams 
   */
  updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  /**
   * 
   * @param {event} event 
   */
  updateSortBy(event){
    let currentEle = event.currentTarget;
    let targetOpt = this.filterForm.querySelector(`input[name="sort_by"][value="${currentEle.value}"]`);
    if(targetOpt){
      targetOpt.checked = true;
      this.filterForm.dispatchEvent(new Event('input', {
        once: true,
      }));
    }
  }

  /**
   * 
   * @param {event} event 
   */
  paginateProductsBy(event){
    event.preventDefault();
    let currentValue = document.querySelector('[data-custom-pagination] [name="paginateBy"]:checked').value;
    let requestData = { 
      attributes: { 'products_per_page': currentValue } 
    };

    fetch("/cart/update", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
    body: JSON.stringify(requestData),
    }).then((data) =>{
      const searchParams = this._createQueryString(this.filterForm);
      const url = `${window.location.pathname}?${searchParams}`;
      this.renderGridFromFetch(url, 'pagination');
    });
  }

  /**
   * 
   * @param {event} event 
   */
  updatePagination(event){
    event.preventDefault();

    let currentvalue = document.querySelector('[data-custom-pagination] [type="radio"]:checked').value;
    this.querySelector('[name="count"]').value = currentvalue;
    this.querySelector('[name="count"]').dispatchEvent(new Event('input', {
      bubbles: true,
      cancelable: true,
    }));

  }

  /**
   * 
   * @param {event} event 
   */
  _manageSubCollections(event){
    event.preventDefault();
    const _this =  event.currentTarget;
    const queryString = this._createQueryString(this.filterForm);
    let collURL = _this.href + '?' + queryString;
  
    this.renderGridFromFetch(collURL, 'sub_collection');

    setTimeout(() => {
      filterNodes.subCollectionLinks.forEach(link => link.classList.remove('active'));
      _this.classList.add('active');
      history.pushState({}, '', collURL);
    }, 500);
  }

  /**
   * 
   * @param {event} event 
   */
  _managePagination(event){
    event.preventDefault();
    let _this = event.currentTarget;
    var nextPageLink = _this.href;
    this.renderGridFromFetch(nextPageLink, 'pagination');

    let paginationType = _this.closest('[data-paginationparent]').dataset.type;
    if(paginationType != 'loadmore'){
      setTimeout(() => {
        history.pushState({}, '', nextPageLink);
      }, 500);
    }
  }

  /**
   * Toggle Filter drawer
   * @param {event} event 
   */
  toggleFilterDrawer(event){
    event.preventDefault();
    let button = event.currentTarget;
    if(button.id == 'filter-drawer' || button.id == 'sortby-drawer'){
      button.setAttribute('aria-expanded', true);
      button.setAttribute('tabindex', '-1');

      if(button.id == 'sortby-drawer'){ 
        filterNodes.parent.classList.add('sortby-drawer'); 
      }
      else{ filterNodes.parent.classList.remove('sortby-drawer'); }
      filterNodes.parent.classList.add('filter-active');

      Utility.trapFocus(filterNodes.parent);
      Utility.forceFocus(filterNodes.closeDrawer);
      siteOverlay.prototype.showOverlay();
    }else{
      filterNodes.parent.classList.remove('filter-active');
      filterNodes.parent.classList.remove('sortby-drawer');
      if(this.openFilterDrawer){
        this.openFilterDrawer.setAttribute('aria-expanded', false);
        this.openFilterDrawer.removeAttribute('tabindex');
      }
      if(this.openSortbyDrawer){
        this.openSortbyDrawer.setAttribute('aria-expanded', false);
        this.openSortbyDrawer.removeAttribute('tabindex');
      }

      Utility.removeTrapFocus(filterNodes.parent);
      siteOverlay.prototype.hideOverlay();
    }
  }

  /**
   * Toggle Filter drawer
   * @param {event} event 
  */
  toggleFilterBlock(event) {
    event.preventDefault();
    const toggleFilterBtn = event.currentTarget;
    const filterContainer = toggleFilterBtn.closest('.filter__container');
    const isOpen = filterContainer.classList.contains('open');
    isOpen ? this.closeFilterBlock(toggleFilterBtn) : this.openFilterBlock(toggleFilterBtn);
  }

  /**
   * Open Filter Block
   * @param {element} toggleFilterBtn 
   */
  openFilterBlock(toggleFilterBtn){
    let filterContainer = toggleFilterBtn.closest('.filter__container');
    toggleFilterBtn.setAttribute('aria-expanded', true);
    Utility.toggleElement(filterContainer, 'open');
    Utility.trapFocus(filterContainer);
  }

  /**
   * Close Filter Block
   * @param {element} toggleFilterBtn 
   */
  closeFilterBlock(toggleFilterBtn){
    const filterContainer = toggleFilterBtn.closest('.filter__container');
    toggleFilterBtn.setAttribute('aria-expanded', false);
    Utility.toggleElement(filterContainer, 'close');
    Utility.removeTrapFocus(filterContainer);
  }
}
typeof CollectionFilters !== 'undefined' && new CollectionFilters();

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('input')
      .forEach(element => element.addEventListener('change', this.onRangeChange.bind(this)));

    this.setMinAndMaxValues();
  }

  /**
   * 
   * @param {event} event 
   */
  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute('max', maxInput.value);
    if (minInput.value) maxInput.setAttribute('min', minInput.value);
    if (minInput.value === '') maxInput.setAttribute('min', 0);
    if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }
}
customElements.define('price-range', PriceRange);

class PriceRangeSlider extends HTMLElement {
  constructor() {
    super();

    let _this = this;
    let sliderSections = this.getElementsByClassName("range-slider");
    
    for(const element of sliderSections){
      let sliders = element.getElementsByTagName("input");
      for(const element of sliders){
        if(element.type ==="range" ){
          element.oninput = _this.getVals;
          element.oninput();
        }
      }
    }
  }
  
  // Get Price value from both range slider
  getVals(){
    let parent = this.parentNode;
    let slides = parent.getElementsByTagName("input");
    let slide1 = parseFloat(slides[0].value);
    let slide2 = parseFloat(slides[1].value);
      
    // Neither slider will clip the other, so make sure we determine which is larger
    if( slide1 > slide2 ){ let tmp = slide2; slide2 = slide1; slide1 = tmp; }
    
    let displayElement = parent.getElementsByClassName("rangeValues")[0];
    displayElement.innerHTML = Utility.formatMoney((slide1*100), window.globalVariables.money_format)+ ' - ' + Utility.formatMoney((slide2*100), window.globalVariables.money_format);
  }
}
customElements.define('range-slider', PriceRangeSlider);