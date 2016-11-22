
// Variables
// var markers = [];
var venues = new Set();
var concertsGeoJson = {
  "type": "FeatureCollection",
  "features": []
};
var venuesGeoJson = {
  "type": "FeatureCollection",
  "features": []
}


function getPage(areaID, page) {
  console.log("Fetching page " + page + " for areaID " + areaID);
  $.getJSON( "http://api.songkick.com/api/3.0/metro_areas/" + areaID + "/calendar.json",
    {
      apikey: SONGKICK_API_KEY,
      page: page
    })
      .done( function(data) {
        console.log("Got page " + page + " for areaID " + areaID);
        $.each( data.resultsPage.results.event, function( i, concert ) {
          console.log(concert)
          var feature = {
            "type": "Feature",
            "properties": {
              "title": concert.displayName,
              "uri": concert.uri,
              "venue": concert.venue.displayName,
              "date": concert.start.date,
              "popularity": concert.popularity,
              "artistID": concert.performance[0].artist.id
            },
            "geometry": {
              "type": "Point",
              "coordinates": [concert.location.lng, concert.location.lat]
            }
          }

          concertsGeoJson.features.push(feature);

          // Create a DOM element for the marker
          // var element = document.createElement('div');
          // element.className = 'concert-marker';

          // // Set an event listener on the element so we can do something when it is clicked
          // element.addEventListener('click', function() {
          //   window.open(concert.uri)
          // });

          // Create a popup
          // var popup = new mapboxgl.Popup( { offset: [0, -15] } )
          //     .setText(feature.properties.title);

          // // Add the marker to map
          // var marker = new mapboxgl.Marker(element, { offset: [-15 / 2, -15 / 2] })
          //     .setLngLat(feature.geometry.coordinates)
          //     .setPopup(popup)
          //     .addTo(map);

          // markers.push(marker);

          // Create a popup
          // var popup = new mapboxgl.Popup( { offset: [0, -15] } )
          //     .setText(concert.venue.displayName);

          // Add the venue to a Set so we only add one featuer per venue
          if (!venues.has(concert.venue.displayName)) {
            venues.add(concert.venue.displayName);
            venuesGeoJson.features.push(feature);
          }
        });

        // Get next page if we're not at the last page
        var totalEntries = data.resultsPage.totalEntries;
        var perPage = data.resultsPage.perPage;

        if (page*perPage >= totalEntries) {
          console.log("Finished fetching events from Songkick");
          console.log('Adding layers to the map');
          addLayers();
          console.log("Starting playback");
          playback(0);
        }
        else {
          getPage(31422, page+1);
        }
      })
      .fail( function() {} )
      .always( function() {} );
}

// Start fetching pages for Oslo
getPage(31422, 1);
