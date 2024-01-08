/**
* Tab HTML
*/
class customTabs extends HTMLElement {
  constructor() {
    super();

    this.tabLinks = this.querySelectorAll('.tablink');
    this.tabContainers = this.querySelectorAll('.tabcontent');

    this.tabLinks.forEach( link => link.addEventListener('click', this.toggleTabs.bind(this)));
  }

  /**
   * Escape Key Press to close drawer when focus is within the container
   *
   * @param {event} Event instance
   */
  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;
  }

  /**
   * Toggle Tabs on link click
   *
   * @param {event} Event instance
   */
  toggleTabs(event){
    event.preventDefault();
    event.stopPropagation();
    const currentTab = event.currentTarget;
    const tabLink = currentTab.querySelector('[data-toggle="tab"]');
    const tabContainer = document.querySelector(tabLink.dataset.tabcontent);

    this.openTab(currentTab, tabContainer)
  }

  /**
   * Open Tab Container
   *
   * @param {Node} currentTab Tab Container Open link
   * @param {Node} tabContainer Tab Container to open
   */
  openTab(currentTab, tabContainer) {
    this.tabContainers.forEach(container => {
      container.classList.remove('open');
      const linkEle = document.querySelector('.tablink a[data-toggle="tab"][data-tabcontent="#'+container.id+'"]');
      if(linkEle){
        linkEle.setAttribute('aria-expanded', false);
        if(linkEle.closest('.tablink')){ linkEle.closest('.tablink').classList.remove('open');}
      }
    });
    currentTab.classList.add('open');
    currentTab.querySelector('[data-toggle="tab"]').setAttribute('aria-expanded', true);
    tabContainer.classList.add('open');
  }
}
customElements.define("custom-tabs", customTabs);

/**
* Accordion HTML
*/
class customAccordion extends HTMLElement {
  constructor() {
    super();
    this.accordionType = this.dataset.accordiontype;
    this.toggleBtns = this.querySelectorAll('.accordion__toggle');

    this.toggleBtns.forEach(button => button.addEventListener('click', this.toggleAccordionBlock.bind(this)));
  }

  /**
   * Escape Key Press to close drawer when focus is within the container
   *
   * @param {event} Event instance
   */
  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;
  }

  /**
   * Toggle Tabs on link click
   *
   * @param {event} Event instance
   */
   toggleAccordionBlock(event){
    event.preventDefault();
    const toggleBtn = event.currentTarget;
    const targetContainer = toggleBtn.parentNode;
    const isOpen = targetContainer.classList.contains('open');
    isOpen ? this.closeAccordionBlock(toggleBtn) : this.openAccordionBlock(toggleBtn);
  }

  /**
   * Open Tab Container
   *
   * @param {Node} toggleBtn Accordion Block Open link
   */
   openAccordionBlock(toggleBtn) {
    let targetContainer = toggleBtn.parentNode;
    toggleBtn.setAttribute('aria-expanded', true);
    Utility.toggleElement(targetContainer, 'open');
    if(this.accordionType == 'single'){
      let siblingBlocks = targetContainer.parentNode.querySelectorAll('.accordion__container');
      siblingBlocks.forEach(element => {
        if(element == targetContainer){ return; }
        element.classList.remove('open');
        element.querySelector('.accordion__block').classList.remove('open');
        element.querySelector('.accordion__toggle').setAttribute('aria-expanded', false);
      });
    }
    Utility.trapFocus(targetContainer);
  }

  /**
   * Close Tab Container
   *
   * @param {Node} currentTab Tab Container link
   * @param {Node} tabContainer Tab Container to close
   */
   closeAccordionBlock(toggleFilterBtn) {
    const targetContainer = toggleFilterBtn.parentNode;
    toggleFilterBtn.setAttribute('aria-expanded', false);
    Utility.toggleElement(targetContainer, 'close');
    Utility.removeTrapFocus(targetContainer);
  }
}
customElements.define("custom-accordion", customAccordion);

/**
  * collaspsibleTab element Events and Methods
  *
  * @param {element} element - Dropdown element
  */
function initCollaspsibleTab(element){

  /** Toggle each filter block container containing values for dropdown effect **/
  let tabToggleBtn = element.querySelector('.tab_toggle');
  tabToggleBtn.addEventListener('click', toggleTab.bind(this));

  /**
   * Toggle Filter drawer
   * @param {event} event 
  */
  function toggleTab(event) {
    event.preventDefault();
    const toggleFilterBtn = event.currentTarget;
    const filterContainer = toggleFilterBtn.closest('.tab_container');
    const isOpen = filterContainer.classList.contains('open');
    isOpen ? closeTab(toggleFilterBtn) : openTab(toggleFilterBtn);
  }

  /**
   * Open Filter Block
   * @param {element} toggleFilterBtn 
   */
   function openTab(toggleFilterBtn) {
    let filterContainer = toggleFilterBtn.closest('.tab_container');
    toggleFilterBtn.setAttribute('aria-expanded', true);
    Utility.toggleElement(filterContainer, 'open');
    Utility.trapFocus(filterContainer);
  }

  /**
   * Close Filter Block
   * @param {element} toggleFilterBtn 
   */
  function closeTab(toggleFilterBtn) {
    const filterContainer = toggleFilterBtn.closest('.tab_container');
    toggleFilterBtn.setAttribute('aria-expanded', false);
    Utility.toggleElement(filterContainer, 'close');
    Utility.removeTrapFocus(filterContainer);
  }
}

const allCollaspsibleTabs = document.querySelectorAll('[is="collaspsibleTab"]');
allCollaspsibleTabs.forEach(function(ele) {
  initCollaspsibleTab(ele)
});