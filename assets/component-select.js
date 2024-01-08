class customSelect extends HTMLElement{
    constructor() {
      super();
      this.selectContainer = this.querySelector('.custom--select');
      this.select = this.querySelector('ul');
      this.initOption = this.querySelector('.default');
      this.options = this.select.querySelectorAll('li');
  
      this.options.forEach(option => option.addEventListener('click', this.toggleOptions.bind(this)));
      this.initOption.addEventListener('click', this.manageVisibility.bind(this));
  
      this.addEventListener('click', (event) => {
        event.stopPropagation();
      });
      document.body.addEventListener('click', ()=> {
        Utility.toggleElement(this.selectContainer, 'close')
      });
    }
  
    /**
     * Toggle custom select option
     * @param event 
     */
    toggleOptions(event){
      let _this = event.currentTarget;
      this.options.forEach(option => option.classList.remove('selected'));
      _this.classList.add('selected');
      this.initOption.querySelector('.option_txt').innerHTML = _this.querySelector('.option_txt').innerHTML;
      Utility.toggleElement(this.selectContainer, 'close');
    }
  
    /**
     * Hide/Show of custom select option
     * @param event 
     */
    manageVisibility(event){
      let isOpen = this.selectContainer.classList.contains('open');
      isOpen ? Utility.toggleElement(this.selectContainer, 'close') : Utility.toggleElement(this.selectContainer, 'open');
    }
  }
  customElements.define('custom-select', customSelect);