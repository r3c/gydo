import {
  ClientDashboard,
  ClientRenderer,
} from "../../../server/src/graph/interface";

export const demo: ClientDashboard = {
  displays: [
    {
      title: "Color properties",
      renderer: ClientRenderer.LineChart,
      labels: "name",
      series: [["luminance"], ["hue"]],
    },
    {
      title: "Number of characters",
      renderer: ClientRenderer.LineChart,
      labels: "name",
      series: [["length"]],
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
