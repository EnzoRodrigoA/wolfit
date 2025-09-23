import topSet from "../../models/topSet.js";
import session from "#src/v1/models/session.js";
import { UnauthorizedError, ValidationError } from "#src/infra/errors.js";

async function postHandler(request, response, next) {
  try {
    const { workoutExerciseId, load, reps } = request.body;

    if (!workoutExerciseId || !load || !reps) {
      throw new ValidationError({
        message: "Dados inválidos",
        action: "Verifique os dados enviados e tente novamente",
      });
    }
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão válida.",
        action: "Verifique se o usuário está logado e tente novamente.",
      });
    }
    const sessionToken = authHeader.split(" ")[1];
    const sessionObject = await session.findOneValidByToken(sessionToken);
    const userId = sessionObject.user_id;

    const lastTopSet = await topSet.findAllAtWorkoutExerciseId(
      userId,
      workoutExerciseId,
    );

    const newTopSet = await topSet.addTopSetToWorkoutExercise(
      workoutExerciseId,
      userId,
      load,
      reps,
    );

    function calculatePercentage() {
      let part = newTopSet.load - lastTopSet[0].load;
      let total = lastTopSet[0].load;
      if (total === 0) {
        return 0;
      }
      return (part / total) * 100;
    }

    let message;
    if (lastTopSet === "Nenhum registro") {
      message = "Primeiro registro!";
    }
    if (
      lastTopSet[0].id !== newTopSet.id &&
      lastTopSet[0].load < newTopSet.load
    ) {
      const percentage = calculatePercentage();
      message = `Você aumentou a carga em ${percentage.toFixed(2)}%!`;
    }
    if (
      lastTopSet[0].id !== newTopSet.id &&
      lastTopSet[0].load === newTopSet.load
    ) {
      message = "Você manteve a mesma carga!";
    }
    if (
      lastTopSet[0].id !== newTopSet.id &&
      lastTopSet[0].reps < newTopSet.reps
    ) {
      const newReps = newTopSet.reps - lastTopSet[0].reps;
      if (newReps === 1) {
        message = `Você aumentou ${newReps} repetição!`;
      } else {
        message = `Você aumentou ${newReps} repetições!`;
      }
    }

    const responseObject = {
      message,
      newTopSet,
    };

    return response.status(201).json(responseObject);
  } catch (error) {
    next(error);
  }
}

async function getHandler(request, response, next) {
  try {
    const { workoutExerciseId } = request.params;

    if (!workoutExerciseId) {
      throw new ValidationError({
        message: "Dados inválidos",
        action: "Verifique os dados enviados e tente novamente",
      });
    }

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão válida.",
        action: "Verifique se o usuário está logado e tente novamente.",
      });
    }
    const sessionToken = authHeader.split(" ")[1];

    const sessionObject = await session.findOneValidByToken(sessionToken);
    const userId = sessionObject.user_id;
    const topSets = await topSet.findAllAtWorkoutExerciseId(
      userId,
      workoutExerciseId,
    );

    return response.status(200).json(topSets);
  } catch (error) {
    next(error);
  }
}

const topSets = {
  postHandler,
  getHandler,
};

export default topSets;
