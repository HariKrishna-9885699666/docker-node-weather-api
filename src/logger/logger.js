const pino = require("pino");
const { config } = require("../config");

const logger = pino({
  level: config.logging.level,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.x-api-key",
      "res.headers['set-cookie']",
      "apiKey",
    ],
    censor: "[REDACTED]",
  },
  base: undefined,
});

module.exports = { logger };
