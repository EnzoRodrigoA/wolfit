import { Router } from "express";
import StatusRoutesV1 from "./status.routes.js";
import MigrationsRoutesV1 from "./migrations.routes.js";
import UsersRoutesV1 from "./users.routes.js";

const router = Router();

router.use("/status", StatusRoutesV1);
router.use("/migrations", MigrationsRoutesV1);
router.use("/users", UsersRoutesV1);

export default router;
