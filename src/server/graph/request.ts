export type Dashboard = {
  panels: Panel[];
  sources: SourceMap;
  title: string;
};

export type Panel = {
  queries: Query[];
  renderer: RenderEngine;
  title: string;
};

export type Query = {
  expression: string;
  label?: string;
  language?: QueryLanguage;
};

export enum QueryLanguage {
  Jsonata,
}

export enum RenderEngine {
  Debug,
  Table,
  LineChart,
}

export type Source = {
  type: SourceType;
  url: string;
};

export type SourceMap = {
  [key: string]: Source;
};

export enum SourceType {
  Json,
}
