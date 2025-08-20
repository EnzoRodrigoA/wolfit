import { Router } from "express";

import { migrations } from "../controllers/migrations/migrations.js";
import { MethodNotAllowedError } from "#src/infra/errors.js";

const router = Router();

router.get("/", migrations);
router.post("/", migrations);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  next(error);
});

export default router;
