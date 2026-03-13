import { Router } from "express";
import { MethodNotAllowedError } from "#src/infra/errors.js";

import sessions from "#controllers/sessions.controller.js";
import controller from "#src/infra/controller.js";

const router = Router();

router.use(controller.injectAnonymousOrUser);
router.post("/", controller.canRequest("create:session"), sessions.postHandler);
router.delete("/", sessions.deleteHandler);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  return next(error);
});

export default router;
