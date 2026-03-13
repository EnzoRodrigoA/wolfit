import { Router } from "express";
import { MethodNotAllowedError } from "#src/infra/errors.js";
import activations from "#controllers/activations.controller.js";
import controller from "#src/infra/controller.js";

const router = Router();
router.use(controller.injectAnonymousOrUser);
router.patch(
  "/:token_id",
  controller.canRequest("read:activation_token"),
  activations.patchHandler,
);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  next(error);
});

export default router;
