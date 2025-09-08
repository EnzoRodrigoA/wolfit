import orchestrator from "../../../../orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/exercises", () => {
  describe("Anonymous User", () => {
    test("Without parameters should return all exercises", async () => {
      const response = await fetch("http://localhost:3030/api/v1/exercises");

      expect(response.status).toBe(200);
    });

    test("With existent target muscle", async () => {
      const targetMuscle = "Peito";
      const response = await fetch(
        `http://localhost:3030/api/v1/exercises?muscle=${targetMuscle}`,
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);
      expect(responseBody.length).toBeGreaterThan(0);

      responseBody.forEach((exercise) => {
        expect(exercise.target_muscle.toLowerCase()).toBe(
          targetMuscle.toLowerCase(),
        );
      });
    });

    test("With existent exercise name", async () => {
      const name = "agachamento";
      const response = await fetch(
        `http://localhost:3030/api/v1/exercises?name=${name}`,
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);
      expect(responseBody.length).toBeGreaterThan(0);

      responseBody.forEach((exercise) => {
        expect(exercise.exercise_name.toLowerCase()).toContain(
          name.toLowerCase(),
        );
      });
    });

    test("With existent exercise name and target muscle", async () => {
      const targetMuscle = "Peito";
      const name = "crucifixo";
      const response = await fetch(
        `http://localhost:3030/api/v1/exercises?muscle=${targetMuscle}&&name=${name}`,
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);
      expect(responseBody.length).toBeGreaterThan(0);

      responseBody.forEach((exercise) => {
        expect(exercise.exercise_name.toLowerCase()).toContain(
          name.toLowerCase(),
        );
      });
    });

    test("With nonexistent target muscle", async () => {
      const targetMuscle = "mão";
      const response = await fetch(
        `http://localhost:3030/api/v1/exercises?muscle=${targetMuscle}`,
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O exercício não foi encontrado no sistema.",
        action: "Verifique se o exercício foi digitado corretamente.",
        status_code: 404,
      });
    });

    test("With nonexistent exercise name", async () => {
      const name = "coxa";
      const response = await fetch(
        `http://localhost:3030/api/v1/exercises?name=${name}`,
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O exercício não foi encontrado no sistema.",
        action: "Verifique se o exercício foi digitado corretamente.",
        status_code: 404,
      });
    });
  });
});
