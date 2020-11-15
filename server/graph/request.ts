export type Dashboard = {
  panels?: Panel[];
  sources?: SourceMap;
  title?: string;
};

export type Panel = {
  labels?: string;
  language?: QueryLanguage;
  queries?: Query[];
  renderer?: RenderEngine;
  title?: string;
};

export type Query = {
  name?: string;
  points?: string;
};

export enum QueryLanguage {
  Jsonata,
}

export enum RenderEngine {
  Debug,
  Table,
  LineChart,
}

export type SourceMap = {
  [key: string]: string;
};

export enum SourceType {
  Json,
}
