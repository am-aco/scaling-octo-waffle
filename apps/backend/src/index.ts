import { config } from "./infrastructure/config.js";
import { createServer } from "./infrastructure/server.js";

/* Create Express app */
const app = createServer();

/* Start listening */
app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
});
