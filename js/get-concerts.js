
// Variables
var markers = [];
var eventsGeoJson = {
    "type": "FeatureCollection",
    "features": []
};


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

          // Create a slightly offset position, so concerts at a venue don't overlap
          var lngSlightOffset = concert.location.lng + getRandomNumber(-0.00015, 0.00015);
          var latSlightOffset = concert.location.lat + getRandomNumber(-0.00015, 0.00015);

          var feature = {
            "type": "Feature",
            "properties": {
              "title": concert['displayName']
            },
            "geometry": {
              "type": "Point",
              "coordinates":
                [
                  lngSlightOffset,
                  latSlightOffset
                ]
            }
          }

          // TODO: Do we need global overview of features, or is markers enough?
          eventsGeoJson.features.push(feature);

          // TODO: draw line from actual venue position to position of concert marker
          // map.addSource("route", {
          //   "type": "geojson",
          //   "data": {
          //     "type": "Feature",
          //     "properties": {},
          //     "geometry": {
          //       "type": "LineString",
          //       "coordinates": [
          //         [-122.48369693756104, 37.83381888486939],
          //         [-122.48348236083984, 37.83317489144141],
          //       ]
          //     }
          //   }
          // });

          // map.addLayer({
          //   "id": "route",
          //   "type": "line",
          //   "source": "route",
          //   "layout": {
          //     "line-join": "round",
          //     "line-cap": "round"
          //   },
          //   "paint": {
          //     "line-color": "#888",
          //     "line-width": 8
          //   }
          // });

          // Create a DOM element for the marker
          var element = document.createElement('div');
          element.className = 'concert-marker';

          // Set an event listener on the element so we can do something when it is clicked
          element.addEventListener('click', function() {
            window.open(concert.uri)
          });

          // Create a popup
          var popup = new mapboxgl.Popup( { offset: [0, -15] } )
              .setText(feature.properties.title);

          // Add the marker to map
          var marker = new mapboxgl.Marker(element, { offset: [-15 / 2, -15 / 2] })
              .setLngLat(feature.geometry.coordinates)
              .setPopup(popup)
              .addTo(map);

          markers.push(marker);

        });

        // Get next page if we're not at the last page
        var totalEntries = data.resultsPage.totalEntries;
        var perPage = data.resultsPage.perPage;

        if (page*perPage >= totalEntries) {
          console.log("Finished fetching events from Songkick");
        }
        else {
          getPage(31422, page+1);

          // Start playback after first page is loaded
          if (page === 1) {
            playback(0);
          }
        }
      })
      .fail( function() {} )
      .always( function() {} );
}

getPage(31422, 1);
