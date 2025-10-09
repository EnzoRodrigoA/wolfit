import email from "#src/infra/email.js";

async function sendEmailToUser(user) {
  await email.send({
    from: "<contato@thekessel.com>",
    to: user.email,
    subject: "Ative seu Cadastro!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro:

    https://link...

    Atenciosamente,
    Equipe do APP,
    
    `,
  });
}

const activation = {
  sendEmailToUser,
};

export default activation;
