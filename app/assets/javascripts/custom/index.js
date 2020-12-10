var initSelector = function() {
  var selectors = document.getElementsByClassName('js-selector');
  for (i = 0; i < selectors.length; i++) {
    selectors[i].addEventListener('mouseenter', function(e) {
      var selector = e.target.parentNode;
      for (i = 0; i < selectors.length; i++) {
        selectors[i].parentNode.classList.remove('is-active');
      }
      selector.classList.add('is-active');
    })
  }
}