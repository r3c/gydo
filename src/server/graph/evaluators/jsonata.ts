import jsonata from "jsonata";
import { Query } from "../request";
import { Serie } from "../response";

export const evaluateJsonata = (
  query: Query,
  data: any
): Omit<Serie, "label"> => {
  try {
    const evaluator = jsonata(query.expression);
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
