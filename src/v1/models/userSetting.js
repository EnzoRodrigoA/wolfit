import database from "#src/infra/database.js";

async function insertUserSettings(
  userId,
  date_of_bith,
  sex,
  weight,
  height,
  experience_level,
  frequency,
  goal,
) {
  const insertResult = await database.query({
    text: `
        INSERT INTO
          user_settings (user_id, date_of_birth, sex, weight, height, experience_level, frequency, goal)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING 
          *  
      ;`,
    values: [
      userId,
      date_of_bith,
      sex,
      weight,
      height,
      experience_level,
      frequency,
      goal,
    ],
  });
  console.log(insertResult.rows);
  return insertResult.rows[0];
}

const userSetting = {
  insertUserSettings,
};

export default userSetting;
