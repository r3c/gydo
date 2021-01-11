import { RenderEntity } from "../server/graph/response";

export type ClientDashboard = {
  errors?: string[];
  panels?: ClientPanel[];
  title?: string;
};

export type ClientPanel = {
  labels: unknown;
  series: unknown;
  engine?: ClientRenderEngine;
  title?: string;
};

export enum ClientRenderEngine {
  Debug,
  LineChart,
}

export type RendererProps = {
  entity: RenderEntity;
  shift: number;
};
