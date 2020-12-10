/// <reference path="./typings/index.d.ts" />
/// <reference path="vertexShader.ts" />
/// <reference path="fragmentShader.ts" />
/**
 * image wall geometry as multiple Three.Mesh with custom fragment shaders
 *
 * Use
 *
 * imageWall = new ImageWallMesh();
 * // set parameters
 * // ...
 * imageWall.createMesh(); // generate materials and mesh geometries
 *
 * // created meshes are retrieved by
 * // getWallPanels()
 * // getReturnFins()
 *
 * Parameter setting methods
 *
 * setMaterialColor(color:string)
 * setMaterialTexture(texturefile:string)
 * enableMaterialTexture()
 * setMaterialTextureTiling(urepeat:number, vrepeat:number)
 * setMaterialTextureSize(usize: number, vsize: number)
 * setPerfBitmap(image)
 * setPerfBitmapFile(imagepath:string)
 * enableCropPerfBitmap(flag:boolean)
 * setGridSize(gridSz:number)
 * setReturnDepth(depth:number)
 * setGridType(type:number)
 * setPerfShape(shape:number)
 * setMinPerf(minperf:number)
 * setMaxPerf(maxperf:number)
 * setMaxIndividualPanelSize(maxPanelWidth:number, maxPanelHeight:number)
 * setPanelLocation(centerX:number, centerY:number, centerZ:number)
 * setPanelSize(width:number, height:number)
 * setPanelOrientation(orientation:number)
 * setPanelBorder(xBorder:number, yBorder:number)
 * setReduction(type:number, percent:number, angle:number)
 * setPerforationSupersample(sampleType:number) // 0: no supersample, 1: 2x2 supersample, 2: 3x3 supersample
 * setReductionSupersample(sampleType:number)
 * setInvertPerforation(flag:boolean)
 * updateCamera(camera:THREE.PerspectiveCamera, cameraTargetPos:THREE.Vector3)
 * setScreenSize(size:THREE.Vector2)
 *
 */
var ImageWallMesh = (function () {
    function ImageWallMesh(fragmentShader, vertexShader) {
        if (fragmentShader === void 0) { fragmentShader = FragmentShader.code; }
        if (vertexShader === void 0) { vertexShader = VertexShader.code; }
        this.vertexShaderCode = vertexShader;
        this.fragmentShaderCode = fragmentShader;
        // default parameters
        this.gridSize = 3.0; // inch
        this.perfShape = 0; // circle
        this.orientationType = 0; // vertical
        this.screenSize = new THREE.Vector2(800, 600);
        this.cameraPos = new THREE.Vector3(0, 0, 100);
        this.cameraTarget = new THREE.Vector3(0, 0, 0);
        this.materialColor = new THREE.Color(0xff0000); // red
        this.useMaterialTexture = false;
        this.materialUSize = 5 * 12;
        this.materialVSize = 5 * 12;
        this.materialURepeat = this.width / this.materialUSize;
        this.materialVRepeat = this.height / this.materialVSize;
        this.xborder = 0.5;
        this.yborder = 0.5;
        this.maxPanelWidth = 42; 
        this.maxPanelHeight = 138; 
        this.panelXNum = Math.ceil(this.width / this.maxPanelWidth);
        this.panelYNum = Math.ceil(this.height / this.maxPanelHeight);
        this.returnDepth = 1;
        this.minPerf = 0.05;
        this.maxPerf = 0.95;
        this.gridType = 1; // triangular grid
        this.reductionType = 0; //0; // no reduction
        this.reductionAngle = 0;
        this.reductionPercent = 0;
        this.supersamplePerforation = 1; // enable 2x2 perf supersampling
        this.supersampleReduction = 1; // enable reduction supersampling
        this.invertPerforation = false;
        if (this.orientationType > 0) {
            this.rectWidthVec = new THREE.Vector3(1, 0, 0);
            this.rectHeightVec = new THREE.Vector3(0, 0, 1);
            this.rectCenter = new THREE.Vector3(0, 10 * 12, 0);
        }
        else {
            this.rectWidthVec = new THREE.Vector3(1, 0, 0);
            this.rectHeightVec = new THREE.Vector3(0, 1, 0);
            this.rectCenter = new THREE.Vector3(0, 0, 0);
        }
        this.rectWidthVec.setLength(this.width);
        this.rectHeightVec.setLength(this.height);
    }
    /**
     * Set material texture file (overriden by material color).
     * @param {string} texturefile file path to texture image
     */
    ImageWallMesh.prototype.setMaterialTexture = function (texturefile) {
        return new Promise((resolve, reject) => {
            this.textureFile = texturefile;
            var loader = new THREE.TextureLoader();
            loader.crossOrigin = 'anonymous'; 
    
            this.materialTexture = loader.load(
                this.textureFile,
                function(texture){
                    resolve();
                },
                function() {},
                function(error) { 
                    console.error(error);
                    reject();
                }
            );
            this.useMaterialTexture = true;
        });
    };
    /**
     * Choose whether to use a material texture or a color.
     */
    ImageWallMesh.prototype.enableMaterialTexture = function (use) {
        this.useMaterialTexture = use;
    };
    /**
     * Set material color. Overrides materialTexture.
     * @param hexString Color
     */
    ImageWallMesh.prototype.setMaterialColor = function (hexString) {
        if (hexString !== undefined && hexString !== '') {
            this.materialColor = new THREE.Color(hexString);
            this.useMaterialTexture = false;
        }
    };
    /**
     * material texture tiling repetition setting
     */
    ImageWallMesh.prototype.setMaterialTextureTiling = function (urepeat, vrepeat) {
        this.materialURepeat = urepeat;
        this.materialVRepeat = vrepeat;
    };
    /**
     * Set size of material texture in scene units (inches).
     */
    ImageWallMesh.prototype.setMaterialTextureSize = function (usize, vsize) {
        this.materialUSize = usize;
        this.materialVSize = vsize;
    };
    /**
     * update bitmap image for perforation.
     * @param {image file html component} perforation bitmap
    */
    ImageWallMesh.prototype.setPerfBitmap = function (image) {
        this.perfTexture = new THREE.Texture(image);
        this.perfTexture.needsUpdate = true;
        this.setPerfBitmapSize(image.width, image.height);
    };
    /**
     * update bitmap image for perforation by file path.
     * @param {image file html component} perforation bitmap
    */
    ImageWallMesh.prototype.setPerfBitmapFile = function (imagepath) {
        return new Promise((resolve, reject) => {
            this.perfBitmapFile = imagepath;
            var loader = new THREE.TextureLoader();
            this.perfBitmapWidth = 1.0; // init
            this.perfBitmapHeight = 1.0; // init
            loader.crossOrigin = ''; 
            this.perfTexture = loader.load(this.perfBitmapFile, (tex) => {
                this.setPerfBitmapSize(tex.image.width, tex.image.height);
                resolve();
            }, function() {}, function(error) {
                reject();
            });
        });
    };
    /**
     * enable crop option of perforation bitmap
     */
    ImageWallMesh.prototype.enableCropPerfBitmap = function (flag) {
        this.cropPerfBitmap = flag;
    };
    /**
     * set bitmap size
     */
    ImageWallMesh.prototype.setPerfBitmapSize = function (bitmapWidth, bitmapHeight) {
        this.perfBitmapWidth = bitmapWidth;
        this.perfBitmapHeight = bitmapHeight;
        this.updateShaderUniform('perfBitmapWidth', this.perfBitmapWidth);
        this.updateShaderUniform('perfBitmapHeight', this.perfBitmapHeight);
    };
    /**
     * update grid size.
     * @param {number} gridSz grid size in inch
    */
    ImageWallMesh.prototype.setGridSize = function (gridSz) {
        this.gridSize = gridSz;
    };
    /**
    update panel return depth
    */
    ImageWallMesh.prototype.setReturnDepth = function (depth) {
        this.returnDepth = depth;
    };
    /**
     * update grid type (orthogonal or diagonal grid).
     * @param {number} gridType 0 sets the grid type to be orthogonal. 1 sets the grid type to be diagonal.
    */
    ImageWallMesh.prototype.setGridType = function (type) {
        this.gridType = type;
    };
    /**
     * update perforation shpae (circle / square / diamond ).
     * @param {number} shape 0: circle, 1: square, 2: diamond.
    */
    ImageWallMesh.prototype.setPerfShape = function (shape) {
        this.perfShape = shape;
    };
    /**
     * update minimum perforation size
     * @param {number} minperf minimum perforation size ratio. number is between 0 - 1.
    */
    ImageWallMesh.prototype.setMinPerf = function (minperf) {
        this.minPerf = minperf;
    };
    /**
     * update maximum perforation size
     * @param {number} maxperf maxmimum perforation size ratio. number is between 0 - 1.
    */
    ImageWallMesh.prototype.setMaxPerf = function (maxperf) {
        this.maxPerf = maxperf;
    };

    ImageWallMesh.prototype.setAbsoluteMaxPerf = function (maxperf) {
        this.maxPerf = maxperf / this.gridSize;
    }

    ImageWallMesh.prototype.setAbsoluteMinPerf = function (minperf) {
        this.minPerf = minperf / this.gridSize;
    }

    /**
     * maximum size of individual panel to decide how many vertical / horizontalreturn fins are inserted
     * this parameters should be set in the beginning once befor createMesh is called for the first time. If this is changed later, 	calculatePanelSizeAndGridNum() and createReturnFins should be called after this.
     */
    ImageWallMesh.prototype.setMaxIndividualPanelSize = function (maxPanelWidth, maxPanelHeight) {
        this.maxPanelWidth = maxPanelWidth;
        this.maxPanelHeight = maxPanelHeight;
        this.panelXNum = Math.ceil(this.width / this.maxPanelWidth);
        this.panelYNum = Math.ceil(this.height / this.maxPanelHeight);
    };
    /**
     * update panel location, size, perforation border, and orientation
     * @param {number} centerX X of center position of rectangle panel.
     * @param {number} centerY Y of center position of rectangle panel.
     * @param {number} centerZ Z of center position of rectangle panel.
    */
    ImageWallMesh.prototype.setPanelLocation = function (centerX, centerY, centerZ) {
        this.rectCenter = new THREE.Vector3(centerX, centerY, centerZ);
    };
    /**
     * set panel size.
     * @param {number} width width of pane.
     * @param {number} height height of pane.
    */
    ImageWallMesh.prototype.setPanelSize = function (width, height) {
        this.width = width;
        this.height = height;
        if (this.orientationType > 0) {
            this.rectWidthVec = new THREE.Vector3(this.width, 0, 0);
            this.rectHeightVec = new THREE.Vector3(0, 0, this.height);
        }
        else {
            this.rectWidthVec = new THREE.Vector3(this.width, 0, 0);
            this.rectHeightVec = new THREE.Vector3(0, this.height, 0);
        }
        this.panelXNum = Math.ceil(this.width / this.maxPanelWidth);
        this.panelYNum = Math.ceil(this.height / this.maxPanelHeight);
        // Update material tiling so that material keeps the same scale.
        this.materialURepeat = this.width / this.materialUSize;
        this.materialVRepeat = this.height / this.materialVSize;
    };
    /**
     * update panel orientation to be vertical wall or horizontal ceiling
     * @param {number} orientation orientation of panel. 0: vertical wall, 1: horizontal ceiling
    */
    ImageWallMesh.prototype.setPanelOrientation = function (orientation) {
        this.orientationType = orientation;
        if (this.orientationType > 0) {
            this.rectWidthVec = new THREE.Vector3(this.width, 0, 0);
            this.rectHeightVec = new THREE.Vector3(0, 0, this.height);
        }
        else {
            this.rectWidthVec = new THREE.Vector3(this.width, 0, 0);
            this.rectHeightVec = new THREE.Vector3(0, this.height, 0);
        }
    };
    /**
     * update panel border width
     * @param {number} xBorder blank border around perforation in width direction
     * @param {number} yBorder blank border around perforation in height direction
    */
    ImageWallMesh.prototype.setPanelBorder = function (xBorder, yBorder) {
        this.xborder = xBorder;
        this.yborder = yBorder;
    };
    /**
     * update reduction setting
     * @param {number} type reduction type; 0: no reduction, 1: uniform random reduction, 2: linear gradient random reduction, 3: radial gradient random reduction
     * @param {number} percent reduction percent 0 - 100%. 0% means no perforation is removed. 100% means all perforation is removed.
     * @param {number} angle angle of gradient in linear gradient type
    */
    ImageWallMesh.prototype.setReduction = function (type, percent, angle) {
        this.reductionType = type;
        this.reductionAngle = angle;
        this.reductionPercent = percent;
    };
    /**
     * control perforation supersample setting
     * @param {number} sampleType 0: no supersampling, 1: 2x2 supersampling, 2: 3x3 supersampling
     */
    ImageWallMesh.prototype.setPerforationSupersample = function (sampleType) {
        this.supersamplePerforation = sampleType;
    };
    /**
     * control reduction supersample setting
     * @param {number} sampleType 0: no supersampling, 1: enable supersampling
     */
    ImageWallMesh.prototype.setReductionSupersample = function (sampleType) {
        this.supersampleReduction = sampleType;
    };
    /**
     * set perforation range inversion setting
     * @param {boolean} flag false: not inverted, 1: inverted
     */
    ImageWallMesh.prototype.setInvertPerforation = function (flag) {
        this.invertPerforation = flag;
    };
    /**
     * update camera parameters which are used in shader for supersampling. needs to be updated everytime camera moves
     * @param {THREE.PerspectiveCamera} camera camera object
     * @param {THREE.Vectror3} cameraTargetPos camera target position. usually center of scene.
     */
    ImageWallMesh.prototype.updateCamera = function (camera, cameraTargetPos) {
        this.cameraPos = camera.position;
        this.cameraTarget = cameraTargetPos;
        var fov = camera.fov / 180 * Math.PI;
        var rectHeight = camera.near * Math.tan(fov / 2) * 2;
        var rectWidth = rectHeight * camera.aspect;
        var rectCorners = new Array();
        rectCorners.push(new THREE.Vector3(-rectWidth / 2, -rectHeight / 2, camera.near));
        rectCorners.push(new THREE.Vector3(rectWidth / 2, -rectHeight / 2, camera.near));
        rectCorners.push(new THREE.Vector3(-rectWidth / 2, rectHeight / 2, camera.near));
        rectCorners.push(new THREE.Vector3(rectWidth / 2, rectHeight / 2, camera.near));
        for (var i = 0; i < rectCorners.length; i++) {
            rectCorners[i].applyQuaternion(camera.quaternion);
            rectCorners[i].add(camera.position);
        }
        this.screenCorner = rectCorners;
    };
    /**
     * set screen size whic is used in shader. needs to be updated everytime screen size changes.
     */
    ImageWallMesh.prototype.setScreenSize = function (size) {
        this.screenSize = size;
    };
    /**
     * returns all wall panel meshes (currently just one)
     */
    ImageWallMesh.prototype.getWallPanels = function () {
        return this.panels;
    };
    /**
     * returns the number of panels
     */
    ImageWallMesh.prototype.getPanelNumber = function () {
        return this.panelXNum * this.panelYNum;
    };
    /**
     * returns all fin meshes
     */
    ImageWallMesh.prototype.getReturnFins = function () {
        var array = new Array();
        for (var i = 0; i < this.verPanelReturn.length; i++) {
            array.push(this.verPanelReturn[i]);
        }
        for (var i = 0; i < this.horPanelReturn.length; i++) {
            array.push(this.horPanelReturn[i]);
        }
        return array;
    };
    ImageWallMesh.prototype.createMesh = function () {
        this.calculatePanelSizeAndGridNum();
        var rectCorner = this.rectCenter.clone().sub(this.rectWidthVec.clone().divideScalar(2)).sub(this.rectHeightVec.clone().divideScalar(2));
        if (!this.geometries) {
            this.geometries = new Array();
            //this.geometries.push(new THREE.BufferGeometry());
            this.geometries.push(this.createRectGeometry(rectCorner, this.rectWidthVec, this.rectHeightVec, new THREE.Vector2(0, 0), 1, 1));
        }
        else {
            this.createRectGeometry(rectCorner, this.rectWidthVec, this.rectHeightVec, new THREE.Vector2(0, 0), 1, 1, this.geometries[0]);
        }
        if (this.panelCorner == null) {
            this.panelCorner = new Array();
            this.panelCorner.push(this.createRectCorners(rectCorner, this.rectWidthVec, this.rectHeightVec));
        }
        else {
            this.panelCorner[0] = this.createRectCorners(rectCorner, this.rectWidthVec, this.rectHeightVec);
        }
        if (this.materials == null) {
            this.materials = new Array();
            this.materials.push(this.createShaderMaterial(this.panelCorner[0], new THREE.Vector2(0, 0), new THREE.Vector2(1.0, 1.0), false, false));
        }
        else {
            this.updateShaderMaterial(this.materials[0], this.panelCorner[0], new THREE.Vector2(0, 0), new THREE.Vector2(1.0, 1.0), false, false);
        }
        if (this.panels == null) {
            this.panels = new Array();
            this.panels.push(new THREE.Mesh(this.geometries[0], this.materials[0]));
            this.panels[0].drawMode = THREE.TriangleStripDrawMode;
        }
        this.createReturnFins();
    };
    ImageWallMesh.prototype.createShaderMaterial = function (rectCorners, minUV, maxUV, isReturnFin, isHorizontalReturnFin) {
        var uniformParam = this.getUniformParameters(rectCorners, minUV, maxUV, isReturnFin, isHorizontalReturnFin);
        return new THREE.RawShaderMaterial({
            vertexShader: this.vertexShaderCode,
            fragmentShader: this.fragmentShaderCode,
            uniforms: uniformParam,
            side: THREE.DoubleSide,
            transparent: true });
    };
    ImageWallMesh.prototype.updateShaderMaterial = function (mat, rectCorners, minUV, maxUV, isReturnFin, isHorizontalReturnFin) {
        var uniformParam = this.getUniformParameters(rectCorners, minUV, maxUV, isReturnFin, isHorizontalReturnFin);
        for (var key in uniformParam) {
            mat.uniforms[key]['value'] = uniformParam[key]['value'];
        }
    };
    ImageWallMesh.prototype.getUniformParameters = function (rectCorners, minUV, maxUV, isReturnFin, isHorizontalReturnFin) {
        var uniformParam = {
            "materialColor": { type: 'c', value: this.materialColor },
            "materialTexture": { type: 't', value: this.materialTexture },
            "useMaterialTexture": { type: 'i', value: this.useMaterialTexture },
            "materialURepeat": { type: 'f', value: this.materialURepeat },
            "materialVRepeat": { type: 'f', value: this.materialVRepeat },
            "perfBitmap": { type: 't', value: this.perfTexture },
            "perfBitmapWidth": { type: 'i', value: this.perfBitmapWidth },
            "perfBitmapHeight": { type: 'i', value: this.perfBitmapHeight },
            "cropBitmap": { type: 'i', value: this.cropPerfBitmap ? 1 : 0 },
            "xcount": { type: 'f', value: this.gridXNum },
            "ycount": { type: 'f', value: this.gridYNum },
            "perfShape": { type: 'i', value: this.perfShape },
            "minPerf": { type: 'f', value: this.minPerf },
            "maxPerf": { type: 'f', value: this.maxPerf },
            "rectSize": { type: 'v2', value: new THREE.Vector2(this.width, this.height) },
            "uborder": { type: 'f', value: this.xborder / this.width },
            "vborder": { type: 'f', value: this.yborder / this.height },
            "screenRect": { type: 'v3v', value: this.screenCorner },
            "panelRect": { type: 'v3v', value: rectCorners },
            "cameraPos": { type: 'v3', value: this.cameraPos },
            "cameraTarget": { type: 'v3', value: this.cameraTarget },
            "screenSize": { type: 'v2', value: this.screenSize },
            "reductionType": { type: 'i', value: this.reductionType },
            "reductionAngle": { type: 'f', value: this.reductionAngle },
            "reductionPercent": { type: 'f', value: this.reductionPercent },
            "gridType": { type: 'i', value: this.gridType },
            "minPerfUV": { type: 'v2', value: minUV },
            "maxPerfUV": { type: 'v2', value: maxUV },
            "controlBySize": { type: 'i', value: isReturnFin ? 0 : 1 },
            "skipShiftedColumn": { type: 'i', value: isHorizontalReturnFin ? 1 : 0 },
            "supersampleReduction": { type: 'i', value: this.supersampleReduction },
            "supersamplePerforation": { type: 'i', value: this.supersamplePerforation },
            "invertPerf": { type: 'i', value: this.invertPerforation ? 1 : 0 }
        };
        return uniformParam;
    };
    ImageWallMesh.prototype.calculatePanelSizeAndGridNum = function () {
        var panelGridXNum = Math.ceil((Math.ceil((this.width - 2 * this.xborder) / this.gridSize) + 2 * Math.ceil((this.xborder - this.gridSize * 0.5) / this.gridSize)) / this.panelXNum);
        var panelGridYNum = Math.ceil((Math.ceil((this.height - 2 * this.yborder) / this.gridSize) + 2 * Math.ceil((this.yborder - this.gridSize * 0.5) / this.gridSize)) / this.panelYNum);
        var edgePanelGridXNum = panelGridXNum - Math.ceil((this.xborder - this.gridSize * 0.5) / this.gridSize) - 0.5;
        var edgePanelGridYNum = panelGridYNum - Math.ceil((this.yborder - this.gridSize * 0.5) / this.gridSize) - 0.5;
        this.actualGridWidth = (this.width - 2 * this.xborder) / (panelGridXNum * (this.panelXNum - 2) + edgePanelGridXNum * 2);
        if (this.panelXNum == 1) {
            edgePanelGridXNum = panelGridXNum - 2 * Math.ceil(this.xborder / this.gridSize);
            this.actualGridWidth = (this.width - 2 * this.xborder) / edgePanelGridXNum;
        }
        this.actualGridHeight = (this.height - 2 * this.yborder) / (panelGridYNum * (this.panelYNum - 2) + edgePanelGridYNum * 2);
        if (this.panelYNum == 1) {
            edgePanelGridYNum = panelGridYNum - 2 * Math.ceil(this.yborder / this.gridSize);
            this.actualGridHeight = (this.height - 2 * this.yborder) / edgePanelGridYNum;
        }
        this.edgePanelWidth = this.actualGridWidth * edgePanelGridXNum + this.xborder;
        this.panelWidth = this.actualGridWidth * panelGridXNum;
        this.edgePanelHeight = this.actualGridHeight * edgePanelGridYNum + this.yborder;
        this.panelHeight = this.actualGridHeight * panelGridYNum;
        this.gridXNum = panelGridXNum * (this.panelXNum - 2) + edgePanelGridXNum * 2;
        if (this.panelXNum == 1) {
            this.gridXNum = edgePanelGridXNum;
        }
        this.gridYNum = panelGridYNum * (this.panelYNum - 2) + edgePanelGridYNum * 2;
        if (this.panelYNum == 1) {
            this.gridYNum = edgePanelGridYNum;
        }
    };
    ImageWallMesh.prototype.createReturnFins = function () {
        // remove fins before creating new ones
        this.horPanelReturn = new Array();
        this.verPanelReturn = new Array();
        this.horPanelCorner = new Array();
        this.verPanelCorner = new Array();
        this.horPanelMaterial = new Array();
        this.verPanelMaterial = new Array();
        var corner = this.rectCenter.clone();
        corner.sub(this.rectWidthVec.clone().multiplyScalar(0.5));
        corner.sub(this.rectHeightVec.clone().multiplyScalar(0.5));
        // vertical return fins
        if (this.panelXNum >= 1 && this.returnDepth > 0) {
            for (var i = 0; i <= this.panelXNum; i++) {
                var pos = corner.clone();
                var winc = this.rectWidthVec.clone();
                if (i == 0 || i == this.panelXNum) {
                    winc.multiplyScalar(i / this.panelXNum);
                }
                else {
                    winc.setLength(this.panelWidth * (i - 1) + this.edgePanelWidth);
                }
                pos.add(winc);
                var uv = new THREE.Vector2((pos.x - corner.x) / this.width, 0);
                var ulen = this.returnDepth / this.width;
                var finPt = pos.clone();
                var finH = this.rectHeightVec.clone();
                var finW = this.rectHeightVec.clone();
                finW.cross(this.rectWidthVec);
                finW.setLength(this.returnDepth);
                var fin = this.createRectGeometry(finPt, finW, finH, uv, ulen, 1.0);
                var minUV = new THREE.Vector2(0, 0);
                var maxUV = new THREE.Vector2(uv.x + this.actualGridWidth / 2 / this.width, 1);
                if (i == 0 || i == this.panelXNum) {
                    maxUV = minUV;
                }
                var rectPts = this.createRectCorners(finPt, finW, finH);
                this.verPanelCorner.push(rectPts);

                var mat = this.createShaderMaterial(rectPts, minUV, maxUV, true, false);
                this.verPanelMaterial.push(mat);
                var mesh = new THREE.Mesh(fin, mat);
                mesh.drawMode = THREE.TriangleStripDrawMode;
                this.verPanelReturn.push(mesh);
            }
        }
        // horizontal return fins
        if (this.panelYNum >= 1 && this.returnDepth > 0) {
            for (var i = 0; i <= this.panelYNum; i++) {
                var pos = corner.clone();
                var hinc = this.rectHeightVec.clone();
                if (i == 0 || i == this.panelYNum) {
                    hinc.multiplyScalar(i / this.panelYNum);
                }
                else {
                    hinc.setLength(this.panelHeight * (i - 1) + this.edgePanelHeight);
                }
                pos.add(hinc);
                var uv = new THREE.Vector2(0, (pos.y - corner.y) / this.height);
                var vlen = this.returnDepth / this.height;
                var finPt = pos.clone();
                var finW = this.rectWidthVec.clone();
                var finH = this.rectHeightVec.clone();
                finH.cross(this.rectWidthVec);
                finH.setLength(this.returnDepth);
                var fin = this.createRectGeometry(finPt, finW, finH, uv, 1.0, vlen);
                var minUV = new THREE.Vector2(0, 0);
                var maxUV = new THREE.Vector2(1, uv.y + this.actualGridHeight / 2 / this.height);
                if (i == 0 || i == this.panelYNum) {
                    maxUV = minUV;
                }
                var rectPts = this.createRectCorners(finPt, finW, finH);
                this.horPanelCorner.push(rectPts);
                var mat = this.createShaderMaterial(rectPts, minUV, maxUV, true, true);
                this.horPanelMaterial.push(mat);
                var mesh = new THREE.Mesh(fin, mat);
                mesh.drawMode = THREE.TriangleStripDrawMode;
                this.horPanelReturn.push(mesh);
            }
        }
    };
    ImageWallMesh.prototype.createRectCorners = function (rectCorner, rectW, rectH) {
        var corners = new Array();
        corners.push(new THREE.Vector3(rectCorner.x, rectCorner.y, rectCorner.z));
        corners.push(new THREE.Vector3(rectCorner.x + rectW.x, rectCorner.y + rectW.y, rectCorner.z + rectW.z));
        corners.push(new THREE.Vector3(rectCorner.x + rectH.x, rectCorner.y + rectH.y, rectCorner.z + rectH.z));
        corners.push(new THREE.Vector3(rectCorner.x + rectW.x + rectH.x, rectCorner.y + rectW.y + rectH.y, rectCorner.z + rectW.z + rectH.z));
        return corners;
    };
    ImageWallMesh.prototype.createRectGeometry = function (rectCorner, rectW, rectH, uvCorner, uvW, uvH, geom) {
        if (geom === void 0) { geom = null; }
        var rect = geom;
        if (rect == null) {
            rect = new THREE.BufferGeometry();
        }
        var posarr = new Float32Array(3 * 2 * 2);
        posarr[0] = rectCorner.x;
        posarr[1] = rectCorner.y;
        posarr[2] = rectCorner.z;
        posarr[3] = rectCorner.x + rectW.x;
        posarr[4] = rectCorner.y + rectW.y;
        posarr[5] = rectCorner.z + rectW.z;
        posarr[6] = rectCorner.x + rectH.x;
        posarr[7] = rectCorner.y + rectH.y;
        posarr[8] = rectCorner.z + rectH.z;
        posarr[9] = rectCorner.x + rectW.x + rectH.x;
        posarr[10] = rectCorner.y + rectW.y + rectH.y;
        posarr[11] = rectCorner.z + rectW.z + rectH.z;
        var texarr = new Float32Array(2 * 2 * 2);
        texarr[0] = uvCorner.x;
        texarr[1] = uvCorner.y;
        texarr[2] = uvCorner.x + uvW;
        texarr[3] = uvCorner.y;
        texarr[4] = uvCorner.x;
        texarr[5] = uvCorner.y + uvH;
        texarr[6] = uvCorner.x + uvW;
        texarr[7] = uvCorner.y + uvH;
        rect.addAttribute('position', new THREE.BufferAttribute(posarr, 3));
        rect.addAttribute('uv', new THREE.BufferAttribute(texarr, 2));
        return rect;
    };
    ImageWallMesh.prototype.updateGeometryOrder = function (isCameraInFront) {
        if (this.panels != null) {
            if (isCameraInFront) {
                for (var i = 0; i < this.panels.length; i++) {
                    this.panels[i].renderOrder = 2;
                }
                if (this.horPanelReturn != null) {
                    for (var i = 0; i < this.horPanelReturn.length; i++) {
                        this.horPanelReturn[i].renderOrder = 1;
                    }
                }
                if (this.verPanelReturn != null) {
                    for (var i = 0; i < this.verPanelReturn.length; i++) {
                        this.verPanelReturn[i].renderOrder = 1;
                    }
                }
            }
            else {
                for (var i = 0; i < this.panels.length; i++) {
                    this.panels[i].renderOrder = 1;
                }
                if (this.horPanelReturn != null) {
                    for (var i = 0; i < this.horPanelReturn.length; i++) {
                        this.horPanelReturn[i].renderOrder = 2;
                    }
                }
                if (this.verPanelReturn != null) {
                    for (var i = 0; i < this.verPanelReturn.length; i++) {
                        this.verPanelReturn[i].renderOrder = 2;
                    }
                }
            }
        }
    };
    ImageWallMesh.prototype.updateCameraParameters = function () {
        for (var i = 0; i < this.materials.length; i++) {
            this.updateCameraParameter(this.materials[i], this.panelCorner[i]);
        }
        if (this.horPanelMaterial != null) {
            for (var i = 0; i < this.horPanelMaterial.length; i++) {
                this.updateCameraParameter(this.horPanelMaterial[i], this.horPanelCorner[i]);
            }
        }
        if (this.verPanelMaterial != null) {
            for (var i = 0; i < this.verPanelMaterial.length; i++) {
                this.updateCameraParameter(this.verPanelMaterial[i], this.verPanelCorner[i]);
            }
        }
    };
    ImageWallMesh.prototype.updateCameraParameter = function (mat, rectCorner) {
        mat.uniforms['screenRect']['value'] = this.screenCorner;
        mat.uniforms['panelRect']['value'] = rectCorner;
        mat.uniforms['cameraPos']['value'] = this.cameraPos;
        mat.uniforms['screenSize']['value'] = this.screenSize;
    };
    ImageWallMesh.prototype.updateShaderUniform = function (paramName, param) {
        if (this.materials != null) {
            for (var i = 0; i < this.materials.length; i++) {
                if (this.materials[i].uniforms != null) {
                    this.materials[i].uniforms[paramName]['value'] = param;
                }
            }
        }
        if (this.horPanelMaterial != null) {
            for (var i = 0; i < this.horPanelMaterial.length; i++) {
                if (this.horPanelMaterial[i] != null && this.horPanelMaterial[i].uniforms != null) {
                    this.horPanelMaterial[i].uniforms[paramName]['value'] = param;
                }
            }
        }
        if (this.verPanelMaterial != null) {
            for (var i = 0; i < this.verPanelMaterial.length; i++) {
                if (this.verPanelMaterial[i] != null && this.verPanelMaterial[i].uniforms != null) {
                    this.verPanelMaterial[i].uniforms[paramName]['value'] = param;
                }
            }
        }
    };
    ImageWallMesh.prototype.update = function () { }; // to override
    return ImageWallMesh;
}());
