import { Router } from "express";
import { MethodNotAllowedError } from "#src/infra/errors.js";

import exercises from "../controllers/exercises/exercises.js";
const router = Router();

router.get("/", exercises.getExercisesByFilterParameters);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  next(error);
});

export default router;
