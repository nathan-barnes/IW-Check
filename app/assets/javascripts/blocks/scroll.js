// Smooth scroll to id
smoothScrollObj = {
  currentY: function() {
    if (self.pageYOffset) return self.pageYOffset;
    if (document.documentElement && document.documentElement.scrollTop)
        return document.documentElement.scrollTop;
    if (document.body.scrollTop) return document.body.scrollTop;
    return 0;
  },
  elementY: function(elementID) {
    var el = document.getElementById(elementID);
    var y = el.offsetTop;
    var node = el;
    while (node.offsetParent && node.offsetParent != document.body) {
        node = node.offsetParent;
        y += node.offsetTop;
    } return y;
  },
  smoothScroll: function(elementID) {
    var startY = smoothScrollObj.currentY();
    var stopY = smoothScrollObj.elementY(elementID) - 60;
    var distance = stopY > startY ? stopY - startY : startY - stopY;
    if (distance < 120) {
        scrollTo(0, stopY); return;
    }
    var speed = Math.round(distance / 100);
    if (speed >= 20) speed = 20;
    var step = Math.round(distance / 33);
    var leapY = stopY > startY ? startY + step : startY - step;
    var timer = 0;
    if (stopY > startY) {
        for ( var i=startY; i<stopY; i+=step ) {
            setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
            leapY += step; if (leapY > stopY) leapY = stopY; timer++;
        } return;
    }
    for ( var i=startY; i>stopY; i-=step ) {
        setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
        leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
    }
    return false;
  }
}

document.addEventListener('click', function(event) {
  if (event.target && event.target.classList && event.target.classList.contains('js-scroll-link')) {
    var data = event.target.getAttribute('data-scroll');
    event.stopPropagation();
    smoothScrollObj.smoothScroll(data);
  }
});