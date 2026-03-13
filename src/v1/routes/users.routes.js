import { Router } from "express";
import { MethodNotAllowedError } from "#src/infra/errors.js";

import users from "#controllers/users.controller.js";
import controller from "#src/infra/controller.js";

const router = Router();

router.use(controller.injectAnonymousOrUser);
router.post("/", controller.canRequest("create:user"), users.postHandler);
router.patch("/:username", users.patchHandler);
router.get("/:username", users.getOneByUsername);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  return next(error);
});

export default router;
