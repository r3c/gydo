import {
  ClientDashboard,
  ClientDisplay,
  ClientRenderer,
  ClientStyle,
} from "./interface";
import { asArray, asNumber, asObject, asString } from "../dynamic/type";

type Loose<T> = { [key in keyof T]: unknown };

const parseDisplay = (unsafeDisplay: unknown, scope: string) => {
  const display = asObject(unsafeDisplay) as Loose<ClientDisplay> | undefined;

  if (display === undefined) {
    throw new Error(`undefined or invalid property "${scope}"`);
  }

  // Render series from queries
  const displaySeries = asArray(display.series);

  if (displaySeries === undefined) {
    throw new Error(`undefined or invalid property "${scope}.series"`);
  }

  const labels = asString(display.labels);
  const renderer = asNumber(display.renderer) ?? ClientRenderer.Debug;
  const series = displaySeries.map((unsafeSerie, index) =>
    parseSerie(unsafeSerie, `${scope}.series[${index}]`)
  );
  const title = asString(display.title) ?? scope;

  return { labels, renderer, series, title };
};

const parseSerie = (
  unsafeSerie: unknown,
  scope: string
): [string, ClientStyle?] => {
  const serie = asArray(unsafeSerie);

  if (serie === undefined || serie.length < 1) {
    throw new Error(`undefined or invalid property "${scope}"`);
  }

  // Parse serie key
  const key = asString(serie[0]);

  if (key === undefined) {
    throw new Error(`undefined or invalid property "${scope}[0]"`);
  }

  // Parse serie style
  const style = serie[1] ? parseStyle(serie[1], `${scope}[1]`) : undefined;

  return [key, style];
};

const parseSource = (
  unsafeSource: unknown,
  scope: string
): [string, string] => {
  const source = asArray(unsafeSource);

  if (source === undefined || source.length < 2) {
    throw new Error(`undefined or invalid property "${scope}"`);
  }

  const [key, expression] = source.map(asString);

  if (key === undefined || expression === undefined) {
    throw new Error(
      `undefined or invalid property "${scope}[0]" or "${scope}[1]"`
    );
  }

  return [key, expression];
};

const parseStyle = (unsafeStyle: unknown, scope: string): ClientStyle => {
  const style = asObject(unsafeStyle) as Loose<ClientStyle>;

  if (style === undefined) {
    throw new Error(`undefined or invalid property "${scope}"`);
  }

  const name = asString(style.name);

  return { name };
};

export const parseDashboard = (unsafeDashboard: unknown): ClientDashboard => {
  const dashboard = asObject(unsafeDashboard) as
    | Loose<ClientDashboard>
    | undefined;

  if (dashboard === undefined) {
    throw new Error("undefined or invalid dashboard");
  }

  // Parse displays
  const unsafeDisplays = asArray(dashboard.displays);

  if (unsafeDisplays === undefined) {
    throw new Error('undefined or invalid property "displays"');
  }

  const displays = unsafeDisplays.map((unsafeDisplay, index) =>
    parseDisplay(unsafeDisplay, `displays[${index}]`)
  );

  // Parse sources
  const unsafeSources = asArray(dashboard.sources);

  if (unsafeSources === undefined) {
    throw new Error('undefined or invalid property "sources"');
  }

  const sources = unsafeSources.map((unsafeSource, index) =>
    parseSource(unsafeSource, `sources[${index}]`)
  );

  // Parse title
  const title = asString(dashboard.title) ?? "Untitled dashboard";

  return { displays, sources, title };
};
