class recentlyProducts extends HTMLElement {
    constructor() {
      super();
      this.recentlyViewed = [];
      this.container = document.querySelector('.recently-viewed-main');

      this.manageRecentlyViewed();      
    }
    
    manageRecentlyViewed(){
      let getRecentlyViewed = localStorage.getItem("user_recently_viewed");
      if (getRecentlyViewed != null) {
        this.recentlyViewed = JSON.parse(getRecentlyViewed);        
        this.recentlyViewed.reverse();

        if(this.recentlyViewed.length > 0) this.showRecentlyViewed(this.recentlyViewed);
      }
      
      if(window.globalVariables.template == 'product'){
        const productData = window.globalVariables.product;
        let requiredData = {
          id: productData.id,
          handle: productData.handle,
          title: productData.title,
          price: productData.price,
          compared_at_price: productData.compare_at_price,
          image: productData.featured_image
        }
        this.addToRecentlyViewed(requiredData);
      }
    }

    showRecentlyViewed(products) {
      let recentlyViewedHTML = '';
      let totalProducts = 0;
      products.forEach(product => {
        const currentIndex = product.id == window.globalVariables.product.id;
        if(currentIndex == false){
          totalProducts += 1;
          recentlyViewedHTML += ` <div class="swiper-slide">
            <div class="card card-product card-product-style-1 text-start rounded-0 border-0">
              <div class="card-img text-center border-0">
              <a href="/products/${product.handle}" class="d-block product-link">
              <img srcset="${product.image}"></a>
              </div>
              <div class="card-body d-flex align-items-center justify-content-between bg-white ps-0 pe-0">
                <a href="/products/${product.handle}" class="d-block product-link h6"><h6 class="card-title m-0">${product.title}</h6></a>
                <span class="price m-0 p-0">${Utility.formatMoney(product.price, window.globalVariables.money_format)}</span>
              </div>
            </div>
          </div>`;
        }
      });

      if(totalProducts > 0){
        let sliderHTML = `<slider-element class="swiper-container carousel">
            <div class="swiper swiper-slider card-carousel" data-slider='{
              "loop": false,
              "shortSwipes": false,
              "slidesPerView": "1",
              "spaceBetween": 15,
              "grabCursor": true,
              "navigation": {
                  "nextEl": ".swiper-button-next",
                  "prevEl": ".swiper-button-prev"
              },
              "breakpoints": {
              "560": {
                  "slidesPerView": 2,
                  "spaceBetween": 20
              },
              "768": {
                  "slidesPerView": 3,
                  "spaceBetween": 30
              },
              "992": {
                  "slidesPerView": 4,
                  "spaceBetween": 30
              }
            }
          }'>
            <div class="swiper-wrapper">${recentlyViewedHTML}</div>
            <div class="swiper-button-next icon-next"></div>
            <div class="swiper-button-prev icon-previous"></div>
          </div>
        </slider-element>`;
        this.container.classList.remove('d-none');
        this.container.querySelector("recently-products").innerHTML = sliderHTML;       
      }      
    }

    addToRecentlyViewed(product) {
      const productExist = this.recentlyViewed.findIndex((x) => {
        return x.id == product.id;
      });

      if (productExist == -1) {
        this.recentlyViewed.push(product)
        localStorage.setItem(
          "user_recently_viewed",
          JSON.stringify(this.recentlyViewed)
        );
      }
    }
}
customElements.define("recently-products", recentlyProducts);
