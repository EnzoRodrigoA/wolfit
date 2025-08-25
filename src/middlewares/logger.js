import chalk from "chalk";

function logger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const method = req.method;
    const url = req.originalUrl;
    const { statusCode } = res;

    let statusColor;

    if (statusCode >= 500)
      statusColor = chalk.red; // vermelho
    else if (statusCode >= 400)
      statusColor = chalk.yellow; // amarelo
    else if (statusCode >= 300)
      statusColor = chalk.cyan; // ciano
    else if (statusCode >= 200)
      statusColor = chalk.green; // verde
    else statusColor = chalk.white; // reset

    console.log(`${method} ${url} ${statusColor(statusCode)} in ${duration}ms`);

    if (statusCode >= 400) {
      console.log("");
    }
  });

  next();
}

export default logger;
