import session from "#src/v1/models/session.js";
import user from "#src/v1/models/user.js";
import { UnauthorizedError } from "#src/infra/errors.js";

async function getHandler(request, response, next) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão válida.",
        action: "Verifique se o usuário está logado e tente novamente.",
      });
    }
    const sessionToken = authHeader.split(" ")[1];

    const sessionObject = await session.findOneValidByToken(sessionToken);
    await session.renew(sessionObject.id);

    const userFound = await user.findOneById(sessionObject.user_id);

    return response.status(200).json(userFound);
  } catch (error) {
    next(error);
  }
}

const userSession = {
  getHandler,
};

export default userSession;
