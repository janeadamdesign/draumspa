// Package imports
import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

// Local imports
import { HourlySingle } from "./DraumSpaTypes";

interface AreaChartComponentProps {
  data: HourlySingle[];
  dataKey: string;
  domain?: number[];
  dataKey2?: string;
  colour?: string;
}

/* Rechart Area Chart data structure:
- AreaChart component takes an array of objects as its prop data
- Area takes as dataKey the name of one of the keys from the objects passed to AreaChart inside an array*/

export default function AreaChartComponent(props: AreaChartComponentProps) {
  // Margin setter logic
  const [marginPixels, setMarginPixels]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(0);
  useEffect((): (() => void) => {
    const setPixels = (): void => {
      let vhValue: number | null = null;
      if (props.dataKey === "visibility") {
        vhValue = 0;
      } else vhValue = 1;
      const pixels: number = Math.round(window.innerWidth * (vhValue / 100));
      setMarginPixels(pixels);
    };
    setPixels();
    window.addEventListener("resize", setPixels);
    return (): void => {
      window.removeEventListener("resize", setPixels);
    };
  }, []);

  // Legend Object
  const legend: {
    [key: string]: {
      name: string;
      ticks: number;
    };
  } = {
    pop: {
      name: "chance of rain (%)",
      ticks: 5,
    },
    clouds: {
      name: "cloud cover (%)",
      ticks: 5,
    },
    aqi: {
      name: "AQI Index (1-5)",
      ticks: 6,
    },
    no: {
      name: "no (μg/m3)",
      ticks: 5,
    },
    no2: {
      name: "no2",
      ticks: 5,
    },
    pm2_5: {
      name: "pm2.5 (μg/m3)",
      ticks: 5,
    },
    pm10: {
      name: "pm10",
      ticks: 5,
    },
    uvi: {
      name: "UV Index (0-11+)",
      ticks: 7,
    },
    wind_speed: {
      name: "wind speed (mph)",
      ticks: 5,
    },
    wind_gust: {
      name: "wind gust (mph)",
      ticks: 5,
    },
    wind_deg: {
      name: "blowing from (0° === N && 360° === N)",
      ticks: 5,
    },
    pressure: {
      name: "pressure (hPa)",
      ticks: 5,
    },
    visibility: {
      name: "visibility (metres)",
      ticks: 5,
    },
    humidity: {
      name: "humidity (%)",
      ticks: 5,
    },
    temp: {
      name: "hourly temperature (°C)",
      ticks: 5,
    },
    minTemp: {
      name: "daily high (°C)",
      ticks: 5,
    },
    maxTemp: {
      name: "daily low (°C)",
      ticks: 5,
    },
    so2: {
      name: "daily low (°C)",
      ticks: 5,
    },
  };

  if (!props.dataKey2) {
    const name: string = legend[props.dataKey].name;
    const tickCount: number = legend[props.dataKey].ticks;
    return (
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart data={props.data} margin={{ left: -marginPixels }}>
          <YAxis
            stroke="white"
            className="axis"
            domain={props.domain}
            tickCount={tickCount}
          />
          <XAxis dataKey="timestamp" stroke="white" className="axis" />
          <CartesianGrid
            strokeDasharray="5"
            className="cartesian"
            stroke="white"
          />
          <Legend />
          <Area
            name={name}
            type="monotone"
            dataKey={props.dataKey}
            {...(props.colour === "green"
              ? { stroke: "#0e8958", fill: "#11a56a" }
              : { stroke: "#bd1180", fill: "#f035ae" })}
            animationBegin={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  } else {
    const name1: string = legend[props.dataKey].name;
    const name2: string = legend[props.dataKey2].name;

    return (
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart data={props.data} margin={{ left: -marginPixels }}>
          <YAxis
            stroke="white"
            className="axis"
            domain={props.domain}
          />
          <XAxis
            dataKey="timestamp"
            stroke="white"
            className="axis"
            tickCount={49}
          />
          <CartesianGrid
            strokeDasharray="5"
            className="cartesian"
            stroke="white"
          />
          <Legend />
          <Area
            name={name2}
            type="monotone"
            dataKey={props.dataKey2}
            stroke="#0e8958"
            fill="#11a56a"
            animationBegin={1000}
          />

          <Area
            name={name1}
            type="monotone"
            dataKey={props.dataKey}
            stroke="#bd1180"
            fill="#f035ae"
            animationBegin={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
}
