export type ServerDashboard = {
  panels?: ServerPanel[];
  sources?: ServerSourceMap;
};

export type ServerPanel = {
  labels?: string;
  language?: ServerQueryLanguage;
  queries?: ServerQuery[];
};

export type ServerQuery = {
  name?: string;
  points?: string;
};

export enum ServerQueryLanguage {
  Jsonata,
}

export type ServerSourceMap = {
  [key: string]: string;
};

export enum ServerSourceType {
  Json,
}
