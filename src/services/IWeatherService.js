class IWeatherService {
  // eslint-disable-next-line class-methods-use-this
  async getWeatherByCity(_city) {
    throw new Error("getWeatherByCity method must be implemented");
  }
}

module.exports = { IWeatherService };
