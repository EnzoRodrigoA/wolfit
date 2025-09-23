import { version as uuidVersion } from "uuid";

import orchestrator from "../../../../orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/workouts", () => {
  describe("Default", () => {
    test("With existent workout", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const createdWorkout = await orchestrator.createWorkout(
        sessionObject.user_id,
      );
      const response = await fetch("http://localhost:3030/api/v1/workouts", {
        headers: {
          Authorization: `Bearer ${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody).toEqual({
        id: createdWorkout.id,
        name: createdWorkout.name,
        user_id: sessionObject.user_id,
        is_rest: false,
        updated_at: createdWorkout.updated_at.toISOString(),
        created_at: createdWorkout.created_at.toISOString(),
      });
    });

    test("With nonexistent workout", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch("http://localhost:3030/api/v1/workouts", {
        headers: {
          Authorization: `Bearer ${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(404);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        action: "Verifique se o treino foi enviado corretamente.",
        message: "Treino não encontrado.",
        name: "NotFoundError",
        status_code: 404,
      });
    });
  });
});
