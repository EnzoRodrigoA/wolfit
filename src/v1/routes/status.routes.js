import { Router } from "express";

import { status } from "../controllers/status.js";

const router = Router();

router.get("/", status);

export default router;
