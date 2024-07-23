// Package Imports
import React, { useEffect, useState, useRef } from "react";
import { faLocationArrow, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment-timezone";
import { CSSTransition, SwitchTransition } from "react-transition-group";

// Local Imports
import {
  animateOpacityValues,
  GenerationContents,
  LatLong,
  Location,
  SunriseSunset,
  Widget,
  OpenWeatherData,
  ContainerContent,
  WeatherData,
  DailyWeather,
} from "./DraumSpaTypes";

interface WelcomePaneProps {
  face: string;
  setFace: React.Dispatch<React.SetStateAction<string>>;
  setRightFace: React.Dispatch<React.SetStateAction<string>>;
  setIsDay: React.Dispatch<React.SetStateAction<boolean>>;
  isDay: boolean;
  setUntil: React.Dispatch<React.SetStateAction<number | null>>;
  until: number | null;
  sunCycleWidget: (location?: string) => JSX.Element;
  location: Location | null;
  setLocation: React.Dispatch<React.SetStateAction<Location | null>>;
  getOpenWeatherData: () => Promise<void>;
  openWeatherData: OpenWeatherData | null;
  timeZone: string | null;
  setTimeZone: React.Dispatch<React.SetStateAction<string | null>>;
  sunriseSunset: SunriseSunset | null;
  setSunriseSunset: React.Dispatch<React.SetStateAction<SunriseSunset | null>>;
  moonDisplayWidget: () => JSX.Element;
  currentWeather: WeatherData | null;
  precipitationTextWidget: () => JSX.Element;
  visibilityHumidityTextWidget: () => JSX.Element;
  barPressureWidget: () => JSX.Element;
  windWidget: () => JSX.Element;
  aqiDisplayWidget: () => JSX.Element;
  ultravioletCloudWidget: () => JSX.Element;
}

function WelcomePane(props: WelcomePaneProps): React.ReactElement {
  // Section 0: Refresh timer
  const [counter, setCounter]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(0);
  useEffect((): void | (() => void) => {
    if (props.face === "right") return;
    const refreshCounter: NodeJS.Timeout | number = setTimeout((): void => {
      setCounter((prev: number): number => {
        return prev + 1;
      });
    }, 5);
    return (): void => {
      clearTimeout(refreshCounter);
    };
  }, [counter, props.face]);

  // Section 1: Data Logix

  /* Location States:
  - Location Input: Controlled State Component 
  - Location Display Error Toggle: advises user to try manual search if any error with geolocation retrieval */
  const [locationInput, setLocationInput]: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ] = useState<string>("");
  const [displayErrorToggle, setDisplayErrorToggle]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);

  useEffect((): void | (() => void) => {
    if (!displayErrorToggle) return;
    const displayErrorTimer: NodeJS.Timeout | number = setTimeout((): void => {
      setDisplayErrorToggle(false);
    }, 1500);
    return (): void => {
      clearTimeout(displayErrorTimer);
    };
  }, [displayErrorToggle]);

  /* Location Processing Functions: 
    - state set on the basis of props.setLocation from CubeContainer
    - googleMapsApiKey: for geocoding and reverse geocoding APIs
    - searchInputRef: to apply focus upon geocoding retrieval error
    - getFormattedLocation: retrieves a formatted location from Google in response to LatLong argument. Sets location state object
    - findLocationData: UX arrow rotation, retrieves geolocation co-ordinates, uses them to call getFormattedLocation
    - findGeocodeData: takes text string as argument to retrieve geolocation co-ordinates from Google AND a formatted address corresponding to the string (if possible). Sets location state object.
    - searchLocationText: calls findGeocodeData with string from controlled location input state. Resets location input state. */
  const googleMapsApiKey: string = "AIzaSyBRawCNVnOgO4cCBL2r-9RZJfwh0HNDdRw";
  const searchInputRef: React.RefObject<HTMLInputElement | null> = useRef(null);
  const getFormattedLocation = async (
    latitude: number,
    longitude: number
  ): Promise<void> => {
    console.log(`inside getFormattedLocation fn`);
    const reverseGeocodeUrl: string = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`;
    try {
      const response: Response = await fetch(reverseGeocodeUrl);
      const data: any = await response.json();
      if (data.status === "OK") {
        let formattedLocation: string | null = null;
        if (data.results[0]?.formatted_address) {
          const formattedLocationFull: string =
            data.results[0]?.formatted_address;
          console.log(formattedLocationFull);
          const cutIndex: number = formattedLocationFull.indexOf(",");
          formattedLocation = formattedLocationFull.slice(0, cutIndex);
        }
        console.log(formattedLocation);
        if (formattedLocation) {
          props.setLocation({
            coordinates: {
              latitude: latitude,
              longitude: longitude,
            },
            formattedLocation: formattedLocation,
          });
        } else {
          props.setLocation({
            coordinates: {
              latitude: latitude,
              longitude: longitude,
            },
            formattedLocation: null,
          });
        }
      } else {
        console.error(`Geocode Fetch error: ${data.status}`);
        props.setLocation({
          coordinates: {
            latitude: latitude,
            longitude: longitude,
          },
          formattedLocation: null,
        });
      }
      setDisplayErrorToggle(false);
    } catch (error: any) {
      console.error(`Geocode Fetch error: ${error}`);
    }
  };
  const findLocationData = (): void => {
    setArrowRotate(true);
    if (!navigator.geolocation) {
      console.log(`navigator object not available`);
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
      setGeocodeErrorCounter((prev: number): number => prev + 1);
      setDisplayErrorToggle(true);
      return;
    } else {
      console.log(`searching location`);
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition): void => {
          const locationCoordinates: LatLong = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          getFormattedLocation(
            locationCoordinates.latitude as number,
            locationCoordinates.longitude as number
          );
        },
        (error: GeolocationPositionError) => {
          let errorMessage: string = "";
          switch (error.code) {
            case 1: // GeolocationPositionError.PERMISSION_DENIED
              errorMessage = "User denied the request for Geolocation.";
              break;
            case 2: // GeolocationPositionError.POSITION_UNAVAILABLE
              errorMessage = "Location information is unavailable.";
              break;
            case 3: // GeolocationPositionError.TIMEOUT
              errorMessage = "The request to get user location timed out.";
              break;
            default:
              errorMessage = "Unspecified error";
              break;
          }
          console.log(`error: ${errorMessage}`);
          setGeocodeErrorCounter((prev: number): number => prev + 1);
          setDisplayErrorToggle(true);
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }
      );
    }
  };
  const findGeocodeData = async (address: string): Promise<void> => {
    const geocodeUrl: string = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${googleMapsApiKey}`;
    try {
      const response: Response = await fetch(geocodeUrl);
      const data: any = await response.json();
      if (data.status === "OK") {
        //console.log(JSON.stringify(data));
        const coordinates: LatLong = {
          latitude: data.results[0].geometry.location.lat,
          longitude: data.results[0].geometry.location.lng,
        };
        //console.log(JSON.stringify(coordinates));
        let formattedLocation: string | null = null;
        if (data.results[0]?.formatted_address) {
          const formattedLocationFull: string =
            data.results[0]?.formatted_address;
          console.log(formattedLocationFull);
          const cutIndex: number = formattedLocationFull.indexOf(",");
          formattedLocation = formattedLocationFull.slice(0, cutIndex);
        }
        props.setLocation({
          coordinates: coordinates,
          formattedLocation: formattedLocation ?? address,
        });
        setDisplayErrorToggle(false);
      } else console.error(`Geocode Fetch error: ${data.status}`);
    } catch (error: any) {
      console.error(`Geocode Fetch error: ${error}`);
    }
  };
  const searchLocationText = (): void => {
    findGeocodeData(locationInput);
    setLocationInput("");
  };

  // Setting local time: bsed on IANA timezone database shared betwen moment-timezone library and geo-tz library
  const [localTime, setLocalTime]: [
    moment.Moment | null,
    React.Dispatch<React.SetStateAction<moment.Moment | null>>
  ] = useState<moment.Moment | null>(null);
  const getTimezone = async (): Promise<void> => {
    if (
      !props.location ||
      !props.location.coordinates.latitude ||
      !props.location.coordinates.longitude
    )
      return;
    const { latitude, longitude }: LatLong = props.location.coordinates;
    const timestamp: number = Math.floor(Date.now() / 1000);
    const tzUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${timestamp}&key=${googleMapsApiKey}`;
    try {
      const response: Response = await fetch(tzUrl);
      const data: any = await response.json();
      if (data.status === "OK") {
        // console.log(JSON.stringify(data))
        // console.log(`timezone data status : OK`)
        const timeZoneId: string = data.timeZoneId;
        props.setTimeZone(timeZoneId);
      } else
        console.error(
          `Error occurred while fetching timezone data: ${data.status}`
        );
    } catch (error: any) {
      console.error(`Error occurred while fetching timezone data: ${error}`);
    }
  };
  useEffect((): void => {
    if (!props.timeZone) return;
    console.log(`Time Zone: ${props.timeZone}`);
    setLocalTime(moment().tz(props.timeZone));
  }, [props.timeZone]);

  // Setting sunrise/sunset: state held in CubeContainer
  const getSunrise = async (): Promise<void> => {
    if (
      !props.location ||
      !props.location.coordinates.latitude ||
      !props.location.coordinates.longitude
    )
      return;
    const { latitude, longitude }: LatLong = props.location.coordinates;
    const sunUrl: string = `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`;
    try {
      const response: Response = await fetch(sunUrl);
      const data: any = await response.json();
      if (data.status === "OK") {
        props.setSunriseSunset({
          sunrise: data.results.sunrise,
          sunset: data.results.sunset,
          solar_noon: data.results.solar_noon,
          day_length: data.results.day_length,
          civil_twilight_begin: data.results.civil_twilight_begin,
          civil_twilight_end: data.results.civil_twilight_end,
          nautical_twilight_begin: data.results.nautical_twilight_begin,
          nautical_twilight_end: data.results.nautical_twilight_end,
          astronomical_twilight_begin: data.results.astronomical_twilight_begin,
          astronomical_twilight_end: data.results.astronomical_twilight_end,
        });
      } else {
        console.error(
          `Error fetching sunrise and sunset times: ${data.status}`
        );
      }
    } catch (error: any) {
      console.error(`Error fetching sunrise and sunset times: ${error}`);
    }
  };

  // Comparing Sunrise/Sunset & Timezone

  useEffect((): void => {
    if (!localTime || !props.sunriseSunset) return;
    if (localTime.isBefore(props.sunriseSunset.sunrise)) {
      props.setUntil(
        moment(props.sunriseSunset.sunrise).diff(localTime, "minutes")
      );
      props.setIsDay(false);
    } else if (localTime.isAfter(props.sunriseSunset.sunset)) {
      const nextDaySunrise = moment(props.sunriseSunset.sunrise).add(1, "days");
      props.setUntil(nextDaySunrise.diff(localTime, "minutes"));
      props.setIsDay(false);
    } else {
      props.setUntil(
        moment(props.sunriseSunset.sunset).diff(localTime, "minutes")
      );
      props.setIsDay(true);
    }
  }, [localTime, props.sunriseSunset, props.location]);

  // gigaUseEffect for storing all relevant states
  useEffect((): void => {
    getTimezone();
    getSunrise();
    props.getOpenWeatherData();
  }, [props.location]);

  // Section 2: Presentational Logic
  /*  DOM Manipulation logics:
    - Arrow rotation
    - Enter / Return = click on input submission */
  const [arrowRotate, setArrowRotate]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);
  useEffect((): (() => void) => {
    const rotationTimer: NodeJS.Timeout | number = setTimeout((): void => {
      if (arrowRotate) {
        setArrowRotate(false);
      }
    }, 500);
    return (): void => {
      clearTimeout(rotationTimer);
    };
  });
  const magnifierRef: React.RefObject<HTMLSpanElement | null> = useRef(null);
  useEffect((): void | (() => void) => {
    const searchInput: HTMLInputElement | null = searchInputRef.current;
    if (!searchInput) return;
    const clickFn = (event: KeyboardEvent): void => {
      if (event.key === "Enter" || event.key === "Return") {
        if (!magnifierRef.current) return;
        event.preventDefault();
        magnifierRef.current.click();
      }
    };
    searchInput.addEventListener("keydown", clickFn);
    return (): void => {
      if (!searchInput) return;
      searchInput.removeEventListener("keydown", clickFn);
    };
  }, []);
  // Geolocation Error UX Indicator Logic
  const [geocodeErrorCounter, setGeocodeErrorCounter]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(0);
  const searchUiRef: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);
  useEffect((): void | (() => void) => {
    if (!searchUiRef.current || geocodeErrorCounter === 0) return;
    searchUiRef.current.classList.add("wiggle");
    const wiggleTimeout: NodeJS.Timeout | number = setTimeout((): void => {
      if (!searchUiRef.current) return;
      searchUiRef.current.classList.remove("wiggle");
    }, 250);
    return (): void => {
      clearTimeout(wiggleTimeout);
    };
  }, [geocodeErrorCounter]);
  // Coordinate / Formatted Location Display Toggle Logic
  const [whichDisplay, setWhichDisplay]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);
  const whichDisplayTimer: React.MutableRefObject<NodeJS.Timeout | number> =
    useRef<NodeJS.Timeout | number>(0);

  useEffect((): void | (() => void) => {
    whichDisplayTimer.current = setInterval((): void => {
      setWhichDisplay((prev: boolean): boolean => !prev);
    }, 4000);
    // 4000
    return (): void => {
      clearInterval(whichDisplayTimer.current);
    };
  }, []);
  // 7day / right now Weather Display Toggle Logic
  const [weatherDisplay, setWeatherDisplay]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);
  const weatherDisplayTimer: React.MutableRefObject<NodeJS.Timeout | number> =
    useRef<NodeJS.Timeout | number>(0);
  useEffect((): void | (() => void) => {
    weatherDisplayTimer.current = setInterval((): void => {
      setWeatherDisplay((prev: boolean): boolean => !prev);
    }, 6000);
    // 6000
    return (): void => {
      clearInterval(weatherDisplayTimer.current);
    };
  }, []);

  // Navigation Click Logic
  const navigationClickHandler = (
    event: React.MouseEvent<HTMLDivElement>
  ): void => {
    if (!(event.currentTarget instanceof HTMLDivElement) || !props.location)
      return;
    const targetElement: HTMLDivElement = event.currentTarget;
    const id: string = targetElement.id;
    switch (id) {
      case "precipitation-container":
        props.setRightFace("precipitation");
        break;
      case "UV-container":
        props.setRightFace("UV");
        break;
      case "wind-container":
        props.setRightFace("wind");
        break;
      case "AQI-container":
        props.setRightFace("AQI");
        break;
      case "pressure-container":
        props.setRightFace("pressure");
        break;
      case "visibility-container":
        props.setRightFace("visibility");
        break;
      case "sunCycle-container":
        props.setRightFace("sunCycle");
        break;
      case "moonCycle-container":
        props.setRightFace("moonCycle");
        break;
      case "right-now-container":
      case "daily-container":
        props.setRightFace("weekAhead");
        break;
      case "---":
      default:
        props.setRightFace("default");
        return;
    }
    props.setFace("right");
  };

  // Current Weather Welcome Widget
  const currentWeatherWelcomeWidget = (): JSX.Element => {
    if (!props.currentWeather) return <></>;
    return (
      <span key="right-now" id="right-now" className="full-dims">
        <div
          className="flex-row"
          id="right-now-container"
          onClick={navigationClickHandler}
        >
          <div id="right-now-img-container" className="flex-center flex-column">
            <img
              alt="current-weather-icon"
              id="right-now-img"
              src={`https://openweathermap.org/img/wn/${props.currentWeather?.icon}@4x.png`}
            />
          </div>
          <div id="temperature-container">
            <p className="weather-text center-text">
              <span style={{ fontWeight: 500 }}>
                {((props.openWeatherData?.current.temp ?? 0) - 273.15).toFixed(
                  1
                )}
                °C
              </span>{" "}
              //{" "}
              <span style={{ fontWeight: 500 }}>
                {(
                  (((props.openWeatherData?.current.temp ?? 0) - 273.15) * 9) /
                    5 +
                  32
                ).toFixed(1)}
                °F
              </span>
            </p>

            <p className="weather-text center-text">
              <em>feels like...</em>
            </p>
            <p className="weather-text center-text">
              <span style={{ fontWeight: 500 }}>
                {(
                  (props.openWeatherData?.current.feels_like ?? 0) - 273.15
                ).toFixed(1)}
                °C{" "}
              </span>{" "}
              //{" "}
              <span style={{ fontWeight: 500 }}>
                {(
                  (((props.openWeatherData?.current.feels_like ?? 0) - 273.15) *
                    9) /
                    5 +
                  32
                ).toFixed(1)}
                °F
              </span>
            </p>
          </div>
          <div className="flex-column" id="right-now-text">
            {" "}
            <p className="weather-text justify-text">
              <em>{props.isDay ? "diurnal" : "nocturnal"}...</em>
            </p>
            <p
              className="weather-text justify-text"
              style={{ fontWeight: 500 }}
            >
              {props.currentWeather ? (
                <React.Fragment key="current-weather-main">
                  <span style={{ fontWeight: 500 }}>
                    {props.currentWeather.main.toLowerCase()}
                  </span>
                  <span> →</span>
                </React.Fragment>
              ) : (
                <React.Fragment key="blank" />
              )}
            </p>
            <p className="weather-text justify-text">
              {props.currentWeather ? (
                <React.Fragment key="current-weather-descr">
                  {props.currentWeather.description}
                </React.Fragment>
              ) : (
                <React.Fragment key="blank" />
              )}
            </p>
          </div>
        </div>
      </span>
    );
  };

  // Seven Days Ahead Widget
  const sevenDaysAheadWidget = (): JSX.Element => {
    if (!props.openWeatherData) return <></>;
    const daily: DailyWeather[] = props.openWeatherData.daily;
    // console.log("daily" + JSON.stringify(daily));
    const eachDay = (index: number): JSX.Element => {
      const dayWeather: DailyWeather = daily[index];
      const maxTemp: string = (dayWeather.temp.max - 273.15).toFixed(0);
      const minTemp: string = (dayWeather.temp.min - 273.15).toFixed(0);
      const icon: string = dayWeather.weather[0].icon;
      const convertUnixToWeekDay = (
        unixTimeStamp: number,
        timezone: string | null
      ): string => {
        if (!timezone) return "";
        const date = new Date(unixTimeStamp * 1000);
        const options: Intl.DateTimeFormatOptions = {
          weekday: "narrow",
          timeZone: timezone,
        };
        const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(
          "en-US",
          options
        );
        const dayString: string = formatter.format(date);
        return dayString;
      };
      const weekDay: string | null = convertUnixToWeekDay(
        dayWeather.dt,
        props.timeZone
      );

      return (
        <div
          className="flex-column flex-center"
          id="daily-container"
          onClick={navigationClickHandler}
          key={`each-day-${index}`}
        >
          <p className="weather-text center-text" id="max-temp">
            {maxTemp}°
          </p>
          <div className="seven-img-container flex-column flex-center">
            {" "}
            <div
              className={
                ["09d", "09n", "10d", "10n", "11d", "11n"].includes(icon)
                  ? "seven-img full-dims"
                  : "seven-img-small full-dims"
              }
              style={{
                backgroundImage: `url(https://openweathermap.org/img/wn/${icon}@4x.png)`,
              }}
            />
          </div>{" "}
          <p className="weather-text center-text" id="weekday">
            {weekDay}
          </p>
          <p className="weather-text center-text" id="min-temp">
            {minTemp}°
          </p>
        </div>
      );
    };

    return (
      <span
        key="week-ahead"
        id="week-ahead"
        className="full-dims flex-center flex-row"
      >
        {daily.map((_day: DailyWeather, index: number): JSX.Element => {
          return eachDay(index);
        })}
      </span>
    );
  };

  // Widget Content Generation
  const whichDisplayInjection = (): JSX.Element => {
    if (displayErrorToggle)
      return (
        <span key="manual-search" id="manual-search">
          try manual search
        </span>
      );
    else if (props.location) {
      if (whichDisplay)
        return (
          <span key="coordinates" id="coordinates-display">
            {" "}
            <>
              {parseFloat(props.location.coordinates.latitude.toFixed(3))},{" "}
              {parseFloat(props.location.coordinates.longitude.toFixed(3))}
            </>{" "}
          </span>
        );
      else
        return (
          <span key="formatted" id="formatted-display">
            {props.location.formattedLocation}
          </span>
        );
    } else
      return (
        <span key="blank" id="blank">
          ---
        </span>
      );
  };

  const generateWelcomeSquares = (
    content1: ContainerContent,
    content2: ContainerContent
  ) => {
    const generateDiv = (content: JSX.Element, id: string): JSX.Element => {
      return (
        <div key={id} className={classNames} onClick={navigationClickHandler} id={id}>
          <AnimatePresence mode="wait">{content}</AnimatePresence>
        </div>
      );
    };
    const classNames: string =
      "widget-container square-widget flex-column flex-center";
    return (
      <>
        {generateDiv(content1.containerContent, content1.containerId)}
        {generateDiv(content2.containerContent, content2.containerId)}
      </>
    );
  };
  const generateMotionContent = (
    key: string,
    content: JSX.Element
  ): JSX.Element => {
    return (
      <motion.div
        {...animateOpacityValues}
        className="weather-text center-text full-dims"
      >
        {content}
      </motion.div>
    );
  };

  //widget function calls

  const generationContents: GenerationContents = !props.location
    ? {
        precipitation: generateMotionContent(
          "---",
          <div className="full-dims flex-column flex-center">---</div>
        ),
        wind: generateMotionContent(
          "---",
          <div className="full-dims flex-column flex-center">---</div>
        ),
        AQI: generateMotionContent(
          "---",
          <div className="full-dims flex-column flex-center">---</div>
        ),
        UV: generateMotionContent(
          "---",
          <div className="full-dims flex-column flex-center">---</div>
        ),
        pressure: generateMotionContent(
          "---",
          <div className="full-dims flex-column flex-center">---</div>
        ),
        visibility: generateMotionContent(
          "---",
          <div className="full-dims flex-column flex-center">---</div>
        ),
        sunCycle: generateMotionContent(
          "---",
          <div className="full-dims flex-column flex-center">---</div>
        ),
        moonCycle: generateMotionContent(
          "---",
          <div className="full-dims flex-column flex-center">---</div>
        ),
      }
    : {
        precipitation: generateMotionContent(
          "precipitation",
          props.precipitationTextWidget()
        ),
        wind: generateMotionContent("wind", props.windWidget()),
        AQI: generateMotionContent("AQI", props.aqiDisplayWidget()),
        UV: generateMotionContent("UV", props.ultravioletCloudWidget()),
        pressure: generateMotionContent("pressure", props.barPressureWidget()),
        visibility: generateMotionContent(
          "visibility",
          props.visibilityHumidityTextWidget()
        ),
        sunCycle: generateMotionContent("sun", props.sunCycleWidget("front")),
        moonCycle: generateMotionContent("moon", props.moonDisplayWidget()),
      };
  const welcomeWidgets: Widget[] = [
    {
      id: "search-bar",
      classNames: "flex-row",
      content: (
        <>
          <div
            className="widget-container square-widget"
            id="search-ui"
            ref={searchUiRef as React.RefObject<HTMLDivElement>}
          >
            <div className="flex-row" id="location-finder">
              <FontAwesomeIcon
                id="arrow-icon"
                icon={faLocationArrow}
                onClick={findLocationData}
                className={
                  arrowRotate ? "location-icon arrow-rotate" : "location-icon"
                }
              />
              <input
                ref={searchInputRef as React.RefObject<HTMLInputElement>}
                id="location-search"
                className="center-text weather-text"
                value={locationInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                  setLocationInput(e.target.value);
                }}
              />
              <span
                className="location-icon"
                onClick={searchLocationText}
                ref={magnifierRef as React.RefObject<HTMLSpanElement>}
              >
                <FontAwesomeIcon id="search-icon" icon={faSearch} />
              </span>
            </div>
          </div>
          <div
            className="widget-container square-widget flex-column flex-center"
            id="location-display"
          >
            <p className="weather-text center-text">
              <SwitchTransition mode="out-in">
                <CSSTransition
                  key={
                    displayErrorToggle
                      ? "error"
                      : props.location
                      ? whichDisplay
                        ? "coordinates"
                        : "formatted"
                      : "blank"
                  }
                  timeout={500}
                  classNames="fade"
                >
                  {whichDisplayInjection()}
                </CSSTransition>
              </SwitchTransition>
            </p>
          </div>
        </>
      ),
    },
    {
      id: "seven-day-overview",
      classNames: "flex-column flex-center",
      content: (
        <div
          className="widget-container full-dims flex-column flex-center"
          id="seven-day-overview-interior"
        >
          {" "}
          {!props.currentWeather ? (
            <p className="weather-text center-text" key="awaiting-data">
              awaiting data
            </p>
          ) : (
            <>
              {/*<AnimatePresence mode="wait" key="seven-current-animation">
                {weatherDisplay
                  ? sevenDaysAheadWidget()
                  : currentWeatherWelcomeWidget()}{" "}
              </AnimatePresence>*/}
              <SwitchTransition mode="out-in">
                <CSSTransition
                  key={weatherDisplay ? "seven" : "current"}
                  timeout={500}
                  classNames="swipe"
                >
                  {weatherDisplay
                    ? sevenDaysAheadWidget()
                    : currentWeatherWelcomeWidget()}
                </CSSTransition>
              </SwitchTransition>
            </>
          )}
        </div>
      ),
    },
    {
      id: "",
      classNames: "flex-row square-row",
      content: generateWelcomeSquares(
        {
          containerId: "precipitation-container",
          containerContent: generationContents.precipitation,
        },
        {
          containerId: "AQI-container",
          containerContent: generationContents.AQI,
        }
      ),
    },
    {
      id: "",
      classNames: "flex-row square-row",
      content: generateWelcomeSquares(
        {
          containerId: "UV-container",
          containerContent: generationContents.UV,
        },
        {
          containerId: "wind-container",
          containerContent: generationContents.wind,
        }
      ),
    },
    {
      id: "",
      classNames: "flex-row square-row",
      content: generateWelcomeSquares(
        {
          containerId: "pressure-container",
          containerContent: generationContents.pressure,
        },
        {
          containerId: "visibility-container",
          containerContent: generationContents.visibility,
        }
      ),
    },
    {
      id: "",
      classNames: "flex-row square-row",
      content: generateWelcomeSquares(
        {
          containerId: "sunCycle-container",
          containerContent: generationContents.sunCycle,
        },
        {
          containerId: "moonCycle-container",
          containerContent: generationContents.moonCycle,
        }
      ),
    },
  ];
  const generateWidgets = (widgetArray: Widget[]): JSX.Element[] => {
    return widgetArray.map((element: Widget, index: number): JSX.Element => {
      return (
        <motion.div
          initial={{ opacity: 0, y: "+100%", scaleY: 0.5 }}
          animate={{ opacity: 1, y: "0%", scaleY: 1 }}
          transition={{
            ease: "easeInOut",
            duration: 0.15,
            delay: 0.75 + index * 0.1,
          }}
          className={element.classNames}
          id={element.id}
          key={`welcome-widget-${index}`}
        >
          <React.Fragment key={`welcome-${index}`}>
            {element.content}
          </React.Fragment>
        </motion.div>
      );
    });
  };

  // Return Content
  return (
    <div className="widget-pane flex-column" id="welcome-pane">
      {generateWidgets(welcomeWidgets)}
    </div>
  );
}

export default WelcomePane;
