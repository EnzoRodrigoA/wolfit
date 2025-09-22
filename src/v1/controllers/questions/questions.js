import { UnauthorizedError } from "#src/infra/errors.js";
import session from "#src/v1/models/session.js";

async function getQuestions(request, response, next) {
  try {
    const authHeader = request.headers.authorization;
    console.log("AUTH HEADER:", authHeader);
    if (!authHeader) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão válida.",
        action: "Verifique se o usuário está logado e tente novamente.",
      });
    }
    const sessionToken = authHeader.split(" ")[1];
    console.log("SESSION TOKEN:", sessionToken);

    const sessionObject = await session.findOneValidByToken(sessionToken);
    console.log("SESSION OBJECT:", sessionObject);
    const userId = sessionObject.user_id;
    if (!userId) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão válida.",
        action: "Verifique se o usuário está logado e tente novamente.",
      });
    }
    const questions = [
      {
        id: "date_if_birth",
        type: "date",
        label: "Qual sua data de nascimento",
        required: true,
      },
      {
        id: "sex",
        type: "select",
        label: "Qual seu gênero?",
        options: ["male", "female", "other"],
        required: true,
      },
      {
        id: "weight",
        type: "number",
        label: "Qual seu peso atual (kg)?",
        required: true,
      },
      {
        id: "height",
        type: "number",
        label: "Qual sua altura (cm)?",
        required: true,
      },
      {
        id: "experience_level",
        type: "select",
        label: "Qual seu nível de experiência?",
        options: ["beginner", "intermediate", "advanced"],
        required: true,
      },
      {
        id: "frequency",
        type: "slider",
        label: "Quantos dias por semana você pretende treinar?",
        min: 1,
        max: 7,
        default: 3,
        required: true,
      },
      {
        id: "goal",
        type: "select",
        label: "Qual seu objetivo principal?",
        options: ["gain_mass", "lose_fat", "maintain"],
        required: true,
      },
    ];
    return response.status(200).json(questions);
  } catch (error) {
    next(error);
  }
}

const migrations = {
  getQuestions,
};

export default migrations;
