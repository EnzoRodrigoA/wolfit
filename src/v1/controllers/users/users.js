import user from "../../models/user.js";

async function postHandler(request, response, next) {
  try {
    const userInputValues = request.body;
    const newUser = await user.create(userInputValues);
    return response.status(201).json(newUser);
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
  getOneByUsername,
};

export default users;
