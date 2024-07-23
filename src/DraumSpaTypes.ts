export const animateOpacityValues: AnimateOpacityValues = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    ease: "easeInOut",
    duration: 0.25,
    delay: 0.25,
  },
};



export const animatePaneValues: AnimateOpacityValues = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    ease: "easeInOut",
    duration: 0.75,
    delay: 0.25,
  },
};

export const environmentBackgroundLinks: string[] = [
  "./daytime-clouds.png",
  "./daytime-fog.png",
  "./daytime-rain.png",
  "./daytime-snow.png",
  "./daytime-sun2.png",
  "./nighttime-clear.png",
  "./nighttime-clouds.png",
  "./nighttime-rain.png",
  "./nighttime-snow.png",
  "./storm.png",
];

export const moonIcons: string[] = [
  "./icons/1.png",
  "./icons/2.png",
  "./icons/3.png",
  "./icons/4.png",
  "./icons/5.png",
  "./icons/6.png",
  "./icons/7.png",
  "./icons/8.png",
  "./icons/9.png",
  "./icons/10.png",
  "./icons/11.png",
  "./icons/12.png",
  "./icons/13.png",
  "./icons/14.png",
  "./icons/15.png",
  "./icons/16.png",
];

export interface AnimateOpacityValues {
  initial: { opacity: number };
  animate: { opacity: number };
  exit: { opacity: number };
  transition: {
    ease: string;
    duration: number;
    delay: number;
  };
}

export interface AnimatePaneValues {
  initial: { opacity: number };
  animate: {
    opacity: number;
    transition: {
      ease: string;
      duration: number;
      delay: number;
    };
  };
  exit: {
    opacity: number;
    transition: {
      ease: string;
      duration: number;
      delay: number;
    };
  };
}

export interface ContainerContent {
  containerId: string;
  containerContent: JSX.Element;
}

export interface GenerationContents {
  [key: string]: JSX.Element;
}

export interface HourlySingle {
  [key: string]: number;
  timestamp: number;
}

export interface LatLong {
  latitude: number;
  longitude: number;
}

export interface Location {
  coordinates: LatLong;
  formattedLocation: string | null;
}

export interface MainCategoryCodes {
  [key: number]: {
    mainCategory: string;
    description: string;
    backgroundIndices: number[];
  };
}

export interface Moonies {
  moonRiseText: string;
  moonSetText: string;
}

export interface MoonPhases {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
}

export interface OpenWeatherData {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: CurrentWeather;
  minutely: MinutelyWeather[];
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  alerts: WeatherAlert[];
}

export interface OpenPollutionData {
  coord: LatLong;
  list: PollutionObject[];
}

export interface PollutionObject {
  dt: number;
  main: {
    aqi: number;
  };
  components: {
    co: number;
    no: number;
    no2: number;
    o3: number;
    so2: number;
    pm2_5: number;
    pm10: number;
    nh3: number;
  };
}

export interface SunriseSunset {
  sunrise: string;
  sunset: string;
  solar_noon: string;
  day_length: string;
  civil_twilight_begin: string;
  civil_twilight_end: string;
  nautical_twilight_begin: string;
  nautical_twilight_end: string;
  astronomical_twilight_begin: string;
  astronomical_twilight_end: string;
}

export interface Widget {
  id: string;
  classNames: string;
  content: JSX.Element;
}

export interface UviRange {
  min: number;
  max: number;
  description: JSX.Element;
}

// Subordinate types for OpenWeatherMaps
export interface WeatherData {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust: number;
  weather: WeatherData[];
}

export interface MinutelyWeather {
  dt: number;
  precipitation: number;
}

export interface HourlyWeather
  extends Omit<CurrentWeather, "sunrise" | "sunset"> {
  pop: number;
}

export interface TempDetails {
  day: number;
  min: number;
  max: number;
  night: number;
  eve: number;
  morn: number;
}

export interface FeelsLikeDetails {
  day: number;
  night: number;
  eve: number;
  morn: number;
}

export interface DailyWeather {
  dt: number;
  sunrise: number;
  sunset: number;
  moonrise: number;
  moonset: number;
  moon_phase: number;
  summary: string;
  temp: TempDetails;
  feels_like: FeelsLikeDetails;
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust: number;
  weather: WeatherData[];
  clouds: number;
  pop: number;
  rain: number;
  uvi: number;
}

export interface WeatherAlert {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags: string[];
}
