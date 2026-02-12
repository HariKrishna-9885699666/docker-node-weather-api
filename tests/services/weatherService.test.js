const { WeatherService } = require("../../src/services/WeatherService");

describe("WeatherService", () => {
  test("maps provider response into API response model", async () => {
    const mockClient = {
      fetchByCity: jest.fn().mockResolvedValue({
        name: "Berlin",
        sys: { country: "DE", sunrise: 100, sunset: 200 },
        coord: { lat: 52.52, lon: 13.4 },
        weather: [{ main: "Clouds", description: "overcast clouds" }],
        main: {
          temp: 8,
          feels_like: 6,
          temp_min: 6,
          temp_max: 10,
          humidity: 70,
          pressure: 1001,
        },
        wind: { speed: 4.2, deg: 150 },
        visibility: 10000,
        clouds: { all: 98 },
        timezone: 3600,
      }),
    };

    const service = new WeatherService({ weatherClient: mockClient });

    const result = await service.getWeatherByCity("Berlin");

    expect(mockClient.fetchByCity).toHaveBeenCalledWith("Berlin");
    expect(result).toMatchObject({
      city: "Berlin",
      country: "DE",
      coordinates: { lat: 52.52, lon: 13.4 },
      weather: {
        condition: "Clouds",
        description: "overcast clouds",
      },
      temperature: {
        current: 8,
        feelsLike: 6,
        min: 6,
        max: 10,
        humidity: 70,
        pressure: 1001,
      },
      wind: { speed: 4.2, degree: 150 },
      visibility: 10000,
      cloudiness: 98,
      timezone: 3600,
      sunrise: 100,
      sunset: 200,
    });
    expect(result.fetchedAt).toBeDefined();
  });
});
