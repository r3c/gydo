export type RenderDashboard = {
  entities?: RenderEntity[];
  errors?: string[];
};

export type RenderEntity = {
  errors?: string[];
  labels?: string[];
  series?: RenderSerie[];
};

export type RenderSerie = {
  errors?: string[];
  name?: string;
  points?: any[];
};
