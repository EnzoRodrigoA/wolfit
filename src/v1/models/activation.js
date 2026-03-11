import email from "#infra/email.js";
import database from "#src/infra/database.js";
import { NotFoundError } from "#src/infra/errors.js";
import webserver from "#src/infra/webserver.js";
import user from "./user.js";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING
         *
      ;`,
      values: [userId, expiresAt],
    });
    return results.rows[0];
  }
}

async function findOneValidById(tokenId) {
  const tokenObject = await runSelectQuery(tokenId);
  return tokenObject;

  async function runSelectQuery(tokenId) {
    const results = await database.query({
      text: `
      SELECT
        *
      FROM
        user_activation_tokens
      WHERE
        id = $1
        AND expires_at > NOW()
        AND used_at IS NULL
      LIMIT
        1
    ;`,
      values: [tokenId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message:
          "O token de ativação não foi encontrado no sistema ou expirou.",
        action: "Faça um novo cadastro.",
      });
    }
    return results.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "Wolfit <contato@wolfit.com.br>",
    to: user.email,
    subject: "Ative seu cadastro!",
    text: `${user.username},
    
Clique no link abaixo para ativar seu cadastro:
    
${webserver.origin}/cadastro/ativar/${activationToken.id}

Atenciosamente,
Equipe Wolfit`,
  });
}

async function markTokenAsUsed(activationTokenId) {
  const usedActivationToken = await runUpdateQuery(activationTokenId);
  return usedActivationToken;

  async function runUpdateQuery(activationTokenId) {
    const results = await database.query({
      text: `
        UPDATE
          user_activation_tokens
        SET
          used_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      ;`,
      values: [activationTokenId],
    });
    return results.rows[0];
  }
}

async function activateUserById(userId) {
  const activatedUser = await user.setFeatures(userId, ["create:session"]);
  return activatedUser;
}

const activation = {
  sendEmailToUser,
  findOneValidById,
  markTokenAsUsed,
  activateUserById,
  create,
};

export default activation;
