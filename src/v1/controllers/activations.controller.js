import activation from "#models/activation.js";

async function patchHandler(request, response, next) {
  try {
    const activationTokenId = request.params.token_id;

    const validActivationToken =
      await activation.findOneValidById(activationTokenId);
    const usedActivationToken =
      await activation.markTokenAsUsed(activationTokenId);

    await activation.activateUserById(validActivationToken.user_id);

    return response.status(200).json(usedActivationToken);
  } catch (error) {
    next(error);
  }
}

const activations = {
  patchHandler,
};

export default activations;
