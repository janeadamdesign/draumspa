import React, { useState, useEffect } from "react";

// Local imports
import AreaChartComponent from "./AreaChart";
import {
  HourlySingle,
  HourlyWeather,
  DailyWeather,
  OpenWeatherData,
} from "./DraumSpaTypes";

interface CurrentSevenProps {
  setFace: React.Dispatch<React.SetStateAction<string>>;
  generateTitleBar: (titleText: string) => JSX.Element;
  hourlySingleGenerator: (variable: keyof HourlyWeather) => HourlySingle[];
  openWeatherData: OpenWeatherData | null;
}

export default function CurrentSeven(
  props: CurrentSevenProps
): React.ReactElement {
  // generating daily data as state
  const [dailyWeather, setDailyWeather]: [
    DailyWeather[],
    React.Dispatch<React.SetStateAction<DailyWeather[]>>
  ] = useState<DailyWeather[]>([]);

  useEffect((): void => {
    if (!props.openWeatherData) return;
    setDailyWeather(props.openWeatherData.daily);
  }, [props.openWeatherData]);

  const dailyTempsGenerator = (): HourlySingle[] => {
    const simplifiedDailyArray: HourlySingle[] = dailyWeather.map(
      (day: DailyWeather) => {
        const minTemp: number = day.temp.min;
        const maxTemp: number = day.temp.max;
        const timestamp: number = day.dt - dailyWeather[0].dt;
        const processedTimestamp: number = timestamp /60/60/24;
        return {
          minTemp: minTemp,
          maxTemp: maxTemp,
          timestamp: processedTimestamp,
        };
      }
    );
    return simplifiedDailyArray;
  };

  const dailyTempData: HourlySingle[] = dailyTempsGenerator();
  // Standard hourly data
  const hourlyTempData: HourlySingle[] = props.hourlySingleGenerator("temp");

  //°C=K−273.15
  const hourlyTempCelcius: HourlySingle[] = hourlyTempData.map(
    (hour: HourlySingle): HourlySingle => {
      return {
        ...hour,
        temp: hour.temp - 273.15,
      };
    }
  );
  const dailyTempCelcius: HourlySingle[] = dailyTempData.map(
    (day: HourlySingle): HourlySingle => {
      return {
        ...day,
        minTemp: day.minTemp - 273.15,
        maxTemp: day.maxTemp - 273.15,
      };
    }
  );

  const [forecastTitle, setForecastTitle]: [string, React.Dispatch<React.SetStateAction<string>>] = useState<string>("Hourly & Daily Forecast")

  return (
    <div className="widget-pane flex-column" id="UV-pane">
      {props.generateTitleBar("Hourly & Daily Forecast")}
      <div className="widget-container flex-column flex-center uv-cloud-graphs">
        <AreaChartComponent data={hourlyTempCelcius} dataKey="temp" />
      </div>
      <div className="widget-container flex-column flex-center uv-cloud-graphs">
        <AreaChartComponent
          data={dailyTempCelcius}
          dataKey="minTemp"
          dataKey2="maxTemp"
        />
      </div>
    </div>
  );
}
