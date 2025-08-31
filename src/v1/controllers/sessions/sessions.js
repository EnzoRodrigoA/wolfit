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

const users = {
  postHandler,
};

export default users;
