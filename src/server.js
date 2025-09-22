import express from "express";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import cookieParser from "cookie-parser";
import cors from "cors";

import logger from "./middlewares/logger.js";
import globalErrorCatcher from "./middlewares/globalErrorCatcher.js";
import appRouter from "./v1/routes/appRouter.js";

dotenvExpand.expand(dotenv.config({ path: ".env.development", quiet: true }));

const app = express();
const port = process.env.PORT || 3030;

app.use(express.json());
app.use(
  cors({
    origin: "exp//192.168.1.227:8081",
    credentials: true,
  }),
);
app.use(logger);
app.use(cookieParser());

app.use("/api/v1", appRouter);

app.get("/", (request, response) => {
  response.status(200).json({ status: "Servidor rodando!" });
});

app.use(globalErrorCatcher);

app.listen(port, () => {
  console.log(`\n API rodando em http://localhost:${port} \n`);
});
