import { Router } from "express";
import { MethodNotAllowedError } from "#src/infra/errors.js";

import sessions from "../controllers/sessions/sessions.js";

const router = Router();

router.post("/", sessions.postHandler);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  next(error);
});

export default router;
