import orchestrator from "../../../../orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/workout-exercises", () => {
  describe("Default User", () => {
    test("With valid data", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);
      const createdWorkout = await orchestrator.createWorkout(
        sessionObject.user_id,
        "Peito",
      );

      const exerciseName = "supino reto barra";
      const exerciseResponse = await fetch(
        `http://localhost:3030/api/v1/exercises?name=${exerciseName}`,
      );

      const exerciseData = await exerciseResponse.json();

      const response = await fetch(
        "http://localhost:3030/api/v1/workout-exercises",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionObject.token}`,
          },
          body: JSON.stringify({
            workoutId: createdWorkout.id,
            exerciseId: exerciseData[0].id,
          }),
        },
      );

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        workout_id: createdWorkout.id,
        exercise_id: exerciseData[0].id,
        exercise_sequence: 1,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
    });

    test("With invalid user session", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);
      const createdWorkout = await orchestrator.createWorkout(
        sessionObject.user_id,
        "Peito",
      );

      const exerciseName = "supino reto barra";
      const exerciseResponse = await fetch(
        `http://localhost:3030/api/v1/exercises?name=${exerciseName}`,
      );

      const exerciseData = await exerciseResponse.json();

      const response = await fetch(
        "http://localhost:3030/api/v1/workout-exercises",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer idQualquer`,
          },
          body: JSON.stringify({
            workoutId: createdWorkout.id,
            exerciseId: exerciseData[0].id,
          }),
        },
      );

      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão válida.",
        action: "Verifique se o usuário está logado e tente novamente.",
        status_code: 401,
      });
    });

    test("With invalid data", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const exerciseName = "supino reto barra";
      const exerciseResponse = await fetch(
        `http://localhost:3030/api/v1/exercises?name=${exerciseName}`,
      );

      const exerciseData = await exerciseResponse.json();

      const response = await fetch(
        "http://localhost:3030/api/v1/workout-exercises",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionObject.token}`,
          },
          body: JSON.stringify({
            workoutId: "",
            exerciseId: exerciseData[0].id,
          }),
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Treino ou Exercício não encontrados.",
        action: "Verifique se os dados enviados estão corretos.",
        status_code: 404,
      });
    });
  });
});
