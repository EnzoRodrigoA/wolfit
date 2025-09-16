import { Router } from "express";
import { MethodNotAllowedError } from "#src/infra/errors.js";

import topSets from "../controllers/topSets/topSets.js";
const router = Router();

router.post("/", topSets.postHandler);
router.get("/:workoutExerciseId", topSets.getHandler);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  next(error);
});

export default router;
