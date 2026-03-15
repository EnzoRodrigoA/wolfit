import chalk from "chalk";

function logger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const method = req.method;
    const url = req.originalUrl;
    const { statusCode } = res;

    let statusColor;

    if (statusCode >= 500) statusColor = chalk.red;
    else if (statusCode >= 400) statusColor = chalk.yellow;
    else if (statusCode >= 300) statusColor = chalk.cyan;
    else if (statusCode >= 200) statusColor = chalk.green;
    else statusColor = chalk.white;

    process.env.NODE_ENV !== "production"
      ? console.log(
          `${method} ${url} ${statusColor(statusCode)} in ${duration}ms\n`,
        )
      : null;
  });

  return next();
}

export default logger;
