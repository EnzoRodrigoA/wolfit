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

      await fetch("http://localhost:3030/api/v1/user-settings", {
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
      });
      const response = await fetch(
        `http://localhost:3030/api/v1/user-settings`,
        {
          headers: {
            Authorization: `Bearer ${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(200);

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
        updated_at: responseBody.updated_at,
        created_at: responseBody.created_at,
      });
    });

    test("With invalid session", async () => {
      const createdUser = await orchestrator.createUser({});
      const sessionObject = await orchestrator.createSession(createdUser.id);

      await fetch("http://localhost:3030/api/v1/user-settings", {
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
      });
      const response = await fetch(
        `http://localhost:3030/api/v1/user-settings`,
        {
          headers: {
            Authorization: `Bearer TOkenQualquer`,
          },
        },
      );

      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        action: "Verifique se o usuário está logado e tente novamente.",
        message: "Usuário não possui sessão válida.",
        name: "UnauthorizedError",
        status_code: 401,
      });
    });
  });
});
