import { Router } from "express";
import { demoData } from "./route";

export const register = (router: Router) => {
  router.get(demoData, async (request, response) => {
    // https://en.wikipedia.org/wiki/Hue
    response.json([
      {
        name: "Red",
        hue: 0,
        luminance: 30,
      },
      {
        name: "Orange",
        hue: 30,
        luminance: 59,
      },
      {
        name: "Yellow",
        hue: 60,
        luminance: 89,
      },
      {
        name: "Green",
        hue: 120,
        luminance: 59,
      },
      {
        name: "Blue",
        hue: 240,
        luminance: 11,
      },
      {
        name: "Violet",
        hue: 270,
        luminance: 26,
      },
    ]);
  });
};
