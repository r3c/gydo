import { ServerDashboard, ServerPanel } from "../server/graph/request";
import { RenderEntity } from "../server/graph/response";

export type ClientDashboard = Omit<ServerDashboard, "panels"> & {
  panels?: ClientPanel[];
  title?: string;
};

export type ClientPanel = ServerPanel & {
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
