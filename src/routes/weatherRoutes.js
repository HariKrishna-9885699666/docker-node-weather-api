const { Router } = require("express");
const { validate } = require("../middlewares/validate");
const { getWeatherQuerySchema } = require("../validators/weatherValidator");

function createWeatherRoutes({ weatherController }) {
  const router = Router();

  router.get("/", validate(getWeatherQuerySchema), weatherController.getWeather);

  return router;
}

module.exports = { createWeatherRoutes };
