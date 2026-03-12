import controller from "#src/infra/controller.js";
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  ServiceError,
  UnauthorizedError,
  ValidationError,
} from "#src/infra/errors.js";

// eslint-disable-next-line no-unused-vars
export default function globalErrorCatcher(error, request, response, next) {
  const statusCode = error.statusCode || 500;
  const publicErrorObject =
    statusCode >= 500
      ? new InternalServerError({
          cause: error,
          statusCode: statusCode,
        })
      : error;
  if (process.env.NODE_ENV !== "production") {
    if (statusCode >= 500) {
      console.error(error);
    } else {
      console.info(
        "\n==============================================================\n",
        statusCode,
        `- ${error.name} -\n${error.message}\n${error.action}`,
      );
    }
  }
  if (error instanceof UnauthorizedError) {
    controller.clearSessionCookie(response);
    return response.status(statusCode).json(publicErrorObject);
  }
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof ForbiddenError ||
    error instanceof ServiceError
  ) {
    return response.status(error.statusCode).json(error);
  }
  return response.status(statusCode).json(publicErrorObject);
}
