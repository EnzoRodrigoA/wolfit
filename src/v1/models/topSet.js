import database from "#src/infra/database.js";
import { UnauthorizedError, NotFoundError } from "#src/infra/errors.js";

async function addTopSetToWorkoutExercise(
  workoutExerciseId,
  userId,
  load,
  reps,
) {
  if (!workoutExerciseId) {
    throw new NotFoundError({
      message: "Treino ou Exercício não encontrados.",
      action: "Verifique se os dados enviados estão corretos.",
    });
  }

  const newExerciseInWorkout = await runInsertQuery(
    workoutExerciseId,
    userId,
    load,
    reps,
  );

  return newExerciseInWorkout;

  async function runInsertQuery(workoutExerciseId, userId, load, reps) {
    const results = await database.query({
      text: `
        INSERT INTO
          top_sets (workout_exercise_id, user_id, load, reps)
        SELECT
          $1, $2, $3, $4
        RETURNING
          *
      ;`,
      values: [workoutExerciseId, userId, load, reps],
    });
    if (results.rowCount === 0) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão válida.",
        action: "Verifique se o usuário está logado e tente novamente.",
      });
    }

    return results.rows[0];
  }
}

async function findAllAtWorkoutExerciseId(userId, workoutExerciseId) {
  if (!workoutExerciseId) {
    throw new NotFoundError({
      message: "Treino ou Exercício não encontrados.",
      action: "Verifique se os dados enviados estão corretos.",
    });
  }

  const newExerciseInWorkout = await runSelectQuery(userId, workoutExerciseId);

  return newExerciseInWorkout;

  async function runSelectQuery(userId, workoutExerciseId) {
    const results = await database.query({
      text: `
        SELECT
          ts.*, we.exercise_id, e.exercise_name AS name
        FROM
          top_sets ts
        JOIN 
          workout_exercise we ON we.id = ts.workout_exercise_id
        JOIN
          exercises e ON we.exercise_id = e.id
        WHERE
          ts.user_id = $1
        AND
          ts.workout_exercise_id = $2
        ORDER BY
          date DESC
      ;`,
      values: [userId, workoutExerciseId],
    });

    if (results.rowCount === 0) {
      return "Nenhum registro";
    }
    return results.rows;
  }
}

const workoutExercise = {
  addTopSetToWorkoutExercise,
  findAllAtWorkoutExerciseId,
};

export default workoutExercise;
