import { PanelRendering, Serie } from "../response";

export const renderDebug = (
  labels: string[],
  series: Serie[]
): Omit<PanelRendering, "title"> => {
  return {
    contents: JSON.stringify({ labels, series }),
  };
};
