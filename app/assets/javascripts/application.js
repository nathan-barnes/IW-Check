// Application JS Manifest

//= require turbolinks
//= require localforage.min
//= require sortable.min
//= require vanilla-modal
//= require flickity.min
//= require domurl.min
//= require headroom.min
//= require clipboard.min
//= require picturefill.min

//= require blocks/ajax
//= require blocks/auth
//= require blocks/menu
//= require blocks/search
//= require blocks/scroll
//= require blocks/carousels

//= require custom/index
//= require custom/design
//= require custom/gallery
//= require custom/contact

// Turbolinks
// Fires immediately after a visit starts.
document.addEventListener('turbolinks:visit', function() {
  document.body.classList.remove('is-animatingIn');
  document.body.classList.add('is-animatingOut');

  // Removes any functions to be called after logging in.
  afterLogin = undefined;
});

// Before leaving the page
document.addEventListener('turbolinks:before-cache', function() {
  
  // Closes modal and repopulates the original div with its content if modal is open
  if (typeof modal !== "undefined") {
    if (modal.isOpen) {
      modal.close();
    }
    modal.destroy();
  }

  if (typeof stepCarousel !== "undefined") {
    stepCarousel.destroy();
  }
  if (typeof cardCarousel !== "undefined") {
    cardCarousel.destroy();
  }
  if (typeof textCarousel !== "undefined") {
    textCarousel.destroy();
  }
  if (typeof imageCarousel !== "undefined") {
    imageCarousel.destroy();
  }
});

// Fires after Turbolinks renders the page. This event fires twice during an application visit to a cached location: 
// once after rendering the cached version, and again after rendering the fresh version.
document.addEventListener('turbolinks:render', function() {
  document.body.classList.remove('is-animatingOut');
  document.body.classList.add('is-animatingIn');
});

// Define our global vars (by Alex)
var stepCarousel, demoCarousel, cardCarousel, textCarousel, imageCarousel;

var IW = window.IW || {};

// URL to POST contact requests to.
IW["support_post_url"] = "https://prod-30.northcentralus.logic.azure.com:443/workflows/2a28c960979d456b8682e6a4e6358df2/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=8iS0dA_TzYrpuRV3grMoEOuu21KkUDIde5jdQarsHBg";

// Fires once after the initial page load, and again after every Turbolinks visit.
document.addEventListener('turbolinks:load', function(event) {

  initMenu();
  picturefill();

  modal = new VanillaModal.default({
    class: 'modal-is-open',
    onClose: function() {
      afterLogin = undefined;
    }
  });

  if (document.body.classList.contains("application") && document.body.classList.contains("index")) {
    initSelector();
    initStepCarousel();
    initCardCarousel();
    // initTextCarousel();
  }

  if (document.body.classList.contains("projects") && document.body.classList.contains("index")) {
    modal.settings.onClose = function() { history.replaceState("test", "", "/gallery")}
  }

  if (document.getElementsByClassName('js-project')[0]) {
    initCardCarousel();
    initImageCarousel();
  }

  if (document.getElementsByClassName('designs')[0]) {
    initDemoCarousel();
    initCardCarousel();
  }

  if (document.getElementsByClassName('contacts')[0]) {
    initForm();
  }

  if (document.getElementsByClassName('js-design-app')[0]) {
    designObj.visit();
  }

});
