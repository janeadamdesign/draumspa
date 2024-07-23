import React from "react";

// Local imports
import AreaChartComponent from "./AreaChart";
import { HourlySingle, HourlyWeather } from "./DraumSpaTypes";

interface PressureProps {
  setFace: React.Dispatch<React.SetStateAction<string>>;
  generateTitleBar: (titleText: string) => JSX.Element;
  hourlySingleGenerator: (variable: keyof HourlyWeather) => HourlySingle[];
}

export default function Pressure(props: PressureProps): React.ReactElement {
  const pressureData: HourlySingle[] = props.hourlySingleGenerator("pressure");

  return (
    <div className="widget-pane flex-column" id="pressure-pane">
      {props.generateTitleBar("Pressure")}
      <div className="widget-container flex-column flex-center" id="pressure">
        <AreaChartComponent data={pressureData} dataKey="pressure" domain={[950, 1050]} />
      </div>
    </div>
  );
}
