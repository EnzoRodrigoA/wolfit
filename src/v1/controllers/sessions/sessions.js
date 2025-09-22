import { UnauthorizedError } from "#src/infra/errors.js";
import authentication from "#src/v1/models/authentication.js";
import session from "#src/v1/models/session.js";

async function postHandler(request, response, next) {
  try {
    const userInputValues = request.body;

    const authenticatedUser = await authentication.authenticateUser(
      userInputValues.email,
      userInputValues.password,
    );

    const newSession = await session.create(authenticatedUser.id);

    return response.status(201).json(newSession);
  } catch (error) {
    next(error);
  }
}

async function deleteHandler(request, response, next) {
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

    const expiredSession = await session.expireById(sessionObject.id);

    return response.status(200).json(expiredSession);
  } catch (error) {
    next(error);
  }
}

const users = {
  postHandler,
  deleteHandler,
};

export default users;
