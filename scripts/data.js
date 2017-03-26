
// Variables
var eventsCollection = {
  'type': 'FeatureCollection',
  'features': []
};
var placesCollection = {
  'type': 'FeatureCollection',
  'features': []
};


function getEvents() {
  console.log('Fetching all events from Mapbox');
  $.getJSON( 'https://api.mapbox.com/datasets/v1/hanshenrik/' + EVENTS_DATASET_ID + '/features',
    {
      access_token: MAPBOX_ACCESS_TOKEN
    })
      .done( function(data) {
        eventsCollection.features = data.features;
        addEventsToMap();
        // playback(0);
      })
      .fail( function() {
        console.log('Oh, tits! Something went horribly wrong.')
      })
      .always( function() {} );
}

function getPlaces() {
  console.log('Fetching all places from Mapbox');
  $.getJSON( 'https://api.mapbox.com/datasets/v1/hanshenrik/' + PLACES_DATASET_ID + '/features',
    {
      access_token: MAPBOX_ACCESS_TOKEN
    })
      .done( function(data) {
        placesCollection.features = data.features;
        addPlacesToMap();
      })
      .fail( function() {
        console.log('Oh, balls! Something went horribly wrong.')
      })
      .always( function() {} );
}
