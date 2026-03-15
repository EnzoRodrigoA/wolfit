import controller from "#src/infra/controller.js";
import chalk from "chalk";
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
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
  if (process.env.NODE_ENV === "production") {
    const logMessage = `${statusCode} - ${error.name} - ${error.message}\nAction: ${error.action}\n${error.stack}`;
    statusCode >= 500 ? console.error(logMessage) : console.info(logMessage);
  } else {
    statusCode >= 500
      ? console.error(
          statusCode,
          `- ${chalk.bgRed(error.name)} -\n${chalk.redBright(error.cause)}\n${error.stack}`,
        )
      : console.info(
          statusCode,
          `- ${chalk.bgYellow(error.name)} -\n${error.message}\n${chalk.yellow(error.action)}`,
        );
  }

  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof ForbiddenError
  ) {
    return response.status(error.statusCode).json(error);
  }
  if (error instanceof UnauthorizedError) {
    controller.clearSessionCookie(response);
    return response.status(error.statusCode).json(error);
  }
  return response.status(statusCode).json(publicErrorObject);
}
