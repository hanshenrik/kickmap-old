
// Variables
var map;
var activeEventId;
var timeAtEachConcert = 4000; // milliseconds
var colors = ['#7DFFC2', '#17F08A', '#00C86A'];
var distanceToTopForActiveConcertInfo = 200;


function initMap() {
  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

  map = new mapboxgl.Map({
    container: 'map',
    style: MAPBOX_STYLE_URL,
    center: [7.451416, 58.025576],
    zoom: 15
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
    'minzoom': 15,
    'paint': {
      'fill-extrusion-color': '#f67586',
      'fill-extrusion-height': {
        'type': 'identity',
        'property': 'height'
      },
      'fill-extrusion-base': {
        'type': 'identity',
        'property': 'base-height'
      },
      'fill-extrusion-opacity': .7
    }
  });
}


function addEventsToMap() {
  console.log('Adding events to the map');

  map.addSource('events', {
    type: 'geojson',
    data: eventsCollection
  });

  map.addLayer({
    'id': 'events',
    'source': 'events',
    'type': 'symbol',
    'layout': {
      'icon-image': 'marker-15',
      'icon-size': 2,
      'icon-allow-overlap': true,
      'text-field': '{artist} @ {place}',
      'text-offset': [0, 1.3],
      'text-anchor': 'top'
    }
  });
}


function addScrollListener() {
  window.onscroll = function() {
    $.each(eventsCollection.features, function() {
      var eventId = 'event-' + this.id;
      if (isElementOnScreen(eventId)) {
        setActiveEvent(this);
        return false;
      }
    })
  };
}


function setActiveEvent(eventFeature) {
  var eventId = 'event-' + eventFeature.id;
  if (eventId === activeEventId) return;

  // Highlight the active concert in the concert list
  $('#' + eventId).addClass('active');
  $('#' + activeEventId).removeClass('active');

  // Animate the map position based on camera properties
  map.flyTo({
    center: eventFeature.geometry.coordinates,
    speed: 0.5,                        // Speed of the flight
    curve: 1.3,                        // How far 'out' we should zoom on the flight from A to B
    zoom: getRandomInt(15, 17),        // Set a random zoom level for effect
    pitch: getRandomInt(0, 61),        // Pitch for coolness
    bearing: getRandomInt(-10, 10)     // Tilt north direction slightly for even more coolness!
  });

  activeEventId = eventId;
}


// Loop through all concerts indefinitely
function playback(index) {
  // Get the current concert
  var eventFeature = eventsCollection.features[index];

  // Scroll to the correct concert section
  $('html, body').animate({ scrollTop: $('#event-' + eventFeature.id).position().top + 2 }, 800)

  // Once the flight has ended, initiate a timeout that triggers a recursive call
  map.once('moveend', function() {
    window.setTimeout( function() {
      // Get index of the next concert.
      // Modulus length makes it 0 if we're at the last index, i.e. we'll start from the beginning again.
      var nextIndex = (index + 1) % eventsCollection.features.length;

      // Recursive call, fly to next concert
      playback(nextIndex);
    }, timeAtEachConcert); // After callback, stay at the location for x milliseconds
  });
}
