import { Router } from "express";
import StatusRoutesV1 from "./status.routes.js";
import MigrationsRoutesV1 from "./migrations.routes.js";
import UsersRoutesV1 from "./users.routes.js";
import UserRoutesV1 from "./user.routes.js";
import SessionsRoutesV1 from "./sessions.routes.js";
import ExercisesRoutesV1 from "./exercises.routes.js";

const router = Router();

router.use("/status", StatusRoutesV1);
router.use("/migrations", MigrationsRoutesV1);
router.use("/users", UsersRoutesV1);
router.use("/user", UserRoutesV1);
router.use("/sessions", SessionsRoutesV1);
router.use("/exercises", ExercisesRoutesV1);

export default router;
