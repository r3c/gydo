import { RenderQuery } from "../response";
import fetch from "node-fetch";

export async function evaluateFromHttp(source: string): Promise<RenderQuery> {
  const response = await fetch(source);
  const type = response.headers.get("Content-Type") ?? "";

  switch (type.replace(/;.*/, "").toLowerCase()) {
    case "application/json":
    case "text/json":
      return {
        errors: [],
        value: await response.json(),
      };

    default:
      return {
        errors: [`media ${type} not supported`],
        value: undefined,
      };
  }
}