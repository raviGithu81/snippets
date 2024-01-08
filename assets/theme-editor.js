window.activeSession = null;
const sectionMethods = {

  _initSection() {
    // console.log('Section Method Loaded');
    // document.addEventListener('shopify:section:load', e => { sectionMethods._onSectionLoad(e) });
    // document.addEventListener('shopify:section:unload', e => {sectionMethods._onSectionUnload(e) });
    document.addEventListener('shopify:section:select', e => { sectionMethods._onSelect(e) });
    document.addEventListener('shopify:section:deselect', e => { sectionMethods._onDeselect(e) });
    document.addEventListener('shopify:block:select', e => { sectionMethods._onBlockSelect(e) });
    // document.addEventListener('shopify:block:deselect', e => { sectionMethods._onBlockDeselect(e) });
  },

  _onSectionLoad: function(e) {
    console.log('section load', e);
    const sectionId = e.detail.sectionId;
    window.dispatchEvent(new Event('resize'));
  },

  _onSectionUnload: function(e) {
    // console.log('section Unload', e);
    const sectionId = e.detail.sectionId;
  },

  _onSelect: (e)=> {
    const sectionDetails = JSON.parse(e.target.dataset.shopifyEditorSection);
    const sectionType = sectionDetails.type;
    window.activeSession = sectionType;

    console.log('Select Section=======>', sectionType)
    switch (sectionType) {
      case 'mobile-nav-drawer': {
        let burgerMenu = document.getElementById('mobile-menu');
        burgerMenu.dispatchEvent(new Event('click'));
        break;
      }
      case 'search-layer': {
        let openSearch = document.querySelector('.open-searchform');
        openSearch.dispatchEvent(new Event('click'));
        break;
      }
      case 'newsletter': {
        const $newsletterPopup = document.querySelector('#PopupModal-newsletter .modal');
        if($newsletterPopup){
          $newsletterPopup.classList.add('open');
          siteOverlay.prototype.showOverlay();
        }
        break;
      }
      case 'component-cart-drawer': {
        let openCart = document.querySelector('.header__icon--cart');
        openCart.dispatchEvent(new Event('click'));
        break;
      }
      default: {
        
      }
    }
  },

  _onDeselect: (e)=> {
    const sectionDetails = JSON.parse(e.target.dataset.shopifyEditorSection);
    const sectionType = sectionDetails.type;
    window.activeSession = null;

    switch (sectionType) {
      case 'mobile-nav-drawer': {
        let closeMobileMenu = document.querySelector('.close-mobile--navbar');
        closeMobileMenu.dispatchEvent(new Event('click'));
        break;
      }
      case 'search-layer': {
        let closeSearchBar = document.querySelector('.search-modal__close-button');
        closeSearchBar.dispatchEvent(new Event('click'));
        break;
      }
      case 'component-cart-drawer': {
        let closeSearchBar = document.querySelector('.close-ajax--cart');
        closeSearchBar.dispatchEvent(new Event('click'));
        break;
      }
      case 'newsletter': {
        const $newsletterPopup = document.querySelector('#PopupModal-newsletter .modal');
        if($newsletterPopup){
          $newsletterPopup.classList.remove('open');
          siteOverlay.prototype.hideOverlay();
        }
        break;
      }
      default: {
        break;
      }
    }
  },

  _onReorder: function(e) {
    const sectionId = e.detail.sectionId;
  },

  _onBlockSelect: (e)=> {
    switch (window.activeSession) {
      case 'global-header-slider': {
        let slideEle = e.target;
        let slideIndex = slideEle.dataset.index;

        let sliderParent = slideEle.closest('.swiper-slider');
        let sliderOptions = sliderParent.getAttribute('data-slider');
        sliderOptions = JSON.parse(sliderOptions);
        let swiper = new Swiper(sliderParent, sliderOptions);
        console.log(slideIndex);
        setTimeout(() => {
          swiper.slideTo(slideIndex, 2000, true);
        }, 1000);
        break;
      }
      default: {
        break;
      }
    }
  },

  _onBlockDeselect: function(e) {
    // console.log('block Deselect', e);
    const sectionId = e.detail.sectionId;
  },

};

sectionMethods._initSection();