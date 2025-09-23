import { Router } from "express";
import StatusRoutesV1 from "./status.routes.js";
import MigrationsRoutesV1 from "./migrations.routes.js";
import UsersRoutesV1 from "./users.routes.js";
import UserRoutesV1 from "./user.routes.js";
import SessionsRoutesV1 from "./sessions.routes.js";
import ExercisesRoutesV1 from "./exercises.routes.js";
import WorkoutsRoutesV1 from "./workouts.routes.js";
import WorkoutExercisesRoutesV1 from "./workoutExercises.routes.js";
import TopSetsRoutesV1 from "./topSet.routes.js";
import QuestionRoutesV1 from "./questions.routes.js";
import UserSettingsRoutesv1 from "./userSettings.routes.js";

const router = Router();

router.use("/status", StatusRoutesV1);
router.use("/migrations", MigrationsRoutesV1);
router.use("/users", UsersRoutesV1);
router.use("/user", UserRoutesV1);
router.use("/sessions", SessionsRoutesV1);
router.use("/exercises", ExercisesRoutesV1);
router.use("/workouts", WorkoutsRoutesV1);
router.use("/workout-exercises", WorkoutExercisesRoutesV1);
router.use("/top-set", TopSetsRoutesV1);
router.use("/questions", QuestionRoutesV1);
router.use("/user-settings", UserSettingsRoutesv1);

export default router;
