
// Variables
var concertsCollection = {
  'type': 'FeatureCollection',
  'features': []
};


function getConcerts(areaID = 31422) { // Use ID of Oslo by default
  // Fetch page 1, kicks off recursive call
  getSongkickConcertsPage(areaID, 1);
}


function getSongkickConcertsPage(areaID, page) {
  console.log('Fetching page ' + page + ' for areaID = ' + areaID);
  $.getJSON( 'http://api.songkick.com/api/3.0/metro_areas/' + areaID + '/calendar.json',
    {
      apikey: SONGKICK_API_KEY,
      page: page
    })
      .done( function(data) {
        var totalEntries = data.resultsPage.totalEntries;
        var perPage = data.resultsPage.perPage;
        var totalPages = Math.ceil(totalEntries/perPage);

        console.log('Got page ' + page + '/' + totalPages + ' for areaID = ' + areaID);
        $.each( data.resultsPage.results.event, function(i, concert) {
          // Create a GeoJson feature so we can represent the concert on the map
          var feature = {
            'type': 'Feature',
            'properties': {
              'id': concert.id,
              'title': concert.displayName,
              'date': concert.start.date,
              'popularity': concert.popularity,
              'artist': '',
              'venue': concert.venue.displayName,
              'imageURL': '',
              'songkickURL': concert.uri
            },
            'geometry': {
              'type': 'Point',
              'coordinates': [concert.location.lng, concert.location.lat]
            }
          };

          if (concert.performance[0]) {
            feature.properties.artist = concert.performance[0].displayName;
            feature.properties.imageURL = 'http://images.sk-static.com/images/media/profile_images/artists/' + concert.performance[0].artist.id + '/huge_avatar';
          }

          concertsCollection.features.push(feature);

          // Create some HTML to show info about the concert in the list
          addConcertSection(feature);
        });

        // Get the next page, unless we're not at the last page
        if (page*perPage >= totalEntries) {
          console.log('Finished fetching all ' + totalEntries + ' events from Songkick.');
          addSources();
          addLayers();
          console.log('Starting playback');
          playback(0);
        }
        else {
          getSongkickConcertsPage(areaID, page+1);
        }
      })
      .fail( function() {
        console.log('Oh, balls! Something went horribly wrong.')
      } )
      .always( function() {} );
}


// Yeyeye, should have used some templating...
function addConcertSection(concertFeature) {
  var $concertDiv = $('<div>').attr('id', 'concert-' + concertFeature.properties.id).attr('class', 'concert').html(" \
    <h3 id='title'>" + concertFeature.properties.title + "</h3> \
    <div class='concert-info'> \
      <div> \
        <table> \
          <tr> \
            <td> \
              <i class='fa fa-map-marker'></i> \
            </td> \
            <td id='venue'>" + concertFeature.properties.venue + "</td> \
          </tr> \
          <tr> \
            <td> \
              <i class='fa fa-line-chart'></i> \
            </td> \
            <td id='popularity'>" + concertFeature.properties.popularity + "</td> \
          </tr> \
          <tr> \
            <td><i class='fa fa-calendar'></i></td> \
            <td id='date'>" + concertFeature.properties.date + "</td> \
          </tr> \
          <tr> \
            <td><i class='fa fa-info-circle'></i></td> \
            <td><a href='" + concertFeature.properties.songkickURL + "' target='_blank' id='uri'>Songkick event</a></td> \
          </tr> \
          <tr> \
            <td><i class='fa fa-youtube'></i></td> \
            <td><a href='https://www.youtube.com/results?search_query=" + concertFeature.properties.artist + "' target='_blank' id='youtube'>Search '" + concertFeature.properties.artist + "'</a></td> \
          </tr> \
        </table> \
      </div> \
      <div> \
        <img id='artist-img' src='" + concertFeature.properties.imageURL + "' \> \
      </div> \
    </div> \
  ");

  $('#concerts').append($concertDiv);
}
