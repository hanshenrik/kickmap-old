
// Variables
var center = [10.73, 59.92];
var zoomLevel = 13;
var timeAtEachConcert = 5000; // milliseconds
var activeConcertId;
var colors = ['#51FFAE', '#17F08A', '#2DFC9B', '#00C86A']
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
  }


// Configure Mapbox
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v9',
  center: center,
  zoom: zoomLevel
});


function addLayers() {
  // Also, add a data source for all venues
  map.addSource("venues", {
    type: "geojson",
    data: venuesGeoJson
  });

  // Add a layer showing the venues.
  map.addLayer({
    "id": "venues",
    "type": "symbol",
    "source": "venues",
    "layout": {
      "icon-image": "marker-15",
      "icon-allow-overlap": true
    }
  });

  // Add a new source from our GeoJSON data and set the
  // 'cluster' option to true.
  map.addSource("concerts", {
    type: "geojson",
    data: concertsGeoJson,
    cluster: true,
    clusterMaxZoom: 20, // Max zoom to cluster points on
    clusterRadius: 20 // Radius of each cluster when clustering points (defaults to 50)
  });

  // Use the concerts source to create five layers:
  // - one for unclustered points,
  // - three for each cluster category,
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
      [50, colors[3]],
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


// When a click event occurs near a polygon, open a popup at the location of
// the feature, with description HTML from its properties.
map.on('click', function (e) {
  var features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-points', 'venues'] });
  if (!features.length) {
    return;
  }

  var feature = features[0];

  var popup = new mapboxgl.Popup()
    .setLngLat(map.unproject(e.point))
    .setHTML(feature.properties.title)
    .addTo(map);
});


// Loops through all concerts indefinitely
function playback(index) {
  // Index of next concert. Modulus length makes it 0 if we're at the last index
  // var nextIndex = (index + 1) % markers.length;
  var nextIndex = (index + 1) % concertsGeoJson.features.length;

  // Get the current concert
  // var marker = markers[index];
  var concertFeature = concertsGeoJson.features[index];

  // Show the info for this concert
  // marker.togglePopup();

  // Scroll to the correct info section
  $("html, body").animate({ scrollTop: $('#concert-' + concertFeature.properties.id).position().top + 2 }, 800)

  // Once the flight has ended, initiate a timeout that triggers a recursive call
  map.once('moveend', function() {
    window.setTimeout( function() {
      // Hide the popup of this marker
      // marker.togglePopup();

      // Recursive call, fly to next concert
      playback(nextIndex);
    }, timeAtEachConcert); // After callback, stay at the location for x milliseconds
  });
}


window.onscroll = function() {
  var concertIds = Object.keys(concertsGeoJson.features);
  $.each(concertsGeoJson.features, function() {
    var concertId = 'concert-' + this.properties.id;
    if (isElementOnScreen(concertId)) {
      setActiveChapter(this);
      return false;
    }
  })
};

function setActiveChapter(concertFeature) {
  var concertId = 'concert-' + concertFeature.properties.id;
  if (concertId === activeConcertId) return;

  // Highlight the position on the map to feed the user with a spoon where the concert is
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
        "circle-opacity": 0.4
      }
    });
  }

  // Animate the map position based on camera properties
  map.flyTo({
    center: concertFeature.geometry.coordinates,
    speed: 0.2,                        // Speed of the flight
    curve: 1.3,                        // How far out it should zoom on the flight from A to B
    zoom: getRandomNumber(14, 17),     // Set a random zoom level for effect
    pitch: getRandomNumber(0, 61),     // Pitch for coolness
    bearing: getRandomNumber(-10, 10)  // Tilt north direction slightly for even more coolness
  });

  // map.flyTo(chapters[concertId]);

  $('#' + concertId).addClass('active');
  $('#' + activeConcertId).removeClass('active');

  activeConcertId = concertId;
}

function isElementOnScreen(id) {
  var element = document.getElementById(id);
  var bounds = element.getBoundingClientRect();
  return bounds.top < window.innerHeight && bounds.bottom > 0;
}


// Returns a random number between min (inclusive) and max (exclusive)
function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

