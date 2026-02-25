const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const pinoHttp = require("pino-http");

const { config } = require("./config");
const { logger } = require("./logger/logger");
const { createContainer } = require("./container");
const { createWeatherRoutes } = require("./routes/weatherRoutes");
const { AppError } = require("./errors/AppError");
const { errorHandler } = require("./errors/errorHandler");

function createApp(overrides = {}) {
  const app = express();
  const container = createContainer(overrides);

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: {
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests, please try again later",
        },
      },
    }),
  );
  app.use(express.json({ limit: "10kb" }));
  app.use(
    pinoHttp({
      logger,
      customLogLevel(req, res, err) {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },
      serializers: {
        req(request) {
          return {
            method: request.method,
            url: request.url,
          };
        },
      },
    }),
  );

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      env: config.env,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || null,
      node: process.version
    });
  });

  app.use("/api/v1/weather", createWeatherRoutes(container));

  app.use((req, _res, next) => {
    next(new AppError("Route not found", 404, "NOT_FOUND"));
  });

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
