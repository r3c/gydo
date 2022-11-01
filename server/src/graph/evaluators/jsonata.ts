import jsonata, { JsonataError } from "jsonata";
import { RenderQuery, RenderState } from "../interface";

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
    const jError = error as JsonataError;

    return {
      errors: [`${jError.message} at character ${jError.position}`],
      value: undefined,
    };
  }
}
