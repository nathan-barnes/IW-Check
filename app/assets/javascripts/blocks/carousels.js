var initStepCarousel = function() {
  if ( window.innerWidth < 640 ) {
    stepCarousel = new Flickity('.js-step-carousel', {
      cellSelector: '.js-step-slide',
      cellAlign: 'center',
      pageDots: false,
      imagesLoaded: true,
      arrowShape: { 
        x0: 30,
        x1: 60, y1: 50,
        x2: 70, y2: 50,
        x3: 40
      }
    });
  }
}
var initDemoCarousel = function() {
  demoCarousel = new Flickity('.js-demo-carousel', {
    cellSelector: '.js-demo-slide',
    cellAlign: 'left',
    contain: true,
    pageDots: false,
    wrapAround: true,
    imagesLoaded: true,
    arrowShape: { 
      x0: 30,
      x1: 60, y1: 50,
      x2: 70, y2: 50,
      x3: 40
    }
  });
}
var initCardCarousel = function() {
  cardCarousel = new Flickity('.js-card-carousel', {
    cellSelector: '.js-card-slide',
    cellAlign: 'center',
    contain: true,
    pageDots: false,
    wrapAround: true,
    initialIndex: 1,
    imagesLoaded: true,
    arrowShape: { 
      x0: 30,
      x1: 60, y1: 50,
      x2: 70, y2: 50,
      x3: 40
    }
  });
}
var initTextCarousel = function() {
  textCarousel = new Flickity('.js-text-carousel', {
    cellSelector: '.js-text-slide',
    cellAlign: 'center',
    contain: true,
    pageDots: false,
    wrapAround: true,
    imagesLoaded: true,
    arrowShape: { 
      x0: 30,
      x1: 60, y1: 50,
      x2: 70, y2: 50,
      x3: 40
    }
  });
}
var initImageCarousel = function() {
  imageCarousel = new Flickity('.js-image-carousel', {
    cellSelector: '.js-image-slide',
    cellAlign: 'left',
    contain: true,
    pageDots: false,
    imagesLoaded: true,
    arrowShape: { 
      x0: 30,
      x1: 60, y1: 50,
      x2: 70, y2: 50,
      x3: 40
    }
  });
}