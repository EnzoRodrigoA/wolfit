import { InternalServerError } from "#src/infra/errors.js";

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
      console.info("\n", statusCode, `- ${error.name} - ${error.action} `);
    }
  }
  response.status(statusCode).json(publicErrorObject);
}
