import email from "#src/infra/email.js";
import orchestrator from "../../orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();
    await email.send({
      from: "Wolfit <contato@wolfit.com.br>",
      to: "enzo@email.com",
      subject: "Teste de assunto",
      text: "Teste de corpo.",
    });
    await email.send({
      from: "Wolfit <contato@wolfit.com.br>",
      to: "enzo@email.com",
      subject: "Ultimo email enviado",
      text: "Corpo do último email",
    });

    const lastEmail = await orchestrator.getLastEmail();
    console.log(lastEmail);
    expect(lastEmail.sender).toBe("<contato@wolfit.com.br>");
    expect(lastEmail.recipients[0]).toBe("<enzo@email.com>");
    expect(lastEmail.subject).toBe("Ultimo email enviado");
    expect(lastEmail.text).toBe("Corpo do último email\r\n");
  });
});
