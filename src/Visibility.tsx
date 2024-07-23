// Package imports
import React from "react";

// Local imports
import AreaChartComponent from "./AreaChart";
import { HourlySingle, HourlyWeather } from "./DraumSpaTypes";

interface VisibilityProps {
  setFace: React.Dispatch<React.SetStateAction<string>>;
  generateTitleBar: (titleText: string) => JSX.Element;
  hourlySingleGenerator: (variable: keyof HourlyWeather) => HourlySingle[];
}

export default function Visibility(props: VisibilityProps): React.ReactElement {
  const visibilityData: HourlySingle[] = props.hourlySingleGenerator("visibility");
  const humidityData: HourlySingle[] = props.hourlySingleGenerator("humidity");

  return (
    <div className="widget-pane flex-column" id="visibility-pane">
      {props.generateTitleBar("Visibility & Humidity")}
      <div className="widget-container flex-column flex-center" id="visibility">
        <AreaChartComponent data={visibilityData} dataKey="visibility" />
      </div>
      <div className="widget-container flex-column flex-center" id="humidity">
        <AreaChartComponent data={humidityData} dataKey="humidity" colour="green"/>
      </div>
    </div>
  );
}
