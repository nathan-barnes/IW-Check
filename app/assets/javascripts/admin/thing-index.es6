class ThingIndex {
  constructor() {
    this.makeThingsSortable();
    this.addEventListeners();
  }

  get thingType() {
    if (document.body.classList.contains("features")) {
      return "features";
    } else if (document.body.classList.contains("materials")) {
      return "materials";
    } else if (document.body.classList.contains("projects")) {
      return "gallery";
    } else if (document.body.classList.contains("resources")) {
      return "resources";
    } else if (document.body.classList.contains("designs")) {
      return "designs";
    }
  }

  get indexContainer() {
    return document.getElementsByClassName('js-thing-category-index')[0];
  }

  makeThingsSortable() {
    const list = document.getElementsByClassName('js-thing-list')[0];
    this.sortable = new Sortable(list, {
      onEnd: (event) => {
        const slug = list.children[event.newIndex].getElementsByClassName('js-action-group')[0].getAttribute('value');
        ajax({
          method: "PUT",
          path: "/admin/" + this.thingType + "/" + slug + "/position",
          data: { position: event.newIndex },
          success: function(data) { console.log(data) }
        });
      },
    });
  }

  toggleVisibility(event) {
    const slug = util.findAncestorByClassName(event.target, 'js-action-group').getAttribute('value');
    ajax({
      method: "PUT",
      path: "/admin/" + this.thingType + "/" + slug + "/toggle_visibility",
      success: function(data) { console.log(data) }
    });

    // Optimistic
    const visibilityState = event.target.children[0].innerHTML;
    const parentLi = util.findAncestorByTagName(event.target, "LI");
    if (visibilityState === "Publish") {
      event.target.children[0].innerHTML = "Unpublish";
      parentLi.classList.remove("is-draft");
      parentLi.classList.add("is-published");
    } else {
      event.target.children[0].innerHTML = "Publish";
      parentLi.classList.remove("is-published");
      parentLi.classList.add("is-draft");
    }
  }

  deleteThing(event) {
    let confirm = window.confirm("Are you sure you want to delete this?");
    if (!confirm) return; 

    const slug = util.findAncestorByClassName(event.target, 'js-action-group').getAttribute('value');

    ajax({
      method: "DELETE",
      path: "/admin/" + this.thingType + "/" + slug,
      success: function(data) { 
        console.log(data)

        const parentLi = util.findAncestorByTagName(event.target, "LI");
        const list = parentLi.parentNode;
        list.removeChild(parentLi);
      }
    });
  }

  // Thing/Category Index
  getCategoryIndex(categoryType) {
    ajax({
      method: "GET",
      path: "/admin/" + categoryType + "/categories/index_partial",
      success: (data) => {
        this.sortable.destroy();
        this.indexContainer.innerHTML = data;
        this.makeCategoriesSortable();
      }
    });
  }

  getThingIndex() {
    ajax({
      method: "GET",
      path: "/admin/" + this.thingType + "/index_partial",
      success: (data) => {
        this.sortable.destroy();
        this.indexContainer.innerHTML = data;
        this.makeThingsSortable();
      }
    });
  }
    
  makeCategoriesSortable() {
    const list = document.getElementsByClassName('js-category-list')[0];
    this.sortable = new Sortable(list, {
      onEnd: (event) => {
        const slug = list.children[event.newIndex].getElementsByClassName('js-action-group')[0].getAttribute('value');
        ajax({
          method: "PUT",
          path: "/admin/" + this.thingType + "/categories/" + slug + "/position",
          data: { position: event.newIndex },
          success: function(data) { console.log(data) }
        });
      },
    });
  }

  toggleCategoryVisibility(event) {
    const slug = util.findAncestorByClassName(event.target, 'js-action-group').getAttribute('value');

    ajax({
      method: "PUT",
      path: "/admin/" + this.thingType + "/categories/" + slug + "/toggle_visibility",
      success: function(data) { console.log(data) }
    });

    // Optimistic
    const visibilityState = event.target.children[0].innerHTML;
    const parentLi = util.findAncestorByTagName(event.target, "LI");
    if (visibilityState === "Publish") {
      event.target.children[0].innerHTML = "Unpublish";
      parentLi.classList.remove("is-draft");
      parentLi.classList.add("is-published");
    } else {
      event.target.children[0].innerHTML = "Publish";
      parentLi.classList.remove("is-published");
      parentLi.classList.add("is-draft");
    }
  }

  deleteCategory(event) {
    let confirm = window.confirm("Are you sure you want to delete this?");
    if (!confirm) return; 

    const slug = util.findAncestorByClassName(event.target, 'js-action-group').getAttribute('value');

    ajax({
      method: "DELETE",
      path: "/admin/" + this.thingType + "/categories/" + slug,
      success: function(data) { 
        console.log(data)

        const parentLi = util.findAncestorByTagName(event.target, "LI");
        const list = parentLi.parentNode;
        list.removeChild(parentLi);
      }
    });
  }

  addEventListeners() {
    document.addEventListener("click", (event) => {
      if (event.target && event.target.classList) {
        if (event.target.classList.contains('js-toggle-visibility')) {
          this.toggleVisibility(event);
        } else if (event.target.classList.contains('js-delete-thing')) {
          this.deleteThing(event);
        } else if (event.target.classList.contains('js-toggle-category-visibility')) {
          this.toggleCategoryVisibility(event);
        } else if (event.target.classList.contains('js-delete-category')) {
          this.deleteCategory(event);
        } else if (event.target.classList.contains('js-get-categories-index')) {
          this.getCategoryIndex(event.target.value);
        } else if (event.target.classList.contains('js-get-things-index')) {
          this.getThingIndex();
        }
      }
    });
  }
}