import orchestrator from "../../../../../orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/workout-exercises/reorder", () => {
  describe("Default User", () => {
    test("With reordened workouts list", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const createdWorkout = await orchestrator.createWorkout(
        sessionObject.user_id,
      );

      const exerciseName = "supino";
      const exerciseResponse = await fetch(
        `http://localhost:3030/api/v1/exercises?name=${exerciseName}`,
      );

      const exerciseData = await exerciseResponse.json();
      const exerciseId1 = exerciseData[0].id;
      const exerciseId2 = exerciseData[1].id;
      const exerciseId3 = exerciseData[2].id;

      const workoutExercise1 = await orchestrator.addWorkoutExercise(
        createdWorkout.id,
        exerciseId1,
        sessionObject.user_id,
      );
      const workoutExercise2 = await orchestrator.addWorkoutExercise(
        createdWorkout.id,
        exerciseId2,
        sessionObject.user_id,
      );
      const workoutExercise3 = await orchestrator.addWorkoutExercise(
        createdWorkout.id,
        exerciseId3,
        sessionObject.user_id,
      );

      const response = await fetch(
        `http://localhost:3030/api/v1/workout-exercises/reorder`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            order: [
              workoutExercise1.id,
              workoutExercise2.id,
              workoutExercise3.id,
            ],
          }),
        },
      );

      expect(response.status).toBe(200);
    });

    test("Without data in request body", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch(
        `http://localhost:3030/api/v1/workout-exercises/reorder`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({}),
        },
      );

      expect(response.status).toBe(400);
    });
  });
});
