import React, { useEffect, useState } from "react";
import { demo } from "../graph/demo";
import { useScript } from "../dom/hook";
import { CompleteDashboard, format, parse, render } from "../graph/interface";
import Dashboard from "../graph/components/dashboard";
import { ClientDashboard } from "../../../server/src/graph/interface";

const load = () => {
  const href = new URL(window.location.href);

  return unescape(href.hash.slice(1));
};

const save = (input: string) => {
  window.location.hash = "#" + escape(input);
};

export default function App() {
  useScript("https://cdn.jsdelivr.net/npm/chart.js@2.9.4");

  const [dashboard, setDashboard] = useState<CompleteDashboard>();
  const [input, setInput] = useState(load);

  const changeDashboard = async (client: ClientDashboard | undefined) => {
    const dashboard = await render(client);

    save(format(client, true));
    setDashboard(dashboard);
    setInput(format(client, false));
  };

  const updateDashboard = () => {
    try {
      changeDashboard(parse(input));
    } catch (e) {
      setDashboard({
        displays: [],
        entities: [],
        errors: [e.toString()],
        title: "",
      });
    }
  };

  useEffect(updateDashboard, []);

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
          <input onClick={updateDashboard} type="button" value="Draw" />
        </div>
      </div>
    </>
  );
}
