class DesignOption {

  constructor(app, wallApp) {
    this.app = app; // using for canvas call
    this.wallApp = wallApp;

    this.state = "off";
    this.pane; // current active pane (system, material, size, etc)

    this.pane1 = document.querySelector('.js-design-pane-1');
    this.pane2 = document.querySelector('.js-design-pane-2');
    this.backBtn = document.querySelector('.js-design-back');

    this.domElements = {
      heightText: document.getElementById('height-text'),
      widthText: document.getElementById('width-text'),
      depthText: document.getElementById('depth-text'),
      perfTextMin: document.getElementById('perf-text-min'),
      perfTextMax: document.getElementById('perf-text-max'),
      perfInput: document.getElementById('perf-input'),
      hardwareColor: document.getElementsByClassName('js-hardware-color')[0]
    };

    const cards = document.querySelectorAll('.js-design-card');
    this.cardsArray = Array.prototype.slice.call(cards);

    this.initCrop();
    this.initSize();
    this.initPerf();
    this.initGrid();
    this.initHardware();
    this.addEventListeners();

    new DesignOptionSystem(this, this.wallApp, this.app);
  }

  setActive(type) {
    this.pane = document.querySelector('.pane-' + type);
    this.pane.classList.toggle('active');

    animate({
      el: this.pane1,
      translateX: -320,
      opacity: 0,
      duration: 175,
      easing: 'easeOutQuad'
    });

    animate({
      el: this.pane2,
      translateX: [320,0],
      opacity: [0, 1],
      duration: 225,
      delay: 75,
      easing: 'easeOutQuad'
    });
  }

  setDefault() {
    this.pane.classList.toggle('active');

    animate({
      el: this.pane2,
      translateX: 320,
      opacity: [1, 0],
      duration: 175,
      easing: 'easeOutQuad'
    });
    animate({
      el: this.pane1,
      translateX: [-320, 0],
      opacity: 1,
      duration: 175,
      delay: 75,
      easing: 'easeOutQuad'
    });
  }

  /**
   * Set level of interactivity of corresponding UI element.
   * @param control 'depth' only, for now.
   * @param state 'full' | 'static' | 'unused'
   * @param reason Display child element with class 'js-reason-[reason]'.
   */
  setControlInteractivity(control, state, reason=null) {
    let el = document.getElementById(control + '-control');

    if (el) {
      switch (state) {
        case 'full':
          el.classList.remove('static', 'unused');
          
          el.getElementsByClassName('range-slider__text-input')[0].disabled = false;

          break;
        
        case 'static':
          el.classList.remove('unused');
          el.classList.add('static');

          el.getElementsByClassName('range-slider__text-input')[0].disabled = true;

          break;
        
        case 'unused':
          el.classList.remove('static');
          el.classList.add('unused');

          break;
      }

      let reasons = el.getElementsByClassName('design-menu__pane-reason');

      for (let i=0; i < reasons.length; i++) {
        reasons[i].hidden = !reasons[i].classList.contains('js-reason-' + reason);
      }
    }
  }

  /**
   * Change range of slider and move handles to fit in new range. Return new values if a handle is moved.
   * @param el Slider element or 'height', 'width', or 'depth'.
   * @param range array New slider range ([min, max])
   * @param newValues array New values for slider handles.
   */
  setSliderLimits(el, range, newValues=[]) {
    if (typeof el === 'string') {
      switch (el) {
        case 'height':
        case 'width':
        case 'depth':
          el = document.getElementById(el + '-input');
          break;
        
        default:
          return [];
      }
    }

    const changed = [];

    if (el !== null) {
      if (!newValues.length) {
        let values = el.noUiSlider.get();

        if (typeof values !== 'object') {
          values = [values];
        }

        for (let value of values) {
          let newValue = Math.min(Math.max(range[0], value), range[1]);
          newValues.push( newValue );

          changed.push((newValue !== value) ? newValue : null);
        }
      }

      el.noUiSlider.updateOptions({
        range: {
          'min': [range[0]],
          'max': [range[1]]
        },
        start: newValues
      });
    }

    return changed;
  }

  setCropDisplay() {
    const cropButton = document.getElementsByClassName('js-crop')[0];
    const stretchButton = document.getElementsByClassName('js-stretch')[0];

    if (DESIGN.crop) {
      cropButton.classList.add("active");
      stretchButton.classList.remove("active");
    } else {
      stretchButton.classList.add("active");
      cropButton.classList.remove("active");
    }
  }

  initCrop() {
    const cropButton = document.getElementsByClassName('js-crop')[0];
    const stretchButton = document.getElementsByClassName('js-stretch')[0];

    this.setCropDisplay();

    cropButton.addEventListener('click', (e) => {
      UNSAVED = true;
      DESIGN.crop = true;

      this.setCropDisplay();

      this.wallApp.imageWall.enableCropPerfBitmap(true);
      this.wallApp.updateMesh();
    });

    stretchButton.addEventListener('click', (e) => {
      UNSAVED = true;
      DESIGN.crop = false;

      this.setCropDisplay();

      this.wallApp.imageWall.enableCropPerfBitmap(false);
      this.wallApp.updateMesh();
    });
  }

  setWidthDisplay() {
    const widthDisplay = document.getElementsByClassName('js-display-width')[0];
    widthDisplay.innerHTML = DESIGN.width;

    this.domElements.widthText.value = DESIGN.width;
  }

  setHeightDisplay() {
    const heightDisplay = document.getElementsByClassName('js-display-height')[0];
    heightDisplay.innerHTML = DESIGN.height;
    
    this.domElements.heightText.value = DESIGN.height;
  }

  setDepthDisplay() {
    this.domElements.depthText.value = DESIGN.depth;
  }

  setWidth(value) {
    UNSAVED = true;
    DESIGN.width = value;
    this.setWidthDisplay();
    this.updateSize();
  }

  setHeight(value) {
    UNSAVED = true;
    DESIGN.height = value;
    this.setHeightDisplay();
    this.updateSize();
  }

  setDepth(value) {
    UNSAVED = true;
    DESIGN.depth = value;
    this.setDepthDisplay();
    this.updateSize();
  }

  initSize() {
    // Width
    this.setWidthDisplay();

    const widthInput = document.getElementById('width-input');
    const widthMin = 3;
    const widthMax = 200;

    noUiSlider.create(widthInput, {
      start: [ DESIGN.width ],
      behavior: 'snap',
      connect: [true, false],
      range: {
        'min': [ widthMin ],
        'max': [ widthMax ]
      }
    });

    widthInput.noUiSlider.on('change', (e) => {
      this.setWidth(e[0]);

      this.app.getPrice();
    });

    this.domElements.widthText.addEventListener('change', (e) => {
      var val = e.target.value;
      var width;
      if (val >= widthMin && val <= widthMax) {
        width = val;
      } else if (val < widthMin) {
        width = widthMin
      } else if (val > widthMax) {
        width = widthMax
      }

      widthInput.noUiSlider.set(width);
      this.setWidth(width);
      this.app.getPrice();
    });

    widthInput.noUiSlider.on('slide', (values, handle, unencoded, tap) => {
      if (!tap) {
        this.domElements.widthText.value = values[0];
      }
    });


    // Height
    this.setHeightDisplay();

    const heightInput = document.getElementById('height-input');
    const heightMin = 3;
    const heightMax = 100;


    noUiSlider.create(heightInput, {
      start: [ DESIGN.height ],
      behavior: 'snap',
      connect: [true, false],
      range: {
        'min': [  heightMin ],
        'max': [ heightMax ]
      }
    });

    heightInput.noUiSlider.on('change', (values) => {
      this.setHeight(values[0]);

      this.app.getPrice();
    });

    heightInput.noUiSlider.on('slide', (values, handle, unencoded, tap) => {
      if (!tap) {
        this.domElements.heightText.value = values[0];
      }
    });

    this.domElements.heightText.addEventListener('change', (e) => {
      var val = e.target.value;
      var height;
      if (val >= heightMin && val <= heightMax) {
        height = val;
      } else if (val < heightMin) {
        height = heightMin
      } else if (val > heightMax) {
        height = heightMax
      }

      heightInput.noUiSlider.set(height);
      this.setHeight(height);
      this.app.getPrice();
    });


    // Depth
    this.setDepthDisplay();

    const depthInput = document.getElementById('depth-input');
    const depthMin = 3;
    const depthMax = 10;

    noUiSlider.create(depthInput, {
      start: [ DESIGN.depth ],
      behavior: 'snap',
      connect: [true, false],
      range: {
        'min': [  depthMin ],
        'max': [ depthMax ]
      }
    });

    depthInput.noUiSlider.on('change', (values) => {
      this.setDepth(values[0]);
      
      this.app.getPrice();
    });

    depthInput.noUiSlider.on('slide', (values, handle, unencoded, tap) => {
      if (!tap) {
        this.domElements.depthText.value = values[0];
      }
    });

    this.domElements.depthText.addEventListener('change', (e) => {
      var val = e.target.value;
      var depth;
      if (val >= depthMin && val <= depthMax) {
        depth = val;
      } else if (val < depthMin) {
        depth = depthMin
      } else if (val > depthMax) {
        depth = depthMax
      }

      depthInput.noUiSlider.set(depth);
      this.setDepth(depth);
      this.app.getPrice();
    });
  }

  updateSize() {
    this.app.canvas.style.opacity = 0;
    this.wallApp.imageWall.setPanelSize(DESIGN.width*12, DESIGN.height*12);
    this.wallApp.imageWall.setReturnDepth(DESIGN.panelReturn);

    setTimeout(() => {
      this.app.canvas.style.opacity = 1;

      this.app.fitView();

      this.wallApp.updateMesh();
    }, 100);
  }

  setGridType() {
    const gridButtons = document.getElementsByClassName('js-grid-button');

    for (let i = 0; i < gridButtons.length; i++) {
      if (gridButtons[i].dataset.type === DESIGN.gridType.toString()) {
        gridButtons[i].classList.add("active");
      } else {
        gridButtons[i].classList.remove("active");
      }
    }

    const gridTypeDisplay = document.getElementsByClassName("js-display-grid-type")[0];
    gridTypeDisplay.innerHTML = DESIGN.toDisplayValue("gridType");
  }

  setGridSize() {
    const gridSizeDisplay = document.getElementsByClassName('js-display-grid-size')[0];
    gridSizeDisplay.innerHTML = DESIGN.gridSize;

    const gridText = document.getElementById('grid-text');
    gridText.value = DESIGN.gridSize;

    const perfInput = document.getElementById('perf-input');

    // Prevent perforations from overlapping.
    let selMinMax = perfInput.noUiSlider.get(),
      curMinMaxLimit = [perfInput.noUiSlider.options.range.min[0], perfInput.noUiSlider.options.range.max[0]],
      curRange = curMinMaxLimit[1] - curMinMaxLimit[0],
      newMinMaxLimit = [0.125, DESIGN.gridSize - 0.125],
      newRange = newMinMaxLimit[1] - newMinMaxLimit[0];

    DESIGN.minPerf = Math.round(((selMinMax[0] - curMinMaxLimit[0]) / curRange * newRange + newMinMaxLimit[0]) * 100) / 100;
    DESIGN.maxPerf = Math.round(((selMinMax[1] - curMinMaxLimit[0]) / curRange * newRange + newMinMaxLimit[0]) * 100) / 100;

    const newPerfRange = this.setSliderLimits(perfInput, newMinMaxLimit, [DESIGN.minPerf, DESIGN.maxPerf]);

    // Check whether perfRange changes. (Always should, I think.)
    if (newPerfRange.length == 2) {
      this.perfMin = newPerfRange[0] !== null ? newPerfRange[0] : this.perfMin;
      this.perfMax = newPerfRange[1] !== null ? newPerfRange[1] : this.perfMax;
    }

    this.wallApp.imageWall.setGridSize(DESIGN.gridSize);
    this.wallApp.imageWall.setAbsoluteMinPerf(DESIGN.minPerf);
    this.wallApp.imageWall.setAbsoluteMaxPerf(DESIGN.maxPerf);
    
    this.setPerfMinAndMaxDisplay();
  }

  initGrid() {
    // grid type
    this.setGridType();
    const gridButtons = document.getElementsByClassName('js-grid-buttons')[0];
    gridButtons.addEventListener('click', (e) => {
      if (e.target.tagName === "BUTTON") {
        UNSAVED = true;
        DESIGN.gridType = e.target.dataset.type;
        this.setGridType();
        this.wallApp.imageWall.setGridType(DESIGN.gridType);
        this.wallApp.updateMesh();
        this.app.getPrice();
      }
    });

    // grid slider
    const gridInput = document.getElementById('grid-input'),
      gridText = document.getElementById('grid-text'),
      gridMin = 0.5,
      gridMax = 4;

    noUiSlider.create(gridInput, {
      start: [ DESIGN.gridSize ],
      behavior: 'snap',
      connect: [true, false ],
      range: {
        'min': [ gridMin ],
        'max': [ gridMax ]
      }
    });
    gridInput.noUiSlider.on('change', (e) => {
      UNSAVED = true;
      DESIGN.gridSize = e[0];
      this.setGridSize();
      
      this.wallApp.updateMesh();

      this.app.getPrice();
    });
    
    gridInput.noUiSlider.on('slide', (values, handle, unencoded, tap) => {
      if (!tap) {
        gridText.value = values[0];
      }
    });

    
    this.setGridSize();

    gridText.addEventListener('change', (e) => {
      UNSAVED = true;

      var val = e.target.value;
      var grid;
      if (val >= gridMin && val <= gridMax) {
        grid = val;
      } else if (val < gridMin) {
        grid = gridMin
      } else if (val > gridMax) {
        grid = gridMax
      }

      DESIGN.gridSize = grid

      this.setGridSize();

      this.wallApp.updateMesh();

      gridInput.noUiSlider.set(grid);

      this.app.getPrice();
    });
  }

  setPerfShapeDisplay() {
    const perfShapes = document.getElementsByClassName('js-perf-shape');

    for (let i = 0; i < perfShapes.length; i++) {
      if (perfShapes[i].dataset.shape === DESIGN.perfShape.toString()) {
        perfShapes[i].classList.add("active");
      } else {
        perfShapes[i].classList.remove("active");
      }
    }

    const perfShapeDisplay = document.getElementsByClassName("js-display-perf-shape")[0];
    perfShapeDisplay.innerHTML = DESIGN.toDisplayValue("perfShape");
  }

  setPerfReductionDisplay() {
    const perfReductions = document.getElementsByClassName('js-perf-reduction');
    const reductionPercent = document.getElementsByClassName('js-reduction-percent')[0];
    const reductionAngle = document.getElementsByClassName('js-reduction-angle')[0];

    for (let i = 0; i < perfReductions.length; i++) {
      if (perfReductions[i].dataset.reduction === DESIGN.reductionType.toString()) {
        perfReductions[i].classList.add("active");
      } else {
        perfReductions[i].classList.remove("active");
      }
    }

    if (DESIGN.reductionType === 0) {
      reductionPercent.style.display = 'none';
      reductionAngle.style.display = 'none';
    } else if (DESIGN.reductionType === 1 || DESIGN.reductionType === 3) {
      reductionPercent.style.display = 'block';
      reductionAngle.style.display = 'none';
    } else {
      reductionPercent.style.display = 'block';
      reductionAngle.style.display = 'block';
    }

    const perfShapeDisplay = document.getElementsByClassName("js-display-perf-reduction")[0];
    perfShapeDisplay.innerHTML = DESIGN.toDisplayValue("reductionType");
  }

  setPerfMinAndMaxDisplay() {
    this.domElements.perfTextMin.value = DESIGN.minPerf;
    this.domElements.perfTextMax.value = DESIGN.maxPerf;

    const perfMinDisplay = document.getElementsByClassName('js-display-min-perf')[0];
    const perfMaxDisplay = document.getElementsByClassName('js-display-max-perf')[0];

    perfMinDisplay.innerHTML = DESIGN.minPerf;
    perfMaxDisplay.innerHTML = DESIGN.maxPerf;
  }

  setReduction() {
    this.setPerfReductionDisplay();
    this.wallApp.imageWall.setReduction(
      DESIGN.reductionType,
      DESIGN.reductionPct,
      DESIGN.reductionAngle * Math.PI / 180
    );
    this.wallApp.updateMesh();
    this.app.getPrice();
  }

  initPerf() {
    // perf type
    this.setPerfShapeDisplay();
    const perfShapes = document.getElementsByClassName('js-perf-shapes')[0]


    perfShapes.addEventListener('click', (e) => {
      if (e.target.tagName === "BUTTON") {
        const shape = e.target.dataset.shape;
        UNSAVED = true;
        DESIGN.perfShape = shape;
        this.setPerfShapeDisplay();
        this.wallApp.imageWall.setPerfShape(shape);
        this.wallApp.updateMesh();
        this.app.getPrice();
      }
    });

    // perf invert
    const perfInvert = document.getElementsByClassName('js-perf-invert')[0];
    perfInvert.addEventListener('click', (e) => {
      var boolean = perfInvert.classList.contains('active') ? false : true;
      this.wallApp.imageWall.setInvertPerforation(boolean);
      UNSAVED = true;
      DESIGN.invert = boolean;
      perfInvert.classList.toggle('active');
      this.wallApp.updateMesh();
    });

    // perf reduction
    this.setPerfReductionDisplay();
    const perfReductions = document.getElementsByClassName('js-perf-reductions')[0];
    perfReductions.addEventListener('click', (e) => {
      if (e.target.tagName === "BUTTON") {
        UNSAVED = true;
        const reduction = parseInt(e.target.dataset.reduction);
        DESIGN.reductionType = reduction;
        this.setReduction();
      }
    });

    // perf slider
    this.setPerfMinAndMaxDisplay();
    this.perfMin = 0.13;
    this.perfMax = DESIGN.gridSize - 0.125;

    noUiSlider.create(this.domElements.perfInput, {
      start: [ DESIGN.minPerf, DESIGN.maxPerf ],
      behavior: 'snap',
      connect: [false, true, false],
      range: {
        'min': [ this.perfMin ],
        'max': [ this.perfMax ]
      }
    });
    this.domElements.perfInput.noUiSlider.on('change', (e) => {
      UNSAVED = true;
      DESIGN.minPerf = e[0];
      DESIGN.maxPerf = e[1];
      this.setPerfMinAndMaxDisplay();
      this.wallApp.imageWall.setAbsoluteMinPerf(DESIGN.minPerf);
      this.wallApp.imageWall.setAbsoluteMaxPerf(DESIGN.maxPerf);
      this.wallApp.updateMesh();
    });
    
    this.domElements.perfInput.noUiSlider.on('slide', (values, handle, unencoded, tap) => {
      if (!tap) {
        this.domElements.perfTextMin.value = values[0];
        this.domElements.perfTextMax.value = values[1];
      }
    });


    this.domElements.perfTextMin.addEventListener('change', (e) => {
      UNSAVED = true;
      const minPerf = e.target.value > this.perfMin ? e.target.value : this.perfMin;
      DESIGN.minPerf = minPerf;

      this.setPerfMinAndMaxDisplay();
      this.domElements.perfInput.noUiSlider.set([DESIGN.minPerf, null]);
      this.wallApp.imageWall.setAbsoluteMinPerf(DESIGN.minPerf);
      this.wallApp.updateMesh();
    });
    this.domElements.perfTextMax.addEventListener('change', (e) => {
      UNSAVED = true;
      const maxPerf = e.target.value < this.perfMax ? e.target.value : this.perfMax;
      DESIGN.maxPerf = maxPerf;

      this.setPerfMinAndMaxDisplay();
      this.domElements.perfInput.noUiSlider.set([null, DESIGN.maxPerf]);
      this.wallApp.imageWall.setAbsoluteMaxPerf(DESIGN.maxPerf);
      this.wallApp.updateMesh();
    });


    const reductionPercent = document.getElementById('reduction-percent');
    const reductionPercentMin = 0;
    const reductionPercentMax = 100;
    noUiSlider.create(reductionPercent, {
      start: [ DESIGN.reductionPct ],
      behavior: 'snap',
      connect: [true, false],
      range: {
        'min': [ reductionPercentMin ],
        'max': [ reductionPercentMax ]
      }
    });
    reductionPercent.noUiSlider.on('change', (e) => {
      UNSAVED = true;
      DESIGN.reductionPct = parseInt(e[0]);
      reductionPercentText.value = DESIGN.reductionPct;
      this.setReduction();
    });
    const reductionPercentText = document.getElementById('reduction-percent-text');
    reductionPercentText.value = DESIGN.reductionPct;
    reductionPercentText.addEventListener('change', (e) => {
      const val = e.target.value;
      let reductPer = 0;
      if (val >= reductionPercentMin && val <= reductionPercentMax) {
        reductPer = val;
      } else if (val < reductionPercentMin) {
        reductPer = reductionPercentMin;
      } else if (val > reductionPercentMax) {
        reductPer = reductionPercentMax;
      }
      reductionPercentText.value = reductPer;
      reductionPercent.noUiSlider.set(reductPer);
      DESIGN.reductionPct = parseInt(reductPer);
      this.setReduction();
    });


    const reductionAngle = document.getElementById('reduction-angle');
    const reductionAngleMin = 0;
    const reductionAngleMax = 360;
    noUiSlider.create(reductionAngle, {
      start: [ DESIGN.reductionAngle ],
      behavior: 'snap',
      connect: [true, false],
      range: {
        'min': [ reductionAngleMin ],
        'max': [ reductionAngleMax ]
      }
    });
    reductionAngle.noUiSlider.on('change', (e) => {
      UNSAVED = true;
      DESIGN.reductionAngle = parseInt(e[0]);
      reductionAngleText.value = DESIGN.reductionAngle;
      this.setReduction();
    });
    const reductionAngleText = document.getElementById('reduction-angle-text');
    reductionAngleText.value = DESIGN.reductionAngle;
    reductionAngleText.addEventListener('change', (e) => {
      const val = e.target.value;
      let reductAngle = 0;
      if (val >= reductionAngleMin && val <= reductionAngleMax) {
        reductAngle = val;
      } else if (val < reductionAngleMin) {
        reductAngle = reductionAngleMin;
      } else if (val > reductionAngleMax) {
        reductAngle = reductionAngleMax;
      }
      reductionAngleText.value = reductAngle;
      reductionAngle.noUiSlider.set(reductAngle);
      DESIGN.reductionAngle = parseInt(reductAngle);
      this.setReduction();
    });
  }

  initHardware() {
    const hardwareButtonArray = document.getElementsByClassName('js-hardware-button');
    for (var i = 0; i < hardwareButtonArray.length; i++) {
      if (DESIGN.mullionType === hardwareButtonArray[i].dataset.type)
        hardwareButtonArray[i].classList.add('active');
    }
    if (DESIGN.mullionType === 'painted' || DESIGN.mullionType === 'anodized') {
      this.domElements.hardwareColor.classList.add('active');
    }

    const hardwareButtons = document.getElementsByClassName('js-hardware-buttons')[0];
    hardwareButtons.addEventListener('click', (e) => {
      const el = e.target;

      if ( el.tagName === "BUTTON" && el.dataset.type !== DESIGN.mullionType ) {
        UNSAVED = true;
        for (var i = 0; i < hardwareButtonArray.length; i++) {
          hardwareButtonArray[i].classList.remove('active');
        }
        el.classList.add('active');
        const hardwareType = el.dataset.type;
        DESIGN.mullionType = hardwareType;

        if (hardwareType === 'painted') {
          this.domElements.hardwareColor.classList.add('active');
          this.wallApp.setStructureColor('FFFFFF');
          this.app.hardwareSwatchDisplay.style.backgroundColor = '#FFFFFF';

        } else if (hardwareType === 'anodized') {
          this.domElements.hardwareColor.classList.add('active');
          this.wallApp.setStructureColor('EBF5F7');
          this.app.hardwareSwatchDisplay.style.backgroundColor = '#EBF5F7';

        } else {
          this.domElements.hardwareColor.classList.remove('active');
          this.wallApp.setStructureColor('CCCCCC');
          this.app.hardwareSwatchDisplay.style.backgroundColor = '#CCCCCC';
        }
        
        this.wallApp.updateMesh();

        this.app.getPrice();
      }
    });

    const hardwareColor = document.getElementsByClassName('js-hardware-color')[0];

    hardwareColor.addEventListener('click', (e) => {
      if (DESIGN.mullionType === 'painted') {
        this.app.hardwareColor.classList.add('active');  
      } else if (DESIGN.mullionType === 'anodized') {
        this.app.hardwareAnodized.classList.add('active');  
      }
    }); 
  }

  addEventListeners() {
    this.cardsArray.forEach( (card) => {
      card.addEventListener('click', () => {
        const type = card.dataset.type;
        this.setActive(type);
      });
    });

    this.backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.setDefault();
    });
    
    document.getElementsByClassName("js-design-title")[0].addEventListener("change", function() {
      UNSAVED = true;
    });
  }
}
