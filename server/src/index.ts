import { config } from "dotenv";
import express, { Router } from "express";
import { AddressInfo } from "net";
import path from "path";
import { register as registerDemo } from "./demo/controller";
import { register as registerGraph } from "./graph/controller";
import { apiBase, staticBase } from "./route";

config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 5000;
const router = Router();

router.use(express.json());

app.use(`${apiBase}`, router);
app.use(`${staticBase}`, express.static(path.join(__dirname, "../client")));

registerDemo(router);
registerGraph(router);

const server = app.listen(port, "0.0.0.0", () => {
  const { port } = server.address() as AddressInfo;

  console.log("Server listening on:", "http://localhost:" + port);
});
