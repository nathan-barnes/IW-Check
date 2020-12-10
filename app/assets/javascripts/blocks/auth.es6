var afterLogin = undefined;

function signup() {
  const data = {
    email: document.getElementById('user_email').value,
    password: document.getElementById('user_password').value,
    password_confirmation: document.getElementById('user_password_confirmation').value
  }

  ajax({
    method: "POST",
    path: "/",
    data: data,
    success: (response) => {
      if (response) {
        const header = document.getElementsByClassName('js-body-header')[0];
        header.innerHTML = response;
        if (typeof afterLogin === "function") {
          afterLogin();
        }
        modal.close();

        // Create a data layer event to be picked up by Google Tag Manager.
        dataLayer.push({'event': 'signup'});
      }
    },
    failure: (response) => {
      document.getElementsByClassName("js-signup-error")[0].innerHTML = response;
    }
  });
}

function login(callback) {
  const data = {
    email: document.getElementById('user_email').value,
    password: document.getElementById('user_password').value
  }

  ajax({
    method: "POST",
    path: "/login",
    data: data,
    success: (response) => {
      if (response) {
        document.getElementsByClassName("js-login-error")[0].innerHTML = "";
        const header = document.getElementsByClassName('js-body-header')[0];
        header.innerHTML = response;
        if (typeof afterLogin === "function") {
          afterLogin();
        }
        if (document.getElementsByClassName('js-creator-id')[0]) {
          const creatorId = document.getElementsByClassName('js-creator-id')[0].value;
          const userId = document.getElementsByClassName('js-profile')[0].dataset.uid;
          if (creatorId === userId) {
            modal.close();
            let u = new Url;
            location.href = u;
          }
        }
        modal.close();
      }
    },
    failure: (response) => {
      document.getElementsByClassName("js-login-error")[0].innerHTML = response;
    }
  });
}

function loggedIn() {
  return document.getElementsByClassName("js-log-out").length > 0
}

document.addEventListener('click', (event) => {
  if (event.target && event.target.id === "signup-submit") {
    event.preventDefault();
    signup();
  }
});

document.addEventListener('click', (event) => {
  if (event.target && event.target.id === "login-submit") {
    event.preventDefault();
    login();
  }
});