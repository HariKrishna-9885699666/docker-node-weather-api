# Weather API Service

Minimal stateless Node.js + Express weather API following clean architecture and SOLID/DRY/KISS principles.

## Endpoint

- `GET /api/v1/weather?city=<city_name>`

## Example response

```json
{
  "data": {
    "city": "Berlin",
    "country": "DE",
    "coordinates": { "lat": 52.52, "lon": 13.4 },
    "weather": { "condition": "Clouds", "description": "overcast clouds" },
    "temperature": {
      "current": 8,
      "feelsLike": 6,
      "min": 6,
      "max": 10,
      "humidity": 70,
      "pressure": 1001
    },
    "wind": { "speed": 4.2, "degree": 150 },
    "visibility": 10000,
    "cloudiness": 98,
    "timezone": 3600,
    "sunrise": 1700000000,
    "sunset": 1700030000,
    "fetchedAt": "2026-02-12T00:00:00.000Z"
  }
}
```

## Setup

1. Copy `.env.example` to `.env`
2. Set `WEATHER_API_KEY` with your provider key (get a free key from https://openweathermap.org/api)
3. Install deps:
   - `corepack yarn install`
4. Run:
   - Dev: `corepack yarn dev`
   - Prod: `corepack yarn start`
   - Tests: `corepack yarn test`

## Docker

### 1) Build image

```bash
docker build -t weather-api:latest .
```

### 2) Run container with env file

Make sure your `.env` exists and has a valid `WEATHER_API_KEY`.

```bash
docker run --name weather-api -p 3000:3000 --env-file .env weather-api:latest
```

### 3) Verify APIs

```bash
curl "http://localhost:3000/health"
curl "http://localhost:3000/api/v1/weather?city=London"
```

### 4) View logs

```bash
docker logs -f weather-api
```

### 5) Stop and remove container

```bash
docker stop weather-api
docker rm weather-api
```

### 6) Rebuild after code changes

```bash
docker rm -f weather-api
docker build --no-cache -t weather-api:latest .
docker run --name weather-api -p 3000:3000 --env-file .env weather-api:latest
```

### Docker notes

- The app listens on port `3000` inside the container.
- Do not bake secrets into the image; always pass via `--env-file` or `-e`.
- If you get `WEATHER_PROVIDER_AUTH_ERROR`, rotate/replace `WEATHER_API_KEY` and rerun the container.
- If port `3000` is busy locally, map another port (example: `-p 8080:3000`) and use `http://localhost:8080`.
- If you get `Cannot find module 'express'`, rebuild with `--no-cache` (old image layers may not include installed modules).

## Architecture

- `src/routes`: HTTP route definitions
- `src/controllers`: Request/response orchestration
- `src/services`: Business logic
- `src/clients`: External provider integration
- `src/validators`: Input validation schemas
- `src/middlewares`: Reusable middleware (validation, etc.)
- `src/config`: Environment/config-driven settings
- `src/errors`: App error types + centralized error handling
- `src/logger`: Structured logging

## Security

- Helmet secure headers
- Rate limiting
- Input validation and sanitization via Zod
- Env-based API key handling
- Sensitive value redaction in logs
- Centralized safe error responses



# Jenkins Docker Setup — Clean & Clear Steps

## Let’s Fix It Cleanly (Step-by-Step, No Confusion)

### 🔍 Step 1 — Check Which Image Jenkins Is Using

Run:

```bash
docker ps
```

Look at the IMAGE column.

If you see:

    jenkins/jenkins:lts-jdk17

❌ That’s the default image (no Docker CLI)

If you see:

    jenkins-with-docker

✅ That’s correct.

---

### 🛑 Step 2 — Stop & Remove Current Jenkins

```bash
docker stop jenkins
docker rm jenkins
```

Confirm it's gone:

```bash
docker ps
```

---

### 🏗 Step 3 — Build Custom Jenkins Image (If Not Already)

Make sure you are inside your `jenkins-docker` folder.

**Dockerfile should be:**

```Dockerfile
FROM jenkins/jenkins:lts-jdk17

USER root

RUN apt-get update && \
    apt-get install -y docker.io && \
    apt-get clean

RUN usermod -aG docker jenkins

USER jenkins
```

Now build:

```bash
docker build -t jenkins-with-docker .
```

Wait until build completes successfully.

---

### 🚀 Step 4 — Run Jenkins Using Custom Image

**IMPORTANT:** Use `jenkins-with-docker`, not default image.

```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins-with-docker
```

---

### 🔍 Step 5 — Verify Again

Now check:

```bash
docker exec -it jenkins bash
docker --version
```

You should see something like:

    Docker version 24.x.x

If yes → 🎉 fixed permanently.