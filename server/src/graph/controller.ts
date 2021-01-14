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
  evaluate: (expression: string, state: RenderState) => Promise<RenderQuery>;
  satisfy: (expression: string) => boolean;
};

const evaluators: Evaluator[] = [
  // Fetch from HTTP or HTTP URL
  {
    evaluate: evaluateFromHttp,
    satisfy: (expression: string) => /^https?:\/\//.test(expression),
  },
  // Evaluate Jsonata expression
  {
    evaluate: evaluateFromJsonata,
    satisfy: (expression: string) => /^\$/.test(expression),
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

  // Compute data from sources
  const sources = asArray(dashboard.sources);

  if (sources === undefined) {
    return {
      entities: [],
      errors: [`undefined or invalid property "sources"`],
    };
  }

  for (let i = 0; i < sources.length; ++i) {
    const source = asArray(sources[i]);

    if (source === undefined) {
      return {
        entities: [],
        errors: [`undefined or invalid property "sources[${i}]"`],
      };
    }

    const [key, expression] = source.map(asString);

    if (key === undefined || expression === undefined) {
      return {
        entities: [],
        errors: [
          `undefined or invalid property "sources[${i}][0]" or "sources[${i}][1]"`,
        ],
      };
    }

    const evaluator = evaluators.find(({ satisfy }) => satisfy(expression));

    if (evaluator === undefined) {
      return {
        entities: [],
        errors: [
          `cannot evaluate source "${key}": unrecognized expression "${expression}"`,
        ],
      };
    }

    const { evaluate } = evaluator;
    const result = await evaluate(expression, state);

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

  // Render displays
  const displays = asArray(dashboard.displays);

  if (displays === undefined) {
    return {
      entities: [],
      errors: ['undefined or invalid property "displays"'],
    };
  }

  return {
    entities: displays.map((display) => renderEntity(display, state)),
    errors: [],
  };
};

const renderEntity = (input: unknown, state: RenderState): RenderEntity => {
  const display = asObject(input);

  if (display === undefined) {
    return {
      errors: ["undefined or invalid display"],
      labels: [],
      series: [],
    };
  }

  const errors: string[] = [];

  // Render series from queries
  const displaySeries = asArray(display.series);

  if (displaySeries === undefined) {
    return {
      errors: ['undefined or invalid property "series"'],
      labels: [],
      series: [],
    };
  }

  const series = displaySeries.map((serie) => renderSerie(serie, state));

  // Render labels
  const labelKey = asString(display.labels);
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

  // Render display
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
      errors: [`source "${key}" is undefined`],
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
