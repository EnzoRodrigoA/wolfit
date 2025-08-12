test("Server is Running?", async () => {
  const response = await fetch("http://localhost:3030");
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  expect(responseBody).toEqual({ status: "Servidor rodando!" });
});
