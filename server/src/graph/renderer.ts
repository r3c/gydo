import { asArray } from "../dynamic/type";
import { evaluateFromHttp } from "./evaluators/http";
import { evaluateFromJsonata } from "./evaluators/jsonata";
import {
  ClientDashboard,
  ClientDisplay,
  ClientStyle,
  RenderEntity,
  RenderQuery,
  RenderSerie,
  RenderState,
} from "./interface";

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

export async function renderDashboard(dashboard: ClientDashboard) {
  const state: RenderState = {};

  // Compute data from sources
  for (const [key, expression] of dashboard.sources) {
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
  return {
    entities: dashboard.displays.map((display) => renderEntity(display, state)),
    errors: [],
  };
}

const renderEntity = (
  display: ClientDisplay,
  state: RenderState
): RenderEntity => {
  const errors: string[] = [];

  // Render series from queries
  const series = display.series.map(([key, style]) =>
    renderSerie(key, style ?? {}, state)
  );

  // Render labels
  let labels;

  if (display.labels === undefined) {
    labels =
      series.length > 0
        ? Array.from(Array(series[0].points.length).keys()).map(String)
        : [];
  } else {
    const unsafeLabels = asArray(state[display.labels]);

    if (unsafeLabels === undefined) {
      return {
        errors: [...errors, `unknown key "${display.labels}" used in "labels"`],
        labels: [],
        series: [],
      };
    }

    labels = unsafeLabels.map(String);
  }

  // Render display
  return { errors, labels, series };
};

const renderName = (key: string): string => {
  const uppercase = /[A-Z]/g;

  while (true) {
    const match = uppercase.exec(key);

    if (match === null) {
      break;
    }

    key =
      key.substr(0, match.index) +
      " " +
      key.substr(match.index, match.length).toLowerCase() +
      key.substr(match.index + match.length);

    uppercase.lastIndex = match.index + match.length;
  }

  return key.substr(0, 1).toUpperCase() + key.substr(1);
};

const renderSerie = (
  key: string,
  style: ClientStyle,
  state: RenderState
): RenderSerie => {
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
    name: style.name ?? renderName(key),
    points: points.map(Number),
  };
};
