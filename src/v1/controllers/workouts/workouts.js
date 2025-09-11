import workout from "../../models/workout.js";
import session from "#src/v1/models/session.js";
import { ValidationError } from "#src/infra/errors.js";

async function newWorkoutHandler(request, response, next) {
  try {
    const { name } = request.body;

    const sessionToken = request.cookies.session_id;

    const sessionObject = await session.findOneValidByToken(sessionToken);
    const userId = sessionObject.user_id;
    const newWorkout = await workout.createWorkout(userId, name);

    return response.status(201).json(newWorkout);
  } catch (error) {
    next(error);
  }
}

async function newRestDayHandler(request, response, next) {
  try {
    const sessionToken = request.cookies.session_id;

    const sessionObject = await session.findOneValidByToken(sessionToken);
    const userId = sessionObject.user_id;
    const newRestDay = await workout.createRestDay(userId);

    return response.status(201).json(newRestDay);
  } catch (error) {
    next(error);
  }
}

async function updateWorkoutHandler(request, response, next) {
  try {
    const { complete, name } = request.body;
    const { workoutId } = request.params;
    const sessionToken = request.cookies.session_id;
    const sessionObject = await session.findOneValidByToken(sessionToken);
    const userId = sessionObject.user_id;

    let updatedWorkout;
    if (name) {
      updatedWorkout = await workout.updateWorkout(workoutId, userId, name);
    } else if (complete === true) {
      updatedWorkout = await workout.completeWorkout(workoutId, userId);
    } else {
      throw new ValidationError({
        message: "Dados não inseridos ou inválidos",
        action: "Verifique se os dados enviados estão corretos",
      });
    }
    return response.status(200).json(updatedWorkout);
  } catch (error) {
    next(error);
  }
}

async function reorderWorkoutsHandler(request, response, next) {
  try {
    const { order } = request.body;
    const sessionToken = request.cookies.session_id;

    const sessionObject = await session.findOneValidByToken(sessionToken);
    const userId = sessionObject.user_id;

    if (!Array.isArray(order) || order.length === 0) {
      throw new ValidationError({
        message: "Ordem não enviada ou incorreta",
        action: "Verifique o corpo da requisição e tente novamente",
      });
    }

    const reorderedWorkout = await workout.reorderWorkouts(userId, order);

    return response.status(200).json(reorderedWorkout);
  } catch (error) {
    next(error);
  }
}

async function getWorkoutsHandler(request, response, next) {
  try {
    const sessionToken = request.cookies.session_id;
    const sessionObject = await session.findOneValidByToken(sessionToken);
    const userId = sessionObject.user_id;

    const userWorkouts = await workout.findAllByUserId(userId);

    return response.status(200).json(userWorkouts);
  } catch (error) {
    next(error);
  }
}

async function getTodaysWorkoutHandler(request, response, next) {
  try {
    const sessionToken = request.cookies.session_id;
    const sessionObject = await session.findOneValidByToken(sessionToken);
    const userId = sessionObject.user_id;

    const todaysWorkout = await workout.getTodaysWorkout(userId);

    return response.status(200).json(todaysWorkout);
  } catch (error) {
    next(error);
  }
}

async function deleteWorkoutHandler(request, response, next) {
  try {
    const { workoutId } = request.params;

    const sessionToken = request.cookies.session_id;
    const sessionObject = await session.findOneValidByToken(sessionToken);
    const userId = sessionObject.user_id;

    const deletedWorkout = await workout.deleteOneById(workoutId, userId);

    return response.status(200).json(deletedWorkout);
  } catch (error) {
    next(error);
  }
}

const workouts = {
  newWorkoutHandler,
  newRestDayHandler,
  getWorkoutsHandler,
  getTodaysWorkoutHandler,
  updateWorkoutHandler,
  reorderWorkoutsHandler,
  deleteWorkoutHandler,
};

export default workouts;
