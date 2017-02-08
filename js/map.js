
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


function setupMap() {
  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9', // mapbox://styles/hanshenrik/civwyr9w800442klkf66ughei
    center: [10.7522, 59.9139],
    zoom: 7
  });
}


function addSources() {
  console.log('Adding concerts as a data source to the map');

  // Add concerts as a source from our GeoJSON object
  map.addSource('concerts', {
    type: 'geojson',
    data: concertsCollection,
    cluster: true,
    clusterMaxZoom: 20, // Max zoom to cluster points on
    clusterRadius: 30 // Radius of each cluster when clustering points (defaults to 50)
  });
}


function addLayers() {
  console.log('Adding the sources as layers to the map');

  // Use the concerts source to create a few layers:
  // - one layer for unclustered points,
  // - one layer for each cluster category so we can differentiate on how many are in the cluster,
  // - one layer for cluster labels
  map.addLayer({
    'id': 'unclustered-points',
    'type': 'symbol',
    'source': 'concerts',
    'filter': ['!has', 'point_count'],
    'layout': {
        'icon-image': 'circle-15',
        'icon-size': 1.5,
        'text-field': '{title}',
        'text-offset': [0, 0.6],
        'text-anchor': 'top'
    },
    'paint': {
      'text-color': 'white'
    }
  });

  // Display the concert data in three layers, each filtered to a range of
  // count values. Each range gets a different fill color.
  var layers = [
      [10, colors[2]],
      [5, colors[1]],
      [0, colors[0]]
  ];

  layers.forEach(function (layer, i) {
    map.addLayer({
      'id': 'cluster-' + i,
      'type': 'circle',
      'source': 'concerts',
      'paint': {
          'circle-color': layer[1],
          'circle-radius': 18
      },
      'filter': i === 0 ?
          ['>=', 'point_count', layer[0]] :
          ['all',
              ['>=', 'point_count', layer[0]],
              ['<', 'point_count', layers[i - 1][0]]]
    });
  });

  // Add a layer for the clusters' count labels
  map.addLayer({
    'id': 'cluster-count',
    'type': 'symbol',
    'source': 'concerts',
    'layout': {
        'text-field': '{point_count}',
        'text-size': 12
    }
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
