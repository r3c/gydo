import React from "react";
import { RendererProps } from "../components/renderer";

export default function DebugRenderer(props: RendererProps) {
  const { entity } = props;
  const { labels, series } = entity;

  return <pre>{JSON.stringify({ labels, series }, null, 2)}</pre>;
}
