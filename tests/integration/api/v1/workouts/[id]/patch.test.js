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
      expect(responseBody.inWorkouts.sequence_index).toBeGreaterThan(
        createdWorkout.sequence_index,
      );
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

      const responseWorkouts = responseBody.inWorkouts;
      const responseWorkoutQueue = responseBody.inWorkoutQueue;

      expect(responseWorkouts.name).toBe("Treino A");
      expect(responseWorkoutQueue.name).toBe("Treino A");

      const createdAtWorkouts = new Date(responseBody.inWorkouts.created_at);
      const updatedAtWorkouts = new Date(responseBody.inWorkouts.updated_at);
      const createdAtWorkoutQueue = new Date(
        responseBody.inWorkouts.created_at,
      );
      const updatedAtWorkoutQueue = new Date(
        responseBody.inWorkouts.updated_at,
      );

      expect(updatedAtWorkouts.getTime()).toBeGreaterThan(
        createdAtWorkouts.getTime(),
      );
      expect(updatedAtWorkoutQueue.getTime()).toBeGreaterThan(
        createdAtWorkoutQueue.getTime(),
      );
    });
  });
});
