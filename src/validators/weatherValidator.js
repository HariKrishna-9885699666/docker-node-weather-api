const { z } = require("zod");

const getWeatherQuerySchema = z.object({
  city: z
    .string()
    .trim()
    .min(1, "city is required")
    .max(100, "city is too long")
    .regex(/^[a-zA-Z\s'-]+$/, "city contains unsupported characters"),
});

module.exports = { getWeatherQuerySchema };
