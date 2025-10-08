import orchestrator from "../../../../orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/workout-exercises", () => {
  describe("Default", () => {
    test("With existent workout", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);
      const createdWorkout = await orchestrator.createWorkout(
        sessionObject.user_id,
      );

      const exerciseName = "supino reto barra";
      const exerciseResponse = await fetch(
        `http://localhost:3030/api/v1/exercises?name=${exerciseName}`,
      );

      const exerciseData = await exerciseResponse.json();
      const exerciseId = exerciseData[0].id;

      await orchestrator.addWorkoutExercise(
        createdWorkout.id,
        exerciseId,
        sessionObject.user_id,
      );

      const response = await fetch(
        `http://localhost:3030/api/v1/workout-exercises/${createdWorkout.id}`,
        {
          headers: {
            Authorization: `Bearer ${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);

      expect(responseBody[0]).toEqual({
        id: responseBody[0].id,
        name: responseBody[0].name,
        muscle: responseBody[0].muscle,
        workout_id: createdWorkout.id,
        exercise_id: exerciseData[0].id,
        exercise_sequence: 1,
        created_at: responseBody[0].created_at,
        updated_at: responseBody[0].updated_at,
      });
    });

    test("With invalid user session", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);
      const createdWorkout = await orchestrator.createWorkout(
        sessionObject.user_id,
      );

      const exerciseName = "supino reto barra";
      const exerciseResponse = await fetch(
        `http://localhost:3030/api/v1/exercises?name=${exerciseName}`,
      );

      const exerciseData = await exerciseResponse.json();
      const exerciseId = exerciseData[0].id;

      await orchestrator.addWorkoutExercise(
        createdWorkout.id,
        exerciseId,
        sessionObject.user_id,
      );

      const response = await fetch(
        `http://localhost:3030/api/v1/workout-exercises/${createdWorkout.id}`,
        {
          headers: {
            Cookie: `session_id=idQualquer`,
          },
        },
      );

      expect(response.status).toBe(401);
    });
  });
});
