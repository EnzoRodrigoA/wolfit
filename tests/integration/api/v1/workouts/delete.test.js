import { version as uuidVersion } from "uuid";
import orchestrator from "../../../../orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("DELETE /api/v1/workouts", () => {
  describe("Default User", () => {
    test("With valid session", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);
      const createdWorkout = await orchestrator.createWorkout(
        sessionObject.user_id,
      );

      const response = await fetch(
        `http://localhost:3030/api/v1/workouts/${createdWorkout.id}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: createdWorkout.id,
        user_id: createdUser.id,
        name: createdWorkout.name,
        sequence_index: createdWorkout.sequence_index,
        last_date: responseBody.last_date,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.last_date)).not.toBeNaN();
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      //Doble check assertions
      const doubleCheckResponse = await fetch(
        "http://localhost:3030/api/v1/workouts",
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(doubleCheckResponse.status).toBe(404);

      const doubleCheckResponseBody = await doubleCheckResponse.json();

      expect(doubleCheckResponseBody).toEqual({
        name: "NotFoundError",
        message: "Treino não encontrado.",
        action: "Verifique se o treino foi enviado corretamente.",
        status_code: 404,
      });
    });
  });
});
