//Module Imports
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Local imports
import { OpenWeatherData, SunriseSunset } from "./DraumSpaTypes";

interface SunCycleProps {
  setFace: React.Dispatch<React.SetStateAction<string>>;
  generateTitleBar: (titleText: string) => JSX.Element;
  until: number | null;
  sunCycleWidget: () => JSX.Element;
  isDay: boolean;
  openWeatherData: OpenWeatherData | null;
  timeZone: string | null;
  sunriseSunset: SunriseSunset | null;
  dayLengthMins: number | null;
  setDayLengthMins: React.Dispatch<React.SetStateAction<number | null>>;
  nightLengthMins: number | null;
  setNightLengthMins: React.Dispatch<React.SetStateAction<number | null>>;
  convertUnixToTimeString: (
    unixTimeStamp: number,
    timezone: string | null
  ) => string;
}

export default function SunCycle(props: SunCycleProps): React.ReactElement {
  // Proportion Calculations
  const calculateDayNightLength = () => {
    if (!props.sunriseSunset) return;
    const day: number = parseInt(props.sunriseSunset.day_length);
    const dayLength: number = day / 60;
    props.setDayLengthMins(dayLength);
    props.setNightLengthMins(1440 - dayLength);
  };
  useEffect((): void => {
    calculateDayNightLength();
  }, []);
  const [proportion, setProportion]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(0);
  const calculateProportion = () => {
    if (!props.dayLengthMins || !props.nightLengthMins || !props.until) return;
    let proportion: number = 0;
    if (props.isDay) {
      const used: number = props.dayLengthMins - props.until;
      proportion = used / props.dayLengthMins;
    } else {
      const used: number = props.nightLengthMins - props.until;
      proportion = used / props.nightLengthMins;
    }
    setProportion(proportion * 100);
  };
  useEffect((): void => {
    calculateProportion();
  }, [props.nightLengthMins, props.dayLengthMins]);

  /* Content generation logic section. 
    - Generate simple am / pm text for sunrise & sunset. Am leaving this using the openWeatherData points because otherwise it requires a different way of calculating timezones etc and that makes my brain hurt. The "time until dawn/dusk" calculations use SunriseSunset API but they are displaying different pieces of information so it appears consistent. If someone calculated the time difference based on the rendered sunrise / sunset times there could potentially be a discrepancy if openWeatherMap & SunriseSunet APIs are using different times.
    - Sun Diagram draws a diagram of the day / night dial on the basis of the proportion calculations described above then injects the text described above into itself. */
  const sunRiseSetTextGenerator = (): JSX.Element => {
    if (!props.openWeatherData || !props.timeZone) return <></>;
    const sunset: number = props.openWeatherData.daily[0].sunset;
    const sunrise: number = props.openWeatherData.daily[0].sunrise;
    const sunriseString: string = props.convertUnixToTimeString(
      sunrise,
      props.timeZone
    );
    const sunsetString: string = props.convertUnixToTimeString(
      sunset,
      props.timeZone
    );
    const sunriseTime: string = sunriseString.slice(0, -3);
    const sunriseMeridiem: string = sunriseString.slice(-2);
    const sunsetTime: string = sunsetString.slice(0, -3);
    const sunsetMeridiem: string = sunsetString.slice(-2);

    return (
      <div>
        <p style={{ fontSize: "min(3.3vh, 1.9rem)" }}>
          {sunriseTime}
          <span className="suntime">
            {" "}
            <span className="meridiem">{sunriseMeridiem}</span> //{" "}
          </span>
          {sunsetTime} <span className="meridiem">{sunsetMeridiem}</span>
        </p>
      </div>
    );
  };
  const sunDiagram = (): JSX.Element => {
    return (
      <div className="sun-dial" id={props.isDay ? "dial-day" : "dial-night"}>
        <div
          id="dial-circle"
          className={props.isDay ? "circle-black" : "circle-white"}
        >
          <motion.div
            className="dial-circle-fill"
            id={props.isDay ? "fill-black" : "fill-white"}
            initial={{ transform: `translateY(${-100}%)` }}
            animate={{ transform: `translateY(${-100 + proportion}%)` }}
            transition={{
              ease: "easeInOut",
              duration: 2,
              delay: 1,
            }}
          />
        </div>
        <div id="sun-textbox-container" className="flex-column">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ease: "easeInOut", duration: 0.75, delay: 3 }}
            className="weather-text until-text center-text"
            id={props.isDay ? "black-dial-text" : "white-dial-text"}
          >
            {" "}
            {props.sunCycleWidget()}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ease: "easeInOut", duration: 0.75, delay: 3.75 }}
            className="weather-text until-text center-text"
            id={props.isDay ? "black-dial-text" : "white-dial-text"}
          >
            {" "}
            {sunRiseSetTextGenerator()}
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <div className="widget-pane flex-column" id="sun-cycle-pane">
      {props.generateTitleBar("Sun Cycle")}
      <div
        className="widget-container flex-column flex-center"
        id="sun-diagram"
      >
        {sunDiagram()}
      </div>
    </div>
  );
}

 