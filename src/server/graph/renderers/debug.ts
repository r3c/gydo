import { PanelRendering, Serie } from "../response";

export const renderDebug = (series: Serie[]): Omit<PanelRendering, "title"> => {
  return {
    contents: JSON.stringify(series),
  };
};
