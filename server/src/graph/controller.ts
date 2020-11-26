import { Dashboard, Panel, QueryLanguage, RenderEngine } from "./request";
import { Rendering, PanelRendering, Serie } from "./response";
import { Router } from "express";
import fetch, { Response } from "node-fetch";
import { evaluateJsonata } from "./evaluators/jsonata";
import { renderLineChart } from "./renderers/chart";
import { renderDebug } from "./renderers/debug";
import { graphRender } from "./route";

const fetchAsJson = async (response: Response): Promise<any> => {
  return await response.json();
};

const evaluate = (
  language: QueryLanguage,
  expression: string,
  data: any
): Omit<Serie, "name"> => {
  switch (language) {
    case QueryLanguage.Jsonata:
      return evaluateJsonata(expression, data);

    default:
      return {
        errors: [`unknown query engine "${language}"`],
      };
  }
};

const renderDashboard = async (dashboard: Dashboard): Promise<Rendering> => {
  const data: { [key: string]: any } = {};

  // Fetch data from sources
  for (const key in dashboard.sources) {
    const source = dashboard.sources[key] ?? "";

    if (!source) {
      return {
        errors: [`missing source ${key}`],
        panels: [],
        title: "",
      };
    }

    const response = await fetch(source);
    const type = response.headers.get("Content-Type") ?? "";

    switch (type.replace(/;.*/, "").toLowerCase()) {
      case "application/json":
      case "text/json":
        data[key] = await fetchAsJson(response);

        break;

      default:
        return {
          errors: [`cannot fetch source ${key}: media ${type} not supported`],
          panels: [],
          title: "",
        };
    }
  }

  // Render panels
  const panels = dashboard.panels ?? [];

  return {
    panels: panels.map((panel, index) => ({
      ...renderPanel(panel, data, index),
      title: panel.title ?? `Panel #${index + 1}`,
    })),
    title: dashboard.title ?? "Untitled dashboard",
  };
};

const renderPanel = (
  panel: Panel,
  data: any,
  shift: number
): Omit<PanelRendering, "title"> => {
  const errors: string[] = [];
  const language = panel.language ?? QueryLanguage.Jsonata;

  // Render series from queries
  const series = [];

  if (panel.queries === undefined) {
    errors.push(`panel property "queries" is undefined`);
  } else {
    for (let i = 0; i < panel.queries.length; ++i) {
      const query = panel.queries[i];

      if (query === undefined || query.points === undefined) {
        continue;
      }

      const querySerie = evaluate(language, query.points, data);
      const name = query.name ?? `Serie #${i}`;

      if (querySerie.errors !== undefined) {
        errors.concat(
          querySerie.errors.map(
            (error) => `query ${name} evaluation failed: ${error}`
          )
        );
      } else if (querySerie.points === undefined) {
        errors.push(`query ${name} evaluation didn't return values`);
      } else {
        series.push({
          name: query.name ?? `Serie #${i}`,
          points: querySerie.points,
        });
      }
    }
  }

  // Render labels
  var labels;

  if (panel.labels === undefined) {
    labels =
      series.length > 0
        ? Array.from(Array(series[0].points.length).keys())
        : [];
  } else {
    const labelSerie = evaluate(language, panel.labels, data);

    if (labelSerie.errors !== undefined) {
      errors.concat(
        labelSerie.errors.map((error) => `labels evaluation failed: ${error}`)
      );
      labels = [];
    } else if (labelSerie.points === undefined) {
      errors.concat("labels evaluation didn't return values");
      labels = [];
    } else {
      labels = labelSerie.points;
    }
  }

  // Render panel
  if (errors.length === 0) {
    switch (panel.renderer ?? RenderEngine.Debug) {
      case RenderEngine.LineChart:
        return renderLineChart(labels, series, shift);

      case RenderEngine.Debug:
        return renderDebug(labels, series);

      default:
        errors.push(`unknown rendering engine "${panel.renderer}"`);

        break;
    }
  }

  // Failure
  return { errors };
};

export const register = (router: Router) => {
  router.post(`${graphRender}`, async (request, response) => {
    try {
      const rendering = await renderDashboard(request.body);

      response.json(rendering);
    } catch (error) {
      response.json({ error });
    }
  });
};
