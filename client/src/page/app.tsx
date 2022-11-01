import React, { useEffect, useState } from "react";
import { demo } from "../graph/demo";
import { useScript } from "../dom/hook";
import {
  CompleteDashboard,
  format,
  load,
  parse,
  render,
  save,
} from "../graph/interface";
import Dashboard from "../graph/components/dashboard";

const urlAbsolute = (relative: string) => {
  return new URL(relative, location.href).href;
};

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
  const [input, setInput] = useState("");
  const [savePassphrase, setSavePassphrase] = useState("");
  const [saveResult, setSaveResult] = useState<SaveResult>();

  const renderDashboard = async (input: string) => {
    try {
      const client = parse(input);

      setInput(format(client, false));
      urlSave(format(client, true));

      const dashboard = client !== undefined ? await render(client) : undefined;

      setDashboard(dashboard);
    } catch (e) {
      setDashboard({
        displays: [],
        entities: [],
        errors: [`${e}`],
        title: "",
      });
    }
  };

  const saveDashboard = async (input: string) => {
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
      setSaveResult({ error: `${e}`, key: undefined });
    }
  };

  useEffect(() => {
    const payload = urlLoad();

    if (/^[-0-9a-z]+$/.test(payload)) {
      load(payload)
        .then((response) => {
          if (response.errors.length > 0) {
            setDashboard({
              displays: [],
              entities: [],
              errors: response.errors,
              title: "",
            });
          } else {
            renderDashboard(response.expression);
          }
        })
        .catch((e) => {
          setDashboard({
            displays: [],
            entities: [],
            errors: [e.toString()],
            title: "",
          });
        });
    } else {
      renderDashboard(payload);
    }
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
            onClick={() => renderDashboard(input)}
            type="button"
            value="Draw"
          />
          <input
            className="field"
            onClick={() => saveDashboard(input)}
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
                    {urlAbsolute(`#${saveResult.key}`)}
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
