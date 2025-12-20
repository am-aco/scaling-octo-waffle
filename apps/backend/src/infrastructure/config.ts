import "dotenv/config";

/* Application configuration loaded from environment variables */

interface Config {
  nodeEnv: "development" | "production" | "test";
  port: number;
}

function loadConfig(): Config {
  const nodeEnv = process.env["NODE_ENV"];
  const port = process.env["PORT"];

  /* Validate required variables exist */
  if (!nodeEnv) {
    throw new Error("Missing required environment variable: NODE_ENV");
  }

  if (!port) {
    throw new Error("Missing required environment variable: PORT");
  }

  /* Validate NODE_ENV is a valid value */
  if (!["development", "production", "test"].includes(nodeEnv)) {
    throw new Error(
      `Invalid NODE_ENV: ${nodeEnv}. Must be development, production, or test`
    );
  }

  /* Parse PORT as number */
  const parsedPort = parseInt(port, 10);
  if (isNaN(parsedPort)) {
    throw new Error(`Invalid PORT: ${port}. Must be a number`);
  }

  return {
    nodeEnv: nodeEnv as Config["nodeEnv"],
    port: parsedPort,
  };
}

/* Export singleton config - loaded once at startup */
export const config = loadConfig();
