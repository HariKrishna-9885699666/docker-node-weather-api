const dotenv = require("dotenv");

dotenv.config({ quiet: true });

const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  weatherApi: {
    baseUrl:
      process.env.WEATHER_API_BASE_URL ||
      "https://api.openweathermap.org/data/2.5",
    apiKey: process.env.WEATHER_API_KEY || "",
    timeoutMs: Number(process.env.WEATHER_API_TIMEOUT_MS || 5000),
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 60),
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
};

module.exports = { config };
