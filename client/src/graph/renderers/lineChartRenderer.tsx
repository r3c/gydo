import React from "react";
import { RendererProps } from "../components/renderer";
import JsChartRenderer from "./jsChartRenderer";

export default function LineChartRenderer(props: RendererProps) {
  return <JsChartRenderer {...props} type="line" />;
}
