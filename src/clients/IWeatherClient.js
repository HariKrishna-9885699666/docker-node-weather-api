class IWeatherClient {
  // eslint-disable-next-line class-methods-use-this
  async fetchByCity(_city) {
    throw new Error("fetchByCity method must be implemented");
  }
}

module.exports = { IWeatherClient };
