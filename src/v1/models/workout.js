import database from "#src/infra/database.js";
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
} from "#src/infra/errors.js";

async function addWorkoutToQueue(userId, workoutId) {
  const result = await database.query({
    text: `
        SELECT COALESCE(MAX(sequence_index), 0) 
          as max_index
        FROM
          workout_queue
        WHERE
          user_id = $1
      ;`,
    values: [userId],
  });
  const nextIndex = result.rows[0].max_index + 1;

  const insertResult = await database.query({
    text: `
        INSERT INTO
          workout_queue (user_id, workout_id, sequence_index)
        VALUES
          ($1, $2, $3)
        RETURNING 
          *  
      ;`,
    values: [userId, workoutId, nextIndex],
  });
  return insertResult.rows[0];
}

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
          workouts (user_id, name)
        VALUES
          (
            $1,
            $2
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
    const workoutId = results.rows[0].id;
    const workoutName = results.rows[0].name;
    await addWorkoutToQueue(userId, workoutId, workoutName);
    return results.rows[0];
  }
}

async function createRestDay(userId) {
  const newWorkout = await runInsertQuery(userId);

  return newWorkout;

  async function runInsertQuery(userId, name = "Descanso") {
    const results = await database.query({
      text: `
        INSERT INTO
          workouts (user_id, name, is_rest)
        VALUES
          (
            $1,
            $2,
            true
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
    const workoutId = results.rows[0].id;
    const workoutName = results.rows[0].name;
    await addWorkoutToQueue(userId, workoutId, workoutName);
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
        message: "Treino não encontrado.",
        action: "Verifique se o treino foi enviado corretamente.",
      });
    }
    return results.rows[0];
  }
}

async function getTodaysWorkout(userId) {
  if (!userId) {
    throw new UnauthorizedError({
      message: "Usuário não possui sessão válida.",
      action: "Verifique se o usuário está logado e tente novamente.",
    });
  }
  const todaysWorkout = await runSelectQuery(userId);
  return todaysWorkout;

  async function runSelectQuery(userId) {
    const results = await database.query({
      text: `
      SELECT
        wq.*, w.name AS name
      FROM
        workout_queue wq
      JOIN
        workouts w ON wq.workout_id = w.id 
      WHERE
        wq.user_id = $1
      ORDER BY
        last_date ASC, sequence_index ASC
      ;`,
      values: [userId],
    });
    return results.rows[0];
  }
}

async function completeWorkout(userId, workoutId, date) {
  const todayWorkout = await getTodaysWorkout(userId);

  if (todayWorkout.workout_id !== workoutId) {
    throw new ValidationError({
      message: `Você deve completar ${todayWorkout.name}`,
      action: "Complete primeiro o treino anterior",
    });
  }

  const renewedWorkoutDate = await runInsertQuery(userId, workoutId, date);
  return renewedWorkoutDate;

  async function runInsertQuery(userId, workoutId, date) {
    const workoutDate = date ? date : "NOW()";

    const results = await database.query({
      text: `
      WITH ins AS (
        INSERT INTO
          workout_history
            (user_id, workout_id, completed_at)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
        )
      UPDATE
          workout_queue
        SET
          last_date = $3
        WHERE 
          user_id = $1
        AND
          workout_id = $2
        RETURNING
          *
     ;`,
      values: [userId, workoutId, workoutDate],
    });
    return results.rows[0];
  }
}

async function deleteOneById(workoutId, userId) {
  const deletedWorkout = await runDeleteQuery(workoutId, userId);
  return deletedWorkout;

  async function runDeleteQuery(workoutId, userId) {
    const results = await database.query({
      text: `
        DELETE FROM
          workouts
        WHERE
          id = $1
        AND
          user_id = $2
        RETURNING
          *
      ;`,
      values: [workoutId, userId],
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

async function updateWorkout(userId, workoutId, name) {
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
  const reorderedWorkout = await runUpdatedQuery(userId, order);
  return reorderedWorkout;

  async function runUpdatedQuery(userId, order) {
    const valuesClause = order
      .map((id, i) => `($${i + 2}::uuid, ${i + 1})`)
      .join(", ");

    const results = await database.query({
      text: `
        WITH updated AS (
          UPDATE
            workout_queue
          SET
            sequence_index = new_values.sequence_index
          FROM 
          (
            VALUES
            ${valuesClause}
          )
          AS
            new_values(workout_id, sequence_index)
          WHERE
            workout_queue.workout_id = new_values.workout_id
          AND
            workout_queue.user_id = $1
          RETURNING
            workout_queue.*, workout_queue.sequence_index AS updated_sequence_index
        )
        SELECT
          *
        FROM
          updated
        ORDER BY
          updated_sequence_index ASC
      ;`,
      values: [userId, ...order],
    });

    return results.rows;
  }
}

const workout = {
  createWorkout,
  createRestDay,
  getTodaysWorkout,
  completeWorkout,
  updateWorkout,
  findAllByUserId,
  reorderWorkouts,
  deleteOneById,
};

export default workout;
