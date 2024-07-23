import React from "react";

// Local imports
import AreaChartComponent from "./AreaChart";
import {
  HourlySingle,
  HourlyWeather,
  OpenPollutionData,
  PollutionObject,
} from "./DraumSpaTypes";

interface AQIProps {
  setFace: React.Dispatch<React.SetStateAction<string>>;
  generateTitleBar: (titleText: string) => JSX.Element;
  hourlySingleGenerator: (variable: keyof HourlyWeather) => HourlySingle[];
  pollution: OpenPollutionData | null;
}

export default function AQI(props: AQIProps): React.ReactElement {
  const generateHourlyPollution = (): HourlySingle[] => {
    if (!props.pollution) return [];
    const pollutionArray: PollutionObject[] = props.pollution.list;
    const mappedPolutionArray: HourlySingle[] = pollutionArray.map(
      (pollutionObject: PollutionObject, index: number) => {
        const timestamp: number = pollutionObject.dt;
        const processedTimestamp: number =
          (timestamp - pollutionArray[0].dt) / 60 / 60;
        const aqi: number = pollutionObject.main.aqi;
        const co: number = pollutionObject.components.co;
        const no: number = pollutionObject.components.no;
        const no2: number = pollutionObject.components.no2;
        const o3: number = pollutionObject.components.o3;
        const so2: number = pollutionObject.components.so2;
        const pm2_5: number =
          pollutionObject.components.pm2_5 > 0
            ? pollutionObject.components.pm2_5
            : pollutionArray[index - 1].components.pm2_5;
        const pm10: number = pollutionObject.components.pm10;
        return {
          timestamp: processedTimestamp,
          aqi: aqi,
          co: co,
          no: no,
          no2: no2,
          o3: o3,
          so2: so2,
          pm2_5: pm2_5,
          pm10: pm10,
        };
      }
    );
    return mappedPolutionArray;
  };

  const pollutionGraphData: HourlySingle[] = generateHourlyPollution();

  return (
    <div className="widget-pane flex-column" id="AQI-pane">
      {props.generateTitleBar("Air Quality")}
      <div className="widget-container flex-column flex-center aqi-graphs">
        {" "}
        <AreaChartComponent
          data={pollutionGraphData}
          dataKey="aqi"
          domain={[0, 5]}
        />
      </div>
      <div className="flex-row" id="combined-graph-container">
        <div className="widget-container flex-column flex-center aqi-combined-graph">
          <AreaChartComponent
            data={pollutionGraphData}
            dataKey="no"
            dataKey2="no2"

          />
        </div>
        <div className="widget-container flex-column flex-center aqi-combined-graph">
          {" "}
          <AreaChartComponent
            data={pollutionGraphData}
            dataKey="pm2_5"
            dataKey2="pm10"
          />
        </div>
      </div>
    </div>
  );
}
