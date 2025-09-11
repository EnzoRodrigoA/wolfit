import database from "#src/infra/database.js";
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
} from "#src/infra/errors.js";

async function addWorkoutToQueue(userId, workoutId, workoutName) {
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
          workout_queue (user_id, workout_id, name, sequence_index)
        VALUES
          ($1, $2, $3, $4)
        RETURNING 
          *  
      ;`,
    values: [userId, workoutId, workoutName, nextIndex],
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
          workouts (user_id, name, is_rest, sequence_index)
        VALUES
          (
            $1,
            $2,
            true,
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
      ORDER BY sequence_index ASC
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const results = await database.query({
      text: `
      SELECT 
        *
      FROM
        workout_queue
      WHERE
        user_id = $1
      AND
        (completed_at IS NULL OR completed_at::date < CURRENT_DATE)
      ORDER BY 
        sequence_index ASC
      LIMIT
        1
      ;`,
      values: [userId],
    });
    return results.rows[0] || null;
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
          
          sequence_index = COALESCE((SELECT MAX(sequence_index) + 1 FROM workouts WHERE user_id = $2), 1)
        WHERE
          id = $1
        RETURNING
          *
      ;`,
      values: [workoutId, userId],
    });

    const sequenceIndex = results.rows[0].sequence_index;
    const completedWorkoutInQueue = await completeWorkoutInQueue(
      userId,
      workoutId,
      sequenceIndex,
    );

    const responseObject = {
      inWorkouts: results.rows[0],
      inWorkoutQueue: completedWorkoutInQueue,
    };
    return responseObject;
  }

  async function completeWorkoutInQueue(
    userId,
    workoutId,

    sequenceIndex,
  ) {
    const results = await database.query({
      text: `
        UPDATE
          workout_queue
        SET
          completed_at = CURRENT_DATE,
          sequence_index = $3
        WHERE
          user_id = $1
        AND
          workout_id = $2
        RETURNING
          *
      ;`,
      values: [userId, workoutId, sequenceIndex],
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
    const updatedWorkoutQueue = await updateWorkoutInQueue(
      userId,
      workoutId,
      name,
    );
    const responseObject = {
      inWorkouts: results.rows[0],
      inWorkoutQueue: updatedWorkoutQueue,
    };

    return responseObject;
  }

  async function updateWorkoutInQueue(userId, workoutId, name) {
    const results = await database.query({
      text: `
        UPDATE
          workout_queue
        SET
          updated_at = NOW(),
          name = $3
        WHERE
          user_id = $1
        AND
          workout_id = $2
        RETURNING
          *
      ;`,
      values: [userId, workoutId, name],
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
            workouts
          SET
            sequence_index = new_values.sequence_index,
            updated_at = NOW()
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
            workouts.*, workouts.sequence_index AS updated_sequence_index
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
    const reorderedWorkoutQueue = await reorderWorkoutsInQueue(userId, order);

    const responseObject = {
      inWorkouts: results.rows,
      inWorkoutQueue: reorderedWorkoutQueue,
    };
    return responseObject;
  }
  async function reorderWorkoutsInQueue(userId, order) {
    const valuesClause = order
      .map((id, i) => `($${i + 2}::uuid, ${i + 1})`)
      .join(", ");
    const results = await database.query({
      text: `
        WITH updated AS (
          UPDATE
            workout_queue
          SET
            sequence_index = new_values.sequence_index,
            updated_at = NOW()
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
