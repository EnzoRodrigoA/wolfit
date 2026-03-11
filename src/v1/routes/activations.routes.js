import { Router } from "express";
import { MethodNotAllowedError } from "#src/infra/errors.js";
import activations from "#controllers/activations.controller.js";

const router = Router();

router.patch("/:token_id", activations.patchHandler);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  next(error);
});

export default router;
