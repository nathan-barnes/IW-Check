class DesignScene {
  
  constructor(fragmentShader = FragmentShader.code, vertexShader = VertexShader.code) {
    this.mouseDownPos = new THREE.Vector2(0, 0);
    this.cameraOrigPos = new THREE.Vector3(0, 0);
    this.mouseZoomRatio = 1;
    this.maxZoomDist = 2000;
    this.minZoomDist = 15;
    this.mouseRotationRatio = 0.0025;
    this.viewContext = true;

    this.createRenderer();

    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 5, 10000);
    this.camera.translateZ(100);

    // Put camera on layer 1 (in addition to the default layer 0). Using layer 1 for selective screenshots.
    this.camera.layers.enable(1);

    this.isCameraInFront = true;
    this.imageWall = new ImageWallMesh(fragmentShader, vertexShader);

    this.structureMaterial = new THREE.MeshStandardMaterial({
      metalness: 0,
      roughness: 0.6,
      color: parseInt('0x' + DESIGN.mullionColor.slice(1), 16)
    });

    this.shadowAlpha = new THREE.TextureLoader().load( "/alpha_faded_eges.jpg" );

    this.host = new THREE.Group();
    this.grid = new THREE.Group();
    this.structure = new THREE.Group();
  }

  createRenderer() {
    let webgl = document.getElementById('webgl');
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    let webglHeight = webgl.getBoundingClientRect().height - 1,
      webglWidth = webgl.getBoundingClientRect().width;

    this.renderer.setSize(webglWidth, webglHeight);    
    this.renderer.setClearColor(0xF2F2F2, 1);

    webgl.appendChild(this.renderer.domElement);
  }

  createScene() {
    this.scene = new THREE.Scene();

    this.cameraTarget = this.scene.position;
    this.imageWall.updateCamera(this.camera, this.cameraTarget);
    this.imageWall.setScreenSize(new THREE.Vector2(this.renderer.getSize().width, this.renderer.getSize().height));
    this.imageWall.createMesh();
    this.camera.lookAt(this.cameraTarget);
    this.addImageWall();

    this.updateGrid();
    this.updateHost();
    
    this.scene.add(this.grid);
    this.scene.add(this.host);
    this.scene.add(this.structure);

    // Create lighting
    let light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 1, 5, 1 );
    this.scene.add(light);

    light = new THREE.AmbientLight( 0xA6A6A6 );
    this.scene.add( light );


    // Load 3D figure
    let loader = new THREE.OBJLoader2();
    
    loader.load('/figure.obj', (object) => {

      // Sets the color of the material
      object.traverse( (child) => {
        if ( child instanceof THREE.Mesh ) {
          child.material = new THREE.MeshBasicMaterial({color: 0xffffff});
        }
      });

      object.scale.set(1,1,1);
      object.children[0].geometry = new THREE.Geometry().fromBufferGeometry( object.children[0].geometry );

      let outlineGeo = object.children[0].geometry.clone(),
        outlineMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });

      let outline = new THREE.Mesh( outlineGeo, outlineMat );
      
      this.updateOutline(outline, object.position);
      
      object.add(outline);

      this.figure = object;

      this.updateFigure();

      this.scene.add(this.figure);
    });
  }

  updateOutline(mesh, position) {
    let oldWidth = mesh.outlineWidth || 0;
  
    let dir = this.camera.position.clone();
    dir.sub(position);
    let len = dir.length();

    let newWidth = Math.min(Math.max(200, len), 1000) * 0.0015;

    THREEx.dilateGeometry(mesh.geometry, newWidth - oldWidth);

    mesh.geometry.verticesNeedUpdate = true;

    mesh.outlineWidth = newWidth;
  }
  
  getContextWidth() {
    let options = IW.systemDetails[DESIGN.system];
    let hostMarginSides = 0;

    if (options && options.hasOwnProperty('hostMarginSides')) {
      hostMarginSides = options.hostMarginSides;
    }

    return Math.ceil( (+DESIGN.width + hostMarginSides / 12 * 2) / 2 ) * 24;
  }
  
  getFloorY() {
    let options = IW.systemDetails[DESIGN.system];
    let floorOffset = 0;

    if (options && options.hasOwnProperty('floorOffset')) {
      floorOffset = options.floorOffset;
    }

    return -(
      floorOffset +
      (this.imageWall.orientationType === 1 ? 0 : +DESIGN.height * 12 / 2)
    );
  }

  updateGrid() {
    // Clear out grid group
    for (let i = this.grid.children.length - 1; i >= 0; i--) {
      this.grid.remove(this.grid.children[i]);
    }

    const grid = new THREE.GridHelper(
      this.getContextWidth(), 
      Math.ceil(DESIGN.width / 2), 
      0xbbbbbb, 
      0xbbbbbb
    );
    
    grid.position.setY(this.getFloorY());

    this.grid.add(grid);
  }

  updateHost() {
    // Clear out host group
    for (let i = this.host.children.length - 1; i >= 0; i--) {
      this.host.remove(this.host.children[i]);
    }

    if (DESIGN.application === 'facade' || DESIGN.application === 'wall') {

      const options = IW.systemDetails[DESIGN.system];

      // Host solid
      const wallGeo = new THREE.BoxGeometry( 
        this.getContextWidth(), 
        +DESIGN.height * 12 + options.hostMarginTop + options.floorOffset, 
        10 
      );
      const wallMat = new THREE.MeshBasicMaterial( { 
        color: 0xffffff,
        polygonOffset: true,
        polygonOffsetFactor: 0,
        polygonOffsetUnits: 0
      } );
      const wall = new THREE.Mesh( wallGeo , wallMat );

      // Wireframe edges
      let edges = new THREE.EdgesGeometry( wallGeo, 5 ),
        lines = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );
      wall.add(lines);

      wall.position.setY( wallGeo.parameters.height / 2 + this.getFloorY() );
      
      this.host.add(wall);

      // Shadow
      let shadowGeo = new THREE.Geometry(),
          w = DESIGN.width * 12 + 10,
          h = DESIGN.height * 12 + 8,
          r = 8;
      
      // Outside
      shadowGeo.vertices.push( new THREE.Vector3( -w/2, -h/2, 0 ) );
      shadowGeo.vertices.push( new THREE.Vector3( -w/2, -h/2 + r, 0 ) );
      shadowGeo.vertices.push( new THREE.Vector3( -w/2, h/2 - r, 0 ) );
      shadowGeo.vertices.push( new THREE.Vector3(  -w/2, h/2, 0 ) );
      shadowGeo.vertices.push( new THREE.Vector3( -w/2 + r, h/2, 0 ) );
      shadowGeo.vertices.push( new THREE.Vector3( w/2 - r, h/2, 0 ) );
      shadowGeo.vertices.push( new THREE.Vector3(  w/2,  h/2, 0 ) );
      shadowGeo.vertices.push( new THREE.Vector3( w/2, h/2 - r, 0 ) );
      shadowGeo.vertices.push( new THREE.Vector3( w/2, -h/2 + r, 0 ) );
      shadowGeo.vertices.push( new THREE.Vector3(  w/2,  -h/2, 0 ) );
      shadowGeo.vertices.push( new THREE.Vector3( w/2 - r, -h/2, 0 ) );
      shadowGeo.vertices.push( new THREE.Vector3( -w/2 + r, -h/2, 0 ) );
      // Inside of fuzzy edge
      shadowGeo.vertices.push( new THREE.Vector3( -w/2 + r, -h/2 + r, 0 ) );
      shadowGeo.vertices.push( new THREE.Vector3(  -w/2 + r, h/2 - r, 0 ) );
      shadowGeo.vertices.push( new THREE.Vector3(  w/2 - r,  h/2 - r, 0 ) );
      shadowGeo.vertices.push( new THREE.Vector3(  w/2 - r,  -h/2 + r, 0 ) );
      
      const faces = [
        [0, 12, 1], [0, 11, 12],
        [1, 12, 2], [2, 12, 13],
        [2, 13, 3], [3, 13, 4],
        [4, 13, 5], [5, 13, 14],
        [5, 14, 6], [6, 14, 7],
        [7, 14, 8], [8, 14, 15],
        [8, 15, 9], [9, 15, 10],
        [10, 15, 11], [11, 15, 12],
        [12, 14, 13], [14, 12, 15]
      ];

      const uvs = [
        [0.02, 0.02],
        [0.02, 0.5],
        [0.02, 0.5],
        [0.02, 0.98],
        [0.5, 0.98],
        [0.5, 0.98],
        [0.98, 0.98],
        [0.98, 0.5],
        [0.98, 0.5],
        [0.98, 0.02],
        [0.5, 0.02],
        [0.5, 0.02],
        [0.5, 0.5],
        [0.5, 0.5],
        [0.5, 0.5],
        [0.5, 0.5]
      ];

      shadowGeo.faceVertexUvs[0] = [];

      for (let i=0; i < faces.length; i++) {
        shadowGeo.faces.push( new THREE.Face3( ...faces[i] ) );
        
        shadowGeo.faceVertexUvs[0].push([]);

        for (let vert of faces[i]) {
          shadowGeo.faceVertexUvs[0][i].push( new THREE.Vector2( ...uvs[vert] ) );
        }
      }
      
      shadowGeo.computeFaceNormals();
      shadowGeo.computeVertexNormals();

      let shadow = new THREE.Mesh( 
        shadowGeo,
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(DESIGN.shade, DESIGN.shade, DESIGN.shade),
          alphaMap: this.shadowAlpha,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -1
        })
      );
      shadow.translateZ(5);
      shadow.material.transparent = true;
      
      this.host.add(shadow);

      this.host.position.setZ(-DESIGN.depth - 5);
    
    }
  }

  updateStructure() {
    // Clear out structure group
    for (let i = this.structure.children.length - 1; i >= 0; i--) {
      this.structure.remove(this.structure.children[i]);
    }

    // Bottom left corner of imageWall.
    const corner = this.imageWall.rectCenter.clone();
    corner.sub(this.imageWall.rectWidthVec.clone().multiplyScalar(0.5));
    corner.sub(this.imageWall.rectHeightVec.clone().multiplyScalar(0.5));

    const anchorGeo = new THREE.Geometry();
    const mullionGeo = new THREE.Geometry();

    const details = IW.systemDetails[DESIGN.system];

    // Thickness of pieces.  
    const t = details.anchorThickness;

    // Create repeatable geometry to be instantiated at each panel.
    switch (DESIGN.system) {
      case 'pieAnchor':
        // Anchor

        // Arms of anchor.
        const piArm = new THREE.BoxGeometry( t, details.anchorHeight, DESIGN.anchorDepth - t );
        piArm.translate( DESIGN.mullionWidth / 2 + t / 2, 0, DESIGN.anchorDepth / 2 + t );
        anchorGeo.merge( piArm, piArm.matrix );

        const anchorArm2 = piArm.clone();
        anchorArm2.translate( -(DESIGN.mullionWidth + t), 0, 0 );
        anchorGeo.merge( anchorArm2, anchorArm2.matrix );

        // Base
        const piBase = new THREE.BoxGeometry( details.anchorWidth, details.anchorHeight, t );
        piBase.translate( 0, 0, t );
        anchorGeo.merge( piBase, piBase.matrix );

        anchorGeo.translate( 0, 0, -DESIGN.depth );

        // Mullion

        // Mullion runs height of panel, with 1" margin on both ends.
        const piMullion = new THREE.BoxGeometry( DESIGN.mullionWidth, DESIGN.panelHeight - 2, DESIGN.mullionDepth );
        mullionGeo.merge( piMullion, piMullion.matrix );

        mullionGeo.translate( 0, DESIGN.panelHeight / 2, -(DESIGN.mullionDepth / 2 + DESIGN.panelReturn) );

        break;

      case 'angleAnchor':
        // Anchor

        // Arm of anchor.
        const angleArm = new THREE.BoxGeometry( t, details.anchorHeight, DESIGN.anchorDepth - t );
        angleArm.translate( -(details.anchorWidth - t) / 2, 0, angleArm.parameters.depth / 2 + t );
        anchorGeo.merge( angleArm, angleArm.matrix );

        // Base
        const angleBase = new THREE.BoxGeometry( details.anchorWidth, details.anchorHeight, t );
        angleBase.translate( 0, 0, t / 2 );
        anchorGeo.merge( angleBase, angleBase.matrix );

        anchorGeo.translate( details.anchorWidth / 2 - t - DESIGN.mullionWidth / 2, 0, -DESIGN.depth );
        
        // Mullion

        // Mullion runs height of panel, with 1" margin on both ends.
        const angleMullion = new THREE.BoxGeometry( DESIGN.mullionWidth, DESIGN.panelHeight - 2, DESIGN.mullionDepth );
        mullionGeo.merge( angleMullion, angleMullion.matrix );

        mullionGeo.translate( 0, DESIGN.panelHeight / 2, -(DESIGN.mullionDepth / 2 + DESIGN.panelReturn) );

        break;
      
      case 'singleScreen':
        // Mullions are posts on screen.

        // Post runs from ground to top of panel.
        const post = new THREE.BoxGeometry( details.postWidth, DESIGN.height * 12 + details.floorOffset - details.baseThickness, details.postWidth );
        post.translate( 0, post.parameters.height / 2 + details.baseThickness, 0 );
        mullionGeo.merge( post, post.matrix );

        const base = new THREE.BoxGeometry( details.baseWidth, details.baseThickness, details.baseWidth );
        base.translate( 0, base.parameters.height / 2, 0 );
        mullionGeo.merge( base, base.matrix );

        mullionGeo.translate( 0, -details.floorOffset, -(post.parameters.depth / 2 + DESIGN.panelReturn) );

        break;

      case 'ceiling':
        // Mullions
        const ceilingMullion = new THREE.BoxGeometry( DESIGN.mullionWidth, DESIGN.mullionDepth, DESIGN.height * 12 );
        mullionGeo.merge( ceilingMullion, ceilingMullion.matrix );

        mullionGeo.translate( 0, DESIGN.mullionDepth / 2 + DESIGN.panelReturn, DESIGN.height * 12 / 2 );
        
        // U Channels, full width
        const channelBase = new THREE.BoxGeometry( DESIGN.width * 12 + DESIGN.mullionWidth, details.channelThickness, details.channelWidth );
        channelBase.translate( 0, details.channelThickness / 2, 0 );
        anchorGeo.merge( channelBase, channelBase.matrix );

        const channelWeb = new THREE.BoxGeometry( DESIGN.width * 12 + DESIGN.mullionWidth, details.channelHeight - details.channelThickness, details.channelThickness );
        channelWeb.translate( 0, channelWeb.parameters.height / 2 + details.channelThickness, (details.channelWidth - details.channelThickness) / 2 );
        anchorGeo.merge( channelWeb, channelWeb.matrix );

        const channelWeb2 = channelWeb.clone();
        channelWeb2.translate( 0, 0, -(details.channelWidth - details.channelThickness) );
        anchorGeo.merge( channelWeb2, channelWeb2.matrix );

        anchorGeo.translate( 0, DESIGN.panelReturn + DESIGN.mullionDepth, 0 );

        break;

      default:
        // If the system isn't one of the above (e.g. flatPanels), don't add any structure.
        return;
    }

    // Create anchor for each panel. Extra iteration for right and top edges.
    for (let i = 0; i <= this.imageWall.panelXNum; i++) {
      for (let j = 0; j <= this.imageWall.panelYNum; j++) {

        // Find horizontal location of left edge of panel.
        const pos = corner.clone();
        const wInc = this.imageWall.rectWidthVec.clone();

        // Left side panel or right edge.
        if (i == 0 || i == this.imageWall.panelXNum) {
          wInc.multiplyScalar(i / this.imageWall.panelXNum);
        } else {
          wInc.setLength(this.imageWall.panelWidth * (i - 1) + this.imageWall.edgePanelWidth);
        }

        pos.add(wInc);

        // Find vertical location of bottom edge of panel.
        const hInc = this.imageWall.rectHeightVec.clone();

        // Top or bottom panel.
        if (j == 0 || j == this.imageWall.panelYNum) {
          hInc.multiplyScalar(j / this.imageWall.panelYNum);
        } else {
          hInc.setLength(this.imageWall.panelHeight * (j - 1) + this.imageWall.edgePanelHeight);
        }

        pos.add(hInc);
        
        const anchor = new THREE.Mesh( anchorGeo , this.structureMaterial );
        const mullion = new THREE.Mesh( mullionGeo , this.structureMaterial );

        switch (DESIGN.system) {
          case 'pieAnchor':
          
            if (j !== this.imageWall.panelYNum) {
              mullion.position.setX( pos.x );
              mullion.position.setY( pos.y );
              this.structure.add(mullion);
            }

            anchor.position.x = pos.x;

            // Bottom edge.
            if (j === 0) {
              anchor.position.y = pos.y + details.anchorHeight;
            
            // Extra run for top edge.
            } else if (j === this.imageWall.panelYNum) {
              anchor.position.y = pos.y - details.anchorHeight;

            } else {
              anchor.position.y = pos.y;
            }

            this.structure.add(anchor);

            break;

          case 'angleAnchor':
            anchor.position.setX( pos.x );
            anchor.position.setY( pos.y );

            // Nothing extra needed on the top edge.
            if (j !== this.imageWall.panelYNum) {
              mullion.position.setX( pos.x );
              mullion.position.setY( pos.y );
              this.structure.add(mullion);

              const margin = 6;
              const count = Math.ceil((DESIGN.panelHeight - (margin * 2)) / details.maxAnchorSpacing) + 1;
              const spacing = (DESIGN.panelHeight - (margin * 2)) / (count - 1);

              for (let n = 0; n < count; n++) {
                const newAnchor = anchor.clone();

                newAnchor.translateY( margin + spacing * n );

                if (i === this.imageWall.panelXNum) {
                  newAnchor.rotateZ( Math.PI );
                }

                this.structure.add(newAnchor);
              }
            }

            break;
          
          case 'singleScreen':

            // Only add full-height hardware for first row of panels.
            if (j === 0) {
              mullion.position.setX( pos.x );
              mullion.position.setY( pos.y );
              this.structure.add(mullion);
            }

            break;

          case 'ceiling':
            
            if (j === 0) {
              mullion.position.setX( pos.x );
              mullion.position.setZ( pos.z );
              this.structure.add(mullion);
            }

            if (i === 0 && j !== this.imageWall.panelYNum) {
              anchor.position.setZ( pos.z );
              
              const count = Math.ceil(DESIGN.panelHeight / details.maxChannelSpacing) + 1;
              const spacing = DESIGN.panelHeight / (count - 1);

              for (
                let n = (j === 0 ? 0 : 1); 
                n < count; 
                n++
              ) {
                const newAnchor = anchor.clone();

                newAnchor.translateZ( spacing * n );

                if (n === 0) {
                  newAnchor.translateZ( details.channelWidth / 2 );

                } else if (n === count - 1) {
                  newAnchor.translateZ( -details.channelWidth / 2 );
                }

                this.structure.add(newAnchor);
              }
            }

            break;
        }
      }
    }
  }

  updateMesh() {
    this.removeImageWall();

    this.imageWall.createMesh();
    this.addImageWall();

    this.updateGrid();
    this.updateHost();
    this.updateFigure();

    this.updateStructure();
    
    requestAnimationFrame(this.render.bind(this));
  }

  setStructureColor(hexString) {
    hexString.replace('#', '');

    if (hexString.length === 6) {

      const color = parseInt('0x' + hexString, 16);
      
      this.structure.traverse((child) => {
        if (child.isObject3D && child.hasOwnProperty('material') && child.material.hasOwnProperty('color')) {
          child.material.color.setHex(color);
        }
      });
    }
  }

  toggleContext(state) {
    if (state !== undefined) {
      this.viewContext = state;
    }

    this.figure.visible = this.viewContext;
    this.grid.visible = this.viewContext;

    if (DESIGN.depth > 0) {
      this.host.visible = this.viewContext;
    }
  }

  removeImageWall() {
    let mesh = this.imageWall.getWallPanels();
    for (let i = 0; i < mesh.length; i++) {
      this.scene.remove(mesh[i]);
    }

    mesh = this.imageWall.getReturnFins();
    for (let i = 0; i < mesh.length; i++) {
      this.scene.remove(mesh[i]);
    }
  }

  addImageWall() {
    let mesh = this.imageWall.getWallPanels();
    for (let i = 0; i < mesh.length; i++) {
      //Put imagewall panels on a separate layer for screenshots.
      mesh[i].layers.set(1);

      this.scene.add(mesh[i]);
    }

    mesh = this.imageWall.getReturnFins();
    for (let i = 0; i < mesh.length; i++) {
      this.scene.add(mesh[i]);
    }
  }

  updateFigure() { 
    if (this.figure) {
      this.figure.position.set(30, this.getFloorY(), 30);
    }
  }

  moveCamera(e, start) {
    const floor = this.getFloorY();

    if (start) {
      this.mouseDownPos.x = e.x;
      this.mouseDownPos.y = e.y;

      this.cameraOrigPos.x = this.camera.position.x;
      this.cameraOrigPos.y = this.camera.position.y;
      this.cameraOrigPos.z = this.camera.position.z;
    }

    let dir = this.cameraOrigPos.clone();
    dir.sub(this.cameraTarget);

    if (e.ctrlKey) {
      // Zoom
      let len = dir.length();
      len += (e.y - this.mouseDownPos.y) * this.mouseZoomRatio;

      if (len < this.minZoomDist)
        len = this.minZoomDist;
      else if (len > this.maxZoomDist)
        len = this.maxZoomDist;

      dir.setLength(len);
      dir.add(this.cameraTarget);
      this.camera.position.copy(dir);

    } else {
      // Rotate
      let yaxis = new THREE.Vector3(0, 1, 0);
      let hdir = dir.clone();
      hdir.y = 0;

      if (hdir.length() == 0) {
        hdir = new THREE.Vector3(1, 0, 0);
      }

      hdir.normalize();
      hdir.applyAxisAngle(yaxis, Math.PI / 2);
      let xdif = -(e.x - this.mouseDownPos.x) * this.mouseRotationRatio;
      let ydif = -(e.y - this.mouseDownPos.y) * this.mouseRotationRatio;
      dir.applyAxisAngle(hdir, ydif);
      dir.applyAxisAngle(yaxis, xdif);

      // Prevent camera from sinking below ground.
      if (dir.y < floor && DESIGN.application !== 'ceiling') {
        dir.setY(floor);
      }

      if (this.isCameraInFront && dir.z < 0) {
        this.isCameraInFront = false;
      } else if (!this.isCameraInFront && dir.z > 0) {
        this.isCameraInFront = true;
      }

      if (this.imageWall != null) {
        this.imageWall.updateGeometryOrder(this.isCameraInFront);

        this.figure.children[1].renderOrder = this.isCameraInFront ? 5 : 0;
      }

      dir.add(this.cameraTarget);
      this.camera.position.copy(dir);
      this.camera.lookAt(this.cameraTarget);
    }

    requestAnimationFrame(this.render.bind(this));
  }

  zoom(zoom) {
    let dir = this.camera.position.clone();
    dir.sub(this.cameraTarget);
    let cameraDistance = dir.length();

    if (zoom > 0) {
      // Zoom out
      this.camera.translateZ( Math.min(this.camera.position.z * zoom * 1/3, this.maxZoomDist - cameraDistance) );
    
    } else {
      // Zoom in
      this.camera.translateZ( Math.max(this.camera.position.z * zoom * 1/4, this.minZoomDist - cameraDistance) );
    }

    this.updateOutline(this.figure.children[1], this.figure.position);

    requestAnimationFrame(this.render.bind(this));
  }

  render() {
    const floor = this.getFloorY();

    // Hide grid if we're below ground.
    if (this.camera.position.y < floor) {
      this.grid.visible = false;
    } else {
      this.grid.visible = this.viewContext;
    }

    if (this.imageWall != null) {
      this.imageWall.updateCamera(this.camera, this.cameraTarget);
      this.imageWall.updateCameraParameters();
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}
