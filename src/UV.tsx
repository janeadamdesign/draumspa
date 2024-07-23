import React from "react";

// Local imports
import AreaChartComponent from "./AreaChart";
import { HourlySingle, HourlyWeather } from "./DraumSpaTypes";

interface UVProps {
  setFace: React.Dispatch<React.SetStateAction<string>>;
  generateTitleBar: (titleText: string) => JSX.Element;
  hourlySingleGenerator: (variable: keyof HourlyWeather) => HourlySingle[];
}

export default function UV (props: UVProps): React.ReactElement {
    const uviData: HourlySingle[] = props.hourlySingleGenerator("uvi");
    const cloudData: HourlySingle[] = props.hourlySingleGenerator("clouds");


    return (
        <div className="widget-pane flex-column" id="UV-pane">
      {props.generateTitleBar("UV & Cloud")}
      <div className="widget-container flex-column flex-center uv-cloud-graphs">
        <AreaChartComponent data={uviData} dataKey="uvi" domain={[0, 12]} />
      </div>
      <div className="widget-container flex-column flex-center uv-cloud-graphs">
        <AreaChartComponent data={cloudData} dataKey="clouds" colour="green" />
      </div>

      </div>
    )
}

