import { Router } from "express";
import { MethodNotAllowedError } from "#infra/errors.js";
import controller from "#infra/controller.js";

import status from "#controllers/status.controller.js";

const router = Router();

router.use(controller.injectAnonymousOrUser);
router.get("/", status);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  next(error);
});

export default router;
