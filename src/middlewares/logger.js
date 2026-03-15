import chalk from "chalk";

function logger(request, response, next) {
  const start = Date.now();

  response.on("finish", () => {
    const duration = Date.now() - start;
    const method = request.method;
    const url = request.originalUrl;
    const { statusCode } = response;

    let statusColor;

    if (statusCode >= 500) statusColor = chalk.red;
    else if (statusCode >= 400) statusColor = chalk.yellow;
    else if (statusCode >= 300) statusColor = chalk.cyan;
    else if (statusCode >= 200) statusColor = chalk.green;
    else statusColor = chalk.white;

    console.log(
      `${method} ${url} ${statusColor(statusCode)} in ${duration}ms\n`,
    );
  });

  return next();
}

export default logger;
