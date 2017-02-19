
// Variables
var map;
var currentConcertMarker;
var activeConcertId;
var timeAtEachConcert = 4000; // milliseconds
var colors = ['#7DFFC2', '#17F08A', '#00C86A'];
var distanceToTopForActiveConcertInfo = 200;
var highlightVenueGeoJson =
  {
    'type': 'geojson',
    'data': {
      'type': 'FeatureCollection',
      'features': [{
        'type': 'Feature',
        'geometry': {
          'type': 'Point'
        }
      }]
    }
  };


function initMap() {
  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

  map = new mapboxgl.Map({
    container: 'map',
    style: MAPBOX_STYLE_URL,
    center: [7.458592, 58.028429],
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
    'type': 'fill',
    'source': 'places',
    'paint': {
      'fill-color': '#93f1a4'
    }
  });
}


function addEventsToMap() {
  console.log('Adding events to the map');

  map.addSource('events', {
    type: 'geojson',
    data: eventsCollection
  });

  eventsCollection.features.forEach( function(eventFeature) {
    console.log(eventFeature)

    var $div = $('<a>',
      { 'id': 'current-concert-marker',
        'class': 'event-marker',
      });

    // TODO: include this in Mapbox dataset
    eventFeature.artist = 'kenny'

    // Set the background based on the artist
    $div.css('background-image', 'url(../images/' + eventFeature.artist + '.jpg)')

    // Add the marker to map
    eventMarker = new mapboxgl.Marker($div.get(0), {offset: [10*getRandomInt(-5,5), 10*getRandomInt(-5,5)]})
      .setLngLat(eventFeature.geometry.coordinates)
      .addTo(map);
  });
}


function addScrollListener() {
  window.onscroll = function() {
    var concertIds = Object.keys(concertsCollection.features);
    $.each(concertsCollection.features, function() {
      var concertId = 'concert-' + this.properties.id;
      if (isElementOnScreen(concertId)) {
        setActiveConcert(this);
        return false;
      }
    })
  };
}


function setActiveConcert(concertFeature) {
  var concertId = 'concert-' + concertFeature.properties.id;
  if (concertId === activeConcertId) return;

  // Highlight the active concert in the concert list
  $('#' + concertId).addClass('active');
  $('#' + activeConcertId).removeClass('active');

  // map.setCenter(concertFeature.geometry.coordinates);

  // Animate the map position based on camera properties
  map.flyTo({
    center: concertFeature.geometry.coordinates,
    speed: 0.5,                        // Speed of the flight
    curve: 1.3,                        // How far 'out' we should zoom on the flight from A to B
    zoom: getRandomInt(14, 17),        // Set a random zoom level for effect
    pitch: getRandomInt(0, 61),        // Pitch for coolness
    bearing: getRandomInt(-10, 10)     // Tilt north direction slightly for even more coolness!
  });

  currentConcertMarker = addCurrentConcertMarker(concertFeature);

  map.once('moveend', function() {
    console.log('Finished flying to concert location. Now move and fading in marker...')
    currentConcertMarker.setLngLat(concertFeature.geometry.coordinates);
    currentConcertMarker.getElement().style.opacity = 1;
  });

  activeConcertId = concertId;
}


function addCurrentConcertMarker(concertFeature) {
  // Create the marker if not already present
  if (currentConcertMarker === undefined) {
    // Create DOM element for the marker
    var $div = $('<a>',
      { 'id': 'current-concert-marker',
        'target': '_blank'
      });

    currentConcertMarker = new mapboxgl.Marker($div.get(0), { offset: [-25, -50] })
      .setLngLat(concertFeature.geometry.coordinates)
      .addTo(map);
  }

  // Fade out and update link
  currentConcertMarker.getElement().style.opacity = 0;
  currentConcertMarker.getElement().setAttribute('href', 'https://www.youtube.com/results?search_query=' + concertFeature.properties.artist);

  return currentConcertMarker;
}


// Loop through all concerts indefinitely
function playback(index) {
  // Get the current concert
  var concertFeature = concertsCollection.features[index];

  // Scroll to the correct concert section
  $('html, body').animate({ scrollTop: $('#concert-' + concertFeature.properties.id).position().top + 2 }, 800)

  // Once the flight has ended, initiate a timeout that triggers a recursive call
  map.once('moveend', function() {
    window.setTimeout( function() {
      // Get index of the next concert.
      // Modulus length makes it 0 if we're at the last index, i.e. we'll start from the beginning again.
      var nextIndex = (index + 1) % concertsCollection.features.length;

      // Recursive call, fly to next concert
      playback(nextIndex);
    }, timeAtEachConcert); // After callback, stay at the location for x milliseconds
  });
}
