import orchestrator from "../../../../orchestrator.js";
import database from "#src/infra/database.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous User", () => {
    test("With unique and valid data", async () => {
      await database.query({
        text: `
        INSERT INTO
          users (username, email, password)
        VALUES
          ($1, $2, $3) 
        ;`,
        values: ["EnzoPasquale", "enzo@email.com", "senha123"],
      });

      const users = await database.query("SELECT * FROM users;");
      console.log(users.rows);

      const response = await fetch("http://localhost:3030/api/v1/status", {
        method: "POST",
      });

      expect(response.status).toBe(201);
    });
  });
});
