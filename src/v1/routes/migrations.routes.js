import { Router } from "express";

import migrations from "#controllers/migrations.controller.js";
import { MethodNotAllowedError } from "#src/infra/errors.js";
import controller from "#infra/controller.js";

const router = Router();

router.use(controller.injectAnonymousOrUser);
router.get("/", controller.canRequest("read:migration"), migrations.getHandler);
router.post(
  "/",
  controller.canRequest("create:migration"),
  migrations.postHandler,
);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  next(error);
});

export default router;
