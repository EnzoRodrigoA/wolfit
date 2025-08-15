import express from "express";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

import StatusRoutesV1 from "./v1/routes/status.routes.js";
import MigrationsRoutesV1 from "./v1/routes/migrations.routes.js";

dotenvExpand.expand(dotenv.config());

const app = express();
const port = process.env.PORT || 3030;

app.use(express.json());

app.use("/api/v1/status", StatusRoutesV1);
app.use("/api/v1/migrations", MigrationsRoutesV1);

app.get("/", (request, response) => {
  response.status(200).json({ status: "Servidor rodando!" });
});

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
