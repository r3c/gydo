import {
  ClientDashboard,
  RenderDashboard,
} from "../../../server/src/graph/interface";
import { parseDashboard } from "../../../server/src/graph/parser";
import { graphRender } from "../../../server/src/graph/route";
import { apiBase } from "../../../server/src/route";
import { fetchJson } from "../network/http";

export type CompleteDashboard = RenderDashboard & {
  displays: ClientDashboard["displays"];
  title: ClientDashboard["title"];
};

export const format = (
  dashboard: ClientDashboard | undefined,
  compact: boolean
) => {
  if (dashboard === undefined) {
    return "";
  }

  return compact
    ? JSON.stringify(dashboard)
    : JSON.stringify(dashboard, null, 2);
};

export const parse = (expression: string): ClientDashboard | undefined => {
  if (expression.trim() === "") {
    return undefined;
  }

  const json = JSON.parse(expression);

  return parseDashboard(json);
};

export const render = async (
  client: ClientDashboard | undefined
): Promise<CompleteDashboard> => {
  try {
    if (client === undefined) {
      return {
        displays: [],
        entities: [],
        errors: [],
        title: "",
      };
    }

    const result = await fetchJson(`${apiBase}${graphRender}`, client);
    const render = result as RenderDashboard;

    return {
      ...render,
      displays: client.displays,
      title: client.title,
    };
  } catch (e) {
    return {
      displays: [],
      entities: [],
      errors: [e],
      title: "",
    };
  }
};
