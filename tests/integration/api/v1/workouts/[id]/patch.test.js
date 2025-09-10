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
      expect(responseBody.sequence_index).toBeGreaterThan(
        createdWorkout.sequence_index,
      );
      const lastDateBefore = new Date(responseBody.last_date);
      const lastDateAfter = new Date(createdWorkout.last_date);

      expect(lastDateBefore.getTime()).toBeGreaterThan(lastDateAfter.getTime());
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
  });
});
