document.addEventListener('click', (event) => {
  if (event.target && event.target.classList && event.target.classList.contains('js-open-project-modal')) {
    modal.open('#project-modal');
    const slug = event.target.dataset.slug;
    ajax({
      method: 'GET',
      path: '/gallery/' + slug + '/modal',
      success: (response) => {
        modal.dom.modalContent.innerHTML = response;
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
        history.replaceState('test', '', '/gallery/' + slug);
      }
    });
  }
});