import React, { useMemo } from "react";
import DebugRenderer from "../renderers/debugRenderer";
import ErrorRenderer from "../renderers/errorRenderer";
import LineChartRenderer from "../renderers/lineChartRenderer";
import {
  ClientRenderer,
  RenderEntity,
} from "../../../../server/src/graph/interface";
import BarChartRenderer from "../renderers/barChartRenderer";

export type RendererProps = {
  entity: RenderEntity;
  shift: number;
};

type Props = RendererProps & {
  renderer: ClientRenderer;
};

function getRenderer(renderer: ClientRenderer) {
  switch (renderer) {
    case ClientRenderer.BarChart:
      return BarChartRenderer;

    case ClientRenderer.Debug:
      return DebugRenderer;

    case ClientRenderer.LineChart:
      return LineChartRenderer;

    default:
      return ErrorRenderer(`Unknown rendering engine "${renderer}"`);
  }
}

export default function Renderer(props: Props) {
  const { entity, renderer, shift } = props;
  const Component = useMemo(() => getRenderer(renderer), [renderer]);

  return <Component entity={entity} shift={shift} />;
}
