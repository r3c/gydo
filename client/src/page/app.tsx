import React, { useEffect, useState } from "react";
import { demo } from "../graph/demo";
import { useScript } from "../dom/hook";
import {
  CompleteDashboard,
  format,
  parse,
  render,
  save,
} from "../graph/interface";
import Dashboard from "../graph/components/dashboard";

const urlLoad = () => {
  const href = new URL(window.location.href);

  return unescape(href.hash.slice(1));
};

const urlSave = (input: string) => {
  window.location.hash = "#" + escape(input);
};

type SaveResult = {
  error: string | undefined;
  key: string | undefined;
};

export default function App() {
  useScript("https://cdn.jsdelivr.net/npm/chart.js@2.9.4");

  const [dashboard, setDashboard] = useState<CompleteDashboard>();
  const [input, setInput] = useState(urlLoad);
  const [savePassphrase, setSavePassphrase] = useState("");
  const [saveResult, setSaveResult] = useState<SaveResult>();

  const renderDashboard = async () => {
    try {
      const client = parse(input);

      urlSave(format(client, true));

      const dashboard = client !== undefined ? await render(client) : undefined;

      setDashboard(dashboard);
      setInput(format(client, false));
    } catch (e) {
      setDashboard({
        displays: [],
        entities: [],
        errors: [e.toString()],
        title: "",
      });
    }
  };

  const saveDashboard = async () => {
    try {
      const dashboard = parse(input);

      if (dashboard !== undefined) {
        const result = await save(dashboard, savePassphrase);

        if (result.errors.length > 0) {
          setSaveResult({ error: result.errors.join(", "), key: undefined });
        } else {
          setSaveResult({ error: undefined, key: result.key });
        }
      }
    } catch (e) {
      setSaveResult({ error: e.toString(), key: undefined });
    }
  };

  useEffect(() => {
    renderDashboard();
  }, []);

  return (
    <>
      <h1>Graph Your Data Online</h1>
      {dashboard !== undefined &&
      (dashboard.entities.length > 0 || dashboard.errors.length > 0) ? (
        <Dashboard dashboard={dashboard} />
      ) : (
        <div className="container">
          <div className="form">
            <div className="group">
              <input
                className="field"
                type="button"
                onClick={() => setInput(format(demo, false))}
                value="Load demo dashboard"
              />
            </div>
          </div>
        </div>
      )}
      <div className="container form">
        <h2>Input</h2>
        <div className="group">
          <textarea
            className="field"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </div>
        <div className="group">
          <input
            className="field"
            onClick={renderDashboard}
            type="button"
            value="Draw"
          />
          <input
            className="field"
            onClick={saveDashboard}
            type="button"
            value="Save"
          />
          <span className="field">
            Passphrase:{" "}
            <input
              type="password"
              value={savePassphrase}
              onChange={(event) => setSavePassphrase(event.target.value)}
            />
          </span>
          {saveResult && (
            <span className="field">
              {saveResult.key ? (
                <span>
                  Dashboard URL:{" "}
                  <a href={`#${saveResult.key}`}>
                    {new URL("#" + saveResult.key, location.href).href}
                  </a>
                </span>
              ) : (
                saveResult.error ?? "Unknown error"
              )}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
