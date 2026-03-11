import { Router } from "express";
import { MethodNotAllowedError } from "#src/infra/errors.js";

import users from "#controllers/users.js";

const router = Router();

router.post("/", users.postHandler);
router.patch("/:username", users.patchHandler);
router.get("/:username", users.getOneByUsername);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  next(error);
});

export default router;
