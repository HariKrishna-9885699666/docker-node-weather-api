const { config } = require("./config");
const { OpenWeatherClient } = require("./clients/OpenWeatherClient");
const { WeatherService } = require("./services/WeatherService");
const { WeatherController } = require("./controllers/WeatherController");

function createContainer(overrides = {}) {
  const weatherClient =
    overrides.weatherClient ||
    new OpenWeatherClient({
      baseUrl: config.weatherApi.baseUrl,
      apiKey: config.weatherApi.apiKey,
      timeoutMs: config.weatherApi.timeoutMs,
      httpClient: overrides.httpClient,
    });

  const weatherService =
    overrides.weatherService || new WeatherService({ weatherClient });

  const weatherController =
    overrides.weatherController || new WeatherController({ weatherService });

  return {
    weatherClient,
    weatherService,
    weatherController,
  };
}

module.exports = { createContainer };
