import React, { useEffect, useRef } from "react";
import { RendererProps } from "../components/renderer";

// FIXME: import @type
declare const Chart: any;

type Props = RendererProps & {
  type: string;
};

export default function JsChartRenderer(props: Props) {
  const { entity, shift, type } = props;
  const { labels, series } = entity;
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const datasets =
      series?.map((serie, index) => ({
        label: serie.name,
        data: serie.points,
        backgroundColor: `hsla(${
          (index * 100 + shift * 30) % 360
        }, 100%, 50%, 10%)`,
        borderColor: `hsl(${(index * 100 + shift * 30) % 360}, 50%, 50%)`,
        borderWidth: 2,
      })) ?? [];

    var context = canvas.current?.getContext("2d");

    if (context) {
      new Chart(context, {
        type,
        data: {
          datasets,
          labels,
        },
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        },
      });
    }
  }, [labels, series, shift]);

  return <canvas ref={canvas}></canvas>;
}
