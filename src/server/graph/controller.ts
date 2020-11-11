import {
  Dashboard,
  Panel,
  Query,
  QueryLanguage,
  RenderEngine,
  SourceType,
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

const evaluate = (query: Query, data: any): Omit<Serie, "label"> => {
  const engine = query.language ?? QueryLanguage.Jsonata;

  switch (engine) {
    case QueryLanguage.Jsonata:
      return evaluateJsonata(query, data);

    default:
      return {
        errors: [`unknown query engine "${engine}"`],
      };
  }
};

const renderDashboard = async (
  dashboard: Dashboard
): Promise<Rendering> => {
  const data: { [key: string]: any } = {};

  // Fetch raw data from sources
  for (const key in dashboard.sources) {
    const source = dashboard.sources[key];
    const response = await fetch(source.url);

    switch (source.type) {
      case SourceType.Json:
        data[key] = await fetchAsJson(response);

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
  const queryErrors = [];
  const querySeries = [];

  for (let i = 0; i < panel.queries.length; ++i) {
    const query = panel.queries[i];
    const result = evaluate(query, data);

    if (result.errors !== undefined) {
      queryErrors.concat(
        result.errors.map(
          (error) => `query "${query.expression}" couldn't execute: ${error}`
        )
      );
    } else if (result.points === undefined) {
      queryErrors.push(`query "${query.expression}" didn't return numbers`);
    } else {
      querySeries.push({
        label: query.label ?? `Serie #${i}`,
        points: result.points,
      });
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
      return renderLineChart(querySeries);

    case RenderEngine.Debug:
      return renderDebug(querySeries);

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
