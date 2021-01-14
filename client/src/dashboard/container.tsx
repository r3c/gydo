import React from "react";
import { ClientDashboard, ClientRenderer } from "./component";
import { RenderDashboard } from "../server/graph/response";
import Renderer from "./renderer";

export type Dashboard = ClientDashboard & RenderDashboard;

type Props = {
  dashboard: Dashboard;
};

export default function Container(props: Props) {
  const { dashboard } = props;

  const displays = dashboard.displays ?? [];
  const entities = dashboard.entities ?? [];

  return (
    <div className="container">
      <h2>{dashboard?.title ?? "Untitled dashboard"}</h2>
      <div className="tiles">
        {dashboard.errors.length > 0 && (
          <div className="tile">
            <ul className="errors">
              {dashboard.errors.map((error) => (
                <li className="error">{error}</li>
              ))}
            </ul>
          </div>
        )}
        {entities.map((entity, index) => (
          <div key={index} className="tile">
            <h3>{displays[index]?.title ?? "Unknown"}</h3>
            <Renderer
              entity={entity}
              renderer={displays[index]?.renderer ?? ClientRenderer.Debug}
              shift={index}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
