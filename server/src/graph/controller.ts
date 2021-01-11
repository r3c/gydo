import {
  RenderDashboard,
  RenderEntity,
  RenderQuery,
  RenderSerie,
  RenderState,
} from "./response";
import { Router } from "express";
import { evaluateFromHttp } from "./evaluators/http";
import { evaluateFromJsonata } from "./evaluators/jsonata";
import { graphRender } from "./route";
import { asArray, asObject, asString } from "../dynamic/type";

type Evaluator = {
  evaluate: (source: string, state: RenderState) => Promise<RenderQuery>;
  satisfy: (source: string) => boolean;
};

const evaluators: Evaluator[] = [
  // Fetch from HTTP or HTTP URL
  {
    evaluate: evaluateFromHttp,
    satisfy: (source: string) => /^https?:\/\//.test(source),
  },
  // Evaluate Jsonata expression
  {
    evaluate: evaluateFromJsonata,
    satisfy: (source: string) => /^\$/.test(source),
  },
];

const renderDashboard = async (input: unknown): Promise<RenderDashboard> => {
  const dashboard = asObject(input);

  if (dashboard === undefined) {
    return {
      entities: [],
      errors: [`undefined or invalid dashboard`],
    };
  }

  const state: RenderState = {};

  // Compute data from queries
  const queries = asArray(dashboard.queries);

  if (queries === undefined) {
    return {
      entities: [],
      errors: [`undefined or invalid property "queries"`],
    };
  }

  for (let i = 0; i < queries.length; ++i) {
    const query = asArray(queries[i]);

    if (query === undefined) {
      return {
        entities: [],
        errors: [`undefined or invalid property "queries[${i}]"`],
      };
    }

    const [key, source] = query.map(asString);

    if (key === undefined || source === undefined) {
      return {
        entities: [],
        errors: [
          `undefined or invalid property "queries[${i}][0]" or "queries[${i}][1]"`,
        ],
      };
    }

    const evaluator = evaluators.find(({ satisfy }) => satisfy(source));

    if (evaluator === undefined) {
      return {
        entities: [],
        errors: [
          `cannot evaluate source "${key}": unrecognized expression "${source}"`,
        ],
      };
    }

    const { evaluate } = evaluator;
    const result = await evaluate(source, state);

    if (result.errors.length > 0) {
      return {
        entities: [],
        errors: result.errors.map(
          (error) => `cannot evaluate source "${key}": ${error}`
        ),
      };
    }

    state[key] = result.value;
  }

  // Render panels
  const panels = asArray(dashboard.panels);

  if (panels === undefined) {
    return {
      entities: [],
      errors: ['undefined or invalid property "panels"'],
    };
  }

  return {
    entities: panels.map((panel) => renderEntity(panel, state)),
    errors: [],
  };
};

const renderEntity = (input: unknown, state: RenderState): RenderEntity => {
  const panel = asObject(input);

  if (panel === undefined) {
    return {
      errors: ["undefined or invalid panel"],
      labels: [],
      series: [],
    };
  }

  const errors: string[] = [];

  // Render series from queries
  const panelSeries = asArray(panel.series);

  if (panelSeries === undefined) {
    return {
      errors: ['undefined or invalid property "series"'],
      labels: [],
      series: [],
    };
  }

  const series = panelSeries.map((serie) => renderSerie(serie, state));

  // Render labels
  const labelKey = asString(panel.labels);
  let labels;

  if (labelKey === undefined) {
    labels =
      series.length > 0
        ? Array.from(Array(series[0].points!.length).keys()).map(String)
        : [];
  } else {
    const labelValues = asArray(state[labelKey]);

    if (labelValues === undefined) {
      return {
        errors: [...errors, `unknown key "${labelKey}" used in "labels"`],
        labels: [],
        series: [],
      };
    }

    labels = labelValues.map(String);
  }

  // Render panel
  return { errors, labels, series };
};

const renderSerie = (serie: unknown, state: RenderState): RenderSerie => {
  const serieArray = asArray(serie);
  const serieKey = asString(serie);

  const [key, name] =
    serieArray !== undefined
      ? serieArray.map(asString)
      : serieKey !== undefined
      ? [serieKey, undefined]
      : [undefined, undefined];

  if (key === undefined) {
    return {
      errors: ["serie key is undefined"],
      name: "",
      points: [],
    };
  }

  const points = asArray(state[key]);

  if (points === undefined) {
    return {
      errors: [`query "${key}" is undefined`],
      name: "",
      points: [],
    };
  }

  return {
    errors: [],
    name: name ?? key,
    points: points.map(Number),
  };
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
