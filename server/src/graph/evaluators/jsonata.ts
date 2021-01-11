import jsonata from "jsonata";
import { RenderQuery, RenderState } from "../response";

export async function evaluateFromJsonata(
  expression: string,
  state: RenderState
): Promise<RenderQuery> {
  try {
    const evaluator = jsonata(expression);
    const value = evaluator.evaluate(state);

    return {
      errors: [],
      value,
    };
  } catch (error) {
    return {
      errors: [`${error.message} at character ${error.position}`],
      value: undefined,
    };
  }
}
