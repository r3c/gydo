export type RenderDashboard = {
  entities: RenderEntity[];
  errors: string[];
};

export type RenderEntity = {
  errors: string[];
  labels: string[];
  series: RenderSerie[];
};

export type RenderQuery = {
  errors: string[];
  value: any;
};

export type RenderSerie = {
  errors: string[];
  name: string;
  points: number[];
};

export type RenderState = {
  [key: string]: unknown;
};
