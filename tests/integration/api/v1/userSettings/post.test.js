import orchestrator from "../../../../orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/user-settings", () => {
  describe("Default User", () => {
    test("With valid data", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch(
        "http://localhost:3030/api/v1/user-settings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionObject.token}`,
          },
          body: JSON.stringify({
            date_of_birth: "2003-05-10",
            sex: "male",
            weight: 70,
            height: 175,
            experience_level: "beginner",
            frequency: 4,
            goal: "gain_mass",
          }),
        },
      );

      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        user_id: sessionObject.user_id,
        date_of_birth: responseBody.date_of_birth,
        sex: "male",
        weight: 70,
        height: 175,
        experience_level: "beginner",
        frequency: 4,
        goal: "gain_mass",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
    });
  });
});
