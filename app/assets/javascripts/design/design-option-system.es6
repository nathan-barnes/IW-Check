class DesignOptionSystem {

  constructor(option, wallApp, app) {
    this.option = option;
    this.wallApp = wallApp;
    this.app = app;

    this.site;
    this.depth = DESIGN.depth === 0 ? 3 : DESIGN.depth; // default depth of 3

    this.locationInput = document.getElementsByClassName('js-system-location')[0];
    this.locationText = document.getElementsByClassName('js-system-location-text')[0];
    this.locationDisplay = document.getElementsByClassName('js-display-location')[0];

    this.initAutocomplete();

    this.initPanel();
    this.initEnvironment();
    this.initApplication();

    this.setDepthSlider();
  }

  initAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(this.locationInput, {'types': ["(cities)"]});
    this.locationDisplay.innerHTML = DESIGN.city;
    this.locationText.innerHTML = DESIGN.city;

    autocomplete.addListener('place_changed', () => {
      this.site = autocomplete.getPlace();

      if (!this.site.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + this.site.name + "'");
        
        return;

      } else {
        UNSAVED = true;

        let state = '', country = '';
        const stateComponent = this.site.address_components.find((el) => el.types.includes("administrative_area_level_1"));
        if (stateComponent) {
          state = stateComponent.short_name;
        }

        const countryComponent = this.site.address_components.find((el) => el.types.includes("country"));
        if (countryComponent) {
          country = countryComponent.short_name;
        }
        
        DESIGN.setLocation(this.site.vicinity, state, country, this.site.geometry.location.lat(), this.site.geometry.location.lng())
          .then(() => {
            this.locationText.innerHTML = DESIGN.city;
            this.locationDisplay.innerHTML = DESIGN.city;

            this.setDepthSlider();

            this.option.app.getPrice() 
          })
          .catch(() => { });
      }
    });
  }

  setEnvironmentType(buttons, disable=false) {
    for (let i = 0; i < buttons.length; i++) {
      
      buttons[i].disabled = disable;
      
      if (buttons[i].dataset.type === DESIGN.environment) {
        buttons[i].classList.add("active");
      } else {
        buttons[i].classList.remove("active");
      }
    }    
  }

  initPanel() {
    const panelButtons = document.getElementsByClassName('js-panel-button');
    const panelCover = document.getElementsByClassName('js-system-cover')[0];

    for (let i = 0; i < panelButtons.length; i++) {
      if (DESIGN.application !== 'flatPanels') {
        panelButtons[0].classList.add('active');
      } else {
        panelButtons[1].classList.add('active');
        panelCover.classList.add('active');
      }

      panelButtons[i].addEventListener('click', (e) => { 
        UNSAVED = true;
        panelButtons[0].classList.remove('active');
        panelButtons[1].classList.remove('active');

        e.target.classList.add('active');

        // Panels Only
        if (panelButtons[1] === e.target) {
          panelCover.classList.add('active');
          this.wallApp.host.visible = false;

          // cache existing application
          this.depth = DESIGN.depth;
          panelButtons[0].dataset.type = DESIGN.application;
          
          DESIGN.application = 'flatPanels';

        // Hardware System
        } else {
          panelCover.classList.remove('active');
          this.wallApp.host.visible = true;

          DESIGN.depth = this.depth;
          DESIGN.application = e.target.dataset.type;
        }

        this.setApplicationType();

        this.wallApp.updateMesh();
        
        this.option.app.getPrice();
      });
    } 
  }

  initEnvironment() {
    const environmentButtons = document.getElementsByClassName('js-environment-button');
    this.setEnvironmentType(environmentButtons);

    for (let i = 0; i < environmentButtons.length; i++) {
      environmentButtons[i].addEventListener('click', (e) => {
        UNSAVED = true;

        DESIGN.environment = environmentButtons[i].dataset.type;

        this.setDepthSlider();

        this.setEnvironmentType(environmentButtons);

        this.wallApp.imageWall.setMaxIndividualPanelSize(DESIGN.maxPanelWidth, DESIGN.maxPanelHeight);

        this.wallApp.updateMesh();
        
        this.option.app.getPrice();
      });
    }
  }

  initLocation() {
    this.locationText.innerHTML = DESIGN.city;
  }

  setDepthSlider() {
    if (DESIGN.depthRange.length === 2) {
      this.option.setSliderLimits('depth', DESIGN.depthRange);
    }

    this.option.setDepth(DESIGN.depth);
  }

  setApplicationType() {
    const applicationButtons = document.getElementsByClassName('js-application-button');
    const applicationTypeDisplay = document.getElementsByClassName('js-display-system')[0];

    // Convert camelCase to Camel Case.
    let capitalizedSystem = DESIGN.application.replace( /([A-Z])/g, " $1" );
    capitalizedSystem = capitalizedSystem.charAt(0).toUpperCase() + capitalizedSystem.slice(1);

    applicationTypeDisplay.innerHTML = capitalizedSystem;

    for (let i = 0; i < applicationButtons.length; i++) {
      if (applicationButtons[i].dataset.type === DESIGN.application) {
        applicationButtons[i].classList.add("active");
      } else {
        applicationButtons[i].classList.remove("active");
      }
    }

    const environmentButtons = document.getElementsByClassName('js-environment-button');
    const shadeSlider = document.querySelector('.js-shade-section');
    
    this.setDepthSlider();

    switch (DESIGN.application) {
      case "facade":
        this.wallApp.imageWall.setPanelOrientation(0);
        
        this.setEnvironmentType(environmentButtons, true);

        // Reset the maximum height.
        this.option.setSliderLimits('height', [IW.settings.minHeight, IW.settings.maxHeight]);

        // In case switching from ceiling.
        this.option.setControlInteractivity('depth', 'full');

        // In case switching from screen.
        shadeSlider.hidden = false;

        break;
      
      case "wall":
        this.wallApp.imageWall.setPanelOrientation(0);
        
        this.setEnvironmentType(environmentButtons, true);

        // Reset the maximum height.
        this.option.setSliderLimits('height', [IW.settings.minHeight, IW.settings.maxHeight]);

        // In case switching from ceiling.
        this.option.setControlInteractivity('depth', 'full');

        // In case switching from screen.
        shadeSlider.hidden = false;

        break;
      
      case "screen":
        this.wallApp.imageWall.setPanelOrientation(0);

        this.setEnvironmentType(environmentButtons, false);

        // Set the maximum height of a free-standing screen.
        let newHeight = this.option.setSliderLimits('height', [IW.settings.minHeight, IW.settings.maxScreenHeight])[0];
        
        // Refrains from calling this.option.setHeight so UNSAVED isn't set upon pageload
        if (newHeight !== null) {
          DESIGN.height = newHeight;
          this.option.setHeightDisplay();
          this.option.updateSize();
        }

        // In case switching from ceiling.
        this.option.setControlInteractivity('depth', 'static', 'screen');

        // In case switching from screen.
        shadeSlider.hidden = true;

        break;
          
      case "ceiling":
        this.wallApp.imageWall.setPanelOrientation(1);
        
        this.setEnvironmentType(environmentButtons, true);

        // Reset the maximum height.
        this.option.setSliderLimits('height', [IW.settings.minHeight, IW.settings.maxHeight]);

        // Hide depth - not used for ceiling.
        this.option.setControlInteractivity('depth', 'unused', 'ceiling');
        
        // In case switching from screen.
        shadeSlider.hidden = true;

        break;
      
      case "flatPanels":
        this.wallApp.imageWall.setPanelOrientation(0);

        this.setEnvironmentType(environmentButtons, false);

        // Reset the maximum height.
        this.option.setSliderLimits('height', [IW.settings.minHeight, IW.settings.maxHeight]);

        // Hide depth - not used for ceiling.
        this.option.setControlInteractivity('depth', 'unused', 'panels');
        
        // In case switching from screen.
        shadeSlider.hidden = true;

        break;
    }
  }

  initApplication() {
    this.setApplicationType();
    
    const applicationButtons = document.getElementsByClassName('js-application-buttons')[0];
    applicationButtons.addEventListener('click', (e) => {
      if ((e.target.tagName === "BUTTON") && (e.target.dataset.type !== DESIGN.application)) {
        UNSAVED = true;
        DESIGN.application = e.target.dataset.type;
        
        this.setApplicationType();
        
        this.wallApp.updateMesh();
        
        this.option.app.getPrice();
      }
    });
  }
}
