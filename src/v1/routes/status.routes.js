import { Router } from "express";
import { MethodNotAllowedError } from "#src/infra/errors.js";

import status from "../controllers/status/status.js";

const router = Router();

router.get("/", status);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  next(error);
});

export default router;
