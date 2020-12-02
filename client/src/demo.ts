import { ClientDashboard, ClientRenderEngine } from "./media/component";

export const demo: ClientDashboard = {
  panels: [
    {
      title: "Color properties",
      engine: ClientRenderEngine.LineChart,
      labels: "$.demo.name",
      queries: [
        {
          points: "$.demo.luminance",
          name: "Luminance",
        },
        {
          points: "$.demo.hue",
          name: "Hue",
        },
      ],
    },
    {
      title: "Number of characters",
      engine: ClientRenderEngine.LineChart,
      labels: "$.demo.name",
      queries: [
        {
          points: "$.demo.($length(name))",
          name: "Length",
        },
      ],
    },
  ],
  sources: {
    demo: "https://gydo.herokuapp.com/api/demo/data",
  },
  title: "Demo dashboard",
};
