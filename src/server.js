const express = require("express");
const app = express();
const port = 3030;
require("dotenv").config();

app.use(express.json());

app.get("/", (request, response) => {
  response.status(200).json({ status: "Servidor rodando!" });
});

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
