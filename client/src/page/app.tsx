import React, { useEffect, useState } from "react";
import { demo } from "../demo";
import { useScript } from "../dom/hook";
import { fetchJson } from "../network/http";
import { ClientDashboard, ClientRenderEngine } from "../media/component";
import { RenderDashboard } from "../server/graph/response";
import { graphRender } from "../server/graph/route";
import { apiBase } from "../server/route";
import Media from "../media/media";

const formatExpression = (
  dashboard: ClientDashboard | undefined,
  compact: boolean = false
) => {
  if (dashboard === undefined) {
    return "";
  }

  return compact
    ? JSON.stringify(dashboard)
    : JSON.stringify(dashboard, null, 2);
};

const loadExpression = () => {
  const href = new URL(window.location.href);
  const hash = unescape(href.hash.slice(1));
  const dashboard = parseExpression(hash);

  return dashboard.errors === undefined || dashboard.errors.length === 0
    ? formatExpression(dashboard)
    : "";
};

const parseExpression = (expression: string): ClientDashboard => {
  try {
    return JSON.parse(expression) as ClientDashboard;
  } catch (e) {
    return { errors: [`could not parse expression: ${e}`] };
  }
};

const render = async (dashboard: ClientDashboard) => {
  const json = await fetchJson(`${apiBase}${graphRender}`, dashboard);
  const output = json as RenderDashboard;

  if (output.entities === undefined && output.errors === undefined) {
    return undefined;
  }

  window.location.hash = escape(formatExpression(dashboard, true));

  return output;
};

export default function App() {
  useScript("https://cdn.jsdelivr.net/npm/chart.js@2.9.4");

  const [expression, setExpression] = useState(loadExpression);
  const [dashboard, setDashboard] = useState(() => parseExpression(expression));
  const [rendering, setRendering] = useState<RenderDashboard>();

  useEffect(() => {
    render(dashboard).then(setRendering);
  }, [dashboard]);

  const entities = rendering?.entities ?? [];
  const errors = [...(dashboard.errors ?? []), ...(rendering?.errors ?? [])];
  const panels = dashboard.panels ?? [];

  return (
    <>
      <h1>Graph Your Data Online</h1>
      {entities.length > 0 || errors.length > 0 ? (
        <div className="container">
          <h2>{dashboard.title ?? "Untitled dashboard"}</h2>
          <div className="tiles">
            {errors.length > 0 && (
              <div className="tile">
                <ul className="errors">
                  {errors.map((error: any) => (
                    <li className="error">{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {entities.map((entity, index) => (
              <div key={index} className="tile">
                <h3>{panels[index]?.title ?? "Unknown"}</h3>
                <Media
                  engine={panels[index]?.engine ?? ClientRenderEngine.Debug}
                  entity={entity}
                  shift={index}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="container">
          <div className="form">
            <div className="field">
              <input
                type="button"
                onClick={() => setExpression(formatExpression(demo))}
                value="Load demo dashboard"
              />
            </div>
          </div>
        </div>
      )}
      <div className="container form">
        <h2>Input dashboard</h2>
        <div className="field">
          <textarea
            value={expression}
            onChange={(event) => setExpression(event.target.value)}
          />
        </div>
        <div className="field">
          <input
            onClick={() => setDashboard(parseExpression(expression))}
            type="button"
            value="Draw"
          />
        </div>
      </div>
    </>
  );
}
