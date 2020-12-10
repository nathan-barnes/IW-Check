class Edit {
  constructor() {
    this.bindEventListeners();
  }

  // get thingId() {
  //   return document.getElementsByClassName('js-thing-edit')[0].dataset.id;
  // }

  // get thingType() {
  //   if (document.body.classList.contains("materials")) {
  //     return "materials";
  //   } else if (document.body.classList.contains("features")) {
  //     return "features";
  //   }
  // }

  // get mediaDiv() {
  //   return document.getElementsByClassName('js-media')[0];
  // }

  // get imageDiv() {
  //   return document.getElementsByClassName('js-image-container')[0];
  // }

  // createCategorization(target) {
  //   const categoryId = util.findAncestorByClassName(target, "js-action-group").dataset.id;

  //   const options = {
  //     method: "POST",
  //     path: "/admin/categorizations",
  //     data: {
  //       category_id: categoryId
  //     },
  //     success: function(data) {
  //       target.classList.remove("js-create-categorization");
  //       target.classList.add("js-destroy-categorization");
  //       target.classList.add("is-active");
  //     }
  //   }

  //   if (document.body.classList.contains("projects")) {
  //     options.data.project_id = this.thingId;
  //   } else {
  //     options.data.material_id = this.thingId;
  //   }

  //   ajax(options);
  // }

  // destroyCategorization(target) {
  //   const categoryId = util.findAncestorByClassName(target, "js-action-group").dataset.id;

  //   const options = {
  //     method: "DELETE",
  //     path: "/admin/categorizations",
  //     data: {
  //       category_id: categoryId
  //     },
  //     success: function(data) {
  //       target.classList.add("js-create-categorization");
  //       target.classList.remove("js-destroy-categorization");
  //       target.classList.remove("is-active");
  //     }
  //   }

  //   if (document.body.classList.contains("projects")) {
  //     options.data.project_id = this.thingId;
  //   } else {
  //     options.data.material_id = this.thingId;
  //   }

  //   ajax(options);
  // }

  // updateThingImage(file) {
  //   // Don't have access to this, so these have to be defined
  //   let thingType;
  //   if (document.body.classList.contains("materials")) {
  //     thingType = "materials";
  //   } else if (document.body.classList.contains("features")) {
  //     thingType = "features";
  //   } else if (document.body.classList.contains("designs")) {
  //     thingType = "designs";
  //   } else if (document.body.classList.contains("resources")) {
  //     thingType = "resources";
  //   }
  //   const imageDiv = document.getElementsByClassName('js-image-container')[0];

  //   const slug = document.getElementsByClassName('js-thing-edit')[0].dataset.slug;
  //   const data = {image: file};

  //   ajax({
  //     method: "PUT",
  //     path: "/admin/" + thingType + "/" + slug + "/update_image",
  //     data: {[thingType.slice(0, -1)]: data},
  //     success: (data) => {
  //       imageDiv.innerHTML = data;
  //     }
  //   });
  // }

  // updateThingTile(file) {
  //   const tileDiv = document.getElementsByClassName('js-tile-container')[0];

  //   const slug = document.getElementsByClassName('js-thing-edit')[0].dataset.slug;
  //   const data = {tile: file};

  //   ajax({
  //     method: "PUT",
  //     path: "/admin/materials/" + slug + "/update_tile",
  //     data: {material: data},
  //     success: (data) => {
  //       tileDiv.innerHTML = data;
  //     }
  //   });
  // }

  // updateThingFile(file) {
  //   const fileDiv = document.getElementsByClassName('js-file-container')[0];

  //   const slug = document.getElementsByClassName('js-thing-edit')[0].dataset.slug;
  //   const data = {file: file};

  //   ajax({
  //     method: "PUT",
  //     path: "/admin/resources/" + slug + "/update_file",
  //     data: {resource: data},
  //     success: (data) => {
  //       fileDiv.innerHTML = data;
  //       console.log("success");
  //     }
  //   });
  // }

  // createMedium(file) {
  //   // Don't have access to this, so these have to be defined
  //   const thingId = document.getElementsByClassName('js-thing-edit')[0].dataset.id;
  //   const mediaDiv = document.getElementsByClassName('js-media')[0];

  //   const id = parseInt(thingId);
  //   const data = {
  //     mediable_type: "Project",
  //     mediable_id: id,
  //     url: file
  //   };

  //   ajax({
  //     method: "POST",
  //     path: "/admin/media",
  //     data: {medium: data},
  //     success: (data) => {
  //       mediaDiv.prepend(util.htmlToElement(data));
  //       document.getElementsByClassName('js-create-medium')[0].value = null;
  //     }
  //   });
  // }

  // destroyMedium(button) {
  //   const parentContainer = util.findAncestorByTagName(button, "DIV");
  //   const id = parentContainer.dataset.id;

  //   ajax({
  //     method: "DELETE",
  //     path: "/admin/media/" + id,
  //     success: (data) => {
  //       this.mediaDiv.removeChild(parentContainer);
  //     }
  //   });
  // }

  // makeMediaSortable() {
  //   const list = document.getElementsByClassName('js-media')[0];
  //   if (list) {
  //     this.sortable = new Sortable(list, {
  //       handle: ".js-medium-image",
  //       onEnd: (event) => {
  //         const id = list.children[event.newIndex].dataset.id;
  //         ajax({
  //           method: "PUT",
  //           path: "/admin/media/" + id + "/position",
  //           data: { position: event.newIndex },
  //           success: function(data) { console.log(data) }
  //         });
  //       },
  //     });
  //   }
  // }

  bindEventListeners() {
    // Categorization creation/destruction
    document.addEventListener('click', (event) => {
      if (event.target && event.target.classList) {
        if (event.target.classList.contains('js-create-categorization')) {
          event.preventDefault();
          this.createCategorization(event.target);
        } else if (event.target.classList.contains('js-destroy-categorization')) {
          event.preventDefault();
          this.destroyCategorization(event.target);

        // Image upload
        // Necessary to detect 'change' event on some browsers
        } else if (event.target.classList.contains('js-upload-image')) {
          event.target.value = null;
        } else if (event.target.classList.contains('js-delete-image')) {
          event.preventDefault();
          this.updateThingImage("");

        // Media Creation and destruction
        } else if (event.target.classList.contains('js-create-medium')) {
          event.target.value = null;
        } else if (event.target.classList.contains('js-destroy-medium')) {
          event.preventDefault();
          this.destroyMedium(event.target);

        // Tile Creation and destruction
        } else if (event.target.classList.contains('js-upload-tile')) {
          event.target.value = null;
        } else if (event.target.classList.contains('js-delete-tile')) {
          event.preventDefault();
          this.updateThingTile("");

        // File Creation and destruction
        } else if (event.target.classList.contains('js-upload-file')) {
          event.target.value = null;
        } else if (event.target.classList.contains('js-delete-file')) {
          event.preventDefault();
          this.updateThingFile("");
        }
      }
    });

    // Necessary to detect 'change' event on some browsers
    document.addEventListener('change', (event) => {
      if (event.target) {
        if (event.target.classList.contains('js-upload-image')) {
          event.preventDefault();
          var file = event.target.files[0];
          AWS.getSignedUrl(file, this.updateThingImage);
        } else if (event.target.classList.contains('js-create-medium')) {
          event.preventDefault();
          var file = event.target.files[0];
          AWS.getSignedUrl(file, this.createMedium);
        } else if (event.target.classList.contains('js-upload-tile')) {
          event.preventDefault();
          var file = event.target.files[0];
          AWS.getSignedUrl(file, this.updateThingTile);
        } else if (event.target.classList.contains('js-upload-file')) {
          event.preventDefault();
          var file = event.target.files[0];
          AWS.getSignedUrl(file, this.updateThingFile);
        }
      }
    });
  }
}