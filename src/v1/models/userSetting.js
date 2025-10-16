import database from "#src/infra/database.js";

async function insertUserSettings(userId, userSettingValues) {
  const enteredSettings = await runInsertQuery(userId, userSettingValues);
  return enteredSettings;

  async function runInsertQuery(userId, userSettingValues) {
    const results = await database.query({
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
        userSettingValues.date_of_birth,
        userSettingValues.sex,
        userSettingValues.weight,
        userSettingValues.height,
        userSettingValues.experience_level,
        userSettingValues.frequency,
        userSettingValues.goal,
      ],
    });
    return results.rows[0];
  }
}

async function findSettingsByUserId(userId) {
  const foundUserSettings = await runSelectQuery(userId);
  return foundUserSettings;

  async function runSelectQuery(userId) {
    const results = await database.query({
      text: `
      SELECT
        *
      FROM
        user_settings
      WHERE
        user_id = $1      
      ;`,
      values: [userId],
    });
    return results.rows[0];
  }
}

async function updateSettings(userId, userSettingValues) {
  const currentSettings = await findSettingsByUserId(userId);

  const newSettings = { ...currentSettings, ...userSettingValues };

  const updatedSettings = await runUpdateQuery(newSettings);
  return updatedSettings;

  async function runUpdateQuery(newSettings) {
    const results = await database.query({
      text: `
      UPDATE
        user_settings
      SET
        date_of_birth = $2,
        sex = $3,
        weight = $4,
        height = $5,
        experience_level = $6,
        frequency = $7,
        goal = $8,
        updated_at = NOW()
      WHERE
        user_id = $1
      RETURNING
        *
      `,
      values: [
        newSettings.user_id,
        newSettings.date_of_birth,
        newSettings.sex,
        newSettings.weight,
        newSettings.height,
        newSettings.experience_level,
        newSettings.frequency,
        newSettings.goal,
      ],
    });
    return results.rows[0];
  }
}

const userSetting = {
  insertUserSettings,
  findSettingsByUserId,
  updateSettings,
};

export default userSetting;
