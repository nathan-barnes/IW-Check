function bindUserEditEvents() {
  document.addEventListener('click', (event) => {
    if (event.target && event.target.classList && event.target.classList.contains('js-toggle-admin')) {
      event.preventDefault();
      const id = document.getElementsByClassName('js-user-id')[0].value;
      const adminType = event.target.name;
      ajax({
        method: "PUT",
        path: "/admin/users/" + id + "/toggle_admin",
        data: {admin_type: adminType},
        success: (response) => {
          console.log(response);
          const replacementButton = util.htmlToElement(response);
          event.target.parentNode.replaceChild(util.htmlToElement(response), event.target);
        }
      });
    }
  });
}