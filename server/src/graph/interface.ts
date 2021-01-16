export type ClientDashboard = {
  displays: ClientDisplay[];
  sources: [string, string][];
  title: string;
};

export type ClientDisplay = {
  labels?: string;
  renderer?: ClientRenderer;
  series: [string, ClientStyle?][];
  title?: string;
};

export enum ClientRenderer {
  Debug,
  LineChart,
}

export type ClientStyle = {
  name?: string;
};

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
