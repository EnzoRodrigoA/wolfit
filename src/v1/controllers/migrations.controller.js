import migrator from "#src/v1/models/migrator.js";
import authorization from "../models/authorization.js";

async function getHandler(request, response, next) {
  try {
    const userTryingToGet = request.context.user;
    const pendingMigrations = await migrator.listPendingMigrations();

    const secureOutputValues = authorization.filterOutput(
      userTryingToGet,
      "read:migration",
      pendingMigrations,
    );
    return response.status(200).json(secureOutputValues);
  } catch (error) {
    next(error);
  }
}

async function postHandler(request, response, next) {
  try {
    const userTryingToPost = request.context.user;
    const migratedMigrations = await migrator.runPendingMigrations();

    const secureOutputValues = authorization.filterOutput(
      userTryingToPost,
      "read:migration",
      migratedMigrations,
    );

    if (migratedMigrations.length > 0) {
      return response.status(201).json(secureOutputValues);
    }

    return response.status(200).json(secureOutputValues);
  } catch (error) {
    next(error);
  }
}

const migrations = {
  getHandler,
  postHandler,
};

export default migrations;
