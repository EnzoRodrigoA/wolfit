import user from "#models/user.js";
import activation from "#models/activation.js";

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

const users = {
  postHandler,
  patchHandler,
  getOneByUsername,
};

export default users;
