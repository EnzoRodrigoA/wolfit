import { Router } from "express";
import { MethodNotAllowedError } from "#src/infra/errors.js";

import users from "../controllers/users/users.js";

const router = Router();

router.post("/", users.postHandler);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  next(error);
});

export default router;
