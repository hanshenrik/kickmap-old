# Jazzatlas
Hvor er alle greiene på Mandaljazz, egentlig? De finner du i Jazzatlaset.


# Utvikling
## Mapbox access token
For å bruke Mapbox trenger man en sånn access token. Registrer deg gratis på [mapbox.com](https://www.mapbox.com/) for å få en.

Lag en fil som heter `env.js` i `scripts`-mappen som ser slik ut:

    var MAPBOX_ACCESS_TOKEN = 'my_mapbox_access_token';
    var MAPBOX_STYLE_URL    = 'mapbox://styles/hanshenrik/cizcwc8d600bb2spm3i0x80ot';
    var PLACES_DATASET_ID   = 'my_places_dataset_id';
    var EVENTS_DATASET_ID   = 'my_events_dataset_id';


## Mapbox Studio
Vi bruker [Mapbox Studio](https://www.mapbox.com/studio) til tre ting:

* Style kartet
* Legge inn faste steder (konsertsteder, festivalområde, infostands, installasjoner, etc.)
* Legge inn hendinger (konserter, happenings, etc.)


# Smil
Det er jo ikke så verst i dag, er'e det 'a?
