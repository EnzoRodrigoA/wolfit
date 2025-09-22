import orchestrator from "../../../../orchestrator.js";
import topSet from "#src/v1/models/topSet.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/top-set", () => {
  describe("Default User", () => {
    test("With first top-set", async () => {
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

      const response = await fetch("http://localhost:3030/api/v1/top-set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          workoutExerciseId: addedWorkoutExercise.id,
          load: 50,
          reps: 10,
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        message: "Primeiro registro!",
        newTopSet: {
          id: responseBody.newTopSet.id,
          user_id: createdUser.id,
          workout_exercise_id: addedWorkoutExercise.id,
          load: "50",
          reps: 10,
          date: responseBody.newTopSet.date,
        },
      });
    });

    test("With new load", async () => {
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
      const mockLoad = 45;
      const mockReps = 10;

      await topSet.addTopSetToWorkoutExercise(
        addedWorkoutExercise.id,
        sessionObject.user_id,
        mockLoad,
        mockReps,
      );

      const response = await fetch("http://localhost:3030/api/v1/top-set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          workoutExerciseId: addedWorkoutExercise.id,
          load: 47.5,
          reps: 10,
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        message: "Você aumentou a carga em 5.56%!",
        newTopSet: {
          id: responseBody.newTopSet.id,
          user_id: createdUser.id,
          workout_exercise_id: addedWorkoutExercise.id,
          load: "47.5",
          reps: 10,
          date: responseBody.newTopSet.date,
        },
      });
    });

    test("With the same load", async () => {
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
      const mockLoad = 45;
      const mockReps = 10;

      await topSet.addTopSetToWorkoutExercise(
        addedWorkoutExercise.id,
        sessionObject.user_id,
        mockLoad,
        mockReps,
      );

      const response = await fetch("http://localhost:3030/api/v1/top-set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          workoutExerciseId: addedWorkoutExercise.id,
          load: 45,
          reps: 10,
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        message: "Você manteve a mesma carga!",
        newTopSet: {
          id: responseBody.newTopSet.id,
          user_id: createdUser.id,
          workout_exercise_id: addedWorkoutExercise.id,
          load: "45",
          reps: 10,
          date: responseBody.newTopSet.date,
        },
      });
    });

    test("With new reps", async () => {
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
      const mockLoad = 47.5;
      const mockReps = 6;

      await topSet.addTopSetToWorkoutExercise(
        addedWorkoutExercise.id,
        sessionObject.user_id,
        mockLoad,
        mockReps,
      );

      const response = await fetch("http://localhost:3030/api/v1/top-set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          workoutExerciseId: addedWorkoutExercise.id,
          load: 47.5,
          reps: 8,
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        message: "Você aumentou 2 repetições!",
        newTopSet: {
          id: responseBody.newTopSet.id,
          user_id: createdUser.id,
          workout_exercise_id: addedWorkoutExercise.id,
          load: "47.5",
          reps: 8,
          date: responseBody.newTopSet.date,
        },
      });
    });

    test("With invalid data", async () => {
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

      const response = await fetch("http://localhost:3030/api/v1/top-set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          workoutExerciseId: addedWorkoutExercise.id,
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Dados inválidos",
        action: "Verifique os dados enviados e tente novamente",
        status_code: 400,
      });
    });
  });
});
