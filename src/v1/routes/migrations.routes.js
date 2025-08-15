import { Router } from "express";

import { migrations } from "../controllers/migrations/migrations.js";

const router = Router();

router.get("/", migrations);
router.post("/", migrations);

export default router;
