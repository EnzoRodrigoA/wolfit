import { Router } from "express";
import { MethodNotAllowedError } from "#src/infra/errors.js";

import userSettings from "../controllers/userSettings/userSettings.js";

const router = Router();

router.post("/", userSettings.postHandler);
router.get("/", userSettings.getHandler);
router.patch("/", userSettings.patchHandler);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  next(error);
});

export default router;
