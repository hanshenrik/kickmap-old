
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

        // TODO: use promises!
        getEvents();
      })
      .fail( function() {
        console.log('Oh, balls! Something went horribly wrong.')
      })
      .always( function() {} );
}


// Yeyeye, should have used some templating...
function addEventInfoSection(eventFeature) {
  var $concertDiv = $('<div>').attr('id', 'event-' + eventFeature.properties.id).attr('class', 'event').html(" \
    <h3 id='title'>" + eventFeature.properties.title + "</h3> \
    <div class='event-info'> \
      <div> \
        <table> \
          <tr> \
            <td> \
              <i class='fa fa-map-marker'></i> \
            </td> \
            <td id='venue'>" + eventFeature.properties.venue + "</td> \
          </tr> \
          <tr> \
            <td><i class='fa fa-calendar'></i></td> \
            <td id='date'>" + eventFeature.properties.date + "</td> \
          </tr> \
          <tr> \
            <td><a href='https://www.youtube.com/results?search_query=" + eventFeature.properties.artist + "' target='_blank' id='youtube'><i class='fa fa-youtube'></i></a></td> \
          </tr> \
        </table> \
      </div> \
      <div> \
        <img id='artist-img' src='" + eventFeature.properties.imageURL + "' \> \
      </div> \
    </div> \
  ");

  $('#concerts').append($concertDiv);
}
