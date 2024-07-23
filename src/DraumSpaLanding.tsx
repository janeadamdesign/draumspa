// Package Imports
import React, { useEffect, useState } from "react";

// Local Imports
import "./DraumSpa.scss";
import "./rtgTransitions.scss";
import { environmentBackgroundLinks, moonIcons } from "./DraumSpaTypes";
import CubeContainer from "./CubeContainer";

interface DraumSpaLandingProps {}

function DraumSpaLanding(props: DraumSpaLandingProps): React.ReactElement {
  // Background Mode Toggle
  const [locationSet, setLocationSet]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);
  //Background Index logic
  const [backgroundIndex, setBackgroundIndex]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(2);
  const [backgroundIndex2, setBackgroundIndex2]: [
    number,
    React.Dispatch<React.SetStateAction<number>>
  ] = useState<number>(2);
  useEffect((): void | (() => void) => {
    if (locationSet) return;
    const backgroundTimer = setTimeout((): void => {
      if (backgroundIndex2 === 9) {
        setBackgroundIndex2(0);
      } else setBackgroundIndex2((prev: number): number => prev + 1);
    }, 2000);
    return (): void => {
      clearTimeout(backgroundTimer);
    };
  }, [backgroundIndex2, locationSet]);

  // Image Preloading
  const storeImages = (
    srcArray: string[],
    stateSetter: React.Dispatch<React.SetStateAction<HTMLImageElement[]>>
  ): void => {
    const handleImageLoad = (image: HTMLImageElement): void => {
      stateSetter((prev: HTMLImageElement[]): HTMLImageElement[] => {
        if (
          prev.find(
            (extantImg: HTMLImageElement): boolean =>
              extantImg.src === image.src
          )
        ) {
          return prev;
        } else return [...prev, image];
      });
    };
    srcArray.forEach((src: string): void => {
      // console.log(src);
      const img: HTMLImageElement = new Image();
      img.src = src;
      img.onload = (): void => handleImageLoad(img);
    });
  };
  const [backgroundImages, setBackgroundImages]: [
    HTMLImageElement[],
    React.Dispatch<React.SetStateAction<HTMLImageElement[]>>
  ] = useState<HTMLImageElement[]>([]);
  const [moonIconImages, setMoonIconImagaes]: [
    HTMLImageElement[],
    React.Dispatch<React.SetStateAction<HTMLImageElement[]>>
  ] = useState<HTMLImageElement[]>([]);
  const imageParams: [
    string[],
    React.Dispatch<React.SetStateAction<HTMLImageElement[]>>
  ][] = [
    [environmentBackgroundLinks, setBackgroundImages],
    [moonIcons, setMoonIconImagaes],
  ];
  useEffect((): void => {
    imageParams.forEach(
      (
        imageParamArray: [
          string[],
          React.Dispatch<React.SetStateAction<HTMLImageElement[]>>
        ]
      ): void => {
        storeImages(...imageParamArray);
      }
    );
  }, []);

  // Image preloader
  const preloader = (): JSX.Element => {
    const JSXArray: JSX.Element[] = environmentBackgroundLinks.map(
      (link: string, index: number) => {
        return (
          <div
            key={`bg-${index}`}
            className="preloader"
            style={{
              backgroundImage: `url("${link}")`,
            }}
          />
        );
      }
    );
    return <>{JSXArray}</>;
  };

  // Landscape Check Logic
  const [landscape, setLandscape]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(true);
  const [small, setSmall]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ] = useState<boolean>(false);
  useEffect((): (() => void) => {
    const checkLandscape = (): void => {
      if (window.innerWidth > window.innerHeight) {
        setLandscape(true);
      } else setLandscape(false);
      if (window.innerHeight < 600) {
        setSmall(true);
      } else setSmall(false);
    };
    window.addEventListener("resize", checkLandscape);
    return (): void => {
      window.removeEventListener("resize", checkLandscape);
    };
  }, [landscape, small]);

  //Generating background divs
  const generateBackgroundDivs = (links: string[]): JSX.Element[] => {
    return links.map((link: string, index: number) => {
      return (
        <div
          key={index}
          className={
            locationSet
              ? backgroundIndex === index
                ? "animated-background ab-show"
                : "animated-background ab-hide"
              : backgroundIndex2 === index
              ? "animated-background ab-show"
              : "animated-background ab-hide"
          }
          style={{
            backgroundImage: `url("${link}")`,
          }}
        />
      );
    });
  };

  // Return Content
  return (
    <>
      <div id="viewport-wrapper">
        {generateBackgroundDivs(environmentBackgroundLinks)}

        <div id="aspect-cage" className="flex-row flex-center">
          {landscape && small ? (
            <div
              id="content-size-warning"
              className="flex-row flex-center justify-text"
            >
              <div className="widget-container">
                {" "}
                <p id="warning-text" className="weather-text">
                  Mobile ? Return to portrait; Desktop ? expand screen height
                </p>
              </div>
            </div>
          ) : (
            <CubeContainer
              setBackgroundIndex={setBackgroundIndex}
              setLocationSet={setLocationSet}
            />
          )}
        </div>
      </div>{" "}
    </>
  );
}

export default DraumSpaLanding;
