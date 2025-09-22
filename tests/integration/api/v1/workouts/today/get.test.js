import { version as uuidVersion } from "uuid";
import orchestrator from "../../../../../orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/workouts/today", () => {
  describe("Default user", () => {
    test("Should return workouts in cyclic order", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const createdWorkout1 = await orchestrator.createWorkout(
        sessionObject.user_id,
        "Treino A",
      );
      const createdWorkout2 = await orchestrator.createWorkout(
        sessionObject.user_id,
        "Treino B",
      );
      const createdWorkout3 = await orchestrator.createWorkout(
        sessionObject.user_id,
        "Treino C",
      );

      await orchestrator.completeWorkout(
        sessionObject.user_id,
        createdWorkout1.id,
      );

      let response = await fetch(
        "http://localhost:3030/api/v1/workouts/today",
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );
      expect(response.status).toBe(200);
      let responseBody = await response.json();

      expect(responseBody.name).toBe("Treino B");

      await orchestrator.completeWorkout(
        sessionObject.user_id,
        createdWorkout2.id,
      );

      response = await fetch("http://localhost:3030/api/v1/workouts/today", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      responseBody = await response.json();

      expect(responseBody.name).toBe("Treino C");

      await orchestrator.completeWorkout(
        sessionObject.user_id,
        createdWorkout3.id,
      );

      response = await fetch("http://localhost:3030/api/v1/workouts/today", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      responseBody = await response.json();

      expect(responseBody.name).toBe("Treino A");
    });

    test("With rest day", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const createdWorkout = await orchestrator.createWorkout(
        sessionObject.user_id,
        "Treino A",
      );
      await orchestrator.createRestDay(sessionObject.user_id);

      await orchestrator.completeWorkout(
        sessionObject.user_id,
        createdWorkout.id,
      );

      const response = await fetch(
        "http://localhost:3030/api/v1/workouts/today",
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody.name).toBe("Descanso");
      expect(uuidVersion(responseBody.id)).toBe(4);
    });

    test("With second verification", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const createdWorkout1 = await orchestrator.createWorkout(
        sessionObject.user_id,
        "Treino A",
      );

      const createdRest1 = await orchestrator.createRestDay(
        sessionObject.user_id,
      );

      const createdWorkout2 = await orchestrator.createWorkout(
        sessionObject.user_id,
        "Treino B",
      );

      const createdRest2 = await orchestrator.createRestDay(
        sessionObject.user_id,
      );

      await orchestrator.completeWorkout(
        sessionObject.user_id,
        createdWorkout1.id,
      );
      await orchestrator.completeWorkout(
        sessionObject.user_id,
        createdRest1.id,
      );
      await orchestrator.completeWorkout(
        sessionObject.user_id,
        createdWorkout2.id,
      );
      await orchestrator.completeWorkout(
        sessionObject.user_id,
        createdRest2.id,
      );

      const response = await fetch(
        "http://localhost:3030/api/v1/workouts/today",
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.name).toBe("Treino A");
    });
  });
});
