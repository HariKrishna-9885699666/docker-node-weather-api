const { WeatherController } = require("../../src/controllers/WeatherController");
const { AppError } = require("../../src/errors/AppError");

describe("WeatherController", () => {
  test("returns weather data on success", async () => {
    const weatherService = {
      getWeatherByCity: jest.fn().mockResolvedValue({ city: "London" }),
    };
    const controller = new WeatherController({ weatherService });
    const req = { query: { city: "London" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await controller.getWeather(req, res, next);

    expect(weatherService.getWeatherByCity).toHaveBeenCalledWith("London");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: { city: "London" } });
    expect(next).not.toHaveBeenCalled();
  });

  test("forwards service errors to centralized error middleware", async () => {
    const serviceError = new AppError("City not found", 404, "CITY_NOT_FOUND");
    const weatherService = {
      getWeatherByCity: jest.fn().mockRejectedValue(serviceError),
    };
    const controller = new WeatherController({ weatherService });
    const req = { query: { city: "MissingCity" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await controller.getWeather(req, res, next);

    expect(next).toHaveBeenCalledWith(serviceError);
    expect(res.status).not.toHaveBeenCalled();
  });
});
