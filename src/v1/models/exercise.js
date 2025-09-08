import database from "#src/infra/database.js";
import { NotFoundError } from "#src/infra/errors.js";

async function findExercisesByParameters(muscle, name) {
  const exercisesFound = await runSelectQuery(muscle, name);

  return exercisesFound;

  async function runSelectQuery(muscle, name) {
    let query = `SELECT * FROM exercises WHERE 1=1`;
    const values = [];
    let index = 1;

    if (muscle) {
      query += ` AND LOWER(target_muscle) = LOWER($${index++})`;
      values.push(muscle);
    }

    if (name) {
      query += ` AND LOWER(exercise_name) LIKE LOWER($${index++})`;
      values.push(`%${name}%`);
    }

    const result = await database.query({ text: query, values });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "O exercício não foi encontrado no sistema.",
        action: "Verifique se o exercício foi digitado corretamente.",
      });
    }
    return result.rows;
  }
}

const exercise = {
  findExercisesByParameters,
};

export default exercise;
