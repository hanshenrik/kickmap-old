# kickmap
A map showing concerts in an area. Concerts are fetched from [Songkick](https://www.songkick.com), the map is made with [Mapbox GL](https://www.mapbox.com/).

# API keys
## Songkick
Songkick requires all users of their API to apply for an API key. You can do so at [songkick.com/developer](https://www.songkick.com/developer). Beware this might take about 2 weeks, even though they say it should only take 7 days.

## Mapbox
To use Mapbox you need an access token, which you get when you register at [mapbox.com](https://www.mapbox.com/). It's free and gives you access to Mapbox Studio, statistics about map views and other stuff.

## Include the keys in the project
Once you have the keys, create a file called `api-keys.js` in the `js` folder that looks like this

    var MAPBOX_ACCESS_TOKEN = 'my_mapbox_access_token';
    var SONGKICK_API_KEY = 'my_songkick_api_key';

And you're off!
