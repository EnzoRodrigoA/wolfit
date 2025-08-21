import migrator from "#src/v1/models/migrator.js";

async function getHandler(request, response, next) {
  try {
    const pendingMigrations = await migrator.listPendingMigrations();
    return response.status(200).json(pendingMigrations);
  } catch (error) {
    next(error);
  }
}

async function postHandler(request, response, next) {
  try {
    const migratedMigrations = await migrator.runPendingMigrations();
    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }
    return response.status(200).json(migratedMigrations);
  } catch (error) {
    next(error);
  }
}

const migrations = {
  getHandler,
  postHandler,
};

export default migrations;
