
// Variables
var center = [10.73, 59.92];
var zoomLevel = 16;
var timeAtEachConcert = 5000; // milliseconds
var colors = ['#51FFAE', '#17F08A', '#2DFC9B', '#00C86A']


// Configure Mapbox
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v9',
  center: center,
  zoom: zoomLevel
});

map.on('load', function() {
  // Add a new source from our GeoJSON data and set the
  // 'cluster' option to true.
  map.addSource("earthquakes", {
    type: "geojson",
    // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
    // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
    data: eventsGeoJson,
    cluster: true,
    clusterMaxZoom: 20, // Max zoom to cluster points on
    clusterRadius: 20 // Radius of each cluster when clustering points (defaults to 50)
  });

  // Use the earthquakes source to create five layers:
  // One for unclustered points, three for each cluster category,
  // and one for cluster labels.
  map.addLayer({
    "id": "unclustered-points",
    "type": "symbol",
    "source": "earthquakes",
    "filter": ["!has", "point_count"],
    "layout": {
        "icon-image": "circle-15",
        "icon-size": 1.5,
        "text-field": "{title}",
        "text-offset": [0, 0.6],
        "text-anchor": "top",
    },
    "paint": {
      // "icon-color": colors[0],
      // "icon-halo-color": "rgba(45, 252, 155, 1)",
      "text-color": "white",
      // "circle-color": colors[0],
      // "circle-radius": 8,
    }
  });

  // Display the earthquake data in three layers, each filtered to a range of
  // count values. Each range gets a different fill color.
  var layers = [
      [50, colors[3]],
      [20, colors[2]],
      [0, colors[1]]
  ];

  layers.forEach(function (layer, i) {
    map.addLayer({
      "id": "cluster-" + i,
      "type": "circle",
      "source": "earthquakes",
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
    "source": "earthquakes",
    "layout": {
        "text-field": "{point_count}",
        "text-font": [
            "DIN Offc Pro Medium",
            "Arial Unicode MS Bold"
        ],
        "text-size": 12
    }
  });
});

// When a click event occurs near a polygon, open a popup at the location of
// the feature, with description HTML from its properties.
map.on('click', function (e) {
  var features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-points'] });
  if (!features.length) {
      return;
  }

  var feature = features[0];

  var popup = new mapboxgl.Popup()
    .setLngLat(map.unproject(e.point))
    .setHTML(feature.properties.title)
    .addTo(map);
});


// Loops through all markers indefinitely
function playback(index) {
  // Index of next marker. Modulus length makes it 0 if we're at the last index
  // var nextIndex = (index + 1) % markers.length;
  var nextIndex = (index + 1) % eventsGeoJson.features.length;

  // Get the feature
  var concertFeature = eventsGeoJson.features[index];

  // Fetch the next marker
  // var marker = markers[index];

  // Show the popup of this marker
  // marker.togglePopup();

  // Change the text
  $('.concert-properties').fadeOut(function() {
    $('#title').text(concertFeature.properties.title);
    $('#popularity').text(concertFeature.properties.popularity);
    $('#uri').text(concertFeature.properties.uri).attr('href', concertFeature.properties.uri);
    $(this).fadeIn();
  });
  // description.textContent = concertFeature.properties.description;

  // Animate the map position based on camera properties
  map.flyTo({
    center: concertFeature.geometry.coordinates,
    speed: 0.2,                        // Speed of the flight
    curve: 1.3,                        // How far out it should zoom on the flight from A to B
    pitch: getRandomNumber(0, 61),     // Pitch for coolness
    bearing: getRandomNumber(-10, 10)  // Tilt slightly for more coolness
  });

  // Once the flight has ended, initiate the timeout that triggers recursive call
  map.once('moveend', function() {
    // Duration the slide is on screen after interaction
    window.setTimeout( function() {

      // Hide the popup of this marker
      // marker.togglePopup();

      // Recursive call, fly to next concert
      playback(nextIndex);
    }, timeAtEachConcert); // After callback, stay at the location for x milliseconds.
  });
}


// Returns a random number between min (inclusive) and max (exclusive)
function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

