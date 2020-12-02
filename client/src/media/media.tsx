import React, { useMemo } from "react";
import { ClientRenderEngine, RendererProps } from "./component";
import DebugRenderer from "./renderers/debugRenderer";
import ErrorRenderer from "./renderers/errorRenderer";
import LineChartRenderer from "./renderers/lineChartRenderer";

function getRenderer(engine: ClientRenderEngine) {
  switch (engine) {
    case ClientRenderEngine.Debug:
      return DebugRenderer;

    case ClientRenderEngine.LineChart:
      return LineChartRenderer;

    default:
      return ErrorRenderer(`Unknown rendering engine "${engine}"`);
  }
}

export type MediaProps = RendererProps & {
  engine: ClientRenderEngine;
};

export default function Media(props: MediaProps) {
  const { engine, entity, shift } = props;
  const Renderer = useMemo(() => getRenderer(engine), [engine]);

  return <Renderer entity={entity} shift={shift} />;
}
