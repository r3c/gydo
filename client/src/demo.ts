import { ClientRenderer } from "./dashboard/component";

export const demo = {
  displays: [
    {
      title: "Color properties",
      renderer: ClientRenderer.LineChart,
      labels: "name",
      series: [
        ["luminance", "Luminance"],
        ["hue", "Hue"],
      ],
    },
    {
      title: "Number of characters",
      renderer: ClientRenderer.LineChart,
      labels: "name",
      series: [["length", "Length"]],
    },
  ],
  sources: [
    ["demo", "https://gydo.herokuapp.com/api/demo/data"],
    ["name", "$.demo.name"],
    ["luminance", "$.demo.luminance"],
    ["hue", "$.demo.hue"],
    ["length", "$.demo.($length(name))"],
  ],
  title: "Demo dashboard",
};
