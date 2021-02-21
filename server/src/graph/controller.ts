import { createHmac } from "crypto";
import { Router } from "express";
import { mariadbQuery } from "../network/mariadb";
import {
  ClientDashboard,
  RenderDashboard,
  SaveRequest,
  SaveResponse,
} from "./interface";
import { graphRender, graphSave } from "./route";
import { parseDashboard } from "./parser";
import { renderDashboard } from "./renderer";
import { asObject, asString } from "../dynamic/type";

const makeKey = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^0-9a-z]/, "-")
    .replace(/-+/, "-");
};

const render = async (input: unknown): Promise<RenderDashboard> => {
  let dashboard: ClientDashboard;

  try {
    dashboard = parseDashboard(input);
  } catch (e) {
    return {
      entities: [],
      errors: [e.toString()],
    };
  }

  return renderDashboard(dashboard);
};

const save = async (input: unknown): Promise<SaveResponse> => {
  const saveRequest = asObject<SaveRequest>(input);
  const passphrase = asString(saveRequest?.passphrase);

  if (saveRequest === undefined || passphrase === undefined) {
    throw new Error("invalid request");
  }

  let dashboard: ClientDashboard;

  try {
    dashboard = parseDashboard(saveRequest?.dashboard);
  } catch (e) {
    return { errors: [e.toString()] };
  }

  const key = makeKey(dashboard.title);

  const rows = await mariadbQuery(
    "SELECT `secret` FROM dashboard WHERE `key` = ?",
    [key, passphrase]
  );

  const secret = createHmac("sha256", key).update(passphrase).digest("base64");

  if (rows.length > 0 && rows[0]["secret"] !== secret) {
    return {
      errors: [
        "This title is already used, please provide passphrase to overwrite it or use a different title",
      ],
    };
  }

  const result = await mariadbQuery(
    "REPLACE INTO `dashboard` (`key`, `secret`, `data`) VALUES (?, ?, ?)",
    [key, secret, JSON.stringify(dashboard)]
  );

  if (result.affectedRows === 1) {
    return { errors: [], key };
  } else {
    return { errors: ["Could not save dashboard"] };
  }
};

export const register = (router: Router) => {
  router.post(`${graphRender}`, async (request, response) => {
    try {
      const rendering = await render(request.body);

      response.json(rendering);
    } catch (error) {
      response.json({ error });
    }
  });

  router.post(`${graphSave}`, async (request, response) => {
    try {
      const result = await save(request.body);

      if (result !== undefined) {
        response.status(400).json(result);
      } else {
        response.status(200).json({});
      }
    } catch (e) {
      response.status(500).json({ errors: [e.toString()] });
    }
  });
};
