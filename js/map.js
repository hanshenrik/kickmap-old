
// Variables
var map;
var activeConcertId;
var timeAtEachConcert = 4000; // milliseconds
var colors = ['#7DFFC2', '#17F08A', '#00C86A'];
var distanceToTopForActiveConcertInfo = 200;
var highlightVenueGeoJson =
  {
    "type": "geojson",
    "data": {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "geometry": {
          "type": "Point"
        }
      }]
    }
  };


function setupMap() {
  mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9', // mapbox://styles/hanshenrik/civwyr9w800442klkf66ughei
    center: [10.73, 59.92],
    zoom: 13
  });
}


function addSources() {
  console.log('Adding concerts as a data source to the map');

  // Add concerts as a source from our GeoJSON object
  map.addSource("concerts", {
    type: "geojson",
    data: concertsCollection,
    cluster: true,
    clusterMaxZoom: 20, // Max zoom to cluster points on
    clusterRadius: 30 // Radius of each cluster when clustering points (defaults to 50)
  });
}


function addLayers() {
  console.log('Adding the sources as layers to the map');

  // Use the concerts source to create a few layers:
  // - one for unclustered points,
  // - one for each cluster category so we can differentiate on how many are in the cluster,
  // - one for cluster labels
  map.addLayer({
    "id": "unclustered-points",
    "type": "symbol",
    "source": "concerts",
    "filter": ["!has", "point_count"],
    "layout": {
        "icon-image": "circle-15",
        "icon-size": 1.5,
        "text-field": "{title}",
        "text-offset": [0, 0.6],
        "text-anchor": "top"
    },
    "paint": {
      "text-color": "white"
    }
  });

  // Display the concert data in three layers, each filtered to a range of
  // count values. Each range gets a different fill color.
  var layers = [
      [50, colors[2]],
      [20, colors[1]],
      [0, colors[0]]
  ];

  layers.forEach(function (layer, i) {
    map.addLayer({
      "id": "cluster-" + i,
      "type": "circle",
      "source": "concerts",
      "paint": {
          "circle-color": layer[1],
          "circle-radius": 18
      },
      "filter": i === 0 ?
          [">=", "point_count", layer[0]] :
          ["all",
              [">=", "point_count", layer[0]],
              ["<", "point_count", layers[i - 1][0]]]
    });
  });

  // Add a layer for the clusters' count labels
  map.addLayer({
    "id": "cluster-count",
    "type": "symbol",
    "source": "concerts",
    "layout": {
        "text-field": "{point_count}",
        "text-size": 12
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

  // Highlight the concert position on the map
  highlightVenueGeoJson.data.features[0].geometry.coordinates = concertFeature.geometry.coordinates;

  if (map.getSource('highlight-venue') !== undefined) {
    map.getSource('highlight-venue').setData(highlightVenueGeoJson.data)
  }
  else {
    map.addSource("highlight-venue", highlightVenueGeoJson);

    map.addLayer({
      "id": "highlight-venue-circle",
      "type": "circle",
      "source": "highlight-venue",
      "paint": {
        "circle-radius": 30,
        "circle-color": "lightyellow",
        "circle-opacity": 0.3
      }
    });
  }

  // Animate the map position based on camera properties
  map.flyTo({
    center: concertFeature.geometry.coordinates,
    speed: 0.5,                        // Speed of the flight
    curve: 1.3,                        // How far out it should zoom on the flight from A to B
    zoom: getRandomNumber(14, 17),     // Set a random zoom level for effect
    pitch: getRandomNumber(0, 61),     // Pitch for coolness
    bearing: getRandomNumber(-10, 10)  // Tilt north direction slightly for even more coolness
  });

  $('#' + concertId).addClass('active');
  $('#' + activeConcertId).removeClass('active');

  activeConcertId = concertId;
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


function isElementOnScreen(id) {
  var element = document.getElementById(id);
  var bounds = element.getBoundingClientRect();
  return bounds.top < window.innerHeight && bounds.bottom > distanceToTopForActiveConcertInfo;
}


// Returns a random number between min (inclusive) and max (exclusive)
function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}
