import dotenv from "dotenv";
dotenv.config();

/** @type {import('jest').Config} */
const config = {
  moduleDirectories: ["node_modules"],
  rootDir: ".",
  testTimeout: 60000,
};

export default config;
