const request = require("supertest");
const { createApp } = require("../../src/app");
const { AppError } = require("../../src/errors/AppError");

describe("GET /api/v1/weather", () => {
  test("returns 200 with weather payload for valid city", async () => {
    const app = createApp({
      weatherService: {
        getWeatherByCity: jest.fn().mockResolvedValue({
          city: "Paris",
          country: "FR",
        }),
      },
    });

    const response = await request(app)
      .get("/api/v1/weather")
      .query({ city: "Paris" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        city: "Paris",
        country: "FR",
      },
    });
  });

  test("returns 400 when city query is missing", async () => {
    const app = createApp({
      weatherService: {
        getWeatherByCity: jest.fn(),
      },
    });

    const response = await request(app).get("/api/v1/weather");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("returns 404 when service throws city not found", async () => {
    const app = createApp({
      weatherService: {
        getWeatherByCity: jest
          .fn()
          .mockRejectedValue(
            new AppError("City not found", 404, "CITY_NOT_FOUND"),
          ),
      },
    });

    const response = await request(app)
      .get("/api/v1/weather")
      .query({ city: "Unknown" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "CITY_NOT_FOUND",
        message: "City not found",
      },
    });
  });
});
