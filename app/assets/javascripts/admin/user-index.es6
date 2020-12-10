function bindUserIndexEvents() {
  document.addEventListener('click', (event) => {
    if (event.target) {
      if (event.target.classList.contains('js-search-users-button')) {
        event.preventDefault();
        let u = new Url;
        u.query.search = document.getElementsByClassName('js-search-users-input')[0].value;
        u.query.page = "1";
        location.assign(u);
      } else if (event.target.classList.contains('js-show-only-admin')) {
        event.preventDefault();
        let u = new Url;
        u.query.admin = "true";
        u.query.page = "1";
        location.assign(u);
      } else if (event.target.classList.contains('js-show-users')) {
        event.preventDefault();
        let u = new Url;
        u.query.admin = "false";
        u.query.page = "1";
        location.assign(u);
      }
    }
  });

  // Bind enter button on search input to search users
  document.addEventListener('keyup', (event) => {
    if (event.target && event.target.classList && event.target.classList.contains('js-search-users-input')) {
      if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementsByClassName('js-search-users-button')[0].click();
      }
    }
  });
}