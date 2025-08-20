import orchestrator from "../../../../orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("POST /api/v1/status", () => {
  describe("Anonymous User", () => {
    test("Other method should return an error", async () => {
      const response = await fetch("http://localhost:3030/api/v1/status", {
        method: "POST",
      });

      expect(response.status).toBe(405);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "MethodNotAllowed",
        message: "Método não é permitido para este endpoint.",
        action: "Verifique se o método enviado é válido.",
        status_code: 405,
      });
    });
  });
});
