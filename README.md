# Draumspa

## Localised Weather App

Full screen weather app: primary weather data retrieved from OpenWeatherAPI. On page load a dynamic background cycles through a carousel of weather-related ‘scenes’. UI allows for location to be retrieved through device location settings or manual text entry: once initialised the scene background mirrors the current weather at given location.

The UI itself is inspired by the GameCube system menu: a cuboid with the capacity to rotate through 3D space. There are nine weather widgets, each of which upon click will rotate the 3D object to an adjacent face displaying further information, usually animated graphs.

All images generated with Midjourney.

## Widgets

- 1: A wide widget iterates through two displays: the first projects forecast for week ahead, the second shows more detailed information about the current day’s weather. Corresponding face loads graph data for hourly temp / current day and the daily high/low for the coming week.
- 2: Text description of precipitation probability and cloud cover: corresponding face loads graph data for these metrics over the next 48hrs.
- 3: Bespoke CSS gradient slider visually represents AQI index: corresponding face loads 82hr graphs for AQI, NO2, NO, PM10 and PM2.5.
- 4: Same gradient slider template used to display UV Index with SPF usage recommendation, explored over a 48hr period in graph face.
- 5: A bespoke CSS dial represents wind speed and direction; graphs illustrate wind gust, wind speed and direction over next 48hrs.
- 6: Another dial represents an hPa atmospheric pressure gauge, explored over 48hrs in subsequent graph data.
- 7: This widget simply describes in text the current visibility and humidity, illustrated by graph data over 48hrs.
- 8: Sun Cycle widget: a text representation of the amount of time until dawn or dusk, respectively, at at a given time in the initialised location. Corresponding face contains an animation representing the amount of the day / night phase through which one has already progressed.
- 9: Moon Cycle widget: this is an animated display of an icon which represents the moon in its current state. The corresponding face features an enlarged version of this icon with corresponding text providing phase name and moonrise / moonset times.

## API Calls

- openWeatherData API: 'onecall' and 'pollution'
- sunriseSunset API: simple request for solar-temporal data
- Google Maps API: geocode from address, geocode from Lat/Long, and timezone from geocode

## Dependencies

- @fortawesome/fontawesome-svg-core
- @fortawesome/free-solid-svg-icons
- @fortawesome/react-fontawesome
- framer-motion
- moment-timezone
- react
- react-device-detect
- react-dom
- react-transition-group
- recharts
- typescript

