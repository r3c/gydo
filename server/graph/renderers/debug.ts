import { PanelRendering, Serie } from "../response";

export const renderDebug = (
  labels: string[],
  series: Serie[]
): Omit<PanelRendering, "title"> => {
  return {
    contents: `<pre>${JSON.stringify({ labels, series }, null, 2)}</pre>`
  };
};
