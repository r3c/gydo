import {
  Dashboard,
  Panel,
  Query,
  QueryLanguage,
  RenderEngine,
} from "./request";
import { Rendering, PanelRendering, Serie } from "./response";
import { Router } from "express";
import fetch, { Response } from "node-fetch";
import { evaluateJsonata } from "./evaluators/jsonata";
import { renderLineChart } from "./renderers/chart";
import { renderDebug } from "./renderers/debug";

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

  // Fetch raw data from sources
  for (const key in dashboard.sources) {
    const source = dashboard.sources[key];
    const response = await fetch(source);
    const type = response.headers.get("Content-Type") ?? "";

    switch (type.toLowerCase()) {
      case "application/json":
      case "text/json":
        data[key] = await fetchAsJson(response);

        break;

      default:
        console.log(`FIXME: data source media type ${type} is not supported`);

        break;
    }
  }

  return {
    panels: dashboard.panels.map((panel) => ({
      ...renderPanel(panel, data),
      title: panel.title,
    })),
    title: dashboard.title,
  };
};

const renderPanel = (
  panel: Panel,
  data: any
): Omit<PanelRendering, "title"> => {
  // Apply expressions
  const language = panel.language ?? QueryLanguage.Jsonata;
  const labels = evaluate(language, panel.labels, data);
  const queryErrors: string[] = [];
  const querySeries = [];

  if (labels.errors !== undefined) {
    queryErrors.concat(
      labels.errors.map((error) => `query for labels failed: ${error}`)
    );
  } else if (labels.points === undefined) {
    queryErrors.concat("query for labels didn't return numbers");
  } else {
    for (let i = 0; i < panel.queries.length; ++i) {
      const query = panel.queries[i];
      const result = evaluate(language, query.points, data);
      const name = query.name ?? `Serie #${i}`;

      if (result.errors !== undefined) {
        queryErrors.concat(
          result.errors.map((error) => `query for ${name} failed: ${error}`)
        );
      } else if (result.points === undefined) {
        queryErrors.push(`query for ${name} didn't return numbers`);
      } else {
        querySeries.push({
          name: query.name ?? `Serie #${i}`,
          points: result.points,
        });
      }
    }
  }

  // Early exit on error
  if (queryErrors.length > 0) {
    return {
      errors: queryErrors,
    };
  }

  // Render panel
  switch (panel.renderer) {
    case RenderEngine.LineChart:
      return renderLineChart(labels.points ?? [], querySeries);

    case RenderEngine.Debug:
      return renderDebug(labels.points ?? [], querySeries);

    default:
      return {
        errors: [`unknown rendering engine "${panel.renderer}"`],
      };
  }
};

export const register = (router: Router) => {
  router.post("/graph/render", async (request, response) => {
    try {
      const rendering = await renderDashboard(request.body);

      response.json(rendering);
    } catch (error) {
      response.json({ error });
    }
  });
};
