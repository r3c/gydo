import React, { useEffect, useState } from "react";
import { demo } from "../demo";
import { useScript } from "../dom/hook";
import { fetchJson } from "../network/http";
import { ClientDashboard, ClientRenderEngine } from "../media/component";
import { RenderDashboard } from "../server/graph/response";
import { graphRender } from "../server/graph/route";
import { apiBase } from "../server/route";
import Media from "../media/media";

type Dashboard = ClientDashboard & RenderDashboard;

const format = (dashboard: ClientDashboard, compact: boolean) => {
  return compact
    ? JSON.stringify(dashboard)
    : JSON.stringify(dashboard, null, 2);
};

const load = () => {
  const href = new URL(window.location.href);
  const hash = unescape(href.hash.slice(1));

  return hash;
};

const parse = (expression: string): ClientDashboard => {
  if (expression.trim() === "") {
    return {};
  }

  try {
    return JSON.parse(expression) as ClientDashboard;
  } catch (e) {
    return { errors: [`could not parse expression: ${e}`] };
  }
};

const render = async (expression: string): Promise<Dashboard | undefined> => {
  const client = parse(expression);

  if (client.errors !== undefined && client.errors.length > 0) {
    const errors = client.errors;

    return {
      entities: [],
      errors,
    };
  }

  if (client.panels === undefined && client.title === undefined) {
    return undefined;
  }

  save(client);

  const result = await fetchJson(`${apiBase}${graphRender}`, client);
  const render = result as RenderDashboard;

  return {
    ...client,
    ...render,
  };
};

const save = (dashboard: ClientDashboard) => {
  window.location.hash = escape(format(dashboard, true));
};

export default function App() {
  useScript("https://cdn.jsdelivr.net/npm/chart.js@2.9.4");

  const [expression, setExpression] = useState(load);
  const [dashboard, setDashboard] = useState<Dashboard>();
  const [input, setInput] = useState(() => format(parse(expression), false));

  useEffect(() => {
    render(expression).then(setDashboard);
  }, [expression]);

  const entities = dashboard?.entities ?? [];
  const errors = dashboard?.errors ?? [];
  const panels = dashboard?.panels ?? [];

  return (
    <>
      <h1>Graph Your Data Online</h1>
      {entities.length > 0 || errors.length > 0 ? (
        <div className="container">
          <h2>{dashboard?.title ?? "Untitled dashboard"}</h2>
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
                onClick={() => setExpression(format(demo, false))}
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
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </div>
        <div className="field">
          <input
            onClick={() => setExpression(input)}
            type="button"
            value="Draw"
          />
        </div>
      </div>
    </>
  );
}
