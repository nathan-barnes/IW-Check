function sendForm() {
  var data = { "campaign": "ImageWall Contact Form" },
      inputs = document.getElementsByClassName("js-contact-input"),
      submit = document.getElementsByClassName('js-contact-submit')[0];
  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].value == "") {
      inputs[i].parentNode.classList.add('is-error');
      return false;
    } else if (inputs[i].name == "email") {
      if (validateEmail(inputs[i].value) === false) {
        inputs[i].parentNode.classList.add('is-error');
        return false
      }
    };
    data[inputs[i].name] = inputs[i].value;
  }
  
  ajax({
    method: 'POST',
    path: IW['support_post_url'],
    data: data,
    success: (response) => {
      console.log(response);
      submit.innerHTML = "Sent! Thanks for your message, we'll get back to you shortly.";
      submit.classList.add('is-success');
    }
  });
}

function validateEmail(email) {
  var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
}

function initForm() {
  var submit = document.getElementsByClassName('js-contact-submit')[0];
  submit.addEventListener('click', sendForm, false);
}

function initMap() {
  var mapCanvas = document.getElementById('js-map'),
      mapCenter = { lat: 39.103476, lng: -94.564473 },
      mapStyles = [
        {
          "featureType": "administrative",
          "elementType": "labels.text.fill",
          "stylers": [
            { "color": "#9DA8A8" }
          ]
        },{
          "featureType": "landscape",
          "elementType": "labels.text.fill",
          "stylers": [
            { "color": "#9DA8A8" }
          ]
        },{
          "featureType": "landscape.man_made",
          "elementType": "geometry.fill",
          "stylers": [
            { "color": "#FFFFFF" }
          ]
        },{
          "featureType": "landscape.man_made",
          "elementType": "geometry.stroke",
          "stylers": [
            { "weight": 0.3 },
            { "color": "#9DA8A8" }
          ]
        },{
          "featureType": "road",
          "elementType": "labels.icon",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },{
          "featureType": "road",
          "elementType": "labels.text.fill",
          "stylers": [
            { "color": "#9DA8A8" }
          ]
        },{
          "featureType": "road.highway",
          "elementType": "geometry.fill",
          "stylers": [
            { "color": "#E1EAEA" }
          ]
        },{
          "featureType": "road.highway",
          "elementType": "geometry.stroke",
          "stylers": [
            { "visibility": "off" }
          ]
        },{
          "featureType": "road.arterial",
          "elementType": "geometry.fill",
          "stylers": [
            { "color": "#E1EAEA" }
          ]
        },{
          "featureType": "road.arterial",
          "elementType": "geometry.stroke",
          "stylers": [
            { "visibility": "off" }
          ]
        },{
          "featureType": "road.local",
          "elementType": "geometry.fill",
          "stylers": [
            { "color": "#E1EAEA" }
          ]
        },{
          "featureType": "transit",
          "elementType": "labels",
          "stylers": [
            { "visibility": "off" }
          ]
        },{
          "featureType": "poi",
          "elementType": "labels",
          "stylers": [
            { "visibility": "off" }
          ]
        },{
          "featureType": "water",
          "elementType": "labels.text",
          "stylers": [
            { "color": "#9DA8A8" }
          ]
        },{
          "featureType": "water",
          "elementType": "geometry.fill",
          "stylers": [
            { "color": "#F7F9F9" }
          ]
        },{
          "featureType": "water",
          "elementType": "geometry.stroke",
          "stylers": [
            { "visibility": "off" }
          ]
        },{
          "featureType": "poi",
          "elementType": "geometry.fill",
          "stylers": [
            { "color": "#F7F9F9" }
          ]
        }
      ],
      mapOptions = {
        zoom: 14,
        styles: mapStyles,
        center: mapCenter,
        scrollwheel: false,
        mapTypeId: 'roadmap'
      }
  if (typeof google !== "undefined") {
    var map = new google.maps.Map(mapCanvas, mapOptions),
        marker = new google.maps.Marker({
          map: map,
          icon: 'https://s3.amazonaws.com/imagewall-media/icons/icon-marker--yellow.svg',
          position: mapCenter
        });
  }
}