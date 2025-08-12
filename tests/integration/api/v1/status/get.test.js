test("Database Connection", async () => {
  const response = await fetch("http://localhost:3030/api/v1/status");
  expect(response.status).toBe(200);
});
