import controller from "#src/infra/controller.js";
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

    controller.setSessionCookie(newSession.token, response);

    return response.status(201).json(newSession);
  } catch (error) {
    next(error);
  }
}

async function deleteHandler(request, response, next) {
  try {
    const sessionToken = request.cookies.session_id;

    const sessionObject = await session.findOneValidByToken(sessionToken);

    const expiredSession = await session.expireById(sessionObject.id);
    controller.clearSessionCookie(response);

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
