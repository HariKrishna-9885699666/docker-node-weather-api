const { createApp } = require("./app");
const { config } = require("./config");
const { logger } = require("./logger/logger");

const app = createApp();

app.listen(config.port, () => {
  const baseUrl = `http://localhost:${config.port}`;
  logger.info(
    {
      port: config.port,
      serverUrl: baseUrl,
      healthUrl: `${baseUrl}/health`,
      weatherUrlExample: `${baseUrl}/api/v1/weather?city=London`,
    },
    "Weather API server started",
  );
});
