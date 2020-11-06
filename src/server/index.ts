import express, { Router } from "express";
import path from "path";
import { register as registerGraph } from "./graph/controller";
import { AddressInfo } from "net";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 5000;
const router = Router();

router.use(express.json());

app.use("/", express.static(path.join(__dirname, "static")));
app.use("/api", router);

registerGraph(router);

const server = app.listen(port, "0.0.0.0", () => {
  const { port, address } = server.address() as AddressInfo;

  console.log("Server listening on:", "http://" + address + ":" + port);
});
