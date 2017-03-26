
// Variables
var map;
var timeAtEachConcert = 4000; // milliseconds
var colors = {
  blue: '#3255a4',
  red: '#f15060'
};
var eventMarkers = [];


function initMap() {
  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

  map = new mapboxgl.Map({
    container: 'map',
    style: MAPBOX_STYLE_URL,
    center: [7.451416, 58.025576],
    zoom: 15,
    attributionControl: false,
  });

  map.addControl(new mapboxgl.AttributionControl({ compact: true }));
  map.addControl(new mapboxgl.NavigationControl());
  map.addControl(new mapboxgl.FullscreenControl());
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

  eventsCollection.features.forEach(function(eventFeature) {
    // create a DOM element for the marker
    var markerDiv = document.createElement('div');
    markerDiv.className = 'event-marker';

    eventFeature.properties.title = eventFeature.properties.artist + ' @ ' + eventFeature.properties.place;
    eventFeature.properties.imageURL = '/images/jazzlaug.png';
    eventFeature.properties.mandaljazzURL = 'http://mandaljazz.no/';

    var popupContent = " \
      <div class='event-info'> \
        <div> \
          <h3 id='title'>" + eventFeature.properties.title + "</h3> \
          <table> \
            <tr> \
              <td> \
                <i class='fa fa-map-marker'></i> \
              </td> \
              <td id='venue'>" + eventFeature.properties.place + "</td> \
            </tr> \
            <tr> \
              <td><i class='fa fa-calendar'></i></td> \
              <td id='date'>" + eventFeature.properties.start + "</td> \
            </tr> \
          </table> \
        </div> \
        <div> \
          <a href='" + eventFeature.properties.mandaljazzURL + "' target='_blank'> \
            <img class='artist-img' src='" + eventFeature.properties.imageURL + "' \> \
          </a> \
        </div> \
      </div> \
        <div>Info info infoinfoinfo om artist. Info info infoinfoinfo om artist. Info info infoinfoinfo om artist. Info info infoinfoinfo om artist</div> \
    ";


    var popup = new mapboxgl.Popup({ offset: 0 })
      .setHTML(popupContent);

    // add marker to map
    marker = new mapboxgl.Marker(markerDiv, {offset: [-30, -30]})
      .setLngLat(eventFeature.geometry.coordinates)
      .setPopup(popup)
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
    eventMarker.togglePopup();

    setTimeout( function() {
      // Toggle off info about this event
      eventMarker.togglePopup();

      // Get index of the next event.
      // Modulus length makes it 0 if we're at the last index, i.e. we'll start from the beginning again.
      var nextIndex = (index + 1) % eventMarkers.length;

      // Recursive call, fly to next event
      playback(nextIndex);
    }, timeAtEachConcert); // After callback, stay at the location for x milliseconds
  });
}
