
// Variables
var concertsCollection = {
  "type": "FeatureCollection",
  "features": []
};


function getConcerts(areaID) {
  getSongkickConcertsPage(areaID, 1);
}


function getSongkickConcertsPage(areaID, page) {
  console.log('Fetching page ' + page + ' for areaID ' + areaID);
  $.getJSON( 'http://api.songkick.com/api/3.0/metro_areas/' + areaID + '/calendar.json',
    {
      apikey: SONGKICK_API_KEY,
      page: page
    })
      .done( function(data) {
        var totalEntries = data.resultsPage.totalEntries;
        var perPage = data.resultsPage.perPage;
        var totalPages = Math.ceil(totalEntries/perPage);

        console.log('Got page ' + page + '/' + totalPages + ' for areaID ' + areaID);
        $.each( data.resultsPage.results.event, function(i, concert) {
          // Create a GeoJson feature so we can represent the concert on the map
          var feature = {
            "type": "Feature",
            "properties": {
              "id": concert.id,
              "title": concert.displayName
            },
            "geometry": {
              "type": "Point",
              "coordinates": [concert.location.lng, concert.location.lat]
            }
          };

          concertsCollection.features.push(feature);

          // Create some HTML to show info about the concert in the list
          addConcertSection(concert);
        });

        // Get the next page, unless we're not at the last page
        if (page*perPage >= totalEntries) {
          console.log('Finished fetching events from Songkick');
          addSources();
          addLayers();
          console.log('Starting playback');
          playback(0);
        }
        else {
          getSongkickConcertsPage(31422, page+1);
        }
      })
      .fail( function() {} )
      .always( function() {} );
}


// Yeyeye, should have used some templating...
function addConcertSection(concert) {
  var $concertDiv = $('<div>').attr('id', 'concert-' + concert.id).attr('class', 'concert').html(" \
    <h3 id='title'>" + concert.displayName + "</h3> \
    <div class='concert-info'> \
      <div> \
        <table> \
          <tr> \
            <td> \
              <i class='fa fa-map-marker'></i> \
            </td> \
            <td id='venue'>" + concert.venue.displayName + "</td> \
          </tr> \
          <tr> \
            <td> \
              <i class='fa fa-line-chart'></i> \
            </td> \
            <td id='popularity'>" + concert.popularity + "</td> \
          </tr> \
          <tr> \
            <td><i class='fa fa-calendar'></i></td> \
            <td id='date'>" + concert.start.date + "</td> \
          </tr> \
          <tr> \
            <td><i class='fa fa-info-circle'></i></td> \
            <td><a href='" + concert.uri + "' target='_blank' id='uri'>songkick event</a></td> \
          </tr> \
        </table> \
      </div> \
      <div> \
        <img id='artist-img' src='http://images.sk-static.com/images/media/profile_images/artists/" + concert.performance[0].artist.id + "/huge_avatar' \> \
      </div> \
    </div> \
  ");

  $('#concerts').append($concertDiv);
}
