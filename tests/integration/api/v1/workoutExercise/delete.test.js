import { version as uuidVersion } from "uuid";
import orchestrator from "../../../../orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("DELETE /api/v1/workout-exercises", () => {
  describe("Default User", () => {
    test("With valid session", async () => {
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
      const exerciseId2 = exerciseData[0].id;

      const createdWorkoutExercise = await orchestrator.addWorkoutExercise(
        createdWorkout.id,
        exerciseId2,
        sessionObject.user_id,
      );

      const response = await fetch(
        `http://localhost:3030/api/v1/workout-exercises/${createdWorkoutExercise.id}`,
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
        id: createdWorkoutExercise.id,
        workout_id: createdWorkout.id,
        exercise_id: createdWorkoutExercise.exercise_id,
        exercise_sequence: createdWorkoutExercise.exercise_sequence,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      //Doble check assertions
      const doubleCheckResponse = await fetch(
        `http://localhost:3030/api/v1/workout-exercises/${createdWorkout.id}`,
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
        message: "Treino ou exercício não encontrado.",
        action: "Verifique se os dados foram enviados corretamente.",
        status_code: 404,
      });
    });
  });
});
