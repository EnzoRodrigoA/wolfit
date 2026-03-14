import user from "#models/user.js";
import session from "#models/session.js";
import activation from "#models/activation.js";
import controller from "#infra/controller.js";
import authorization from "#models/authorization.js";
import { ForbiddenError } from "#src/infra/errors.js";

async function postHandler(request, response, next) {
  try {
    const userTryingToPost = request.context.user;
    const userInputValues = request.body;
    const newUser = await user.create(userInputValues);

    const activationToken = await activation.create(newUser.id);
    await activation.sendEmailToUser(newUser, activationToken);

    const secureOutputValues = authorization.filterOutput(
      userTryingToPost,
      "read:user",
      newUser,
    );

    return response.status(201).json(secureOutputValues);
  } catch (error) {
    next(error);
  }
}

async function patchHandler(request, response, next) {
  try {
    const { username } = request.params;
    const userInputValues = request.body;

    const userTryingToPatch = request.context.user;
    const targetUser = await user.findOneByUsername(username);

    if (!authorization.can(userTryingToPatch, "update:user", targetUser)) {
      throw new ForbiddenError({
        message: "Você não possui permissão para atualizar outro usuário.",
        action:
          "Verifique se você tem a feature necessária para atualizar outro usuário.",
      });
    }

    const updatedUser = await user.update(username, userInputValues);

    const secureOutputValues = authorization.filterOutput(
      userTryingToPatch,
      "read:user",
      updatedUser,
    );

    return response.status(200).json(secureOutputValues);
  } catch (error) {
    next(error);
  }
}

async function getOneByUsername(request, response, next) {
  try {
    const userTryingToGet = request.context.user;
    const { username } = request.params;
    const userFound = await user.findOneByUsername(username);

    const secureOutputValues = authorization.filterOutput(
      userTryingToGet,
      "read:user",
      userFound,
    );

    return response.status(200).json(secureOutputValues);
  } catch (error) {
    next(error);
  }
}

async function getHandler(request, response, next) {
  try {
    const userTryingToGet = request.context.user;
    const sessionToken = request.cookies.session_id;

    const sessionObject = await session.findOneValidByToken(sessionToken);
    const renewedSessionObject = await session.renew(sessionObject.id);

    controller.setSessionCookie(renewedSessionObject.token, response);

    const userFound = await user.findOneById(sessionObject.user_id);

    response.setHeader(
      "Cache-Control",
      "no-store, no-cache, max-age=0, must-revalidate",
    );

    const secureOutputValues = authorization.filterOutput(
      userTryingToGet,
      "read:user:self",
      userFound,
    );

    return response.status(200).json(secureOutputValues);
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
