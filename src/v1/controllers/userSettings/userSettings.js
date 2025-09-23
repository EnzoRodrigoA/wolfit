import { UnauthorizedError } from "#src/infra/errors.js";
import session from "#src/v1/models/session.js";
import userSetting from "#src/v1/models/userSetting.js";

async function postHandler(request, response, next) {
  try {
    const userSettingValues = request.body;
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão válida.",
        action: "Verifique se o usuário está logado e tente novamente.",
      });
    }
    const sessionToken = authHeader.split(" ")[1];

    const sessionObject = await session.findOneValidByToken(sessionToken);
    const userId = sessionObject.user_id;
    if (!userId) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão válida.",
        action: "Verifique se o usuário está logado e tente novamente.",
      });
    }
    const newUserSettings = await userSetting.insertUserSettings(
      userId,
      userSettingValues,
    );

    return response.status(201).json(newUserSettings);
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
    const userId = sessionObject.user_id;
    if (!userId) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão válida.",
        action: "Verifique se o usuário está logado e tente novamente.",
      });
    }
    const userSettings = await userSetting.findSettingsByUserId(userId);
    return response.status(200).json(userSettings);
  } catch (error) {
    next(error);
  }
}

async function patchHandler(request, response, next) {
  try {
    const userSettingValues = request.body;

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão válida.",
        action: "Verifique se o usuário está logado e tente novamente.",
      });
    }
    const sessionToken = authHeader.split(" ")[1];

    const sessionObject = await session.findOneValidByToken(sessionToken);
    const userId = sessionObject.user_id;
    if (!userId) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão válida.",
        action: "Verifique se o usuário está logado e tente novamente.",
      });
    }
    const updatedUser = await userSetting.updateSettings(
      userId,
      userSettingValues,
    );

    return response.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
}

const users = {
  postHandler,
  getHandler,
  patchHandler,
};

export default users;
