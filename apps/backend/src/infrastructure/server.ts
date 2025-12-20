import express, { type Express } from "express";

/* Creates and configures the Express application */
export function createServer(): Express {
  const app = express();

  /* Parse JSON request bodies */
  app.use(express.json());

  /* Health check endpoint - used by load balancers, container orchestration */
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  return app;
}
