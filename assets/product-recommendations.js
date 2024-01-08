class ProductRecommendations extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      fetch(this.dataset.url)
        .then((response) => response.text())
        .then((text) => {
          const html = document.createElement('div');
          html.innerHTML = text;
          const recommendations = html.querySelector('product-recommendations');

          if (recommendations && recommendations.innerHTML.trim().length) {
            this.innerHTML = recommendations.innerHTML;
            if(this.dataset.url.indexOf('intent=complementary') > -1){
              const complementaryParent = document.querySelector('[data-complementaryitems]');
              complementaryParent.classList.remove('d-none');
            }

            let quickShopModal = document.querySelector('quick-shop');
            if(quickShopModal && typeof quickShopModal.updateEvents == 'function') quickShopModal.updateEvents(); 
          }
        })
        .catch((e) => {
          console.error(e);
        });
    }
}
customElements.define('product-recommendations', ProductRecommendations);