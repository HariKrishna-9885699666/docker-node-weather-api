const { OpenWeatherClient } = require("../../src/clients/OpenWeatherClient");
const { AppError } = require("../../src/errors/AppError");

describe("OpenWeatherClient", () => {
  test("fetches weather data from provider", async () => {
    const httpClient = {
      get: jest.fn().mockResolvedValue({ data: { name: "Rome" } }),
    };
    const client = new OpenWeatherClient({
      baseUrl: "https://example.com",
      apiKey: "secret",
      timeoutMs: 3000,
      httpClient,
    });

    const result = await client.fetchByCity("Rome");

    expect(httpClient.get).toHaveBeenCalledWith("https://example.com/weather", {
      params: { q: "Rome", appid: "secret", units: "metric" },
      timeout: 3000,
    });
    expect(result).toEqual({ name: "Rome" });
  });

  test("throws config error when API key is missing", async () => {
    const client = new OpenWeatherClient({
      baseUrl: "https://example.com",
      apiKey: "",
      timeoutMs: 3000,
      httpClient: { get: jest.fn() },
    });

    await expect(client.fetchByCity("Rome")).rejects.toMatchObject({
      code: "WEATHER_PROVIDER_CONFIG_ERROR",
      statusCode: 500,
    });
  });

  test("maps provider 404 to CITY_NOT_FOUND", async () => {
    const client = new OpenWeatherClient({
      baseUrl: "https://example.com",
      apiKey: "secret",
      timeoutMs: 3000,
      httpClient: {
        get: jest.fn().mockRejectedValue({ response: { status: 404 } }),
      },
    });

    await expect(client.fetchByCity("NoCity")).rejects.toMatchObject({
      code: "CITY_NOT_FOUND",
      statusCode: 404,
    });
  });

  test("maps provider 401 to WEATHER_PROVIDER_AUTH_ERROR", async () => {
    const client = new OpenWeatherClient({
      baseUrl: "https://example.com",
      apiKey: "secret",
      timeoutMs: 3000,
      httpClient: {
        get: jest.fn().mockRejectedValue({ response: { status: 401 } }),
      },
    });

    await expect(client.fetchByCity("Rome")).rejects.toMatchObject({
      code: "WEATHER_PROVIDER_AUTH_ERROR",
      statusCode: 502,
    });
  });

  test("maps unknown provider failures to WEATHER_PROVIDER_ERROR", async () => {
    const client = new OpenWeatherClient({
      baseUrl: "https://example.com",
      apiKey: "secret",
      timeoutMs: 3000,
      httpClient: {
        get: jest.fn().mockRejectedValue(new Error("network down")),
      },
    });

    try {
      await client.fetchByCity("Rome");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect(err.code).toBe("WEATHER_PROVIDER_ERROR");
      expect(err.statusCode).toBe(502);
    }
  });
});
