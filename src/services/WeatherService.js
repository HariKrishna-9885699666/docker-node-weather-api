const { IWeatherService } = require("./IWeatherService");

class WeatherService extends IWeatherService {
  constructor({ weatherClient }) {
    super();
    this.weatherClient = weatherClient;
  }

  async getWeatherByCity(city) {
    const providerData = await this.weatherClient.fetchByCity(city);

    return {
      city: providerData?.name,
      country: providerData?.sys?.country,
      coordinates: {
        lat: providerData?.coord?.lat,
        lon: providerData?.coord?.lon,
      },
      weather: {
        condition: providerData?.weather?.[0]?.main,
        description: providerData?.weather?.[0]?.description,
      },
      temperature: {
        current: providerData?.main?.temp,
        feelsLike: providerData?.main?.feels_like,
        min: providerData?.main?.temp_min,
        max: providerData?.main?.temp_max,
        humidity: providerData?.main?.humidity,
        pressure: providerData?.main?.pressure,
      },
      wind: {
        speed: providerData?.wind?.speed,
        degree: providerData?.wind?.deg,
      },
      visibility: providerData?.visibility,
      cloudiness: providerData?.clouds?.all,
      timezone: providerData?.timezone,
      sunrise: providerData?.sys?.sunrise,
      sunset: providerData?.sys?.sunset,
      fetchedAt: new Date().toISOString(),
    };
  }
}

module.exports = { WeatherService };
