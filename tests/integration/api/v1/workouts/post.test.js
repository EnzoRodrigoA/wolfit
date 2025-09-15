import { version as uuidVersion } from "uuid";

import orchestrator from "../../../../orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/workouts", () => {
  describe("Default User", () => {
    test("With valid user session", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);
      const workoutName1 = "Peito e Tríceps";

      const response1 = await fetch("http://localhost:3030/api/v1/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          name: workoutName1,
        }),
      });

      expect(response1.status).toBe(201);

      const response1Body = await response1.json();

      expect(uuidVersion(response1Body.id)).toBe(4);
      expect(uuidVersion(response1Body.user_id)).toBe(4);
      expect(Date.parse(response1Body.created_at)).not.toBeNaN();
      expect(Date.parse(response1Body.updated_at)).not.toBeNaN();

      expect(response1Body.name).toBe(workoutName1);
      expect(response1Body.user_id).toBe(createdUser.id);

      const workoutName2 = "Costas e Bíceps";

      const response2 = await fetch("http://localhost:3030/api/v1/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          name: workoutName2,
        }),
      });

      expect(response2.status).toBe(201);

      const response2Body = await response2.json();

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(uuidVersion(response2Body.user_id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();

      expect(response2Body.name).toBe(workoutName2);
      expect(response2Body.user_id).toBe(createdUser.id);
    });

    test("With invalid user session", async () => {
      const workoutName = "Pernas";

      const response = await fetch("http://localhost:3030/api/v1/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: workoutName,
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão válida.",
        action: "Verifique se o usuário está logado e tente novamente.",
        status_code: 401,
      });
    });

    test("Withou workout name", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);
      const workoutName = "";

      const response = await fetch("http://localhost:3030/api/v1/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          name: workoutName,
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O nome do treino não pode ser vazio.",
        action: "Insira ao menos um caractere como nome do treino.",
        status_code: 400,
      });
    });
  });
});
