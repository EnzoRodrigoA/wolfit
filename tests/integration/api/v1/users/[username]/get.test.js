import { version as uuidVersion } from "uuid";
import orchestrator from "../../../../../orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous User", () => {
    test("With exact case match", async () => {
      await orchestrator.createUser({
        username: "mesmoCase",
        email: "mesmo.case@email.com",
        password: "senha123",
      });

      const response = await fetch(
        "http://localhost:3030/api/v1/users/mesmoCase",
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json({});

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "mesmoCase",
        email: "mesmo.case@email.com",
        features: [],
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      await orchestrator.createUser({
        username: "CaseDiferente",
        email: "case.diferente@email.com",
        password: "senha123",
      });

      const response = await fetch(
        "http://localhost:3030/api/v1/users/casedifeREnte",
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json({});

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "CaseDiferente",
        email: "case.diferente@email.com",
        features: [],
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3030/api/v1/users/UsuarioInexistente",
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json({});

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username não foi encontrado no sistema.",
        action: "Verifique se o username foi digitado corretamente.",
        status_code: 404,
      });
    });
  });
});
