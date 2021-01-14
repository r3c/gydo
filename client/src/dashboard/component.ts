export type ClientDashboard = {
  errors?: string[];
  displays?: ClientDisplay[];
  title?: string;
};

export type ClientDisplay = {
  labels: unknown;
  renderer?: ClientRenderer;
  series: unknown;
  title?: string;
};

export enum ClientRenderer {
  Debug,
  LineChart,
}
