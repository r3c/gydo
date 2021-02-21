import {
  ClientDashboard,
  LoadResponse,
  RenderDashboard,
  SaveResponse,
} from "../../../server/src/graph/interface";
import { parseDashboard } from "../../../server/src/graph/parser";
import {
  graphLoad,
  graphRender,
  graphSave,
} from "../../../server/src/graph/route";
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

export const load = async (key: string): Promise<LoadResponse> => {
  try {
    const result = await fetchJson(`${apiBase}${graphLoad}`, {
      key,
    });

    return result as LoadResponse;
  } catch (e) {
    return { errors: [e.toString()], expression: "" };
  }
};

export const parse = (expression: string): ClientDashboard | undefined => {
  if (expression.trim() === "") {
    return undefined;
  }

  const json = JSON.parse(expression);

  return parseDashboard(json);
};

export const render = async (
  dashboard: ClientDashboard
): Promise<CompleteDashboard> => {
  try {
    const result = await fetchJson(`${apiBase}${graphRender}`, dashboard);
    const render = result as RenderDashboard;

    return {
      ...render,
      displays: dashboard.displays,
      title: dashboard.title,
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

export const save = async (
  dashboard: ClientDashboard,
  passphrase: string
): Promise<SaveResponse> => {
  try {
    const result = await fetchJson(`${apiBase}${graphSave}`, {
      dashboard,
      passphrase,
    });

    return result as SaveResponse;
  } catch (e) {
    return { errors: [e.toString()], key: "" };
  }
};
