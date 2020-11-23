export type PanelRendering = {
  contents?: string;
  errors?: string[];
  script?: string;
  title?: string;
};

export type Rendering = {
  errors?: string[];
  panels?: PanelRendering[];
  title?: string;
};

export type Serie = {
  errors?: string[];
  name?: string;
  points?: any[];
};
