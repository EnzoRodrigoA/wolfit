import { Router } from "express";

import { status } from "../controllers/status/status.js";

const router = Router();

router.get("/", status);

export default router;
