import orchestrator from "../../orchestrator";

let createdUser;
let sessionObject;
let createdWorkout;
let createdWorkoutExercise;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();

  createdUser = await orchestrator.createUser({});
  sessionObject = await orchestrator.createSession(createdUser.id);
});

describe("Use case: Workouts flow(add and get data)", () => {
  test("Create workout", async () => {
    const workoutName1 = "Peito";

    const workoutResponse = await fetch(
      "http://localhost:3030/api/v1/workouts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionObject.token}`,
        },
        body: JSON.stringify({
          name: workoutName1,
        }),
      },
    );

    expect(workoutResponse.status).toBe(201);

    createdWorkout = await workoutResponse.json();

    expect(createdWorkout.name).toBe(workoutName1);
    expect(createdWorkout.user_id).toBe(createdUser.id);
  });

  test("Add exercise to workout", async () => {
    const exercise = await orchestrator.getExerciseByName("Supino Reto Barra");

    const workoutExerciseResponse = await fetch(
      "http://localhost:3030/api/v1/workout-exercises",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionObject.token}`,
        },
        body: JSON.stringify({
          workoutId: createdWorkout.id,
          exerciseId: exercise.id,
        }),
      },
    );

    expect(workoutExerciseResponse.status).toBe(201);

    createdWorkoutExercise = await workoutExerciseResponse.json();

    expect(createdWorkoutExercise).toEqual({
      id: createdWorkoutExercise.id,
      workout_id: createdWorkout.id,
      exercise_id: exercise.id,
      exercise_sequence: 1,
      created_at: createdWorkoutExercise.created_at,
      updated_at: createdWorkoutExercise.updated_at,
    });
  });

  test("Add first top-set", async () => {
    const topSetResponse = await fetch("http://localhost:3030/api/v1/top-set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionObject.token}`,
      },
      body: JSON.stringify({
        workoutExerciseId: createdWorkoutExercise.id,
        load: 50,
        reps: 10,
        feeling: "very-light",
      }),
    });

    expect(topSetResponse.status).toBe(201);

    const responseBody = await topSetResponse.json();
    expect(responseBody).toEqual({
      message: "Primeiro registro!",
      newTopSet: {
        id: responseBody.newTopSet.id,
        user_id: createdUser.id,
        workout_exercise_id: createdWorkoutExercise.id,
        load: "50",
        reps: 10,
        feeling: "very-light",
        date: responseBody.newTopSet.date,
      },
    });
  });

  test("Add new top-set", async () => {
    const topSetResponse = await fetch("http://localhost:3030/api/v1/top-set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionObject.token}`,
      },
      body: JSON.stringify({
        workoutExerciseId: createdWorkoutExercise.id,
        load: 54,
        reps: 8,
        feeling: "light",
      }),
    });

    expect(topSetResponse.status).toBe(201);

    const responseBody = await topSetResponse.json();
    expect(responseBody).toEqual({
      message: responseBody.message,
      newTopSet: {
        id: responseBody.newTopSet.id,
        user_id: createdUser.id,
        workout_exercise_id: createdWorkoutExercise.id,
        load: "54",
        reps: 8,
        feeling: "light",
        date: responseBody.newTopSet.date,
      },
    });
  });

  test("Get top-sets data", async () => {
    const response = await fetch(
      `http://localhost:3030/api/v1/top-set/${createdWorkoutExercise.id}`,
      {
        headers: {
          Authorization: `Bearer ${sessionObject.token}`,
        },
      },
    );

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody[0]).toEqual({
      id: responseBody[0].id,
      user_id: responseBody[0].user_id,
      exercise_id: responseBody[0].exercise_id,
      workout_exercise_id: responseBody[0].workout_exercise_id,
      name: "Supino Reto Barra",
      load: "54",
      reps: 8,
      feeling: "light",
      date: responseBody[0].date,
    });

    expect(responseBody[1]).toEqual({
      id: responseBody[1].id,
      user_id: responseBody[1].user_id,
      exercise_id: responseBody[1].exercise_id,
      workout_exercise_id: responseBody[1].workout_exercise_id,
      name: "Supino Reto Barra",
      load: "50",
      reps: 10,
      feeling: "very-light",
      date: responseBody[1].date,
    });
  });
});
