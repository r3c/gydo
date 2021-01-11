import { ClientRenderEngine } from "./media/component";

export const demo = {
  panels: [
    {
      title: "Color properties",
      engine: ClientRenderEngine.LineChart,
      labels: "name",
      series: [
        ["luminance", "Luminance"],
        ["hue", "Hue"],
      ],
    },
    {
      title: "Number of characters",
      engine: ClientRenderEngine.LineChart,
      labels: "name",
      series: [["length", "Length"]],
    },
  ],
  queries: [
    ["demo", "https://gydo.herokuapp.com/api/demo/data"],
    ["name", "$.demo.name"],
    ["luminance", "$.demo.luminance"],
    ["hue", "$.demo.hue"],
    ["length", "$.demo.($length(name))"],
  ],
  title: "Demo dashboard",
};
