const axios = require("axios");
const { IWeatherClient } = require("./IWeatherClient");
const { AppError } = require("../errors/AppError");

class OpenWeatherClient extends IWeatherClient {
  constructor({ baseUrl, apiKey, timeoutMs, httpClient = axios }) {
    super();
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.timeoutMs = timeoutMs;
    this.httpClient = httpClient;
  }

  async fetchByCity(city) {
    if (!this.apiKey) {
      throw new AppError(
        "Weather provider API key is not configured",
        500,
        "WEATHER_PROVIDER_CONFIG_ERROR",
      );
    }

    try {
      const response = await this.httpClient.get(`${this.baseUrl}/weather`, {
        params: {
          q: city,
          appid: this.apiKey,
          units: "metric",
        },
        timeout: this.timeoutMs,
      });

      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        throw new AppError("City not found", 404, "CITY_NOT_FOUND");
      }

      if (err.response?.status === 401) {
        throw new AppError(
          "Weather provider authentication failed1111111",
          502,
          "WEATHER_PROVIDER_AUTH_ERROR",
        );
      }

      throw new AppError(
        "Failed to fetch weather data from provider",
        502,
        "WEATHER_PROVIDER_ERROR",
      );
    }
  }
}

module.exports = { OpenWeatherClient };
