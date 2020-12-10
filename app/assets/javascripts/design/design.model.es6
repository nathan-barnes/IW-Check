class DesignModel {
  constructor(params = {}) {
    this.params = {};

    this.params.perfBitmap = DEFAULT_MAP; // image
    this.params.crop = true; // crop

    this.params.width = 15; // feet
    this.params.height = 11; // feet
    this.params.depth = 4; // inches
    this.params.depthRange = [3, 8]; // inches
    this.params.panelReturn = 1; // inches

    this.params.gridSize = 1.25; // inches
    this.params.minPerf = 0.13; // inches
    this.params.maxPerf = 1; // inches
    this.params.gridType = 1; // staggered
    this.params.perfShape = 0; // circle
    this.params.invert = true;
    
    this.params.reductionType = 0;
    this.params.reductionPct = 10;
    this.params.reductionAngle = 5;

    this.params.application = "wall";
    this.params.environment = "indoor";
    this.params.orientation = 0; // vertical
    this.params.system = "angleAnchor";
    this.params.anchorDepth = 1.5;
    this.params.mullionWidth = 1;
    this.params.mullionDepth = 2;
    this.params.mullionThickness = 2;
    this.params.windLoad = 90;
    this.params.windCategory = 0;
    this.params.mullionType = "painted";
    this.params.mullionColor = "#FFFFFF";

    this.params.panelMaterial = "solanumSteel";
    this.params.panelMetal = "steel";
    this.params.materialBitmap = DEFAULT_TILE;
    this.params.panelColor = "#42849C";

    this.params.distance = 509;
    this.params.city = "Chicago";
    this.params.state = "IL";
    this.params.country = "US";
    this.params.latitude = 41.878114;
    this.params.longitude = -87.629798;

    this.params.shade = 0.5;
    
    // Dynamic parameters
    this.params.panelNumber = undefined;
    this.params.minPanelThickness = undefined;
    this.params.maxPanelWidth = undefined;
    this.params.maxPanelHeight = undefined;
    this.params.panelWidth = undefined;
    this.params.panelHeight = undefined;
    

    this.windMap = null;
    

    this.displayValMap = {
      "gridType": {
        "0": "Square",
        "1": "Staggered"
      },

      "perfShape": {
        "0": "Circle",
        "1": "Square",
        "2": "Diamond",
        "3": "Hexagon"
      },

      "reductionType": {
        "0": "None",
        "1": "Random",
        "2": "Linear",
        "3": "Radial"
      }
    };

    // Overwrite defaults with design to load, and run logic to keep parameters consistent.
    Object.assign(this, params);
  }


  get perfBitmap() { return this.params.perfBitmap; }
  get crop() { return this.params.crop; }
  get width() { return this.params.width; }
  get height() { return this.params.height; }
  get depth() { return this.params.depth; }
  get depthRange() { return this.params.depthRange; }
  get gridSize() { return this.params.gridSize; }
  get minPerf() { return this.params.minPerf; }
  get maxPerf() { return this.params.maxPerf; }
  get gridType() { return this.params.gridType; }
  get perfShape() { return this.params.perfShape; }
  get invert() { return this.params.invert; }
  get reductionType() { return this.params.reductionType; }
  get reductionPct() { return this.params.reductionPct; }
  get reductionAngle() { return this.params.reductionAngle; }
  get application() { return this.params.application; }
  get environment() { return this.params.environment; }
  get orientation() { return this.params.orientation; }
  get system() { return this.params.system; }
  get anchorDepth() { return this.params.anchorDepth; }
  get mullionWidth() { return this.params.mullionWidth; }
  get mullionDepth() { return this.params.mullionDepth; }
  get mullionThickness() { return this.params.mullionThickness; }
  get mullionColor() { return this.params.mullionColor; }
  get mullionType() { return this.params.mullionType; }
  get windLoad() { return this.params.windLoad; }
  get windCategory() { return this.params.windCategory; }
  get panelMaterial() { return this.params.panelMaterial; }
  get panelMetal() { return this.params.panelMetal; }
  get materialBitmap() { return this.params.materialBitmap; }
  get panelColor() { return this.params.panelColor; }
  get distance() { return this.params.distance; }
  get city() { return this.params.city; }
  get state() { return this.params.state; }
  get country() { return this.params.country; }
  get longitude() { return this.params.longitude; }
  get latitude() { return this.params.latitude; }
  get panelReturn() { return this.params.panelReturn; }
  get shade() { return this.params.shade; }

  get panelWidth() {
    return this.width * 12 / Math.ceil(this.width * 12 / this.maxPanelWidth);
  }

  get panelHeight() {
    return this.height * 12 / Math.ceil(this.height * 12 / this.maxPanelHeight);
  }

  get maxPanelWidth() {
    return IW.metalInfo[this.params.panelMetal]["maxWidth"][this.params.windCategory];
  }

  get maxPanelHeight() {
    return IW.metalInfo[this.params.panelMetal]["maxHeight"];
  }

  get panelNumber() {
    return Math.round(this.params.width * 12 / this.panelWidth) * 
      Math.round(this.params.height * 12 / this.panelHeight);
  }

  /**
   * Calculate minimum allowable panel thickness given wind loads, material, and panel width.
   */
  get minPanelThickness() {
    return IW.metalInfo[this.params.panelMetal]['factor'][this.params.windCategory] * this.panelWidth;
  }

  /**
   * Convert mullion dimensions to an id string for use in the pricing spreadsheet.
   */
  get mullionId() {
    let dims = [this.params.mullionDepth, this.params.mullionWidth, this.params.mullionThickness];

    return dims.reduce((mullionId, dim) => {
      // If any of the dimensions are null, short circuit and return null.
      if (mullionId === null || dim === null) {
        return null;
      } else if (mullionId.length) {
        mullionId += "x";
      }

      return mullionId + Math.round(parseFloat(dim) * 1000) / 1000;
    }, "");
  }
  
  get pricingObject() {
    return {
      panelNumber: this.panelNumber,  
      overallWidth: this.width * 12,
      overallHeight: this.height * 12,
      panelWidth: this.panelWidth,
      panelHeight: this.panelHeight,
      gridSize: this.gridSize,
      gridType: this.toDisplayValue("gridType"), // e.g. "staggered"
      perfShape: this.toDisplayValue("perfShape"), // e.g. "circle"
      reductionType: this.toDisplayValue("reductionType"), // e.g. "none"
      reductionPercent: this.reductionPct, // 
      panelMaterial: this.panelMaterial, // e.g. "roanoZinc"
      panelColor: this.panelColorCategory(), // e.g. "light"
      structureMaterial: this.mullionType, // 
      structureColor: this.structureColorCategory(), // e.g. "light"
      city: this.city, // 
      system: this.system, // e.g. "angleAnchor"
      mullion: this.mullionId, // e.g. "2x1x0.125"
      anchorDepth: this.anchorDepth,
      distance: this.distance,
      windCategory: this.windCategory,
      exposure: 0, // this.exposure TODO
      minPanelThickness: this.minPanelThickness,
    }
  }


  set perfBitmap(perfBitmap) { this.params.perfBitmap = perfBitmap; }
  set crop(crop) { this.params.crop = crop; }

  // Calculated parameters. Don't set manually.
  set panelNumber(panelNumber) {  }
  set minPanelThickness(minPanelThickness) {  }
  set maxPanelWidth(maxPanelWidth) {  }
  set maxPanelHeight(maxPanelHeight) {  }
  set panelWidth(panelWidth) {  }
  set panelHeight(panelHeight) {  }
  set panelReturn(panelReturn) {  }
  set depthRange(depthRange) {  }

  set gridSize(gridSize) { this.params.gridSize = gridSize; }
  set minPerf(minPerf) { this.params.minPerf = minPerf; }
  set maxPerf(maxPerf) { this.params.maxPerf = maxPerf; }
  set gridType(gridType) { this.params.gridType = gridType; }
  set perfShape(perfShape) { this.params.perfShape = perfShape; }
  set invert(invert) { this.params.invert = invert; }
  set reductionType(reductionType) { this.params.reductionType = reductionType; }
  set reductionPct(reductionPct) { this.params.reductionPct = reductionPct; }
  set reductionAngle(reductionAngle) { this.params.reductionAngle = reductionAngle; }

  set system(system) { this.params.system = system; }

  set orientation(orientation) { this.params.orientation = orientation; }

  set anchorDepth(anchorDepth) { this.params.anchorDepth = anchorDepth; }
  set mullionWidth(mullionWidth) { this.params.mullionWidth = mullionWidth; }
  set mullionDepth(mullionDepth) { this.params.mullionDepth = mullionDepth; }
  set mullionThickness(mullionThickness) { this.params.mullionThickness = mullionThickness; }
  set mullionType(mullionType) { this.params.mullionType = mullionType; }
  set mullionColor(mullionColor) { this.params.mullionColor = mullionColor; }

  set materialBitmap(materialBitmap) { this.params.materialBitmap = materialBitmap; }
  set panelColor(panelColor) { this.params.panelColor = panelColor; }

  // TODO: Calculated parameter. Don't set manually?
  set distance(distance) { this.params.distance = distance; }
  
  set city(city) { this.params.city = city; }
  set state(state) { this.params.state = state; }
  set country(country) { this.params.country = country; }
  set longitude(longitude) { this.params.longitude = longitude; }
  set latitude(latitude) { this.params.latitude = latitude; }
  
  set shade(shade) { this.params.shade = shade; }

  set width(width) {
    this.params.width = width;
  }

  set height(height) {
    this.params.height = height;

    this.updateWindCategory();
  }
  
  set depth(depth) { 
    this.params.depth = depth; 
  
    this.setDepthComponents();
  }

  set windLoad(windLoad) {
    this.params.windLoad = windLoad;
      
    this.updateWindCategory();
  }

  // TODO: Calculated parameter. Don't set manually?
  set windCategory(windCategory) {
    this.params.windCategory = windCategory;
  }

  // TODO: Calculated parameter. Don't set manually?
  set panelMetal(panelMetal) {
    this.params.panelMetal = panelMetal;
  }
  
  set panelMaterial(panelMaterial) {
    this.params.panelMaterial = panelMaterial;

    this.panelMetal = MATERIALS[panelMaterial].metal;
  }

  set application(application) {
    this.params.application = application; 
    
    switch (application) {
      case "facade":
        this.params.environment = 'outdoor';
        this.updateWindCategory();
        break;
      
      case "wall":
        this.params.environment = 'indoor';
        this.updateWindCategory();
        break;
      
      case "screen":
        break;
          
      case "ceiling":
        this.params.environment = 'indoor';
        this.updateWindCategory();
        break;
    }

    this.updateSystem();
  }
  
  set environment(environment) {
    this.params.environment = environment;

    this.updateWindCategory();
    this.updateSystem();
  }
  
  initDistanceService() {
    this.distanceService = new google.maps.DistanceMatrixService();

    if (this.windMap && this.windMap.canvas) {

      return this.setLocation()
        .then(() => {
          if (DESIGN.distance === null) {
            // Check stored longitude and latitude for accuracy. Some designs were saved with the two swapped.
            const geocoder = new google.maps.Geocoder;
            
            return new Promise((resolve, reject) => {
              geocoder.geocode({ address: [ this.city, this.state, this.country ].join(', ')}, (results, status) => {
                if (status == 'OK') {
                  resolve(results);
                } else {
                  reject();
                }
              });

            }).then((results) => {
              this.params.latitude = results[0].geometry.location.lat();
              this.params.longitude = results[0].geometry.location.lng();
              
              return this.setLocation();

            }).catch(() => false);

          } else {
            return true;
          }
        })
        .catch(() => false);
    }
  }

  setLocation(city = this.params.city, state = this.params.state, country = this.params.country, latitude = this.params.latitude, longitude = this.params.longitude) {

    this.params.city = city;
    this.params.state = state;
    this.params.country = country;
    this.params.latitude = latitude;
    this.params.longitude = longitude;

    this.updateWindLoad();

    return new Promise((resolve, reject) => {
      if (!this.distanceService) {
        reject(false);
      }

      let callback = (response, status) => {
        if (status == "OK" && response.rows[0].elements[0].status !== 'ZERO_RESULTS') {
          const meters = response.rows[0].elements[0].distance.value,
            miles = meters * 0.000621371;

          DESIGN.distance = miles;

        } else {
          DESIGN.distance = null;
        }

        this.updateSystem();

        resolve(true);
      }

      this.distanceService.getDistanceMatrix({
        origins: ['Zahner, East 9th Street, KCMO, MO, United States'],
        destinations: [{lat: DESIGN.latitude, lng: DESIGN.longitude}],
        travelMode: 'DRIVING'
      }, callback);
    });
  }

  /**
   * Set structural system parameters based on application, wind loads, and anchor spacing.
   */
  updateSystem() {

    this.params.anchorDepth = null;
    this.params.mullionDepth = null;
    this.params.mullionWidth = null;
    this.params.mullionThickness = null;
    
    switch (this.params.application) {
      case 'ceiling':
        this.params.system = 'ceiling';
        this.params.mullionWidth = 1;
        this.params.mullionDepth = 2;
        this.params.mullionThickness = 0.125;

        break;

      case 'screen':
        this.params.system = 'singleScreen';

        break;
      
      case 'wall':
        this.params.system = 'angleAnchor';
        [this.params.mullionDepth, this.params.mullionWidth, this.params.mullionThickness] = IW.mullionSizes[0][1];

        break;
      
      case 'facade':
        this.params.system = 'pieAnchor';

        for (var row of IW.mullionSizes) {
          if (row[0] >= this.panelHeight) {

            const size = row[this.params.windCategory + 1];

            [this.params.mullionDepth, this.params.mullionWidth, this.params.mullionThickness] = size;

            break;
          }
        }
        
        break;

      case 'flatPanels':
        this.params.system = 'flatPanels';

        break;
    }

    this.setDepthRange();

    this.setDepthComponents();

    return true;
  }

  /**
   * Calculate anchor depth and panel return to add up to target overall depth.
   */
  setDepthComponents() {
    const details = IW.systemDetails[this.system];

    // If the system is built of an anchor which holds a mullion which holds a panel. (e.g. angleAnchor, pieAnchor)
    if (details.hasOwnProperty('minMullionBoltMargin') && details.hasOwnProperty('minAnchorBoltMargin') && details.hasOwnProperty('maxAnchorDepth')) {

      // First try, assuming default panel return and minimum overlap between anchor and mullion.
      this.params.anchorDepth = this.depth - IW.settings.defaultPanelReturn - (this.mullionDepth - details.minMullionBoltMargin) + details.minAnchorBoltMargin

      // Too deep - expand panel return.
      if (this.anchorDepth > details.maxAnchorDepth) {
        this.params.anchorDepth = details.maxAnchorDepth;

        this.params.panelReturn = this.depth - (this.params.anchorDepth - details.minAnchorBoltMargin) - (this.mullionDepth - details.minMullionBoltMargin);

        if (this.panelReturn > IW.settings.maxPanelReturn) {
          console.log("Panel Return too large: " + this.panelReturn);
          return false;
        }

      // Too shallow
      } else if (this.anchorDepth < details.minAnchorDepth) {
        // Try just shrinking panel return.
        if ((details.minAnchorDepth - this.anchorDepth) < (IW.settings.defaultPanelReturn - IW.settings.minPanelReturn)) {
          this.params.panelReturn = IW.settings.defaultPanelReturn - (details.minAnchorDepth - this.anchorDepth);
          this.params.anchorDepth = details.minAnchorDepth;
        
        // Need to overlap anchor and mullion.
        } else {
          this.params.panelReturn = IW.settings.minPanelReturn;
          
          this.params.anchorDepth = details.minAnchorDepth;

          if (this.depth - (this.panelReturn + this.mullionDepth) > details.minMullionOffset) {
            console.log("Depth too small: " + this.depth);
            return false;
          }
        }

      // First guess worked.
      } else {
        this.params.panelReturn = IW.settings.defaultPanelReturn;
      }
    
    // Current system doesn't have the parameters to calculate anchor depth - assume there is no anchor.
    } else {
      this.params.anchorDepth = false;
      
      if (details.hasOwnProperty('panelReturn')) {
        this.params.panelReturn = details.panelReturn;
      } else {
        this.params.panelReturn = 0;
      }
    }
    
    return true;
  }
  
  /**
   * Calculate wind load by sampling wind map canvas. Update wind category.
   */
  updateWindLoad() {
    if (this.windMap && this.windMap.canvas) {
      const x = (this.params.longitude/360 + 0.5) * this.windMap.canvas.width,
        y = ((-this.params.latitude/180) + 0.5) * this.windMap.canvas.height,

        imgData = this.windMap.getImageData(x, y, 1, 1);
      
      this.windLoad = imgData.data[0];

      this.updateSystem();
    }
  }

  /**
   * Calculate wind category based on design wind load and overall height.
   */
  updateWindCategory() {
    if (this.params.environment === 'indoor') {
      this.windCategory = 0;

    } else if (this.params.windLoad <= 115) {
      this.windCategory = 1 + (this.params.height > 30 ? 1 : 0);

    } else if (this.params.windLoad <= 150) {
      this.windCategory = 2 + (this.params.height > 30 ? 1 : 0);

    } else {
      this.windCategory = 3 + (this.params.height > 30 ? 1 : 0);
    }
  }

  /**
   * Calculate min and max depth possible with current system and mullion size.
   */
  setDepthRange() {
    let minDepth, maxDepth;
    
    let details = IW.systemDetails[this.params.system];

    switch (this.params.system) {
      case 'angleAnchor':
      case 'pieAnchor':

        minDepth = Math.max(
          this.params.mullionDepth + details.minMullionOffset, 
          details.minAnchorDepth + Math.max(details.minAnchorBoltMargin, details.minMullionBoltMargin)
         ) + IW.settings.minPanelReturn;

        maxDepth = (this.params.mullionDepth - details.minMullionBoltMargin) + (details.maxAnchorDepth - details.minAnchorBoltMargin) + IW.settings.maxPanelReturn;     

        this.params.depthRange = [minDepth, maxDepth];

        if (this.depth < this.depthRange[0]) {
          this.depth = this.depthRange[0];
          return this.depth;
        
        } else if (this.depth > this.depthRange[1]) {
          this.depth = this.depthRange[1];
          return this.depth;
        }

        break;
      
      case 'singleScreen':

        this.params.depthRange = [+details.postWidth + details.panelReturn];

        if (this.depth !== this.depthRange[0]) {
          this.depth = this.depthRange[0];
          return this.depth;
        }

        break;
      
      default:

        // Don't know what to do with the current system type.
        this.params.depthRange = false;
    }

    return true;
  }

  /**
   * Convert hex color to category of finish color, for pricing.
   */
  panelColorCategory() {
    switch (this.panelMaterial) {
      case 'anodizedAluminum':
        const lightness = one.color(this.panelColor).lightness();

        if (lightness >= 0.9) {
          // Only clear anodized.
          return 'clear';

        } else if (lightness >= 0.35) {
          // Nickel, Champagne, Golden Bronze.
          return 'light';

        } else {
          // Light Bronze, Dark Bronze, Electrolytic Black.
          return 'dark';
        }
        break;

      default:
        return '';
    }
  }

  /**
   * Convert hex color to category of finish color, for pricing.
   */
  structureColorCategory() {
    switch (this.mullionType) {
      case 'anodized':
        const lightness = one.color(this.mullionColor).lightness();

        if (lightness >= 0.9) {
          return 'clear';
        } else if (lightness >= 0.35) {
          return 'light';
        } else {
          return 'dark';
        }
        break;

      default:
        return '';
    }
  }

  /**
   * Convert design parameter value to display string.
   * @param key string Design parameter name.
   */
  toDisplayValue(key) {
    let value = this.params[key].toString();
    return this.displayValMap[key][value];
  }

}
