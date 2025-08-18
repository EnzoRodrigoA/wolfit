import dotenv from "dotenv";
dotenv.config();

/** @type {import('jest').Config} */
const config = {
  moduleDirectories: ["node_modules"],
  rootDir: ".",
  testTimeout: 60000,
  setupFiles: ["<rootDir>/jest.setup.js"],
};

export default config;
