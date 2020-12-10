class DesignView {

  constructor(app, wallApp) {
    this.app = app;
    this.wallApp = wallApp;

    this.shade = document.getElementsByClassName('js-shade')[0];
    this.context = document.getElementsByClassName('js-context')[0];

    this.viewElevation = document.getElementsByClassName('js-view-elevation')[0];
    this.viewPerspective = document.getElementsByClassName('js-view-perspective')[0];
    this.viewPerson = document.getElementsByClassName('js-view-person')[0];
    this.viewDetail = document.getElementsByClassName('js-view-detail')[0];

    this.zoomPlus = document.getElementsByClassName('js-view-plus')[0];
    this.zoomMinus = document.getElementsByClassName('js-view-minus')[0];

    this.addEventListeners();
  }

  addEventListeners() {
    // Shade
    
    noUiSlider.create(this.shade, {
      start: 0.6,
      behavior: 'snap',
      step: 0.2,
      range: {
        'min': 0.2,
        'max': 1
      }
    });
    this.shade.noUiSlider.on('change', (e) => {
      UNSAVED = true;
      DESIGN.shade = e[0];
      
      this.wallApp.updateMesh();
    });
    
    this.shade.noUiSlider.on('slide', (values, handle, unencoded, tap) => {
      if (!tap) {
        DESIGN.shade = values[0];
        this.wallApp.updateMesh();
      }
    });

    // Context
    this.context.addEventListener('click', () => {
      this.wallApp.toggleContext(!this.wallApp.viewContext);
      this.context.classList.toggle('active');
      
      requestAnimationFrame(this.wallApp.render.bind(this.wallApp));
    });    


    // Views
    this.viewElevation.addEventListener('click', () => {
      if (DESIGN.application === 'ceiling') {
        this.wallApp.camera.position.set(0, -10, 0);
      } else {
        this.wallApp.camera.position.set(0, 0, 10);
      }

      this.wallApp.camera.lookAt(this.wallApp.cameraTarget);

      this.app.fitView();
      
      requestAnimationFrame(this.wallApp.render.bind(this.wallApp));
    });

    this.viewPerspective.addEventListener('click', () => {
      this.wallApp.camera.position.setX( DESIGN.width * 12 / 2 );
      this.wallApp.camera.position.setY( DESIGN.height * 12 / 2 );
      this.wallApp.camera.lookAt(this.wallApp.cameraTarget);

      this.app.fitView();
      
      requestAnimationFrame(this.wallApp.render.bind(this.wallApp));
    });

    this.viewPerson.addEventListener('click', () => {
      // Use the existing X position but set to person view
      this.wallApp.camera.position.setY( (-(DESIGN.height * 12) / 2) + 42 );
      this.wallApp.camera.position.setZ( 36 );
      this.wallApp.camera.lookAt(this.wallApp.cameraTarget);
      
      requestAnimationFrame(this.wallApp.render.bind(this.wallApp));
    });

    this.viewDetail.addEventListener('click', () => {
      this.wallApp.camera.position.set( DESIGN.width * 12, DESIGN.height * 12, 20 );
      this.wallApp.camera.lookAt(this.wallApp.cameraTarget);
      
      requestAnimationFrame(this.wallApp.render.bind(this.wallApp));
    });

    // Zooming
    this.zoomPlus.addEventListener('click', () => {
      this.wallApp.zoom(-1);
    });
    this.zoomMinus.addEventListener('click', () => {
      this.wallApp.zoom(1);
    });


  }

}
