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

const users = {
  postHandler,
};

export default users;
