
initMap();

map.on('load', function() {
  getPlaces();

  getEvents();

  addScrollListener();
});

