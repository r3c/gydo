import { createHmac } from "crypto";
import { Router } from "express";
import { mariadbQuery } from "../network/mariadb";
import {
  ClientDashboard,
  LoadRequest,
  LoadResponse,
  RenderDashboard,
  SaveRequest,
  SaveResponse,
} from "./interface";
import { graphLoad, graphRender, graphSave } from "./route";
import { parseDashboard } from "./parser";
import { renderDashboard } from "./renderer";
import { asObject, asString } from "../dynamic/type";

const load = async (input: unknown): Promise<LoadResponse> => {
  const loadRequest = asObject<LoadRequest>(input);
  const key = asString(loadRequest?.key);

  if (key === undefined) {
    throw new Error("invalid request");
  }

  const rows = await mariadbQuery(
    "SELECT `data` FROM dashboard WHERE `key` = ?",
    [key]
  );

  if (rows.length < 1) {
    return {
      errors: ["This dashboard doesn't exist"],
      expression: "",
    };
  }

  return { errors: [], expression: rows[0]["data"] };
};

const makeKey = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^0-9a-z]/g, "-")
    .replace(/-+/g, "-");
};

const render = async (input: unknown): Promise<RenderDashboard> => {
  let dashboard: ClientDashboard;

  try {
    dashboard = parseDashboard(input);
  } catch (e) {
    return {
      entities: [],
      errors: [`${e}`],
    };
  }

  return renderDashboard(dashboard);
};

const save = async (input: unknown): Promise<SaveResponse> => {
  const request = asObject<SaveRequest>(input);
  const passphrase = asString(request?.passphrase);

  if (passphrase === undefined) {
    throw new Error("invalid request");
  }

  let dashboard: ClientDashboard;

  try {
    dashboard = parseDashboard(request?.dashboard);
  } catch (e) {
    return { errors: [`${e}`], key: "" };
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
      key: "",
    };
  }

  const result = await mariadbQuery(
    "REPLACE INTO `dashboard` (`key`, `secret`, `data`) VALUES (?, ?, ?)",
    [key, secret, JSON.stringify(dashboard)]
  );

  if (result.affectedRows === 1) {
    return { errors: [], key };
  } else {
    return { errors: ["Could not save dashboard"], key: "" };
  }
};

export const register = (router: Router) => {
  router.post(`${graphLoad}`, async (request, response) => {
    try {
      const result = await load(request.body);

      response.json(result);
    } catch (e) {
      response.status(500).json({ errors: [`${e}`] });
    }
  });

  router.post(`${graphRender}`, async (request, response) => {
    try {
      const result = await render(request.body);

      response.json(result);
    } catch (e) {
      response.status(500).json({ errors: [`${e}`] });
    }
  });

  router.post(`${graphSave}`, async (request, response) => {
    try {
      const result = await save(request.body);

      if (result === undefined) {
        response.json({});
      } else {
        response.status(400).json(result);
      }
    } catch (e) {
      response.status(500).json({ errors: [`${e}`] });
    }
  });
};
