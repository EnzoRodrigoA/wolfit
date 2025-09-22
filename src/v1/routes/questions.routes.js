import { Router } from "express";
import { MethodNotAllowedError } from "#src/infra/errors.js";

import questions from "../controllers/questions/questions.js";
const router = Router();

router.get("/", questions.getQuestions);

router.use("/", (request, response, next) => {
  const error = new MethodNotAllowedError();
  next(error);
});

export default router;
