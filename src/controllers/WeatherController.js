class WeatherController {
  constructor({ weatherService }) {
    this.weatherService = weatherService;
  }

  getWeather = async (req, res, next) => {
    try {
      const { city } = req.query;
      const data = await this.weatherService.getWeatherByCity(city);
      return res.status(200).json({ data });
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = { WeatherController };
