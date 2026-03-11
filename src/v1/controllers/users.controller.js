import user from "#models/user.js";
import session from "#src/v1/models/session.js";
import activation from "#models/activation.js";
import { UnauthorizedError } from "#src/infra/errors.js";

async function postHandler(request, response, next) {
  try {
    const userInputValues = request.body;
    const newUser = await user.create(userInputValues);

    const activationToken = await activation.create(newUser.id);
    await activation.sendEmailToUser(newUser, activationToken);

    return response.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
}

async function patchHandler(request, response, next) {
  try {
    const { username } = request.params;
    const userInputValues = request.body;

    const updatedUser = await user.update(username, userInputValues);

    return response.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
}

async function getOneByUsername(request, response, next) {
  try {
    const { username } = request.params;
    const userFound = await user.findOneByUsername(username);
    return response.status(200).json(userFound);
  } catch (error) {
    next(error);
  }
}

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

const users = {
  postHandler,
  patchHandler,
  getOneByUsername,
  getHandler,
};

export default users;
