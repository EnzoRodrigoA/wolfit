import retry from "async-retry";
import { faker } from "@faker-js/faker";

import database from "#src/infra/database.js";
import migrator from "#src/v1/models/migrator.js";
import user from "#src/v1/models/user.js";
import session from "#src/v1/models/session.js";
import workout from "#src/v1/models/workout.js";
import exercise from "#src/v1/models/exercise.js";
import topSet from "#src/v1/models/topSet.js";
import workoutExercise from "#src/v1/models/workoutExercise.js";

const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
  await waitForWebServer();
  await waitForEmailServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3030/api/v1/status");

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
  async function waitForEmailServer() {
    return retry(fetchEmailPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchEmailPage() {
      const response = await fetch(emailHttpUrl);

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject) {
  return await user.create({
    username:
      userObject.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || "validpassword",
  });
}

async function createSession(userId) {
  return await session.create(userId);
}

async function createWorkout(userId, name) {
  return await workout.createWorkout(userId, name || "Treino padrão");
}

async function createDefaultWorkout(userId, name) {
  const createdWorkout = await workout.createWorkout(
    userId,
    name || "Treino Padrão",
  );
  const foundExercise = await exercise.findExercisesByParameters("Peito");

  const workoutExercise1 = await workoutExercise.addExerciseToWorkout(
    createdWorkout.id,
    foundExercise[0].id,
    userId,
  );
  await workoutExercise.addExerciseToWorkout(
    createdWorkout.id,
    foundExercise[1].id,
    userId,
  );
  await workoutExercise.addExerciseToWorkout(
    createdWorkout.id,
    foundExercise[2].id,
    userId,
  );
  await workoutExercise.addExerciseToWorkout(
    createdWorkout.id,
    foundExercise[3].id,
    userId,
  );

  const topSetMockParams = [
    { load: 30, reps: 8 },
    { load: 42, reps: 12 },
    { load: 12, reps: 10 },
    { load: 22, reps: 8 },
  ];

  await topSet.addTopSetToWorkoutExercise(
    workoutExercise1.id,
    userId,
    topSetMockParams[0].load,
    topSetMockParams[0].reps,
  );
  await topSet.addTopSetToWorkoutExercise(
    workoutExercise1.id,
    userId,
    topSetMockParams[1].load,
    topSetMockParams[1].reps,
  );
  await topSet.addTopSetToWorkoutExercise(
    workoutExercise1.id,
    userId,
    topSetMockParams[2].load,
    topSetMockParams[2].reps,
  );
  await topSet.addTopSetToWorkoutExercise(
    workoutExercise1.id,
    userId,
    topSetMockParams[3].load,
    topSetMockParams[3].reps,
  );

  return createdWorkout;
}

async function completeWorkout(userId, workoutId) {
  return await workout.completeWorkout(userId, workoutId);
}

async function createRestDay(userId) {
  return await workout.createRestDay(userId);
}

async function addWorkoutExercise(workoutId, exerciseId, userId) {
  return await workoutExercise.addExerciseToWorkout(
    workoutId,
    exerciseId,
    userId,
  );
}

async function deleteAllEmails() {
  try {
    await fetch(`${emailHttpUrl}/messages`, {
      method: "DELETE",
    });
    console.log("Caixa de entrada limpa com sucesso!");
  } catch (error) {
    console.error("Erro ao limpar a caixa:", error);
  }
}

async function getLastEmail() {
  const emailListResponse = await fetch(`${emailHttpUrl}/messages`);
  const emailListBody = await emailListResponse.json();
  const lastEmailItem = emailListBody.pop();

  if (!lastEmailItem) {
    return null;
  }

  const emailTextResponse = await fetch(
    `${emailHttpUrl}/messages/${lastEmailItem.id}.plain`,
  );
  const emailTextBody = await emailTextResponse.text();

  lastEmailItem.text = emailTextBody;
  return lastEmailItem;
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
  createWorkout,
  createDefaultWorkout,
  completeWorkout,
  createRestDay,
  addWorkoutExercise,
  deleteAllEmails,
  getLastEmail,
};

export default orchestrator;
