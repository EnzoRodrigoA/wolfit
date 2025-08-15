import dotenv from "dotenv";
dotenv.config();

/** @type {import('jest').Config} */
const config = {
  moduleDirectories: ["node_modules"],
  rootDir: ".",
};

export default config;
