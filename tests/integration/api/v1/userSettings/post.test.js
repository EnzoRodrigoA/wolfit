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
            Cookie: `session_id=${sessionObject.token}`,
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
    });
  });
});
