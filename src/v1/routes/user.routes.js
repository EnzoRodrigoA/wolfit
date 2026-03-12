import { Router } from "express";
import { MethodNotAllowedError } from "#src/infra/errors.js";

import users from "#controllers/users.controller.js";

const router = Router();

router.get("/", users.getHandler);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  return next(error);
});

export default router;
