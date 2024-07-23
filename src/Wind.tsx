import React from "react";

// Local imports
import AreaChartComponent from "./AreaChart";
import { HourlySingle, HourlyWeather } from "./DraumSpaTypes";

interface WindProps {
  setFace: React.Dispatch<React.SetStateAction<string>>;
  generateTitleBar: (titleText: string) => JSX.Element;
  hourlySingleGenerator: (variable: keyof HourlyWeather) => HourlySingle[];
}

export default function Wind(props: WindProps): React.ReactElement {
  const windSpeedData: HourlySingle[] =
    props.hourlySingleGenerator("wind_speed");
  const windGustData: HourlySingle[] = props.hourlySingleGenerator("wind_gust");
  const combinedWindData: HourlySingle[] = windSpeedData.map(
    (hourlySingle: HourlySingle, index: number) => {
      const equivalentGust: HourlySingle = windGustData[index];
      const mergedObject: HourlySingle = {
        ...hourlySingle,
        ...equivalentGust,
      };
      return mergedObject;
    }
  );
  const windDirData: HourlySingle[] = props.hourlySingleGenerator("wind_deg");

  //mph=m/s×2.23694
  const imperialWindData: HourlySingle[] = combinedWindData.map(
    (hourly: HourlySingle): HourlySingle => {
      return {
        ...hourly,
        wind_speed: hourly.wind_speed * 2.23694,
        wind_gust: hourly.wind_gust * 2.23694,
      };
    }
  );

  return (
    <div className="widget-pane flex-column" id="wind-pane">
      {props.generateTitleBar("Wind")}
      <div
        className="widget-container flex-column flex-center wind"
        id="wind-graph"
      >
        <AreaChartComponent
          data={imperialWindData}
          dataKey="wind_speed"
          dataKey2="wind_gust"
        />
      </div>
      <div
        className="widget-container flex-column flex-center wind"
        id="wind-direction"
      >
        <AreaChartComponent
          data={windDirData}
          dataKey="wind_deg"
          domain={[0, 360]}
        />
      </div>
    </div>
  );
}
