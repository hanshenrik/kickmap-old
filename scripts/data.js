
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
        addEventsToInfoSection();
        playback(0);
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


function addEventsToInfoSection() {
  console.log('Adding events to info section');
  eventsCollection.features.forEach( function(eventFeature) {
    addEventInfoSection(eventFeature);
  });
}

// Yeyeye, should have used some templating...
function addEventInfoSection(eventFeature) {
  // TODO: do this when initially populating eventCollection
  eventFeature.properties.title = eventFeature.properties.artist + ' @ ' + eventFeature.properties.place;
  // TODO: add URLs to features
  eventFeature.properties.imageURL = '/images/jazzlaug.png';
  eventFeature.properties.mandaljazzURL = 'http://mandaljazz.no/';

  var $eventDiv = $('<div>').attr('id', 'event-' + eventFeature.id).attr('class', 'event').html(" \
    <h3 id='title'>" + eventFeature.properties.title + "</h3> \
    <div class='event-info'> \
      <div> \
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
  ");

  $('#events').append($eventDiv);
}
