// Package Imports
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Local Imporst
import { OpenWeatherData, Moonies, MoonPhases } from "./DraumSpaTypes";

interface MoonCycleProps {
  setFace: React.Dispatch<React.SetStateAction<string>>;
  generateTitleBar: (titleText: string) => JSX.Element;
  moonDisplayWidget: () => JSX.Element;
  openWeatherData: OpenWeatherData | null;
  convertUnixToTimeString: (
    unixTimeStamp: number,
    timezone: string | null
  ) => string;
  timeZone: string | null;
  moonPhaseIndex: number | null;
}

function MoonCycle(props: MoonCycleProps): React.ReactElement {
  // Logic defining text elements for DOM injection
  const [moonies, setMoonies]: [
    Moonies | null,
    React.Dispatch<React.SetStateAction<Moonies | null>>
  ] = useState<Moonies | null>(null);
  useEffect((): void => {
    if (!props.timeZone || !props.openWeatherData) return;
    setMoonies({
      moonRiseText: props.convertUnixToTimeString(
        props.openWeatherData.daily[0].moonrise,
        props.timeZone
      ),
      moonSetText: props.convertUnixToTimeString(
        props.openWeatherData.daily[0].moonset,
        props.timeZone
      ),
    });
  }, [props.timeZone, props.openWeatherData]);

  const [moonPhase, setMoonPhase]: [
    string | null,
    React.Dispatch<React.SetStateAction<string | null>>
  ] = useState<string | null>(null);

  // How do type predicates work? A type predicate in a function's return type (key is keyof MoonPhases) serves as a signal to the TypeScript compiler that if the boolean content returned (key in moonPhases) is true, then the variable checked within the function (key) should be treated as belonging to the specified type (keyof MoonPhases).
  useEffect((): void => {
    if (!props.moonPhaseIndex) return;
    const moonPhases: MoonPhases = {
      1: "new moon",
      2: "waxing crescent",
      3: "first quarter",
      4: "waxing gibbous",
      5: "full moon",
      6: "waning gibbous",
      7: "third quarter",
      8: "waning crescent",
    };
    const isKeyOfMoonPhases = (key: number): key is keyof MoonPhases => {
      return key in moonPhases;
    };
    const key: number = props.moonPhaseIndex;
    if (isKeyOfMoonPhases(key)) {
      setMoonPhase(moonPhases[key]);
    }
  }, [props.moonPhaseIndex]);

  // Logic to separate moontime into parts
  let moonRiseTime: string | null = null;
  let moonRiseMeridiem: string | null = null;
  let moonSetTime: string | null = null;
  let moonSetMeridiem: string | null = null;
  if (moonies) {
    moonRiseTime = moonies.moonRiseText.slice(0, -3);
    moonRiseMeridiem = moonies.moonRiseText.slice(-2);
    moonSetTime = moonies.moonSetText.slice(0, -3);
    moonSetMeridiem = moonies.moonSetText.slice(-2);
  }

  return (
    <div className="widget-pane flex-column" id="moon-cycle-pane">
      {props.generateTitleBar("Moon Cycle")}
      <div id="moon-pane-content-container" className="flex-column">
        <div className="moon-pane-content-subdivision widget-container flex-column flex-center">
          <div className="moon-pane-subdivision-interior flex-column flex-center">
            {" "}
            {props.moonDisplayWidget()}
          </div>
        </div>
        <div className="moon-pane-content-subdivision widget-container flex-column flex-center">
          <div className="moon-pane-subdivision-interior flex-column flex-center">
            <div
              id="moon-textbox-container"
              className="flex-column flex-center"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ease: "easeInOut", duration: 0.75, delay: 1.5 }}
                className="weather-text center-text moon-text flex-row"
              >
                <span style={{ margin: "auto", fontStyle: "italic" }}>
                  {moonPhase ? moonPhase : ""}
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ease: "easeInOut", duration: 0.75, delay: 2.25 }}
                className="weather-text center-text moon-text flex-row"
              >
                <span className="moonrise">moonrise</span>
                <span className="flex-row flex-center">
                  <span className="moontide">
                    {moonies ? moonRiseTime : ""}&nbsp;
                  </span>
                  <span className="meridiem">
                    {moonies ? moonRiseMeridiem : ""}
                  </span>
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ease: "easeInOut", duration: 0.75, delay: 3 }}
                className="weather-text center-text moon-text flex-row"
              >
                <span className="moonrise">moonset</span>
                <span className="flex-row flex-center">
                  <span className="moontide">
                    {moonies ? moonSetTime : ""}&nbsp;
                  </span>
                  <span className="meridiem">
                    {moonies ? moonSetMeridiem : ""}
                  </span>
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoonCycle;
