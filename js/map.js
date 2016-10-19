
// Variables
var center = [10.73, 59.92];
var zoomLevel = 15;
var timeAtEachConcert = 5000; // milliseconds


// Configure Mapbox
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v9',
  center: center,
  zoom: zoomLevel
});


// Loops through all markers indefinitely
function playback(index) {
  // Index of next marker. Modulus length makes it 0 if we're at the last index
  var nextIndex = (index + 1) % markers.length;

  // Fetch the next marker
  var marker = markers[index];

  // Show the popup of this marker
  marker.togglePopup();

  // Animate the map position based on camera properties
  map.flyTo({
    center: marker.getLngLat(),
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
      marker.togglePopup();

      // Recursive call, fly to next concert
      playback(nextIndex);
    }, timeAtEachConcert); // After callback, stay at the location for x milliseconds.
  });
}


// Returns a random number between min (inclusive) and max (exclusive)
function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}
