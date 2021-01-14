import React, { useState } from "react";
import { demo } from "../demo";
import { useScript } from "../dom/hook";
import { fetchJson } from "../network/http";
import { ClientDashboard } from "../dashboard/component";
import { RenderDashboard } from "../server/graph/response";
import { graphRender } from "../server/graph/route";
import { apiBase } from "../server/route";
import Container, { Dashboard } from "../dashboard/container";

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

const render = async (expression: string): Promise<Dashboard> => {
  const client = parse(expression);

  if (client.errors !== undefined && client.errors.length > 0) {
    const errors = client.errors;

    save(undefined);

    return {
      entities: [],
      errors,
    };
  }

  save(client);

  const result = await fetchJson(`${apiBase}${graphRender}`, client);
  const render = result as RenderDashboard;

  return {
    ...client,
    ...render,
  };
};

const save = (dashboard: ClientDashboard | undefined) => {
  const hash = dashboard !== undefined ? format(dashboard, true) : "";

  window.location.hash = escape(hash);
};

export default function App() {
  useScript("https://cdn.jsdelivr.net/npm/chart.js@2.9.4");

  const [dashboard, setDashboard] = useState<Dashboard>();
  const [input, setInput] = useState(load);

  return (
    <>
      <h1>Graph Your Data Online</h1>
      {dashboard !== undefined &&
      (dashboard.entities.length > 0 || dashboard.errors?.length > 0) ? (
        <Container dashboard={dashboard} />
      ) : (
        <div className="container">
          <div className="form">
            <div className="field">
              <input
                type="button"
                onClick={() => setInput(format(demo, false))}
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
            onClick={() => render(input).then(setDashboard)}
            type="button"
            value="Draw"
          />
        </div>
      </div>
    </>
  );
}
