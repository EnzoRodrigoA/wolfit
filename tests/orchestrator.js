import retry from "async-retry";
import { faker } from "@faker-js/faker";

import database from "#src/infra/database.js";
import migrator from "#src/v1/models/migrator.js";
import user from "#src/v1/models/user.js";
import session from "#src/v1/models/session.js";
import workout from "#src/v1/models/workout.js";

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
  deleteAllEmails,
  getLastEmail,
};

export default orchestrator;
