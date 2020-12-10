class DesignApp {

  constructor() {
    this.wallApp;
    this.canvas;

    DESIGN = new DesignModel(DESIGN);

    // If material has been discontinued, use default.
    if (!MATERIALS.hasOwnProperty(DESIGN.panelMaterial)) {
      DESIGN.panelMaterial = "solanumSteel";
    }

    if (DESIGN.panelMaterial === "paintedAluminum" || DESIGN.panelMaterial === "anodizedAluminum") {
      DESIGN.materialBitmap = null;
    } else {
      const texture = MATERIALS[DESIGN.panelMaterial].url;
      DESIGN.materialBitmap = texture;
    }


    this.webgl = document.getElementById('webgl');
    this.exportImage = document.getElementById('action-export-image');
    this.paintedColor = document.getElementById('paintedColor');
    this.anodizedColor = document.getElementById('anodizedColor');
    this.hardwareColor = document.getElementById('hardwareColor');
    this.hardwareAnodized = document.getElementById('hardwareAnodized');
    this.materials = document.getElementsByClassName('js-material-swatch');
    this.materialTitleDisplay = document.getElementsByClassName('js-display-material')[0];
    this.materialImageDisplay = document.getElementsByClassName('js-display-material-image')[0];
    this.materialSwatchDisplay = document.getElementsByClassName('js-display-material-swatch');
    this.hardwareSwatchDisplay = document.getElementsByClassName('js-hardware-swatch')[0];

    this.prevTouchSpread = 0;

    this.loadAsync();

    this.initMaterialDisplay();
  }

  camelCaseToWords(str) {
    return str.match(/^[a-z]+|[A-Z][a-z]*/g).map(function (x) {
      return x[0].toUpperCase() + x.substr(1).toLowerCase();
    }).join(' ');
  }

  // What of this needs to be in design-app and why?
  getPrice() {
    console.log("getPrice");
    const buyButton = document.getElementsByClassName("js-buy-button")[0];
    const designStats = document.getElementsByClassName("js-design-stats")[0];
    buyButton.disabled = true;
    buyButton.classList.add("is-calculating");
    designStats.classList.add("is-calculating");

    const data = {
      pricingObject: DESIGN.pricingObject
    }

    ajax({
      method: "PUT",
      path: "/design/update_cells",
      data: data,
      success: (response) => {
        const prices = JSON.parse(response),
          shippingCost = prices["shipping_cost"],
          imagewallCost = prices["imagewall_cost"],
          panelThickness = prices["panel_thickness"],
          romMin = prices["rom_min"],
          romMax = prices["rom_max"];

        const totalElements = document.getElementsByClassName("js-purchase-total"),
          sfpriceEl = document.getElementsByClassName("js-stats-pricesf")[0];

        let total = parseInt(shippingCost + imagewallCost);

        buyButton.classList.remove('sqft');
        buyButton.classList.remove('rom');
        buyButton.classList.remove('no-price');

        if (imagewallCost === "" && romMin === "") {
          // Show "contact us" if there was an error in the spreadsheet (errors may be intentional, to disable pricing).

          buyButton.title = "Click for Pricing";

          if (sfpriceEl) {
            sfpriceEl.style.display = "none";
          }

          buyButton.classList.add('no-price');

        } else if (romMin || DESIGN.country !== 'US' || DESIGN.distance === null) {
          // Only show ROM pricing if the spreadsheet told us to, or if this is an international project.

          //const  totalText = romMin + "–$" + romMax + "<span style='font-size: 75%'> / SF</span>";
          const totalText = romMin || Math.ceil(total / (DESIGN.width * DESIGN.height));

          for (let i = 0; i < totalElements.length; i++) {
            totalElements[i].innerHTML = totalText;
          }

          buyButton.title = "$" + totalText;

          if (sfpriceEl) {
            sfpriceEl.style.display = "none";
          }

          buyButton.classList.add('rom');
          buyButton.classList.add('sqft');

        } else {
          document.getElementsByClassName("js-purchase-shipping")[0].value = shippingCost;
          document.getElementsByClassName("js-purchase-subtotal")[0].value = imagewallCost;

          buyButton.classList.add('rom');

          var roundedPrice = Math.ceil(total / 1000) * 1000;

          buyButton.title = "$" + roundedPrice / 1000 + "K";

          for (let i = 0; i < totalElements.length; i++) {
            totalElements[i].innerHTML = roundedPrice / 1000 + "K";
          }

          let priceSf = "$" + Math.round(roundedPrice / (DESIGN.height * DESIGN.width));

          if (sfpriceEl) {
            sfpriceEl.style.removeProperty("display");
          }
          document.querySelector(".js-stats-pricesf .value").innerHTML = priceSf;
        }


        //let panelWeight = this.getPanelWeight(panelThickness); // TODO: display after finishing getPanelWeight()

        document.querySelector(".js-stats-panels .value").innerHTML = DESIGN.panelNumber;
        document.querySelector(".js-stats-panelthickness .value").innerHTML = panelThickness.toFixed(3) + '"';

        buyButton.disabled = false;
        buyButton.classList.remove("is-calculating");
        designStats.classList.remove("is-calculating");
      }
    });
  }

  /**
   * Calculate weight of panels based on material, size, and percent open area.
   * @param panelThickness Necessary if we're not storing panelThickness on DESIGN.
   */
  getPanelWeight(panelThickness) {
    const panelWidth = this.wallApp.imageWall.width / this.wallApp.imageWall.panelXNum,
      panelHeight = this.wallApp.imageWall.height / this.wallApp.imageWall.panelYNum,
      returnDepth = this.wallApp.imageWall.returnDepth;

    return ((panelWidth * panelHeight)
      + (returnDepth * panelWidth * 2)
      + (returnDepth * panelHeight * 2))
      * panelThickness; //TODO: Add metal density and perforation %
  }

  /**
   * Move a camera to view the entire wall orthogonally.
   * @param xMargin Margin in pixels to left and right of wall on canvas.
   * @param yMargin Margin in pixels above and below wall on canvas.
   * @param camera Camera to move.
   */
  fitView(xMargin = 180, yMargin = 60, camera = this.wallApp.camera) {
    // Default to extra margin for side panel on left and buttons on right.

    const d2r = Math.PI / 180,
      hfov = 2 * Math.atan(Math.tan(d2r * camera.fov / 2) * camera.aspect),
      newCamDistance = Math.max(
        this.canvas.width * DESIGN.width * 12 / (this.canvas.width - 2 * xMargin) / (2 * Math.tan(hfov / 2)),
        this.canvas.height * DESIGN.height * 12 / (this.canvas.height - 2 * yMargin) / (2 * Math.tan(d2r * camera.fov / 2))
      );

    const dir = camera.position.clone();
    dir.sub(this.wallApp.cameraTarget);
    const curCamDistance = dir.length();

    camera.translateZ(newCamDistance - curCamDistance);
  }

  initMaterialDisplay() {
    if (this.materialTitleDisplay) {
      const material = this.camelCaseToWords(DESIGN.panelMaterial);
      this.materialTitleDisplay.innerHTML = material;
    }

    if (this.materialImageDisplay) {
      if (DESIGN.materialBitmap) {
        this.materialImageDisplay.style.backgroundImage = 'url(' + DESIGN.materialBitmap + ')';
      } else {
        this.materialImageDisplay.style.backgroundColor = DESIGN.panelColor;
      }
    }

    // Set background color for material swatch for anodized or painted alum
    const swatchDisplay = Array.from(this.materialSwatchDisplay).find((el) => el.dataset.material === DESIGN.panelMaterial)
    if (swatchDisplay) {
      swatchDisplay.style.backgroundColor = DESIGN.panelColor;
    }
  }

  initColorPicker() {
    const colorContainer = document.getElementsByClassName('js-colors')[0];
    const colorMenus = document.getElementsByClassName('js-color-menu');

    // Color picker for painted aluminum
    const joePainted = colorjoe.rgb("paintedColorPicker", DESIGN.panelColor);
    const joePaintedInput = document.getElementsByClassName('js-painted-color-input')[0];
    joePainted.on("done", (color) => {
      var hex = color.hex();
      updateMaterial(hex);
    });
    joePaintedInput.value = DESIGN.panelColor.replace('#', '');
    joePaintedInput.addEventListener("input", (e) => {
      if (e.target.value.length === 3 || e.target.value.length === 6) {
        var hex = "#" + e.target.value;
        updateMaterial(hex);
      }
    });

    // Color picker for hardware color
    const joeHardware = colorjoe.rgb('hardwareColorPicker', DESIGN.mullionColor);
    const joeHardwareInput = document.getElementsByClassName('js-hardware-color-input')[0];
    this.hardwareSwatchDisplay.style.backgroundColor = DESIGN.mullionColor;
    joeHardware.on("done", (color) => {
      const hex = color.hex();
      updateHardware(hex);
    });
    joeHardwareInput.value = DESIGN.mullionColor.replace('#', '');
    joeHardwareInput.addEventListener("input", (e) => {
      if (e.target.value.length === 3 || e.target.value.length === 6) {
        var hex = "#" + e.target.value;
        updateHardware(hex, true);
      }
    });

    // Default color swatches color picker not shown or below picker
    colorContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('js-color-default')) {
        const hex = e.target.dataset.hex;
        updateMaterial(hex);
        this.getPrice();
      } else if (e.target.classList.contains('js-hardware-default')) {
        const hex = e.target.dataset.hex;
        updateHardware(hex);
      } else if (e.target.classList.contains('js-color-submit')) {
        for (var i = 0; i < colorMenus.length; i++) {
          colorMenus[i].classList.remove('active');
        }
      }
    });




    // Hide color pickers when clicking outside of the picker
    document.addEventListener('click', (e) => {
      if (e.target.classList &&
        e.target.dataset.material !== "paintedAluminum" &&
        e.target.dataset.material !== "anodizedAluminum" &&
        e.target.dataset.material !== "hardware" &&
        !colorContainer.contains(e.target)
      ) {
        var colorMenus = document.getElementsByClassName("design-menu__color");
        if (colorMenus[0].classList.contains("active")) {
          colorMenus[0].classList.remove("active");
        } else if (colorMenus[1].classList.contains("active")) {
          colorMenus[1].classList.remove("active");
        } else if (colorMenus[2].classList.contains("active")) {
          colorMenus[2].classList.remove("active");
        } else if (colorMenus[3].classList.contains("active")) {
          colorMenus[3].classList.remove("active");
        }
      }
    });


    const updateMaterial = (hex) => {
      const hexSans = hex.replace('#', '');
      joePainted.set(hex);
      joePaintedInput.value = hexSans;
      UNSAVED = true;
      DESIGN.panelColor = hex;
      joePainted.set(DESIGN.panelColor);
      joePaintedInput.value = DESIGN.panelColor.replace('#', '');
      joePainted.update();
      this.materialImageDisplay.style.backgroundImage = '';
      this.materialImageDisplay.style.backgroundColor = hex;

      const swatchDisplay = Array.from(this.materialSwatchDisplay).find((el) => el.dataset.material === DESIGN.panelMaterial);
      if (swatchDisplay) {
        swatchDisplay.style.backgroundColor = DESIGN.panelColor;
      }

      this.wallApp.imageWall.setMaterialColor(hex);
      this.wallApp.updateMesh();
      this.getPrice();
    };

    const updateHardware = (hex, input = false) => {
      const hexSans = hex.replace('#', '');
      UNSAVED = true;
      DESIGN.mullionColor = hex;
      joeHardware.set(DESIGN.mullionColor);
      joeHardwareInput.value = hexSans;
      joeHardware.update();
      this.wallApp.setStructureColor(hexSans);
      this.hardwareSwatchDisplay.style.backgroundColor = hex;
      this.wallApp.updateMesh();
      this.getPrice();
    };
  }


  initWallApp() {

  }


  updateCanvasSize() {
    var webgl = document.getElementById('webgl');

    var webglHeight = webgl.getBoundingClientRect().height - 1;
    var webglWidth = webgl.getBoundingClientRect().width;

    this.wallApp.renderer.setSize(webglWidth, webglHeight);

    this.wallApp.imageWall.setScreenSize(new THREE.Vector2(this.wallApp.renderer.getSize().width, this.wallApp.renderer.getSize().height));

    this.wallApp.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.wallApp.camera.updateProjectionMatrix();

    requestAnimationFrame(this.wallApp.render.bind(this.wallApp));
  }

  /**
   * Create string of design parameters for pasting into Excel.
   */
  exportParameters(vertical = true) {
    const params = DESIGN.pricingObject;

    let parameters = [];

    for (let n of IW.pricingParams) {
      if (params.hasOwnProperty(n)) {
        parameters.push(params[n]);
      } else {
        parameters.push('-');
      }
    }

    return parameters.join(vertical ? "\n" : "\t");;
  }

  loadAsync() {
    let documentReady = new Promise(function (resolve) {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        function onReady() {
          resolve();
          document.removeEventListener('DOMContentLoaded', onReady, true);
          window.removeEventListener('load', onReady, true);
        }
        document.addEventListener('DOMContentLoaded', onReady, true);
        window.addEventListener('load', onReady, true);
      }
    });

    const map = new Image();
    map.src = DEFAULT_WIND;

    Promise.all([
      // Load Google maps api.
      UTIL.loadScript('https://maps.googleapis.com/maps/api/js?key=' + IW.google_key + '&libraries=places'),

      // Load DOM.
      documentReady.then(() => {
        return new Promise((resolve) => {

          // Create wind map.
          function initMap() {
            let windMap = document.getElementsByClassName('js-wind-canvas')[0].getContext('2d');

            windMap.canvas.width = map.width;
            windMap.canvas.height = map.height;

            windMap.drawImage(map, 0, 0);

            DESIGN.windMap = windMap;

            resolve();
          }

          if (map.complete) {
            initMap();
          } else {
            map.onload = () => initMap();
          }
        });
      }).catch((reason) => {
        console.log('Failed to load document: ' + reason);
      })
    ]).then(() => {

      // When async loading is done and page is ready, init.
      this.init();

    }).catch((reason) => {
      console.log(reason);
    });
  }

  init() {
    this.wallApp = new DesignScene();
    // Set canvas object, so we can fadeIn/fadeOut when
    // wall camera zooms out for larger walls
    this.canvas = document.getElementsByTagName('canvas')[0];

    // Resize the canvas to fit the window
    this.updateCanvasSize();

    this.wallApp.imageWall.setMaterialTextureTiling(5, 5);
    this.wallApp.imageWall.enableCropPerfBitmap(DESIGN.crop);
    this.wallApp.imageWall.setGridSize(DESIGN.gridSize);
    this.wallApp.imageWall.setGridType(DESIGN.gridType);
    this.wallApp.imageWall.setPerfShape(DESIGN.perfShape);
    this.wallApp.imageWall.setAbsoluteMinPerf(DESIGN.minPerf);
    this.wallApp.imageWall.setAbsoluteMaxPerf(DESIGN.maxPerf);
    this.wallApp.imageWall.setPanelSize(DESIGN.width * 12, DESIGN.height * 12);
    this.wallApp.imageWall.setPanelOrientation(DESIGN.orientation);
    this.wallApp.imageWall.setInvertPerforation(DESIGN.invert);
    this.wallApp.imageWall.setPanelLocation(0, 0, 0);
    this.wallApp.setStructureColor(DESIGN.mullionColor);

    if (DESIGN.panelMaterial === "paintedAluminum" || DESIGN.panelMaterial === "anodizedAluminum") {
      this.wallApp.imageWall.setMaterialColor(DESIGN.panelColor);
    } else {
      this.wallApp.imageWall.setMaterialTexture(DESIGN.materialBitmap);
    }

    this.wallApp.imageWall.setReduction(
      DESIGN.reductionType, DESIGN.reductionPct, DESIGN.reductionAngle * Math.PI / 180
    );
    this.wallApp.imageWall.setPerforationSupersample(1); // 2x2 supersampling
    this.wallApp.imageWall.setReductionSupersample(1);

    // Fire the rest of the app if editable
    if (document.getElementsByClassName("js-design-pane-1")[0]) {

      new DesignImagery(this, this.wallApp);
      let designOption = new DesignOption(this, this.wallApp);

      IW.testInterface = new TestInterface(this, this.wallApp, designOption.system);

      this.initColorPicker()
      // Set Design Material for each material category
      const designMaterial = document.getElementsByClassName('js-material');
      for (var i = 0; i < designMaterial.length; i++) {
        new DesignMaterial(this, this.wallApp, designMaterial[i]);
      }
    }

    if (document.getElementsByClassName("js-excel-export")[0]) {
      new Clipboard('.js-excel-export', {
        text: () => this.exportParameters()
      });
    }


    // Fire views 
    new DesignView(this, this.wallApp);

    // Get inital price if design is not a purchase
    if (!document.querySelector(".js-buy-button.js-is-purchase")) {
      DESIGN.initDistanceService()
        .then((result) => {
          if (result) {
            this.getPrice();
          } else {
            console.log("Unable to initialize the distance service.");
          }
        });
    }

    // Create scene
    this.wallApp.createScene();

    // Set zoom level
    this.fitView();

    this.wallApp.imageWall.setPerfBitmapFile(DESIGN.perfBitmap)
      .then(() => {
        requestAnimationFrame(this.wallApp.render.bind(this.wallApp));
      });

    this.addEventListeners();
  }

  addEventListeners() {

    window.addEventListener('resize', () => {
      this.updateCanvasSize();
    });

    let controlMove = (e) => {
      e.preventDefault();
      this.wallApp.moveCamera(e, false);
    }

    this.webgl.addEventListener('mousedown', (e) => {
      this.wallApp.moveCamera(e, true);

      this.webgl.addEventListener('mousemove', controlMove, false);
    }, false);

    this.webgl.addEventListener('mouseup', () => {
      this.webgl.removeEventListener('mousemove', controlMove, false);
    }, false);



    this.webgl.addEventListener('touchstart', (e) => {

      if (e.touches.length == 2) {
        e.preventDefault();

        this.wallApp.moveCamera(e, true);

        this.webgl.addEventListener('touchmove', controlMove, false);
      }
    });

    this.webgl.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.webgl.removeEventListener('touchmove', controlMove, false);
    }, false);

    this.webgl.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      this.webgl.removeEventListener('touchmove', controlMove, false);
    }, false);

    if (this.exportImage) {
      this.exportImage.addEventListener('click', () => {

        this.renderExport()
          .then((blob) => {
            if (window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveBlob(blob, 'ImageWall.png');

            } else {
              let elem = window.document.createElement('a');
              elem.href = window.URL.createObjectURL(blob);
              elem.download = 'ImageWall.png';
              document.body.appendChild(elem);
              elem.click();
              document.body.removeChild(elem);
            }
          })

      });
    }
  }

  renderExport(maxWidth, maxHeight) {
    let width, height;

    if (!maxWidth || !maxHeight) {
      const maxSize = IW.settings.imageExport_maxSize,
        idealPxPerInch = IW.settings.imageExport_resolution / DESIGN.gridSize;

      width = DESIGN.width * idealPxPerInch * 12,
        height = DESIGN.height * idealPxPerInch * 12;

      if (width > maxSize || height > maxSize) {
        width = Math.min(maxSize, maxSize * DESIGN.width / DESIGN.height);
        height = Math.min(maxSize, maxSize * DESIGN.height / DESIGN.width);
      }
    } else {
      width = Math.min(maxWidth, maxHeight * DESIGN.width / DESIGN.height);
      height = Math.min(maxHeight, maxWidth * DESIGN.height / DESIGN.width);
    }

    const oldSize = this.wallApp.renderer.getSize();

    //const exportCamera = new THREE.OrthographicCamera( -DESIGN.width * 6, DESIGN.width * 6, DESIGN.height * 6, -DESIGN.height * 6, -100, 100);
    const exportCamera = new THREE.PerspectiveCamera(40, DESIGN.width / DESIGN.height, 0.1, 50000);
    exportCamera.layers.set(1);

    this.fitView(0, 0, exportCamera);

    exportCamera.lookAt(new THREE.Vector3());

    this.wallApp.imageWall.setScreenSize(new THREE.Vector2(width, height));
    this.wallApp.imageWall.updateCamera(exportCamera, new THREE.Vector3());
    this.wallApp.imageWall.updateCameraParameters();

    this.wallApp.renderer.setSize(width, height);

    this.wallApp.renderer.setClearAlpha(0);

    this.wallApp.renderer.render(this.wallApp.scene, exportCamera);

    const promise = new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        resolve(blob);
      });
    });

    // Reset
    this.wallApp.renderer.setClearAlpha(1);

    this.wallApp.renderer.setSize(oldSize.width, oldSize.height);

    this.wallApp.imageWall.setScreenSize(new THREE.Vector2(this.wallApp.renderer.getSize().width, this.wallApp.renderer.getSize().height));

    this.wallApp.imageWall.updateCamera(this.wallApp.camera, this.wallApp.cameraTarget);
    this.wallApp.imageWall.updateCameraParameters();

    requestAnimationFrame(this.wallApp.render.bind(this.wallApp));

    return promise;
  }
}
