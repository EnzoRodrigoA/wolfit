import { Router } from "express";
import { MethodNotAllowedError } from "#src/infra/errors.js";

import workoutExercises from "../controllers/workoutExercises/workoutExercises.js";
const router = Router();

router.post("/", workoutExercises.addExerciseToWorkoutHandler);
router.delete(
  "/:workoutExerciseId",
  workoutExercises.deleteExerciseFromWorkoutHandler,
);
router.patch("/reorder", workoutExercises.reorderWorkoutExercisesHandler);
router.get("/:workoutId", workoutExercises.getAllWorkoutExercisesHandler);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  next(error);
});

export default router;
