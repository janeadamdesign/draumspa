import React from "react";

// Local imports
import AreaChartComponent from "./AreaChart";
import { HourlySingle, HourlyWeather } from "./DraumSpaTypes";

interface PrecipitationProps {
  setFace: React.Dispatch<React.SetStateAction<string>>;
  generateTitleBar: (titleText: string) => JSX.Element;
  hourlySingleGenerator: (variable: keyof HourlyWeather) => HourlySingle[];
}

export default function Precipitation(props: PrecipitationProps): React.ReactElement {
  const popData: HourlySingle[] = props.hourlySingleGenerator("pop");
  const cloudData: HourlySingle[] = props.hourlySingleGenerator("clouds");

  const popDataPercentage: HourlySingle[] = popData.map(
    (hourly: HourlySingle): HourlySingle => {
      return {
        ...hourly,
        pop: hourly.pop * 100,
      };
    }
  );

  return (
    <div className="widget-pane flex-column" id="precipitation-pane">
      {props.generateTitleBar("Precipitation")}

      <div className="widget-container flex-column flex-center uv-cloud-graphs">
        <AreaChartComponent
          data={popDataPercentage}
          dataKey="pop"
          domain={[0, 100]}
        />
      </div>
      <div className="widget-container flex-column flex-center uv-cloud-graphs">
        <AreaChartComponent
          data={cloudData}
          dataKey="clouds"
          colour="green"
          domain={[0, 100]}
        />
      </div>
    </div>
  );
}


