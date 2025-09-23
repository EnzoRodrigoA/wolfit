import orchestrator from "../../../../../orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/workouts/reorder", () => {
  describe("Default User", () => {
    test("With reordered workouts list", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const createdWorkout1 = await orchestrator.createWorkout(
        sessionObject.user_id,
        "Peito",
      );
      const createdWorkout2 = await orchestrator.createWorkout(
        sessionObject.user_id,
        "Costas",
      );
      const createdWorkout3 = await orchestrator.createWorkout(
        sessionObject.user_id,
        "Pernas",
      );

      const response = await fetch(
        `http://localhost:3030/api/v1/workouts/reorder`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionObject.token}`,
          },
          body: JSON.stringify({
            order: [createdWorkout3.id, createdWorkout1.id, createdWorkout2.id],
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody[1].sequence_index).toBe(2);
    });

    test("Without data in request body", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch(
        `http://localhost:3030/api/v1/workouts/reorder`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionObject.token}`,
          },
          body: JSON.stringify({}),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Ordem não enviada ou incorreta",
        action: "Verifique o corpo da requisição e tente novamente",
        status_code: 400,
      });
    });
  });
});
