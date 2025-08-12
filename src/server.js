import express from "express";
import dotenv from "dotenv";

import StatusRoutesV1 from "./v1/routes/status.routes.js";

const app = express();
const port = 3030;
dotenv.config();

app.use(express.json());

app.use("/api/v1/status", StatusRoutesV1);

app.get("/", (request, response) => {
  response.status(200).json({ status: "Servidor rodando!" });
});

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
