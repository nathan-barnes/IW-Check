function redirectToDesign() {
  var designToken = document.getElementsByClassName("menu-desktop__input")[0].value;
  if (designToken.length > 0) {
    window.location.href = "/design/" + designToken;
  }
}

document.addEventListener('keyup', function(event) {
  if (event.keyCode === 13 && event.target && event.target.classList && event.target.classList.contains('menu-desktop__input')) {
    redirectToDesign();
  }
});

document.addEventListener('click', function(event) {
  if (event.target && event.target.classList && (event.target.classList.contains('menu-desktop__submit') || event.target.classList.contains('menu-desktop__arrow'))) {
    redirectToDesign();
  }
});

