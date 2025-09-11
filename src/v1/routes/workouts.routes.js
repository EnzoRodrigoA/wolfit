import { Router } from "express";
import { MethodNotAllowedError } from "#src/infra/errors.js";

import workouts from "../controllers/workouts/workouts.js";
const router = Router();

router.get("/", workouts.getWorkoutsHandler);
router.post("/", workouts.newWorkoutHandler);
router.patch("/reorder", workouts.reorderWorkoutsHandler);
router.patch("/:workoutId", workouts.updateWorkoutHandler);
router.delete("/:workoutId", workouts.deleteWorkoutHandler);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  next(error);
});

export default router;
