// Package imports
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isSafari } from "react-device-detect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { CSSTransition, SwitchTransition } from "react-transition-group";

// Local importsx
import WelcomePane from "./WelcomePane";
import Precipitation from "./Precipitation";
import Wind from "./Wind";
import AQI from "./AQI";
import UV from "./UV";
import Pressure from "./Pressure";
import Visibility from "./Visibility";
import MoonCycle from "./MoonCycle";
import SunCycle from "./SunCycle";
import CurrentSeven from "./CurrentSeven";
import {
  GenerationContents,
  LatLong,
  Location,
  OpenWeatherData,
  SunriseSunset,
  animatePaneValues,
  animateOpacityValues,
  moonIcons,
  WeatherData,
  OpenPollutionData,
  UviRange,
  HourlyWeather,
  HourlySingle,
} from "./DraumSpaTypes";
import { mainCategoryCodes } from "./WeatherData";

interface CubeContainerProps {
  setBackgroundIndex: React.Dispatch<React.SetStateAction<number>>;
  setLocationSet: React.Dispatch<React.SetStateAction<boolean>>;
}

function CubeContainer(props: CubeContainerProps): React.ReactElement {
  /* Rotation Logic:
        - Store face as state
        - Store transform variable as state 
        - Store safariToggle as state on the basis of third-party isSafari module on page load []
        - Rotate cuboid differentially in response to change in face on the basis of whether browser is Safari or not. Firefox & Chrome require standard rotational values, Safari requires infinitessimally small offset. */
  const [face, setFace]: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ] = useState<string>("front");
  const [transform, setTransform]: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ] = useState<string>("rotateX(0deg) rotateY(0deg)");
  const [safariToggle, setSafariToggle]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);
  useEffect((): void => {
    if (isSafari) {
      setSafariToggle(true);
    } else setSafariToggle(false);
  }, []);
  useEffect((): void => {
    switch (face) {
      case "front":
        setTransform("rotateX(0deg) rotateY(0deg)");
        break;
      case "right":
        if (safariToggle) {
          setTransform("rotateX(0deg) rotateY(-90.000000000001deg)"); // necessary to avoid bugs in safari but causes bugs in chrome & firefox
        } else setTransform("rotateX(0deg) rotateY(-90deg)");
        break;
    }
  }, [face, safariToggle]);

  /* Highest level location and weather data logic:
    - Location State Object: Co-ordinates & Formatted Addres. State held in CubeContainer, managed by WelcomePane. Google API call logic held in WelcomePane.
    - openWeatherData: state holding all/most weather data points, held within CubeContainer
    - sunriseSunset: state holding details sunrise/sunset values, managed by WelcomePane.
    - getOpenWeatherData fn: called within WelcomePane. Held here because of some syntactical issues passing props (I think) */
  const [location, setLocation]: [
    Location | null,
    React.Dispatch<React.SetStateAction<Location | null>>
  ] = useState<Location | null>(null);
  const [openWeatherData, setOpenWeatherData]: [
    OpenWeatherData | null,
    React.Dispatch<React.SetStateAction<OpenWeatherData | null>>
  ] = useState<OpenWeatherData | null>(null);
  const [pollution, setPollution]: [
    OpenPollutionData | null,
    React.Dispatch<React.SetStateAction<OpenPollutionData | null>>
  ] = useState<OpenPollutionData | null>(null);
  const [hourlyWeather, setHourlyWeather]: [
    HourlyWeather[] | null,
    React.Dispatch<React.SetStateAction<HourlyWeather[] | null>>
  ] = useState<HourlyWeather[] | null>(null);

  useEffect((): void => {
    if (!location) return;
    else props.setLocationSet(true);
  }, [location]);

  const [sunriseSunset, setSunriseSunset]: [
    SunriseSunset | null,
    React.Dispatch<React.SetStateAction<SunriseSunset | null>>
  ] = useState<SunriseSunset | null>(null);
  // OpenWeatherMap API Call
  const getOpenWeatherData = async (): Promise<void> => {
    if (!location) return;
    const openWeatherMapApiKey: string = "c1ae4de95a65472dd852880564d777ff";
    const { latitude, longitude }: LatLong = location.coordinates;
    const openUrl: string = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&appid=${openWeatherMapApiKey}`;
    const pollutionUrl: string = `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${latitude}&lon=${longitude}&appid=${openWeatherMapApiKey}`;
    try {
      const response: Response = await fetch(openUrl);
      if (response.ok) {
        console.log(`response ok`);
        const data: OpenWeatherData = await response.json();
        // console.log(JSON.stringify(data));
        setOpenWeatherData(data);
        const hourly: HourlyWeather[] = data.hourly;
        setHourlyWeather(hourly);
      }
    } catch (error: any) {
      console.error(`Open Weather API error: ${error}`);
    }
    try {
      const response: Response = await fetch(pollutionUrl);
      if (response.ok) {
        console.log(`response ok`);
        const data: OpenPollutionData = await response.json();
        // console.log(JSON.stringify(data));
        setPollution(data);
      }
    } catch (error: any) {
      console.error(`Open Pollution API error: ${error}`);
    }
  };

  /* States held by CubeContainer but managed by WelcomePane:
- isDay: state & useEffect which changes background in respones to isDay boolean value change. setIsDay passed as props to WelcomePane to be managed therein.
-  until: state records time until dawn/dusk. passed to WelcomePane and SunCycle. setUntil passed as props to WelcomePane to be managed therein.
- timeZone: a string state, similarly passed as props to WelcomePane to be managed therein. 
- convertUnixToTimeString: converts numerical Epoch times to date strings relevant to a given timezone. Used in multiple widgets.
*/
  const [isDay, setIsDay]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(true);
  useEffect(() => {
    if (!openWeatherData) {
      if (isDay) {
        props.setBackgroundIndex(0);
      } else props.setBackgroundIndex(6);
    } else {
      console.log(JSON.stringify(openWeatherData.current.weather[0]));
      const index: number = isDay ? 0 : 1;
      const weatherCode: number = openWeatherData.current.weather[0].id;
      if (weatherCode in mainCategoryCodes) {
        const backgroundIndex: number =
          mainCategoryCodes[weatherCode].backgroundIndices[index];
        props.setBackgroundIndex(backgroundIndex);
      }
    }
  }, [isDay, openWeatherData]);
  const [until, setUntil]: [
    number | null,
    React.Dispatch<React.SetStateAction<number | null>>
  ] = useState<number | null>(null);
  const [timeZone, setTimeZone]: [
    string | null,
    React.Dispatch<React.SetStateAction<string | null>>
  ] = useState<string | null>(null);
  const convertUnixToTimeString = (
    unixTimeStamp: number,
    timezone: string | null
  ): string => {
    if (!timezone) return "";
    const date = new Date(unixTimeStamp * 1000);
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    };
    const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(
      "en-US",
      options
    );
    const timeString: string = formatter.format(date);
    return timeString;
  };

  /* Widgets functions that return JSX:
  - generateTitleBar: used within all secondary panes
  - sunCycleWidget: used to display information in both WelcomePane and SunCycle
  */
  const generateTitleBar = (titleText: string): JSX.Element => {
    return (
      <div className="widget-container title-bar flex-row">
        {" "}
        <FontAwesomeIcon
          icon={faArrowLeft}
          className="back-icon"
          onClick={(): void => {
            setFace("front");
            setRightFace("default");
          }}
        />
        <p
          className="weather-text center-text"
          id={
            titleText === "Hourly & Daily Forecast" ? "hourly-line-height" : ""
          }
        >
          {titleText}
        </p>
      </div>
    );
  };
  // Sun Logic
  const [dayLengthMins, setDayLengthMins]: [
    number | null,
    React.Dispatch<React.SetStateAction<number | null>>
  ] = useState<number | null>(null);
  const [nightLengthMins, setNightLengthMins]: [
    number | null,
    React.Dispatch<React.SetStateAction<number | null>>
  ] = useState<number | null>(null);
  const [whichSunText, setWhichSunText]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);
  useEffect((): void | (() => void) => {
    if (!location || !sunriseSunset || face === "front") return;
    const whichSunTimer: NodeJS.Timeout | number = setTimeout((): void => {
      setWhichSunText((prev: boolean): boolean => !prev);
    }, 5000);
    return (): void => {
      clearTimeout(whichSunTimer);
    };
  }, [location, whichSunText, sunriseSunset, face]);
  const sunCycleWidget = (sunWidgetLocation?: string): JSX.Element => {
    if (!until) return <></>;
    let minutesUntil: string = "";
    let hoursUntil: string = "";
    const hours: number = Math.floor(until / 60);
    const minutes: number = Math.round(until % 60);
    hoursUntil = hours.toString();
    minutesUntil = minutes.toString();
    let dayLength: JSX.Element = <></>;
    let nightLength: JSX.Element = <></>;
    if (dayLengthMins && nightLengthMins) {
      const dayHours: number = Math.floor(dayLengthMins / 60);
      const dayMinutes: number = Math.round(dayLengthMins % 60);
      dayLength = (
        <>
          {dayHours} <span className="suntime">hours, </span>
          {dayMinutes} <span className="suntime">minutes</span>
        </>
      );
      const nightHours: number = Math.floor(nightLengthMins / 60);
      const nightMinutes: number = Math.round(nightLengthMins % 60);
      nightLength = (
        <>
          {nightHours} <span className="suntime">hours,</span>
          {nightMinutes} <span className="suntime">minutes</span>
        </>
      );
    }
    const untilTextContent: JSX.Element =
      hours > 0 ? (
        <React.Fragment key="hours">
          {hoursUntil} <span className="suntime">hours,</span> {minutesUntil}{" "}
          <span className="suntime">
            minutes until {isDay ? "dusk" : "dawn"}
          </span>
        </React.Fragment>
      ) : (
        <React.Fragment key="minutes">
          {minutesUntil}{" "}
          <span className="suntime">
            {" "}
            minutes until {isDay ? "dusk" : "dawn"}
          </span>
        </React.Fragment>
      );
    const UntilText: JSX.Element = sunWidgetLocation ? (
      <motion.div
        {...animateOpacityValues}
        className="full-dims flex-column flex-center"
        id="dawn-dusk-welcome"
        key="front-sun"
      >
        <p className="weather-text center-text">
          <em>{isDay ? "'til dusk" : "'til dawn"}</em>
        </p>
        <p
          className="weather-text flex-row visibility-span"
          id="hours-minutes-text"
        >
          {" "}
          {hours > 0 ? (
            <React.Fragment key="light-hours">
              <span>
                <span style={{ fontWeight: 500 }}>{hoursUntil}</span>{" "}
                <span className="light">hrs</span>
              </span>
              <span>
                <span style={{ fontWeight: 500 }}>{minutesUntil}</span>{" "}
                <span className="light">mins</span>
              </span>
            </React.Fragment>
          ) : (
            <span className="center-text" key="light-minutes">
              <span style={{ fontWeight: 500 }}>{minutesUntil}</span>{" "}
              <span className="light">mins</span>
            </span>
          )}
        </p>
      </motion.div>
    ) : (
      <p key="until-text">{untilTextContent}</p>
    );
    const LightText: JSX.Element = (
      <p key="light-text">
        {dayLength} <span className="suntime">light</span>
      </p>
    );
    const DarkText: JSX.Element = (
      <p key="light-text">
        {nightLength}
        <span className="suntime">dark</span>
      </p>
    );
    if (sunWidgetLocation === "front") {
      return UntilText;
    } else
      return (
        <SwitchTransition mode="out-in">
          <CSSTransition
            key={whichSunText ? "which" : isDay ? "day" : "night"}
            timeout={1000}
            classNames="fade"
          >
            {whichSunText ? UntilText : isDay ? LightText : DarkText}
          </CSSTransition>
        </SwitchTransition>
      );
  };
  // Moon Logic
  const [moonPhaseIndex, setMoonPhaseIndex]: [
    number | null,
    React.Dispatch<React.SetStateAction<number | null>>
  ] = useState<number | null>(null);
  useEffect((): void => {
    if (!openWeatherData) return;
    const moonPhase: number = openWeatherData.daily[0].moon_phase;
    if (0 <= moonPhase && moonPhase <= 0.03125) {
      setMoonPhaseIndex(1);
    } else if (0.0315 < moonPhase && moonPhase <= 0.09375) {
      setMoonPhaseIndex(2);
    } else if (0.09375 < moonPhase && moonPhase <= 0.15625) {
      setMoonPhaseIndex(2);
    } else if (0.15625 < moonPhase && moonPhase <= 0.21875) {
      setMoonPhaseIndex(2);
    } else if (0.21875 < moonPhase && moonPhase <= 0.28125) {
      setMoonPhaseIndex(3);
    } else if (0.28125 < moonPhase && moonPhase <= 0.34375) {
      setMoonPhaseIndex(4);
    } else if (0.34375 < moonPhase && moonPhase <= 0.40625) {
      setMoonPhaseIndex(4);
    } else if (0.40625 < moonPhase && moonPhase <= 0.46875) {
      setMoonPhaseIndex(4);
    } else if (0.46875 < moonPhase && moonPhase <= 0.53125) {
      setMoonPhaseIndex(5);
    } else if (0.53125 < moonPhase && moonPhase <= 0.59375) {
      setMoonPhaseIndex(6);
    } else if (0.59375 < moonPhase && moonPhase <= 0.65625) {
      setMoonPhaseIndex(6);
    } else if (0.65625 < moonPhase && moonPhase <= 0.71875) {
      setMoonPhaseIndex(6);
    } else if (0.71875 < moonPhase && moonPhase <= 0.78125) {
      setMoonPhaseIndex(7);
    } else if (0.78125 < moonPhase && moonPhase <= 0.84375) {
      setMoonPhaseIndex(8);
    } else if (0.84375 < moonPhase && moonPhase <= 0.90625) {
      setMoonPhaseIndex(8);
    } else if (0.90625 < moonPhase && moonPhase <= 0.96875) {
      setMoonPhaseIndex(8);
    } else if (0.96875 < moonPhase && moonPhase <= 1) {
      setMoonPhaseIndex(1);
    }
  }, [openWeatherData]);
  const moonDisplayWidget = (): JSX.Element => {
    if (!openWeatherData) return <></>;
    let srcIndex: number | null = null;
    const moonPhase: number = openWeatherData.daily[0].moon_phase;
    if (0 <= moonPhase && moonPhase <= 0.03125) {
      srcIndex = 15;
    } else if (0.0315 < moonPhase && moonPhase <= 0.09375) {
      srcIndex = 0;
    } else if (0.09375 < moonPhase && moonPhase <= 0.15625) {
      srcIndex = 1;
    } else if (0.15625 < moonPhase && moonPhase <= 0.21875) {
      srcIndex = 2;
    } else if (0.21875 < moonPhase && moonPhase <= 0.28125) {
      srcIndex = 3;
    } else if (0.28125 < moonPhase && moonPhase <= 0.34375) {
      srcIndex = 4;
    } else if (0.34375 < moonPhase && moonPhase <= 0.40625) {
      srcIndex = 5;
    } else if (0.40625 < moonPhase && moonPhase <= 0.46875) {
      srcIndex = 6;
    } else if (0.46875 < moonPhase && moonPhase <= 0.53125) {
      srcIndex = 7;
    } else if (0.53125 < moonPhase && moonPhase <= 0.59375) {
      srcIndex = 8;
    } else if (0.59375 < moonPhase && moonPhase <= 0.65625) {
      srcIndex = 9;
    } else if (0.65625 < moonPhase && moonPhase <= 0.71875) {
      srcIndex = 10;
    } else if (0.71875 < moonPhase && moonPhase <= 0.78125) {
      srcIndex = 11;
    } else if (0.78125 < moonPhase && moonPhase <= 0.84375) {
      srcIndex = 12;
    } else if (0.84375 < moonPhase && moonPhase <= 0.90625) {
      srcIndex = 13;
    } else if (0.90625 < moonPhase && moonPhase <= 0.96875) {
      srcIndex = 14;
    } else if (0.96875 < moonPhase && moonPhase <= 1) {
      srcIndex = 15;
    }
    return (
      <div className="flex-column flex-center full-dims">
        {" "}
        <img
          id="moon-img"
          alt="moong-image"
          src={moonIcons[srcIndex as number]}
        />
      </div>
    );
  };

  // Current Weather Logic
  const [currentWeather, setCurrentWeather]: [
    WeatherData | null,
    React.Dispatch<React.SetStateAction<WeatherData | null>>
  ] = useState<WeatherData | null>(null);
  const getCurrentWeather = (): void => {
    if (!openWeatherData) return;
    setCurrentWeather(openWeatherData.current.weather[0]);
  };
  useEffect((): void => {
    getCurrentWeather();
  }, [openWeatherData]);

  // Precipitation logic
  const precipitationTextWidget = (): JSX.Element => {
    if (!currentWeather) return <></>;
    const key: number = currentWeather.id;
    let textContent1: string | null = null;
    let textContent2: string | null = null;
    switch (mainCategoryCodes[key].mainCategory) {
      case "Clear":
        textContent1 = "the sun has got his hat on";
        textContent2 = "precipitation unlikely";
        break;
      case "Clouds":
        textContent1 = "it's cloudy out";
        textContent2 = "precipitation possible";
        break;
      case "Snow":
        textContent1 = "wintry precipitate";
        textContent2 = "snowflakes in the air";
        break;
      case "Rain":
        switch (mainCategoryCodes[key].description) {
          case "light rain":
          case "light intensity shower rain":
            textContent1 = "light to moderate rain";
            textContent2 = "remember your umbrella";
            break;
          default:
            textContent1 = "serious rain";
            textContent2 = "dash to the car";
        }
        break;
      case "Drizzle":
        textContent1 = "drizzly bears!";
        textContent2 = "you'll be soaked by the spray";
        break;
      case "Thunderstorm":
        textContent1 = "thunder & lightning";
        textContent2 = "take a brolly for the nighting";
        break;
      default:
        textContent1 = "atmospheric conditions";
        textContent2 = "rain not expected";
    }
    return (
      <div className="full-dims flex-column flex-center">
        <p className="weather-text center-text">{textContent2}</p>
        <p className="weather-text center-text">
          <em>{textContent1}</em>
        </p>
        <p className="weather-text flex-row visibility-span">
          {" "}
          <span>cloud cover</span>{" "}
          <span style={{ fontWeight: 500 }}>
            {openWeatherData?.current.clouds}%
          </span>
        </p>
      </div>
    );
  };
  const [displayMetres, setDisplayMetres]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(0);
  const [displayHumidity, setDisplayHumidity]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(0);
  const [humidityToggleAndLimit, setHumidityToggleAndLimit]: [
    number | null,
    React.Dispatch<React.SetStateAction<number | null>>
  ] = useState<number | null>(null);
  useEffect((): void | (() => void) => {
    if (!humidityToggleAndLimit || humidityToggleAndLimit < displayHumidity) {
      setDisplayHumidity(0);
      return;
    }
    let humidityTimer: NodeJS.Timeout | number = 0;
    if (displayHumidity < humidityToggleAndLimit) {
      humidityTimer = setTimeout((): void => {
        setDisplayHumidity((prev: number): number => prev + 1);
      }, 12.5);
    }
    return (): void => {
      clearTimeout(humidityTimer);
    };
  }, [humidityToggleAndLimit, displayHumidity]);
  useEffect((): void => {
    if (!openWeatherData) return;
    const visibility: number = openWeatherData.current.visibility;
    const humidity: number = openWeatherData.current.humidity;
    // console.log(openWeatherData.current.visibility);
    setDisplayMetres(visibility);
    setHumidityToggleAndLimit(humidity);
  }, [openWeatherData]);

  const visibilityHumidityTextWidget = (): JSX.Element => {
    if (!openWeatherData) return <></>;

    return (
      <div className="full-dims flex-column flex-center">
        {" "}
        <p className="weather-text flex-row visibility-span">
          <span>visibility</span>
          <span style={{ fontWeight: 500 }}> {displayMetres / 1000}km</span>
        </p>
        <p className="weather-text flex-row visibility-span">
          <span>humidity</span>
          <span style={{ fontWeight: 500 }}> {displayHumidity}%</span>
        </p>
      </div>
    );
  };

  // Bar Pressure Logic
  const notch = (
    angle: number,
    index: number,
    width: number,
    qualifier?: string
  ): JSX.Element => {
    return (
      <div
        className={
          !qualifier
            ? "notch"
            : index === 0 || index % 4 === 0
            ? "notch-small"
            : index % 2 === 1
            ? "notch-small"
            : "notch"
        }
        key={`notch-${index}`}
        style={{
          transform: `rotate(${angle}deg) translateY(-${
            width / 2.5
          }px) translateX(-50%)`,
        }}
      />
    );
  };
  const pressureGaugeRef: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);
  const [rotationState, setRotationState]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(-135);
  useEffect((): void => {
    if (!openWeatherData) return;
    const pressure: number = openWeatherData.current.pressure;
    const proportion: number = (pressure - 950) / 100;
    const rotation: number = proportion * 270 - 135;
    setRotationState(rotation);
  }, [openWeatherData]);

  const barPressureWidget = (): JSX.Element => {
    if (!openWeatherData) return <></>;
    let width: number = 0;
    if (pressureGaugeRef.current) {
      width = pressureGaugeRef.current.getBoundingClientRect().width;
    }
    const gauge = (): JSX.Element => {
      const numberOfNotches: number = 11;
      const notches: number[] = Array.from(
        { length: numberOfNotches } as { length: number },
        (_value: undefined, index: number) => {
          const angle: number = -135 + index * (270 / (numberOfNotches - 1));
          // -135 is our starting point, 270 is the total degrees of rotation towards +135deg, 270 is divided by number-1 to represent the rotational distance between each tick, multiplied by index such that first item in index adds nothing and final (index: number-1) = 270.
          return angle;
        }
      );
      return (
        <div
          id="pressure-gauge"
          className="gauge"
          ref={pressureGaugeRef as React.RefObject<HTMLDivElement>}
        >
          {notches.map((angle: number, index: number): JSX.Element => {
            if (!pressureGaugeRef.current)
              return <React.Fragment key={index} />;
            return notch(angle, index, width);
          })}
        </div>
      );
    };

    // console.log(pressure);
    return (
      <div className="full-dims bar-pressure-diagram-container">
        <div className="bar-pressure-diagram">
          <div className="full-dims bar-pressure-diagram-inner flex-column flex-center">
            {gauge()}
            <div className="full-dims annotation-container">
              <div className="full-dims annotation-container-inner">
                {" "}
                <p className="annotation pressure-reading" id="a950">
                  950
                </p>
                <p className="annotation pressure-reading" id="a1000">
                  1000
                </p>
                <p className="annotation pressure-reading" id="a1050">
                  1050
                </p>
              </div>
            </div>
            <div className="full-dims annotation-container">
              <div className="full-dims annotation-container-inner">
                <p className="pressure-text">hPa</p>
                <motion.div
                  id="arrow"
                  initial={{
                    transform: `translateX(-50%) translateY(-100%) rotate(-135deg)`,
                  }}
                  animate={{
                    transform: `translateX(-50%) translateY(-100%) rotate(${rotationState}deg)`,
                  }}
                  transition={{
                    type: "spring",
                    damping: 10,
                    stiffness: 100,
                    delay: 0.5,
                  }}
                  style={{
                    borderBottom: `${width / 2}px solid rgb(182, 1, 1)`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Wind Logic
  const windGaugeRef: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);
  const windWidget = (): JSX.Element => {
    if (!openWeatherData) return <></>;
    const windSpeed: number = openWeatherData.current.wind_speed;
    const windDirection: number = openWeatherData.current.wind_deg;
    const windWidth: number = windGaugeRef.current
      ? windGaugeRef.current.getBoundingClientRect().width
      : 0;
    const windGauge = (): JSX.Element => {
      const numberOfNotches: number = 17;
      const notches: number[] = Array.from(
        { length: numberOfNotches } as { length: number },
        (_value: undefined, index: number) => {
          const angle: number = index * (360 / (numberOfNotches - 1));
          return angle;
        }
      );
      return (
        <div
          id="wind-gauge"
          className="gauge"
          ref={windGaugeRef as React.RefObject<HTMLDivElement>}
          key="wind-gauge"
        >
          {notches.map((angle: number, index: number): JSX.Element => {
            if (!windGaugeRef.current) return <React.Fragment key={index} />;

            return (
              <React.Fragment key={`notch-container-${index}`}>
                {notch(angle, index, windWidth, "yes")}
              </React.Fragment>
            );
          })}
        </div>
      );
    };
    return (
      <div className="full-dims bar-pressure-diagram-container">
        <div className="bar-pressure-diagram">
          <div className="full-dims bar-pressure-diagram-inner flex-column flex-center">
            {windGauge()}
            <div
              className="full-dims annotation-container"
              style={{ zIndex: 1 }}
            >
              <div className="full-dims annotation-container-inner">
                {" "}
                <p className="annotation direction" id="north">
                  N
                </p>
                <p className="annotation direction" id="south">
                  S
                </p>
                <p className="annotation direction" id="east">
                  E
                </p>
                <p className="annotation direction" id="west">
                  W
                </p>
              </div>
            </div>
            <div className="full-dims annotation-container">
              <div className="full-dims annotation-container-inner">
                <p id="mph" className="pressure-text">
                  {(windSpeed * 2.23694).toFixed(0)}
                  <span id="mph-indicator">mph</span>
                </p>
                <motion.img
                  id="wind-arrow"
                  src="./arrow.png"
                  style={{ height: windWidth }}
                  initial={{
                    transform: `translate(0%, 7%) scale(0) rotate(0)`,
                  }}
                  animate={{
                    transform: `translate(0%, 7%) scale(1.1) rotate(${
                      windDirection - 180
                    }deg)`,
                  }}
                  transition={{
                    type: "spring",
                    damping: 10,
                    stiffness: 100,
                    delay: 0.5,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // AQI Logic
  const [aqiTiny, setAqiTiny]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);
  useEffect((): (() => void) => {
    const aqiEval = (): void => {
      if (window.innerWidth < 600) {
        setAqiTiny(true);
      }
      else setAqiTiny(false) 
    };
    aqiEval();
    window.addEventListener("resize", aqiEval);
    return (): void => {
      window.removeEventListener("resize", aqiEval);
    };
  }, []);

  const aqiRef: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);
  const aqiDisplayWidget = (): JSX.Element => {
    if (!pollution) return <></>;
    const aqiWidth: number = aqiRef.current
      ? aqiRef.current.getBoundingClientRect().width
      : 0;
    const aqi: number = pollution.list[0].main.aqi;
    const aqiProportion: number = aqi / 5;
    const aqiDescriptions: { [key: number]: string } = {
      1: "good",
      2: "fair",
      3: "moderate",
      4: "poor",
      5: "very poor",
    };
    return (
      <div className="meter-container full-dims flex-column">
        <p className="aqi-text flex-row">
          <span>
            <span className="all-caps">AQI INDEX :</span>
          </span>{" "}
          <span style={{ fontWeight: 500 }}>{aqi}</span>{" "}
          {!aqiTiny && (
            <span>
              <em>{aqiDescriptions[aqi]}</em>{" "}
            </span>
          )}{" "}
        </p>

        <div className="meter" ref={aqiRef as React.RefObject<HTMLDivElement>}>
          <motion.div
            className="meter-indicator"
            initial={{
              transform: `translateX(-0%) scale(0)`,
            }}
            animate={{
              transform: `translateX(calc(${
                aqiProportion * aqiWidth
              }px - 50%)) scale(1)`,
            }}
            transition={{
              type: "spring",
              damping: 10,
              stiffness: 100,
              delay: 0.5,
            }}
          />
        </div>
      </div>
    );
  };

  //UV & Cloud Cover Logic
  const uvRef: React.RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement | null>(null);
  const ultravioletCloudWidget = (): JSX.Element => {
    if (!openWeatherData) return <></>;
    const uvi: number = openWeatherData.current.uvi;
    const uviRanges: UviRange[] = [
      {
        min: 0,
        max: 2,
        description: (
          <p className="aqi-text">
            <span className="all-caps">LOW</span>:{" "}
            <span className="uv-description">wear SPF15+</span>
          </p>
        ),
      },
      {
        min: 3,
        max: 5,
        description: (
          <p className="aqi-text">
            <span className="uv-category">MODERATE</span>:{" "}
            <span className="uv-description">wear SPF15+</span>
          </p>
        ),
      },
      {
        min: 6,
        max: 7,
        description: (
          <p className="aqi-text">
            <span className="uv-category">HIGH</span>:{" "}
            <span className="uv-description">wear SPF30+</span>
          </p>
        ),
      },
      {
        min: 8,
        max: 10,
        description: (
          <p className="aqi-text">
            <span className="uv-category">VERY HIGH</span>:{" "}
            <span className="uv-description">seek shade</span>
          </p>
        ),
      },
      {
        min: 11,
        max: Infinity,
        description: (
          <p className="aqi-text">
            <span className="uv-category">EXTREME</span>:{" "}
            <span className="uv-description">stay indoors</span>
          </p>
        ),
      },
    ];
    const findUviRange = (uvi: number): UviRange | undefined => {
      return uviRanges.find((range: UviRange): boolean => {
        return uvi >= range.min && uvi <= range.max;
      });
    };
    const uviDescription: JSX.Element | undefined =
      findUviRange(uvi)?.description;
    const uvWidth: number = uvRef.current
      ? uvRef.current.getBoundingClientRect().width
      : 0;
    const uviProportion: number = uvi / 11;
    return (
      <div className="meter-container full-dims flex-column">
        <p className="aqi-text flex-row flex-center">
          <span className="all-caps">UV INDEX :</span>{" "}
          <span style={{ fontWeight: 500 }}>{uvi}</span>
        </p>
        <div className="meter" ref={uvRef as React.RefObject<HTMLDivElement>}>
          <motion.div
            className="meter-indicator"
            initial={{
              transform: `translateX(-0%) scale(0)`,
            }}
            animate={{
              transform: `translateX(calc(${
                uviProportion * uvWidth
              }px - 50%)) scale(1)`,
            }}
            transition={{
              type: "spring",
              damping: 10,
              stiffness: 100,
              delay: 0.5,
            }}
          />
        </div>
        {uviDescription ?? uviDescription}
      </div>
    );
  };

  // Conditional Rendering Right Pane
  const [rightFace, setRightFace]: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ] = useState<string>("default");
  const returnRightFace = (): JSX.Element => {
    const faceToShow = rightFace ?? "default";
    const faces: GenerationContents = {
      default: <></>,
      weekAhead: (
        <motion.div
          {...animatePaneValues}
          className="right-pane-motion"
          key="weekAhead"
        >
          <CurrentSeven
            setFace={setFace}
            generateTitleBar={generateTitleBar}
            hourlySingleGenerator={hourlySingleGenerator}
            openWeatherData={openWeatherData}
          />
        </motion.div>
      ),
      precipitation: (
        <motion.div
          {...animatePaneValues}
          className="right-pane-motion"
          key="visibility"
        >
          <Precipitation
            setFace={setFace}
            generateTitleBar={generateTitleBar}
            hourlySingleGenerator={hourlySingleGenerator}
          />
        </motion.div>
      ),
      wind: (
        <motion.div
          {...animatePaneValues}
          className="right-pane-motion"
          key="visibility"
        >
          <Wind
            setFace={setFace}
            generateTitleBar={generateTitleBar}
            hourlySingleGenerator={hourlySingleGenerator}
          />{" "}
        </motion.div>
      ),
      AQI: (
        <motion.div
          {...animatePaneValues}
          className="right-pane-motion"
          key="visibility"
        >
          <AQI
            setFace={setFace}
            generateTitleBar={generateTitleBar}
            hourlySingleGenerator={hourlySingleGenerator}
            pollution={pollution}
          />
        </motion.div>
      ),
      UV: (
        <motion.div
          {...animatePaneValues}
          className="right-pane-motion"
          key="visibility"
        >
          <UV
            setFace={setFace}
            generateTitleBar={generateTitleBar}
            hourlySingleGenerator={hourlySingleGenerator}
          />{" "}
        </motion.div>
      ),
      pressure: (
        <motion.div
          {...animatePaneValues}
          className="right-pane-motion"
          key="visibility"
        >
          <Pressure
            setFace={setFace}
            generateTitleBar={generateTitleBar}
            hourlySingleGenerator={hourlySingleGenerator}
          />{" "}
        </motion.div>
      ),
      visibility: (
        <motion.div
          {...animatePaneValues}
          className="right-pane-motion"
          key="visibility"
        >
          <Visibility
            setFace={setFace}
            generateTitleBar={generateTitleBar}
            hourlySingleGenerator={hourlySingleGenerator}
          />
        </motion.div>
      ),
      sunCycle: (
        <motion.div
          {...animatePaneValues}
          className="right-pane-motion"
          key="sun-cycle"
        >
          <SunCycle
            setFace={setFace}
            generateTitleBar={generateTitleBar}
            until={until}
            sunCycleWidget={sunCycleWidget}
            isDay={isDay}
            openWeatherData={openWeatherData}
            timeZone={timeZone}
            sunriseSunset={sunriseSunset}
            setDayLengthMins={setDayLengthMins}
            dayLengthMins={dayLengthMins}
            setNightLengthMins={setNightLengthMins}
            nightLengthMins={nightLengthMins}
            convertUnixToTimeString={convertUnixToTimeString}
          />
        </motion.div>
      ),
      moonCycle: (
        <motion.div
          {...animatePaneValues}
          className="right-pane-motion"
          key="moon-cycle"
        >
          <MoonCycle
            setFace={setFace}
            generateTitleBar={generateTitleBar}
            moonDisplayWidget={moonDisplayWidget}
            openWeatherData={openWeatherData}
            convertUnixToTimeString={convertUnixToTimeString}
            timeZone={timeZone}
            moonPhaseIndex={moonPhaseIndex}
          />
        </motion.div>
      ),
    };
    return <AnimatePresence mode="wait">{faces[faceToShow]}</AnimatePresence>;
  };

  // Graph Generation Function
  const hourlySingleGenerator = (
    variable: keyof HourlyWeather
  ): HourlySingle[] => {
    if (!hourlyWeather) return [];
    const simplifiedHourlyArray: HourlySingle[] = hourlyWeather.map(
      (hour: HourlyWeather): HourlySingle => {
        let value: number = 0;
        if (
          typeof hour[variable] === "number" &&
          !Array.isArray(hour[variable])
        ) {
          value = hour[variable] as number;
        }
        if (!hourlyWeather)
          return {
            [variable]: value,
            timestamp: 0,
          };
        const timestamp: number = hour.dt;
        const processedTimestamp: number =
          (timestamp - hourlyWeather[0].dt) / 60 / 60;
        return { [variable]: value, timestamp: processedTimestamp };
      }
    );
    return simplifiedHourlyArray;
  };

  return (
    <motion.div
      id="cube-scale"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        ease: "easeInOut",
        duration: 0.5,
      }}
    >
      <div
        id="cube"
        className="flex-column flex-center"
        style={{ transform: transform }}
      >
        <div className="face transparency-container" id="front">
          <WelcomePane
            setFace={setFace}
            face={face}
            setRightFace={setRightFace}
            setIsDay={setIsDay}
            isDay={isDay}
            setUntil={setUntil}
            until={until}
            sunCycleWidget={sunCycleWidget}
            location={location}
            setLocation={setLocation}
            getOpenWeatherData={getOpenWeatherData}
            openWeatherData={openWeatherData}
            timeZone={timeZone}
            setTimeZone={setTimeZone}
            sunriseSunset={sunriseSunset}
            setSunriseSunset={setSunriseSunset}
            moonDisplayWidget={moonDisplayWidget}
            currentWeather={currentWeather}
            precipitationTextWidget={precipitationTextWidget}
            visibilityHumidityTextWidget={visibilityHumidityTextWidget}
            barPressureWidget={barPressureWidget}
            windWidget={windWidget}
            aqiDisplayWidget={aqiDisplayWidget}
            ultravioletCloudWidget={ultravioletCloudWidget}
          />
        </div>
        <div className="face transparency-container" id="back" />
        <div className="face transparency-container" id="right">
          {" "}
          {rightFace ? (returnRightFace() as JSX.Element) : ""}
        </div>
        <div className="face transparency-container" id="left" />
        <div
          className="face transparency-container"
          id="top"
          style={{ opacity: 0 }}
        />
        <div
          className="face transparency-container"
          id="bottom"
          style={{ opacity: 0 }}
        />
      </div>
    </motion.div>
  );
}

export default CubeContainer;
