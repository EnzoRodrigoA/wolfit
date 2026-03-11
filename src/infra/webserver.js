function gerOrigin() {
  if (["test", "development"].includes(process.env.NODE_ENV)) {
    return "http://localhost:3030";
  }

  return "https://linkcerto.com.br";
}

const webserver = {
  origin: gerOrigin(),
};

export default webserver;
