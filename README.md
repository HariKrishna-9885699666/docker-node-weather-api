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


# Jenkins CI/CD Setup

## Install Jenkins with Docker

```bash
# Pull Jenkins LTS image
docker pull jenkins/jenkins:lts

# Run Jenkins container (map port 8080 and 50000)
docker run -d --name jenkins -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
```

## Get Jenkins initial admin password

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

## Access Jenkins

- Open http://localhost:8080 in your browser
- Paste the initial admin password when prompted
- Install suggested plugins and create your admin user

## Example Jenkins Pipeline (Jenkinsfile)

This repo includes a Jenkinsfile for Docker-based CI/CD:

```groovy
pipeline {
  agent any
  environment {
    IMAGE_NAME = "weather-api"
    CONTAINER_NAME = "weather-api"
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Build Docker Image') {
      steps { sh "docker build -t ${IMAGE_NAME} ." }
    }
    stage('Stop Old Container') {
      steps {
        sh "docker stop ${CONTAINER_NAME} || true"
        sh "docker rm ${CONTAINER_NAME} || true"
      }
    }
    stage('Run Container') {
      steps { sh "docker run -d -p 3000:3000 --name ${CONTAINER_NAME} ${IMAGE_NAME}" }
    }
  }
}
```

---

## Commands Used in This Project

### Node/Yarn
- `corepack yarn install` — Install dependencies
- `corepack yarn dev` — Start in development mode
- `corepack yarn start` — Start in production mode
- `corepack yarn test` — Run tests

### Docker
- `docker build -t weather-api:latest .` — Build Docker image
- `docker run --name weather-api -p 3000:3000 --env-file .env weather-api:latest` — Run container
- `docker logs -f weather-api` — View logs
- `docker stop weather-api` — Stop container
- `docker rm weather-api` — Remove container
- `docker rm -f weather-api` — Force remove container

### Jenkins
- `docker pull jenkins/jenkins:lts` — Pull Jenkins image
- `docker run -d --name jenkins -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts` — Run Jenkins
- `docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword` — Get Jenkins admin password