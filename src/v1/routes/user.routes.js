import { Router } from "express";
import { MethodNotAllowedError } from "#src/infra/errors.js";

import users from "#controllers/users.controller.js";
import controller from "#infra/controller.js";

const router = Router();

router.use(controller.injectAnonymousOrUser);
router.get("/", controller.canRequest("read:session"), users.getHandler);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  return next(error);
});

export default router;
