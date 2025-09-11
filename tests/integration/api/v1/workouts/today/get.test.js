import { version as uuidVersion } from "uuid";
import orchestrator from "../../../../../orchestrator.js";
import workout from "#src/v1/models/workout.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/workouts/today", () => {
  describe("Default user", () => {
    test("With first workout", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const createdWorkout = await orchestrator.createWorkout(
        sessionObject.user_id,
      );

      const response = await fetch(
        "http://localhost:3030/api/v1/workouts/today",
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody).toEqual({
        id: responseBody.id,
        name: createdWorkout.name,
        user_id: sessionObject.user_id,
        workout_id: createdWorkout.id,
        sequence_index: 1,
        completed_at: responseBody.completed_at,
        updated_at: responseBody.updated_at,
        created_at: responseBody.created_at,
      });
    });

    test("With rest day", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const createdWorkout = await orchestrator.createWorkout(
        sessionObject.user_id,
      );
      const createdRest = await orchestrator.createRestDay(
        sessionObject.user_id,
      );

      await workout.completeWorkout(createdWorkout.id, sessionObject.user_id);

      const response = await fetch(
        "http://localhost:3030/api/v1/workouts/today",
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody).toEqual({
        id: responseBody.id,
        name: createdRest.name,
        user_id: sessionObject.user_id,
        workout_id: createdRest.id,
        sequence_index: 2,
        completed_at: responseBody.completed_at,
        updated_at: responseBody.updated_at,
        created_at: responseBody.created_at,
      });
    });

    test("With second verification", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const createdWorkout = await orchestrator.createWorkout(
        sessionObject.user_id,
      );
      const createdRest = await orchestrator.createRestDay(
        sessionObject.user_id,
      );
      const createdWorkout2 = await orchestrator.createWorkout(
        sessionObject.user_id,
        "Costas e bíceps",
      );

      await workout.completeWorkout(createdWorkout.id, sessionObject.user_id);
      await workout.completeWorkout(createdRest.id, sessionObject.user_id);

      const response = await fetch(
        "http://localhost:3030/api/v1/workouts/today",
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody).toEqual({
        id: responseBody.id,
        name: "Costas e bíceps",
        user_id: sessionObject.user_id,
        workout_id: createdWorkout2.id,
        sequence_index: 3,
        completed_at: responseBody.completed_at,
        updated_at: responseBody.updated_at,
        created_at: responseBody.created_at,
      });
    });
  });
});
