export type PanelRendering = {
  contents?: string;
  errors?: string[];
  resources?: Resource[];
  script?: string;
  title?: string;
};

export type Rendering = {
  errors?: string[];
  panels?: PanelRendering[];
  title?: string;
};

export type Resource = {
  type?: ResourceType;
  url?: string;
};

export enum ResourceType {
  Javascript,
}

export type Serie = {
  errors?: string[];
  name?: string;
  points?: any[];
};
