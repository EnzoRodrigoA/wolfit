import workoutExercise from "../../models/workoutExercise.js";
import session from "#src/v1/models/session.js";
import { ValidationError, UnauthorizedError } from "#src/infra/errors.js";

async function addExerciseToWorkoutHandler(request, response, next) {
  try {
    const { workoutId, exerciseId } = request.body;
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
    const newExerciseInWorkout = await workoutExercise.addExerciseToWorkout(
      workoutId,
      exerciseId,
      userId,
    );

    return response.status(201).json(newExerciseInWorkout);
  } catch (error) {
    next(error);
  }
}

async function getAllWorkoutExercisesHandler(request, response, next) {
  try {
    const { workoutId } = request.params;
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
    const workoutExercises =
      await workoutExercise.findWorkoutExercisesByWorkoutId(workoutId, userId);
    return response.status(200).json(workoutExercises);
  } catch (error) {
    next(error);
  }
}

async function deleteExerciseFromWorkoutHandler(request, response, next) {
  try {
    const { workoutExerciseId } = request.params;

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

    const deletedExerciseFromWorkout = await workoutExercise.deleteOneById(
      workoutExerciseId,
      userId,
    );

    return response.status(200).json(deletedExerciseFromWorkout);
  } catch (error) {
    next(error);
  }
}

async function reorderWorkoutExercisesHandler(request, response, next) {
  try {
    const { order } = request.body;
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

    if (!Array.isArray(order) || order.length === 0) {
      throw new ValidationError({
        message: "Ordem não enviada ou incorreta",
        action: "Verifique o corpo da requisição e tente novamente",
      });
    }

    const reorderedWorkout = await workoutExercise.reorderWorkoutExercises(
      userId,
      order,
    );

    return response.status(200).json(reorderedWorkout);
  } catch (error) {
    next(error);
  }
}

const workouts = {
  addExerciseToWorkoutHandler,
  getAllWorkoutExercisesHandler,
  reorderWorkoutExercisesHandler,
  deleteExerciseFromWorkoutHandler,
};

export default workouts;
