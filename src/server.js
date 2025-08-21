import express from "express";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

dotenvExpand.expand(dotenv.config({ path: ".env.development", quiet: true }));

import StatusRoutesV1 from "./v1/routes/status.routes.js";
import MigrationsRoutesV1 from "./v1/routes/migrations.routes.js";
import { InternalServerError } from "./infra/errors.js";

const app = express();
const port = process.env.PORT || 3030;

app.use(express.json());

app.use("/api/v1/status", StatusRoutesV1);
app.use("/api/v1/migrations", MigrationsRoutesV1);

app.get("/", (request, response) => {
  response.status(200).json({ status: "Servidor rodando!" });
});

// eslint-disable-next-line no-unused-vars
app.use((error, request, response, next) => {
  const statusCode = error.statusCode;
  const publicErrorObject =
    statusCode >= 500
      ? new InternalServerError({
          cause: error,
          statusCode: statusCode,
        })
      : error;
  if (process.env.NODE_ENV !== "production") {
    if (statusCode >= 500) {
      console.error(error);
    } else {
      console.info("\n", statusCode, `- ${error.name} - ${error.action} \n`);
    }
  }
  response.status(statusCode).json(publicErrorObject);
});

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
