import { PanelRendering, Serie } from "../response";

export const renderLineChart = (
  labels: string[],
  series: Serie[]
): Omit<PanelRendering, "title"> => {
  if (series.length < 1) {
    return {
      errors: ["line chart renderer requires at least one serie"],
    };
  }

  const datasets = series.map((serie, index) => ({
    label: serie.name,
    data: serie.points,
    backgroundColor: `hsla(${(index * 100) % 360}, 100%, 50%, 10%)`,
    borderColor: `hsl(${(index * 100) % 360}, 50%, 50%)`,
    borderWidth: 2,
  }));

  return {
    contents: `<canvas></canvas>`,
    script: `
var elements = panel.getElementsByTagName('canvas');
var context = elements[0].getContext('2d');

new Chart(context, {
		type: 'line',
		data: {
				datasets: ${JSON.stringify(datasets)},
				labels: ${JSON.stringify(labels)}
		},
		options: {
				scales: {
						yAxes: [{
								ticks: {
										beginAtZero: true
								}
						}]
				}
		}
});
		`,
  };
};
