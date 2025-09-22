import orchestrator from "../../../../../orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/workouts/[workoutId]", () => {
  describe("Default User", () => {
    test("With completed workout", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const createdWorkout = await orchestrator.createWorkout(
        sessionObject.user_id,
      );

      const response = await fetch(
        `http://localhost:3030/api/v1/workouts/${createdWorkout.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            complete: true,
          }),
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      const lastDate = new Date(responseBody.last_date);

      expect(lastDate.getTime()).toBeGreaterThan(
        createdWorkout.created_at.getTime(),
      );

      expect(responseBody).toEqual({
        id: responseBody.id,
        user_id: responseBody.user_id,
        workout_id: responseBody.workout_id,
        sequence_index: 1,
        last_date: responseBody.last_date,
      });
    });

    test("With skipped workout", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);

      await orchestrator.createWorkout(sessionObject.user_id, "Treino A");

      const createdWorkout = await orchestrator.createWorkout(
        sessionObject.user_id,
        "Treino B",
      );

      const response = await fetch(
        `http://localhost:3030/api/v1/workouts/${createdWorkout.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            complete: true,
          }),
        },
      );

      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Você deve completar Treino A",
        action: "Complete primeiro o treino anterior",
        status_code: 400,
      });
    });

    test("With edited name", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const createdWorkout = await orchestrator.createWorkout(
        sessionObject.user_id,
        "Treino 1",
      );

      const response = await fetch(
        `http://localhost:3030/api/v1/workouts/${createdWorkout.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "Treino A",
          }),
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody.name).toBe("Treino A");

      const createdAt = new Date(responseBody.created_at);
      const updatedAt = new Date(responseBody.updated_at);

      expect(updatedAt.getTime()).toBeGreaterThan(createdAt.getTime());
    });

    test("With unavailable name", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const createdWorkout = await orchestrator.createWorkout(
        sessionObject.user_id,
        "Treino 1",
      );

      const response = await fetch(
        `http://localhost:3030/api/v1/workouts/${createdWorkout.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            name: "",
          }),
        },
      );

      expect(response.status).toBe(400);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Dados não inseridos ou inválidos",
        action: "Verifique se os dados enviados estão corretos",
        status_code: 400,
      });
    });
  });
});
