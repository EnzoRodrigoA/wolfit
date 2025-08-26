import express from "express";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

import logger from "./middlewares/logger.js";
import globalErrorCatcher from "./middlewares/globalErrorCatcher.js";

import StatusRoutesV1 from "./v1/routes/status.routes.js";
import MigrationsRoutesV1 from "./v1/routes/migrations.routes.js";
import UsersRoutesV1 from "./v1/routes/users.routes.js";

dotenvExpand.expand(dotenv.config({ path: ".env.development", quiet: true }));

const app = express();
const port = process.env.PORT || 3030;

app.use(express.json());
app.use(logger);

app.use("/api/v1/status", StatusRoutesV1);
app.use("/api/v1/migrations", MigrationsRoutesV1);
app.use("/api/v1/users", UsersRoutesV1);

app.get("/", (request, response) => {
  response.status(200).json({ status: "Servidor rodando!" });
});

app.use(globalErrorCatcher);

app.listen(port, () => {
  console.log(`\n API rodando em http://localhost:${port} \n`);
});
