let productSlider = null;
let quickShopSlider = null;

/**
  * Open Modal javscript trigger
  *
  * */
 function openModal(modal, opener){
  if(modal && opener != undefined) modal.show(opener);
}

/**
  * prevent body Touch event in Touch devices when Overlay is visible
  *
  * @param {event} event - event instance
*/
function bodyTouchMove(event){
  let currentTarget = event.target;
  if (!currentTarget.closest('[data-touch-moveable]')) {
    event.preventDefault();
    return false;
  }
}

/**
  * Limit the number of times a function is called within defined timeout
  *
  * @param {form} form - Form to serialize
*/
const serializeForm = form => {
  const obj = {};
  const formData = new FormData(form);

  for (const key of formData.keys()) {
    const regex = /(?:^(properties\[))(.*?)(?:\]$)/;
    if (regex.test(key)) {
      obj.properties = obj.properties || {};
      obj.properties[regex.exec(key)[2]] = formData.get(key);
    } else {
      obj[key] = formData.get(key);
    }
  }

  return JSON.stringify(obj);
};

/**
  * Fetch call config
  *
  * @param {string} type - request Accept type
*/
function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

/**
  * Dropdown component Events and Methods
  *
  * @param {element} element - Dropdown element
  */
 function dropDownInit(element){
 
  const dropdownParent = element.parentElement;
  const dropdownEle = element;
 
  ["mouseover", "focusin",  "click", "mouseout"].forEach(function(type){
    if(type == 'click'){
      dropdownEle.addEventListener(type, (evt) => {
        evt.stopPropagation();
        let currentTarget = evt.currentTarget;
        let liveTarget = evt.target;
        if(liveTarget.classList.contains('nav-link-title')){
          let linkHref = currentTarget.getAttribute('data-href');
          if(linkHref) window.location.href = linkHref;
        }else {
          dropdownToggle(dropdownParent);
        }
      });
    }else if(type == 'mouseout'){
      dropdownParent.addEventListener(type, (event) => {
        let mobileContainer = event.currentTarget.closest('[data-touch-moveable]');
        if(!mobileContainer){
          dropdownHide(dropdownParent);
        }
      }, true);
    } else if(type == 'mouseover' || type == 'focusin'){
      dropdownParent.addEventListener(type, (event) => {
        let mobileContainer = event.currentTarget.closest('[data-touch-moveable]');
        if(!mobileContainer){
          dropdownShow(dropdownParent); 
        }
      });
      dropdownEle.addEventListener(type, (e) => { ChildonFocusChange(dropdownParent); });
    }
  });

  dropdownParent.addEventListener('keyup', (event) => {
    if (event.code.toUpperCase() === 'ESCAPE'){ dropdownHide(event.currentTarget, event.type); }
    if (event.code.toUpperCase() === 'ENTER'){ dropdownShow(event.currentTarget); }
  });

  function dropdownToggle(dropdownParent) {
    setTimeout(function(){
      dropdownParent.classList.contains('open')
        ? dropdownHide(dropdownParent)
        : dropdownShow(dropdownParent);
    }, 50);
  }

  function dropdownShow(dropdownParent){
    if(!dropdownParent){
      return;
    }

    dropdownEle.setAttribute('aria-expanded', true);
    if(!dropdownParent.closest('[data-role="drawer"]')){
      dropdownParent.classList.add('open');
    }else{
      Utility.toggleElement(dropdownParent, 'open');
    }
  }

  function dropdownHide(dropdownParent, eventType){
    if(!dropdownParent){
      return;
    }

    dropdownEle.setAttribute('aria-expanded', false);
    if(!dropdownParent.closest('[data-role="drawer"]')){
      dropdownParent.classList.remove('open');
    }else{
      Utility.toggleElement(dropdownParent, 'close');
    }

    if(eventType == 'mouseout' && dropdownParent.parentElement.closest('.dropdown')){
      dropdownParent.parentElement.closest('.dropdown').classList.remove('open');
    }

    let childDropdowns = dropdownParent.querySelectorAll('.dropdown.open');
    if(childDropdowns.length > 0){
      childDropdowns.forEach((child) => {
        child.classList.remove('open');
        if(child.querySelector('a[data-toggle="open"]'))
          child.querySelector('a[data-toggle="open"]').setAttribute('aria-expanded', false);
      });
    }
  }

  function ChildonFocusChange(dropdownParent){
    let openDropdowns = Array.from(dropdownParent.parentElement.querySelectorAll('.dropdown.open'));
    let currentIndex = openDropdowns.indexOf(dropdownParent);
    openDropdowns.forEach((ele) => {
      let eleIndex = openDropdowns.indexOf(ele);
      if(eleIndex != currentIndex){ dropdownHide(ele); }
    });
  }

  let closeBtn = dropdownParent.querySelector('.close-submenu');
  if(closeBtn){
    closeBtn.addEventListener('click', (event)=>{
      event.preventDefault();
      let parentElement = event.currentTarget.closest('.dropdown');
      dropdownToggle(parentElement);
    });
  };
}

const allDropdowns = document.querySelectorAll('a[is="drop-down"]');
allDropdowns.forEach(function(ele) {
  dropDownInit(ele)
});

/**
 * Close SubMenu Dropdowns on Regular Nav Item fous or click
 *
 * @param {element} element - Dropdown element
 */
function defaultNavItem(element){
  let _this = element;
  ["focusin", "click", "mouseover", "mouseout"].forEach(function(type){
    _this.addEventListener(type, (e) => {
      e.stopPropagation();
      let currentTarget = e.currentTarget;
      if(!currentTarget.closest('[data-touch-moveable]')){
        hideDropdown(_this.parentElement);
      }
    });
  });

  _this.addEventListener('touchend', (e) => {
    e.stopPropagation();
  });
  
  function hideDropdown(dropdownParent){
    let openDropdowns = Array.from(dropdownParent.parentElement.querySelectorAll('.dropdown.open'));
    openDropdowns.forEach((ele) => {
      ele.classList.remove('open');
      ele.querySelector('[is="drop-down"]').setAttribute('aria-expanded', false);
    });
  }
}

const allDefaultNav = document.querySelectorAll('a[is="simple-menu-item"]');
allDefaultNav.forEach(function(ele) {
  defaultNavItem(ele);
});

/**
* Website Overlay for Mobile Menu and Cart Drawer
*/
class siteOverlay extends HTMLElement{
  constructor() {
    super();

    this.menuDrawer = document.querySelector('#mobile-menu-drawer');
    this.cartDrawer = document.querySelector('#ajax-cart');
  }

  connectedCallback() {
    this.bindEvents();
  }

  /**
   * bind Click and Touchend event to this custom component
   */
  bindEvents(){
    this.addEventListener('click', this.onClick.bind(this));
    this.addEventListener('touchend', this.onClick.bind(this));
  }

  /**
   * Click event of Site overlay
   * @param {event} Event instance performed
   */
  onClick(event){
    if(this.cartDrawer && this.cartDrawer.classList.contains('opened-drawer')){
      document.querySelector('.close-ajax--cart').dispatchEvent(new Event('click'));
    }
    if(this.menuDrawer && this.menuDrawer.classList.contains('opened-drawer')){
      document.querySelector('.close-mobile--navbar').dispatchEvent(new Event('click'));
    }
    this.hideOverlay();
  }

  /**
   * Show Overlay
   */
   showOverlay(){
    document.getElementById('site-overlay').classList.add('overlay--body');
    document.querySelector('body').classList.add('scroll-fixed');
    document.body.style.overflowY = "hidden";
    document.body.addEventListener('touchmove', bodyTouchMove, false);
  }

  /**
   * Hide overlay 
   */
  hideOverlay(){
    document.getElementById('site-overlay').classList.remove('overlay--body');
    document.querySelector('body').classList.remove('scroll-fixed');
    document.body.style.overflowY = "auto";
    document.body.removeEventListener('touchmove', bodyTouchMove, false);
  }
}
customElements.define("site-overlay", siteOverlay);

/**
 * Slider Component
 *
 */
 class sliderElement extends HTMLElement{
  constructor() {
    super();
    this.sliderEle = this.querySelector('.swiper-slider');
  }

  connectedCallback() {
    if(!this.sliderEle) return;
    
    let sliderOptions = this.sliderEle.getAttribute('data-slider');
    sliderOptions = JSON.parse(sliderOptions);

    // Set up nav slider 
    if(this.sliderEle.hasAttribute('data-nav')){
      let thumbSlider = document.querySelector('.' + this.sliderEle.getAttribute('data-nav'));
      if(!thumbSlider){
        return;
      }
      let thumbSliderOptions = thumbSlider.getAttribute('data-slider');
      thumbSliderOptions = JSON.parse(thumbSliderOptions);
      thumbSlider = new Swiper(thumbSlider, thumbSliderOptions);

      sliderOptions.thumbs = {
        swiper: thumbSlider
      }
    }

    let sliderInstance = new Swiper(this.sliderEle, sliderOptions);
    if(this.sliderEle.classList.contains('pdp-carousel')){
      productSlider = sliderInstance;
    }else if(this.sliderEle.classList.contains('quickshop-slider')){
      quickShopSlider = sliderInstance;
    }

    this.slideChangeEvt(sliderInstance);
  }

  slideChangeEvt(slider){   
    slider.on('slideChange', (event) => {
      const currentTarget = event.el;
      let activeVideos = currentTarget.querySelectorAll('.custom-video-container.playing--video');
      if(activeVideos.length > 0){        
        activeVideos.forEach((container)=>{
          let video = container.querySelector('custom-video');
          let videoType = video.getAttribute('data-video-type');
          let videoEle = video.querySelector('video') || video.querySelector('iframe');
          if(videoType == 'local'){
            videoEle.pause();
          }else if(videoType == 'youtube'){
            videoEle.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          }
        });
      }
    });
  }
}
customElements.define('slider-element', sliderElement);

/**
* Custom Video
*/
class customVideo extends HTMLElement {
  constructor() {
    super();

    this.container = this.closest('.custom-video-container');
    this.videoModal = document.getElementById('PopupModal-video');
    this.contentSection = this.querySelector('.content-section');
    
    this.triggerVideo = this.container.querySelector('[data-trigger-video]');
    this.type = this.getAttribute('data-video-type');
    this.videoURL = this.getAttribute('data-video-id');
    this.placementType = this.getAttribute('data-placement');

    this.videoSection = this.querySelector('.video-section');
    if(this.placementType == 'popup') this.videoSection = this.videoModal.querySelector('.video-container');
  }

  connectedCallback() {
    this.bindEvents();
  }

  /**
   * Binding events on the video button
   */
  bindEvents(){
    if(this.querySelector('[data-postervideo]')) this.managePosterVideos();
    if(this.triggerVideo) this.triggerVideo.addEventListener('click', this.toggleView.bind(this));
    if(this.placementType == 'grid' ) this.addEventListener('focusout', this.focusOut.bind(this));
  }

  /**
   * Focus Out Event to close drawer
   *
   * @param {event} Event instance
   */
  focusOut(event){
    if(this.placementType == 'popup' && this.container.classList.contains('playing--video')) this.toggleView();
  }

  /**
   * Toggle of video modal
   */
  toggleView(evt){
    let isOpen = this.container.classList.contains('playing--video');
    if(isOpen){
      this.videoSection.innerHTML = '';
      this.container.classList.remove('playing--video');
    }else{
      if(typeof YT == 'undefined' && this.type == 'youtube'){
        let youtubeScript = document.createElement('script');
        youtubeScript.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(youtubeScript);
      }

      const videoElement = this._buildVideo();
      videoElement.id = 'custom-video' + Math.floor((Math.random() * 100) + 1);;
      this.videoSection.appendChild(videoElement);

      const addClassInterval = setInterval(()=> {
        if (this.videoSection.innerHTML != ''){
          if(this.placementType == 'popup'){ 
            openModal(this.videoModal, this.triggerVideo);
          }else{
            this.container.classList.add('playing--video');
          }
          clearInterval(addClassInterval); 
        } 
      }, 500);

      if(this.querySelector('[data-postervideo]')) this.managePosterVideos();
      if(this.placementType == 'grid' && (this.type == 'local' || this.type == 'youtube')){
        this.videoPauseOnScroll();
      }
    }
  }

  /**
   * 
   * Create the video html element
   */
  _buildVideo(){
    let video;

    if(this.type == 'local'){
      video = document.createElement('video');
      video.src = this.videoURL;
      video.controls = this.dataset.controls;
      video.muted = this.dataset.muted;
      video.autoplay = this.dataset.autoplay;
      video.loop = this.dataset.loop;
    }else if(this.type == 'youtube'){
      let videoID = this.videoURL.replace('https://www.youtube.com/watch?v=', '');
      video = document.createElement( "iframe" );
      video.setAttribute( "allowfullscreen", "" );
      video.setAttribute( "frameborder", "0" );
      video.setAttribute( "src", "https://www.youtube.com/embed/"+ videoID +`?rel=0&showinfo=0&autoplay=${this.dataset.autoplay}&mute=${this.dataset.muted}&controls=${this.dataset.controls}&loop=${this.dataset.loop}&playlist=${videoID}&enablejsapi=1&origin=${window.origin}` );
    }else if(this.type == 'vimeo'){
      let videoID = this.videoURL.replace('https://vimeo.com/','');
      video = document.createElement( "iframe" );
      video.setAttribute( "allowfullscreen", "" );
      video.setAttribute( "frameborder", "0" );
      if(this.dataset.autoplay) video.setAttribute("allow", "autoplay");
      video.setAttribute( "src", "https://player.vimeo.com/video/"+ videoID + `?rel=0&showinfo=0&autoplay=${this.dataset.autoplay}&mute=${this.dataset.muted}&controls=${this.dataset.controls}&loop=${this.dataset.loop}&playlist=${videoID}`);
    }
    return video;
  }

  /**
   * Pause video on scroll when out of viewport
   *
  */
  videoPauseOnScroll(){
    let videoEle = this.querySelector('.video-section video') || this.querySelector('.video-section iframe');
    let observer = new IntersectionObserver((entries, observer) => { 
      entries.forEach(entry => {
        if(entry.intersectionRatio == 0){
          if(this.type == 'local'){
            videoEle.pause();
          }else if(this.type == 'youtube'){
            videoEle.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          }
        }
      });
    });
    observer.observe(videoEle);
  }

  /**
   * Poster Video Autoplay
   *
  */
  managePosterVideos(){
    let posterVideo = this.querySelector('[data-postervideo]');
    if(!posterVideo) return;

    const onIntersection = (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.target) {
          let dataSrc = entry.target.dataset.src;
          var videoSource = document.createElement('source');
          videoSource.src = dataSrc;
          videoSource.type = "video/mp4";
          entry.target.appendChild(videoSource)
          entry.target.play();
          observerPosterVideo.disconnect();         
        }
      }
    };
    const observerPosterVideo = new IntersectionObserver(onIntersection);
    if(posterVideo != undefined) observerPosterVideo.observe(posterVideo);
  }
}
customElements.define("custom-video", customVideo);

/**
  * Open Modal javscript trigger
  *
  * */
 function openModal(modal, opener){
  if(modal && opener != undefined) modal.show(opener);
}

/**
* Modal Dialogue
*
*/
class ModalDialog extends HTMLElement {
  constructor() {
    super();

    this.modal = this.querySelector('.modal');
    this.modalOpeners = document.querySelectorAll('[data-modal-opener="'+this.id+'"]');
  }

  connectedCallback() {
    if(this.modalOpeners.length > 0) {
      this.modalOpeners.forEach((opener)=>{
        opener.addEventListener('click', ()=>{
          this.show(opener);
        });
      });
    }

    if(this.querySelector('[id^="ModalClose-"]')){
      this.querySelector('[id^="ModalClose-"]').addEventListener(
        'click',
        this.hide.bind(this)
      );
    }

    this.addEventListener('click', (evt) => {
      if (evt.target.nodeName === 'MODAL-DIALOG') this.hide();
    });

    this.addEventListener('keyup', (evt) => {
      if (evt.code.toUpperCase() === 'ESCAPE') this.hide();
    });
  }

  /**
   * Open the Modal
   * @param {element} opener 
   */
  show(opener) {
    this.openedBy = opener;
    this.modal.classList.add('open');
    siteOverlay.prototype.showOverlay();
    Utility.trapFocus(this);
    Utility.forceFocus(this.querySelector('[id^="ModalClose-"]'));
  }

  /**
   * Close Modal Dialogue
   */
  hide() {
    this.modal.classList.remove('open');
    siteOverlay.prototype.hideOverlay();
    Utility.removeTrapFocus(this.openedBy);

    if(this.id == 'PopupModal-video'){
      this.querySelector('.video-container').innerHTML = '';
    }
  }
}
customElements.define('modal-dialog', ModalDialog);

/**
   * Manage Custom Notification Trigger
   *
   */
class Notification extends HTMLElement {
  constructor() {
    super();

    this.paused = false;
    this.container = this.querySelector('.snotifyToast');
    this.closeBtn = this.querySelector('.snotifyToast__close');
  }

  connectedCallback() {
    this.container.addEventListener('mouseover', (event) =>{
      this.paused = true;
    });
    this.container.addEventListener('mouseout', (event) =>{
      this.paused = false;
    });

    if(this.closeBtn){
      this.closeBtn.addEventListener('click', (e)=> {
        e.preventDefault();
        this.container.classList.remove('open');
        this.querySelector('.snotifyToast__title').innerHTML = '';
        this.querySelector('.snotifyToast__body').innerHTML = '';
        this.container.classList.remove("snotify-warning","snotify-info","snotify-error","snotify-success");
        this.querySelector("[data-toast-pr]").removeAttribute("style");
      });
    }
  }

  /**
   * Notification Type
   * @param title 
   * @param body 
   * @param options 
   */
  updateNotification(title, body, options){
    this.container.className = '';
    this.querySelector('.snotifyToast__title').innerHTML = title;
    this.querySelector('.snotifyToast__body').innerHTML = body;

    this.container.classList.add('snotifyToast');
    if(options.type == 'error'){
      this.container.classList.add('snotify-error');
    }else if(options.type == 'warning'){
      this.container.classList.add('snotify-warning');
    }else if(options.type == 'info'){
      this.container.classList.add('snotify-info');
    }else if(options.type == 'success'){
      this.container.classList.add('snotify-success');
    }

    this.container.classList.add('open');
    this.manageToggle(options.timeout)
  }

  /**
   * Duration of notification to hide again
   * @param timeout 
   */
  manageToggle(timeout){
    this.progressBar = this.querySelector('[data-toast-pr]');
    let unit = parseInt(timeout) / 1000;
    unit = 100 / unit;
    let width = 0;

    let interval = setInterval(() => {
      if(this.paused == false){
        width += unit;
        this.progressBar.setAttribute('style', `width: ${width}%`);
        if (width > 100) {
          this.closeBtn.dispatchEvent(new Event('click'));
          clearInterval(interval);
        }
      }
    }, 1000)
  }
}
customElements.define("custom-notification", Notification);
window.notificationEle = document.querySelector('custom-notification');
// notificationEle.updateNotification('Title', 'Body', {
//   type: 'success',
//   timeout: 10000
// });