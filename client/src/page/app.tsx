import React, { useEffect, useState } from "react";
import { demo } from "../graph/demo";
import { useScript } from "../dom/hook";
import { ClientDashboard } from "../../../server/src/graph/interface";
import { CompleteDashboard, format, parse, render } from "../graph/interface";
import Dashboard from "../graph/components/dashboard";

const draw = async (expression: string): Promise<CompleteDashboard> => {
  try {
    const client = parse(expression);

    save(client);

    return await render(client);
  } catch (e) {
    return {
      displays: [],
      entities: [],
      errors: [e.toString()],
      title: "",
    };
  }
};

const load = () => {
  const href = new URL(window.location.href);
  const expression = unescape(href.hash.slice(1));

  try {
    const dashboard = parse(expression);

    return dashboard !== undefined ? format(dashboard, false) : "";
  } catch (e) {
    return expression;
  }
};

const save = (dashboard: ClientDashboard | undefined) => {
  const hash = dashboard !== undefined ? format(dashboard, true) : "";

  window.location.hash = escape(hash);
};

export default function App() {
  useScript("https://cdn.jsdelivr.net/npm/chart.js@2.9.4");

  const [dashboard, setDashboard] = useState<CompleteDashboard>();
  const [input, setInput] = useState(load);

  const update = () => {
    draw(input).then(setDashboard);
  };

  useEffect(update, []);

  return (
    <>
      <h1>Graph Your Data Online</h1>
      {dashboard !== undefined &&
      (dashboard.entities.length > 0 || dashboard.errors.length > 0) ? (
        <Dashboard dashboard={dashboard} />
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
          <input onClick={update} type="button" value="Draw" />
        </div>
      </div>
    </>
  );
}
