export const demo = {
  panels: [
    {
      title: "Color properties",
      renderer: 2,
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
      renderer: 2,
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
