class DesignImagery {

  constructor(app, wallApp) {
    this.app = app;
    this.wallApp = wallApp;

    this.searchForm = document.getElementById('search-form');
    this.searchInput = document.getElementById('search-input');
    this.uploadThumb = document.getElementById('upload-thumb');
    this.selectedThumb = document.getElementById('selected-thumb');
    this.uploadButton = document.getElementById('upload-button');
    this.images = document.getElementById('images');

    this.designImageryGallery = document.getElementsByClassName("design-imagery__gallery-images")[0];

    this.searchQuery = '';
    this.searchDelay = UTIL.debounce(() => {
      this.searchImages(this.searchQuery);
    }, 300);

    this.init();
    this.setEventListeners();
  }

  renderTessarray() {
    new Tessarray("#images", ".image", {
      flickr: {
        targetRowHeight: 50,
        targetRowHeightTolerance: 0.1,
        containerPadding: 0,
        boxSpacing: 2,
        maxNumRows: 2
      }
    });
  }


  searchImages(query) {
    var searchEngineId = '009128334737799912757:49tfyedord4';
    var url = 'https://www.googleapis.com/customsearch/v1?key=' + IW.google_key + '&cx=' + searchEngineId + '&q=' + query + '&searchType=image&imgSize=medium';
    UTIL.jsonp(url).then((result) => {
      this.updateGalleryImages(result);
    });
  }

  updateGalleryImages(response) {
    this.images.innerHTML = '';
    var imgCount = 0;

    for (var i = 0; i < response.items.length; i++) {
      var item = response.items[i];

      var img = new Image();
      img.onload = () => {
        imgCount += 1;
        if (imgCount == response.items.length) {
          imgCount = 0;
          this.imageArray = document.querySelectorAll('.image');
          this.renderTessarray();
        }
      };
      img.src = item.image.thumbnailLink;
      img.classList.add('image');
      this.images.appendChild(img);
    } 
  }


  setUploadedImage(file) {
    // read in file to image
    UNSAVED = true;
    var reader = new FileReader();
    reader.onload = (e) => {
      var base64 = e.target.result;

      DESIGN.uploadBitmap = base64;
      UNSAVED = true;
      this.deselectGalleryImage();
      this.updateUploadThumb();
      this.uploadThumb.classList.add("active");


      this.wallApp.imageWall.setPerfBitmapFile(DESIGN.uploadBitmap)
        .then(() => {
          this.wallApp.updateMesh();
          requestAnimationFrame(this.wallApp.render.bind(this.wallApp));
        });
    };
    reader.readAsDataURL(file);
  }

  setGalleryImage(e) {
    if (e.target.classList.contains('image')) {
      this.deselectGalleryImage();
      this.uploadThumb.classList.remove("active");
      e.target.classList.add('active');

      UNSAVED = true;
      DESIGN.searchBitmap = e.target.src;
      DESIGN.perfBitmap = e.target.src;

      this.updateSelectedThumb();

      this.wallApp.imageWall.setPerfBitmapFile(DESIGN.searchBitmap)
        .then(() => {
          this.wallApp.updateMesh();
        });
    }
  }

  selectGalleryImage() {
    let images = document.getElementsByClassName("image");
    for (let i = 0; i < images.length; i++) {
      if (images[i].src === DESIGN.perfBitmap) {
        images[i].classList.add("active");
      }
    }
  }

  deselectGalleryImage() {
    const imageArray = document.getElementsByClassName('image');
    for (var i = 0; i < imageArray.length; i++) {
      imageArray[i].classList.remove('active');
    }
  }

  updateUploadThumb() {
    this.uploadThumb.style.display = 'block';
    this.uploadThumb.style.backgroundImage = "url(" + DESIGN.uploadBitmap + ")";
  }

  updateSelectedThumb() {
    this.selectedThumb.style.backgroundImage = "url(" + DESIGN.perfBitmap + ")";
  }

  init() {
    if (DESIGN.uploadBitmap) {
      this.updateUploadThumb();
      if (DESIGN.uploadBitmap === DESIGN.perfBitmap) {
        this.uploadThumb.classList.add("active");
      }
    }

    this.selectGalleryImage();
    this.updateSelectedThumb();
  }

  setEventListeners() {
    this.uploadButton.addEventListener("click", () => {
      this.value = null;
    });

    this.uploadButton.addEventListener("change", (event) => {
      event.preventDefault();
      UNSAVED = true;
      const file = event.target.files[0];
      this.setUploadedImage(file);
      AWS.getSignedUrl(file, (file) => {
        // let imgixFile = "https://imagewall.imgix.net/" + file.split(".amazonaws.com/")[1];
        UNSAVED = true;
        DESIGN.uploadBitmap = file;
        DESIGN.perfBitmap = file;
        this.updateSelectedThumb();
      });
    })

    this.searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
    });

    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.searchDelay();
    });

    this.designImageryGallery.addEventListener('click', this.setGalleryImage.bind(this));

    this.searchInput.addEventListener('focus', () => {
      if (DESIGN.searchBitmap) {
        UNSAVED = true;
        DESIGN.perfBitmap = DESIGN.searchBitmap;
        this.uploadThumb.classList.remove("active");
        this.selectGalleryImage();
        this.updateSelectedThumb();
        this.wallApp.imageWall.setPerfBitmapFile(DESIGN.searchBitmap)
          .then(() => {
            this.wallApp.updateMesh();
            requestAnimationFrame(this.wallApp.render.bind(this.wallApp));
          });
      }
    });

    this.uploadThumb.addEventListener('click', () => {
      if (DESIGN.uploadBitmap) {
        this.deselectGalleryImage();
        this.uploadThumb.classList.add("active");
        this.updateUploadThumb();

        UNSAVED = true;
        DESIGN.perfBitmap = DESIGN.uploadBitmap;
        this.updateSelectedThumb();
        this.wallApp.imageWall.setPerfBitmapFile(DESIGN.uploadBitmap)
          .then(() => {
            this.wallApp.updateMesh();
            requestAnimationFrame(this.wallApp.render.bind(this.wallApp));
          });
      }
    });
  }
}
