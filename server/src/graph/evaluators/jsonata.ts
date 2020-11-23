import jsonata from "jsonata";
import { Serie } from "../response";

export const evaluateJsonata = (
  expression: string,
  data: any
): Omit<Serie, "name"> => {
  try {
    const evaluator = jsonata(expression);
    const points = evaluator.evaluate(data);

    return {
      points,
    };
  } catch (error) {
    return {
      errors: [`${error.message} at character ${error.position}`],
    };
  }
};
