import controller from "#src/infra/controller.js";
import session from "#src/v1/models/session.js";
import user from "#src/v1/models/user.js";

async function getHandler(request, response, next) {
  try {
    const sessionToken = request.cookies.session_id;

    const sessionObject = await session.findOneValidByToken(sessionToken);
    const renewedSessionObject = await session.renew(sessionObject.id);

    controller.setSessionCookie(renewedSessionObject.token, response);

    const userFound = await user.findOneById(sessionObject.user_id);

    response.setHeader(
      "Cache-Control",
      "no-store, no-cache, max-age=0, must-revalidate",
    );

    return response.status(200).json(userFound);
  } catch (error) {
    next(error);
  }
}

const userSession = {
  getHandler,
};

export default userSession;
