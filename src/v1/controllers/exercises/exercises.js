import exercise from "#src/v1/models/exercise.js";

async function getExercisesByFilterParameters(request, response, next) {
  try {
    const { muscle, name } = request.query;

    const exercisesFound = await exercise.findExercisesByParameters(
      muscle,
      name,
    );

    return response.status(200).json(exercisesFound);
  } catch (error) {
    next(error);
  }
}

const exercises = {
  getExercisesByFilterParameters,
};

export default exercises;
