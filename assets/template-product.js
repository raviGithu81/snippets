const selectors = {
    productContainer: document.querySelector('.product-details-wrapper'),
    productMedia: document.querySelector('[data-productMedia]')
  };

  const mediaJSON = JSON.parse(selectors.productMedia.innerHTML);
  window.productMedia = mediaJSON;
  class TemplateProductJS {
    constructor() {
      // Custom code for product page goes here

      document.querySelector('.read_more').addEventListener('click', (e)=>{
        e.preventDefault();
        let currentTarget = e.target;
        if(currentTarget.closest('[data-readmorecontainer]').classList.contains('open')){
          Utility.toggleElement(currentTarget.closest('[data-readmorecontainer]'), 'close');
          currentTarget.innerHTML = "Learn more";
        }else{
          Utility.toggleElement(currentTarget.closest('[data-readmorecontainer]'), 'open');
          currentTarget.innerHTML = "Show Less";
        }
      });
    }
}

typeof TemplateProductJS !== 'undefined' && new TemplateProductJS();
