import database from "#src/infra/database.js";
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
} from "#src/infra/errors.js";

async function createWorkout(userId, name) {
  const newWorkout = await runInsertQuery(userId, name);

  return newWorkout;

  async function runInsertQuery(userId, name) {
    if (!name || !name.trim()) {
      throw new ValidationError({
        message: "O nome do treino não pode ser vazio.",
        action: "Insira ao menos um caractere como nome do treino.",
      });
    }
    const results = await database.query({
      text: `
        INSERT INTO
          workouts (user_id, name, sequence_index)
        VALUES
          (
            $1,
            $2,
            COALESCE((SELECT MAX(sequence_index) + 1 FROM workouts WHERE user_id = $1), 1)
          )
        RETURNING
          *
      ;`,
      values: [userId, name],
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

async function findAllByUserId(userId) {
  if (!userId) {
    throw new UnauthorizedError({
      message: "Usuário não possui sessão válida.",
      action: "Verifique se o usuário está logado e tente novamente.",
    });
  }
  const workoutsFound = await runSelectQuery(userId);
  return workoutsFound;

  async function runSelectQuery(userId) {
    const results = await database.query({
      text: `
      SELECT 
        *
      FROM
        workouts
      WHERE
        user_id = $1
      ;`,
      values: [userId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Treino não encontrado",
        action: "Verifique se o treino foi criado corretamente",
      });
    }

    return results.rows[0];
  }
}

async function completeWorkout(workoutId, userId) {
  const renewedWorkoutDate = await runUpdatedQuery(workoutId, userId);
  return renewedWorkoutDate;

  async function runUpdatedQuery(workoutId, userId) {
    const results = await database.query({
      text: `
        UPDATE
          workouts
        SET
          last_date = NOW(),
          sequence_index = COALESCE((SELECT MAX(sequence_index) + 1 FROM workouts WHERE user_id = $2), 1)
        WHERE
          id = $1
        RETURNING
          *
      ;`,
      values: [workoutId, userId],
    });

    return results.rows[0];
  }
}

async function updateWorkout(workoutId, userId, name) {
  if (!name || !name.trim()) {
    throw new ValidationError({
      message: "O nome do treino não pode ser vazio.",
      action: "Insira ao menos um caractere como nome do treino.",
    });
  }
  const renewedWorkoutDate = await runUpdatedQuery(workoutId, userId, name);
  return renewedWorkoutDate;

  async function runUpdatedQuery(workoutId, userId, name) {
    const results = await database.query({
      text: `
        UPDATE
          workouts
        SET
          name = $3,
          updated_at = NOW()
        WHERE
          id = $1
        AND
          user_id = $2
        RETURNING
          *
      ;`,
      values: [workoutId, userId, name],
    });
    return results.rows[0];
  }
}

async function reorderWorkouts(userId, order) {
  const reordenedWorkout = await runUpdatedQuery(userId, order);
  return reordenedWorkout;

  async function runUpdatedQuery(userId, order) {
    const valuesClause = order
      .map((id, i) => `($${i + 2}::uuid, ${i + 1})`)
      .join(", ");

    const results = await database.query({
      text: `
        UPDATE
          workouts
        SET
          sequence_index = new_values.sequence_index
        FROM 
        (
          VALUES
          ${valuesClause}
        )
        AS
          new_values(id, sequence_index)
        WHERE
          workouts.id = new_values.id
        AND
          workouts.user_id = $1
        RETURNING
          *
      ;`,
      values: [userId, ...order],
    });
    return results.rows;
  }
}

const workout = {
  createWorkout,
  completeWorkout,
  updateWorkout,
  findAllByUserId,
  reorderWorkouts,
};

export default workout;
