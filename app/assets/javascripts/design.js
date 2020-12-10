// Design JS Manifest

//= require three/three.min
//= require three/OBJLoader2
//= require three/threex.dilategeometry

//= require vertexShader
//= require fragmentShader
//= require imageWallMesh

//= require animate.min
//= require tessarray.min
//= require nouislider
//= require one-color
//= require colorjoe.min

//= require design/util
//= require design/settings
//= require design/design-app
//= require design/design-imagery
//= require design/design-option
//= require design/design-option-system
//= require design/design-view
//= require design/design-material
//= require design/design-test
//= require design/design.model
//= require design/design-scene

//= require admin/aws

var designApp = new DesignApp();

// Copy and paste JS for share modal
var clipboard = new Clipboard('.js-share-clipboard');
clipboard.on("success", function(event) {
  console.log(event);
  event.trigger.classList.add("is-active");
  setTimeout(function() {
  	event.trigger.classList.remove("is-active");
  }, 1000);
});

UNSAVED = false;
window.onbeforeunload = function(){
  if (UNSAVED) {
    return 'Are you sure you want to leave?';
  }
};