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
        "Peito",
      );

      const exerciseName = "supino";
      const exerciseResponse = await fetch(
        `http://localhost:3030/api/v1/exercises?name=${exerciseName}`,
      );

      const exerciseData = await exerciseResponse.json();
      const exerciseId = exerciseData[0].id;

      const addedWorkoutExercise = await orchestrator.addWorkoutExercise(
        createdWorkout.id,
        exerciseId,
        sessionObject.user_id,
      );

      await fetch("http://localhost:3030/api/v1/top-set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          workoutExerciseId: addedWorkoutExercise.id,
          load: 35,
          reps: 12,
        }),
      });

      const response = await fetch(
        `http://localhost:3030/api/v1/top-set/${addedWorkoutExercise.id}`,
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(200);
    });

    test("With default workout", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);
      const createdDefaultWorkout = await orchestrator.createDefaultWorkout(
        sessionObject.user_id,
        "Peito",
      );

      const workoutExercises = await fetch(
        `http://localhost:3030/api/v1/workout-exercises/${createdDefaultWorkout.id}`,
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      const workoutExerciseData = await workoutExercises.json();

      const response = await fetch(
        `http://localhost:3030/api/v1/top-set/${workoutExerciseData[0].id}`,
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(Array.isArray(responseBody)).toBe(true);
    });
  });
});
