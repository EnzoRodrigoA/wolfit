import database from "#src/infra/database.js";
import { UnauthorizedError, NotFoundError } from "#src/infra/errors.js";

async function addExerciseToWorkout(workoutId, exerciseId, userId) {
  if (!workoutId || !exerciseId) {
    throw new NotFoundError({
      message: "Treino ou Exercício não encontrados.",
      action: "Verifique se os dados enviados estão corretos.",
    });
  }

  const newExerciseInWorkout = await runInsertQuery(
    workoutId,
    exerciseId,
    userId,
  );

  return newExerciseInWorkout;

  async function runInsertQuery(workoutId, exerciseId, userId) {
    const results = await database.query({
      text: `
        INSERT INTO
          workout_exercise (workout_id, exercise_id, exercise_sequence)
        SELECT
          $1, $2,
        COALESCE((SELECT MAX(exercise_sequence) + 1 FROM workout_exercise WHERE workout_id = $1), 1)
        FROM
          workouts
        WHERE
          id = $1 AND user_id = $3
        RETURNING
          *
      ;`,
      values: [workoutId, exerciseId, userId],
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

async function findWorkoutExercisesByWorkoutId(workoutId, userId) {
  if (!workoutId) {
    throw new NotFoundError({
      message: "Treino ou Exercício não encontrados.",
      action: "Verifique se os dados enviados estão corretos.",
    });
  }
  const newExerciseInWorkout = await runSelectQuery(workoutId, userId);

  return newExerciseInWorkout;

  async function runSelectQuery(workoutId, userId) {
    const results = await database.query({
      text: `
        SELECT 
          we.*, e.exercise_name AS name
        FROM
          workout_exercise we
        JOIN
          workouts w ON w.id = we.workout_id 
        JOIN
          exercises e ON e.id = we.exercise_id
        WHERE
          we.workout_id = $1
        AND
          w.user_id = $2
        ORDER BY we.exercise_sequence ASC
        ;`,
      values: [workoutId, userId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Treino ou exercício não encontrado.",
        action: "Verifique se os dados foram enviados corretamente.",
      });
    }

    return results.rows;
  }
}

async function reorderWorkoutExercises(userId, order) {
  const reorderedWorkoutExercises = await runUpdatedQuery(userId, order);
  return reorderedWorkoutExercises;

  async function runUpdatedQuery(userId, order) {
    const valuesClause = order
      .map((id, i) => `($${i + 2}::uuid, ${i + 1})`)
      .join(", ");

    const results = await database.query({
      text: `
        UPDATE
          workout_exercise we
        SET
          exercise_sequence = new_values.exercise_sequence
        FROM (
          VALUES
            ${valuesClause}
        ) AS new_values(id, exercise_sequence)
        WHERE
          we.id = new_values.id
        AND EXISTS (
          SELECT 
            1
          FROM
            workouts w
          WHERE w.id = we.workout_id
            AND w.user_id = $1
          )
        RETURNING
          we.*
      ;`,
      values: [userId, ...order],
    });
    return results.rows;
  }
}

async function deleteOneById(workoutExerciseId, userId) {
  const deletedWorkoutExercise = await runDeleteQuery(
    workoutExerciseId,
    userId,
  );
  return deletedWorkoutExercise;

  async function runDeleteQuery(workoutExercise, userId) {
    const results = await database.query({
      text: `
        DELETE FROM
          workout_exercise we
        USING
          workouts w
        WHERE
          we.id = $1
        AND
          w.id = we.workout_id
        AND
          w.user_id = $2
        RETURNING
          we.*
      ;`,
      values: [workoutExerciseId, userId],
    });
    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Exercício não encontrado.",
        action: "Verifique se o exercício foi criado corretamente.",
      });
    }
    return results.rows[0];
  }
}

const workoutExercise = {
  addExerciseToWorkout,
  findWorkoutExercisesByWorkoutId,
  reorderWorkoutExercises,
  deleteOneById,
};

export default workoutExercise;
