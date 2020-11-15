import React, { useEffect, useState } from "react";
import { demo } from "../demo";
import { useScript } from "../dom/hook";
import { fetchJson } from "../network/http";
import { Dashboard } from "../server/graph/request";
import { Rendering } from "../server/graph/response";
import { graphRender } from "../server/graph/route";
import { apiBase } from "../server/route";

const formatExpression = (
  dashboard: Dashboard | undefined,
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

  return formatExpression(parseExpression(hash));
};

const parseExpression = (expression: string) => {
  try {
    return JSON.parse(expression) as Dashboard;
  } catch (e) {
    return undefined;
  }
};

const render = async (dashboard: Dashboard | undefined) => {
  if (dashboard === undefined) {
    return undefined;
  }

  const json = await fetchJson(`${apiBase}${graphRender}`, dashboard);
  const output = json as Rendering;

  if (
    output.errors === undefined &&
    output.panels === undefined &&
    output.title === undefined
  ) {
    return undefined;
  }

  window.location.hash = escape(formatExpression(dashboard, true));

  return output;
};

function App() {
  useScript("https://cdn.jsdelivr.net/npm/chart.js@2.9.4");

  const [expression, setExpression] = useState(loadExpression);
  const [dashboard, setDashboard] = useState(parseExpression(expression));
  const [rendering, setRendering] = useState<Rendering>();

  useEffect(() => {
    render(dashboard).then(setRendering);
  }, [dashboard]);

  return (
    <>
      <h1>Graph Your Data Online</h1>
      {rendering ? (
        <div className="container">
          <h2>{rendering.title}</h2>
          <div className="tiles">
            {rendering.errors && (
              <div v-if="rendering.errors" className="tile">
                <ul className="errors">
                  {rendering.errors.map((error: any) => (
                    <li v-for="error of rendering.errors" className="error">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {rendering.panels &&
              rendering.panels.map((panel, index) => {
                const panelId = `panel${index}`;

                // eslint-disable-next-line no-implied-eval
                setTimeout(
                  `(function() { var panel = document.getElementById('${panelId}'); ${panel.script} })();`,
                  0
                );

                return (
                  <div key={index} className="tile">
                    <h3>{panel.title}</h3>
                    {panel.errors &&
                      panel.errors.map((error: any) => (
                        <div className="error">{error}</div>
                      ))}
                    {panel.contents && (
                      <div
                        id={panelId}
                        dangerouslySetInnerHTML={{ __html: panel.contents }}
                      ></div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <div className="container">
          <input
            type="button"
            onClick={() => setExpression(formatExpression(demo))}
            value="Load demo dashboard"
          />
        </div>
      )}
      <div className="container form">
        <h2>Input dashboard</h2>
        <div className="field">
          <textarea
            value={expression}
            onBlur={() =>
              setExpression(
                formatExpression(parseExpression(expression)) || expression
              )
            }
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

export default App;
