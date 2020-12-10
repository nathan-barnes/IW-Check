// Menu
var initMenu = function() {
  var body     = document.body,
      hero     = document.getElementsByClassName( 'js-page-header' )[0],
      header   = document.getElementsByClassName( 'js-body-header' )[0],
      headroom = new Headroom(header, {
        "offset": 300,
        "tolerance": 4
      }),
      overlay  = document.getElementsByClassName( 'js-layout-overlay' )[0],
      openbtn  = document.getElementsByClassName( 'js-menu-mobile-toggle' )[0],
      menubtns = document.getElementsByClassName( 'js-menu-mobile-link' ),
      isOpen   = false;

  // Menu scroll events
  function menuScroll() {
    var offset = hero.offsetHeight - 180;
    function listener() {
      var y = window.pageYOffset;
      if ( y >= offset ) {
        body.classList.add('is-scrolled');
      } else {
        body.classList.remove('is-scrolled');
      }
    };
    window.addEventListener( 'scroll', listener, false );
  }

  function init() {
    if (header) {
      headroom.init();
    }
    if (openbtn) {
      openbtn.addEventListener( 'click', toggleNav );
    }
    if (overlay) {
      overlay.addEventListener( 'click', function(e) {
        var target = e.target;
        if( isOpen && target !== openbtn ) {
          toggleNav();
        }
      });
    };
    if (menubtns) {
      for ( var i = 0; i < menubtns.length; i++ ) {
        menubtns[i].addEventListener( 'click', closeNav );
      }
    };
    if (hero) {
      menuScroll();
    }

    var dropButton = document.getElementsByClassName('js-profile-dropButton')[0];
    var dropdown = document.getElementsByClassName('js-profile-dropdown')[0];
    if (dropdown) {
      dropButton.addEventListener('click', function(e) {
        e.preventDefault();
        dropdown.classList.toggle('is-active');
      });
    }
  } 

  function toggleNav(e) {
    if (isOpen) {
      body.classList.remove( 'menu-is-open' );
    } else {
      body.classList.add( 'menu-is-open' );
    }
    isOpen = !isOpen;
  }

  function closeNav(e) {
    if (isOpen) {
      body.classList.remove( 'menu-is-open' );
    }
    isOpen = false;
  }

  init();
};