import activation from "#models/activation.js";
import authorization from "../models/authorization.js";

async function patchHandler(request, response, next) {
  try {
    const userTryingToPatch = request.context.user;
    const activationTokenId = request.params.token_id;

    const validActivationToken =
      await activation.findOneValidById(activationTokenId);

    await activation.activateUserByUserId(validActivationToken.user_id);

    const usedActivationToken =
      await activation.markTokenAsUsed(activationTokenId);

    const secureOutputValues = authorization.filterOutput(
      userTryingToPatch,
      "read:activation_token",
      usedActivationToken,
    );

    return response.status(200).json(secureOutputValues);
  } catch (error) {
    next(error);
  }
}

const activations = {
  patchHandler,
};

export default activations;
