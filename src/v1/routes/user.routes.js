import { Router } from "express";
import { MethodNotAllowedError } from "#src/infra/errors.js";

import userSession from "../controllers/user/user.js";

const router = Router();

router.get("/", userSession.getHandler);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  next(error);
});

export default router;
