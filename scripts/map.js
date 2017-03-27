
// Variables
var map;
var timeAtEachConcert = 5000; // milliseconds
var colors = {
  blue: '#3255a4',
  red: '#f15060'
};
var eventMarkers = [];
var locationMarker, locationMarkerAccuracy;
var bounds = [
  [7.418380, 58.011527], // Southwest coordinates
  [7.474327, 58.039323]  // Northeast coordinates
];
var exampleImages = ['elliot', 'helen', 'jenny', 'steve', 'stevie', 'veronika', 'matt']

function initMap() {
  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

  map = new mapboxgl.Map({
    container: 'map',
    style: MAPBOX_STYLE_URL,
    center: [7.454231, 58.025881],
    zoom: 15,
    attributionControl: false,
  });

  map.addControl(new mapboxgl.AttributionControl({ compact: true }));
  map.addControl(new mapboxgl.NavigationControl());
  var geolocate = new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true } })
  map.addControl(geolocate);
  map.addControl(new mapboxgl.FullscreenControl());

  geolocate.on('geolocate', function(e) {
    // Only create the marker if it does not exist, otherwise just update the position
    if (locationMarker) {
      locationMarker.setLngLat([e.coords.longitude, e.coords.latitude])
      locationMarkerAccuracy.setLngLat([e.coords.longitude, e.coords.latitude])
    }
    else {
      accuracyMarker = document.createElement('div');
      accuracyMarker.className = 'location-marker-accuracy';
      locationMarkerAccuracy = new mapboxgl.Marker(accuracyMarker, { offset: [-70 / 2, -70 / 2] })
        .setLngLat([e.coords.longitude, e.coords.latitude])
        .addTo(map);

      locationMarker = document.createElement('div');
      locationMarker.className = 'location-marker';
      locationMarker = new mapboxgl.Marker(locationMarker, { offset: [-15 / 2, -15 / 2] })
        .setLngLat([e.coords.longitude, e.coords.latitude])
        .addTo(map);
    }
  });
}

function addPlacesToMap() {
  console.log('Adding places to the map');

  map.addSource('places', {
    type: 'geojson',
    data: placesCollection
  });
  
  map.addLayer({
    'id': 'places',
    'source': 'places',
    'type': 'fill-extrusion',
    'minzoom': 1,
    'paint': {
      'fill-extrusion-color': colors.red,
      'fill-extrusion-height': {
        'type': 'identity',
        'property': 'height'
      },
      'fill-extrusion-base': {
        'type': 'identity',
        'property': 'base-height'
      },
      'fill-extrusion-opacity': 0.7
    }
  });
}


function addEventsToMap() {
  console.log('Adding events to the map');

  eventsCollection.features.forEach(function(eventFeature, i) {
    // create a DOM element for the marker
    var markerDiv = document.createElement('a');
    markerDiv.className = 'event-marker';

    eventFeature.properties.title = eventFeature.properties.artist + ' @ ' + eventFeature.properties.place;
    eventFeature.properties.imageURL = 'https://semantic-ui.com/images/avatar/large/' + exampleImages[i % exampleImages.length] + '.jpg';
    eventFeature.properties.mandaljazzURL = 'http://mandaljazz.no/';

    markerDiv.style.backgroundImage = 'url(' + eventFeature.properties.imageURL + ')';
    markerDiv.href = eventFeature.properties.mandaljazzURL;
    markerDiv.target = '_blank';
    markerDiv.innerHTML = "<div class='event-info'><h1>" + eventFeature.properties.start + "</h1><h2>" + eventFeature.properties.title + "</h2></div>";

    // add marker to map
    marker = new mapboxgl.Marker(markerDiv, { offset: [-30, -30] })
      .setLngLat(eventFeature.geometry.coordinates)
      .addTo(map);
    
    eventMarkers.push(marker);
  });
}

// Loop through all concerts indefinitely
function playback(index) {
  // Get the current event marker
  var eventMarker = eventMarkers[index];

  // Animate the map position based on camera properties
  map.flyTo({
    center: eventMarker._lngLat,
    speed: 0.5,                        // Speed of the flight
    curve: 1.3,                        // How far 'out' we should zoom on the flight from A to B
    zoom: getRandomInt(15, 17),        // Set a random zoom level for effect
    pitch: getRandomInt(0, 61),        // Pitch for coolness
    bearing: getRandomInt(-10, 10)     // Tilt north direction slightly for even more coolness!
  });

  // Once the flight has ended, initiate a timeout that triggers a recursive call
  map.once('moveend', function() {
    // Toggle on info about this event
    // eventMarker.togglePopup();

    // Indicate that this is the active marker;
    eventMarker._element.classList.add('active');

    setTimeout( function() {
      // Toggle off info about this event
      // eventMarker.togglePopup();

      // Indicate that this is the active marker;
      eventMarker._element.classList.remove('active');

      // Get index of the next event.
      // Modulus length makes it 0 if we're at the last index, i.e. we'll start from the beginning again.
      var nextIndex = (index + 1) % eventMarkers.length;

      // Recursive call, fly to next event
      playback(nextIndex);
    }, timeAtEachConcert); // After callback, stay at the location for x milliseconds
  });
}
