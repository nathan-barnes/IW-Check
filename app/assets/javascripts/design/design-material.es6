class DesignMaterial {

  constructor(app, wallApp, category) {
    this.app = app;
    this.wallApp = wallApp;

    this.category = category;
    this.row = this.category.getElementsByClassName('js-material-row')[0];
    this.materials = this.category.getElementsByClassName('js-material-swatch');
    this.length = this.materials.length;
    this.active = 0;

    this.anodizedOptions = ['#EBF5F7', '#D1DFE0', '#cccfc8', '#adab9c', '#83795E',
      '#3C3934', '#303D45'];

    this.addEventListeners();
  }
  

  removeActive() {
    for (var i = 0; i < this.app.materials.length; i++) {
      this.app.materials[i].classList.remove('active');
    }
  }

  addEventListeners() {
    this.category.addEventListener('click', (e) => {
      const el = e.target;

      // Right Arrow: Scroll swatches to the right.
      if (el.classList.contains('js-material-next')) {
        if (this.active < this.length - 2) {
          const dist = (this.active + 1) * 94;
          this.row.style.transform = 'translateX(-'+ dist +'px)'
          this.active += 1;
        }

      // Left Arrow: Scroll swatches to the left.        
      } else if (el.classList.contains('js-material-prev')) {
        if (this.active > 0) {
          const dist = (this.active - 1) * 94;
          this.row.style.transform = 'translateX(-'+ dist +'px)'
          this.active -= 1;
        }

      // Swatch Button        
      } else if (el.classList.contains('js-material-swatch')) {
        this.removeActive();
        el.classList.add('active');
        var material = el.dataset.material;
        
        UNSAVED = true;
        DESIGN.panelMaterial = el.dataset.material;

        this.wallApp.imageWall.setMaxIndividualPanelSize(DESIGN.maxPanelWidth, DESIGN.maxPanelHeight);

        if (material === 'anodizedAluminum') {
          this.app.anodizedColor.classList.toggle('active');
          this.app.paintedColor.classList.remove('active');
          this.app.materialTitleDisplay.innerHTML = this.app.camelCaseToWords(el.dataset.material);

          // If current panelColor isn't within andodized options,
          // update DESIGN and 3D with first anodized option
          if (!this.anodizedOptions.includes(DESIGN.panelColor)) {
            DESIGN.panelColor = this.anodizedOptions[0];
            this.app.materialImageDisplay.style.backgroundColor = this.anodizedOptions[0];

            const swatchDisplay = Array.from(this.app.materialSwatchDisplay).find((el) => el.dataset.material === 'anodizedAluminum');            
            if (swatchDisplay) {
              swatchDisplay.style.backgroundColor = this.anodizedOptions[0];
            }

            this.wallApp.imageWall.setMaterialColor(this.anodizedOptions[0]);
            
            this.wallApp.updateMesh();
            requestAnimationFrame(this.wallApp.render.bind(this.wallApp));              
            this.app.getPrice();
          };

        } else if (material === 'paintedAluminum') {
          this.app.paintedColor.classList.toggle('active');
          this.app.anodizedColor.classList.remove('active');
          this.app.materialTitleDisplay.innerHTML = this.app.camelCaseToWords(el.dataset.material);
        
          const swatchDisplay = Array.from(this.app.materialSwatchDisplay).find((el) => el.dataset.material === 'paintedAluminum');
          
          if (swatchDisplay) {
            const color = one.color(swatchDisplay.style.backgroundColor);
            let hex = "#ffffff";

            if (color) {
              hex = one.color(color).hex();
            }

            DESIGN.panelColor = hex;
            swatchDisplay.style.backgroundColor = hex;
            this.app.materialImageDisplay.style.backgroundColor = hex;
            this.wallApp.imageWall.setMaterialColor(hex);
          }

          this.wallApp.updateMesh();
          requestAnimationFrame(this.wallApp.render.bind(this.wallApp));              
          this.app.getPrice();

        } else {
          let texture = MATERIALS[el.dataset.material].url;

          DESIGN.materialBitmap = texture;
          this.app.materialTitleDisplay.innerHTML = this.app.camelCaseToWords(el.dataset.material);
          this.app.materialImageDisplay.style.backgroundImage = 'url(' + DESIGN.materialBitmap + ')';

          this.wallApp.imageWall.setMaterialTexture(DESIGN.materialBitmap)
            .then(() => {
              this.wallApp.updateMesh();
              requestAnimationFrame(this.wallApp.render.bind(this.wallApp));              
            });
            
          this.app.getPrice();
        }
      }
    })
  }

}