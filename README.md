````markdown
# Weather API Service

Minimal stateless Node.js + Express weather API following clean architecture and SOLID/DRY/KISS principles.

---

## 📌 Endpoint

- `GET /api/v1/weather?city=<city_name>`

---

## 📦 Example Response

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
````

---

# 🛠 Setup (Local Development)

## 1️⃣ Environment Setup

1. Copy `.env.example` to `.env`
2. Set `WEATHER_API_KEY` with your provider key
   (Get a free key from [https://openweathermap.org/api](https://openweathermap.org/api))

---

## 2️⃣ Install Dependencies (Yarn 4)

```bash
corepack enable
corepack prepare yarn@4.12.0 --activate
yarn install
```

---

## 3️⃣ Run Application

Development:

```bash
yarn dev
```

Production:

```bash
yarn start
```

Run tests:

```bash
yarn test
```

---

# 🐳 Docker

## 1) Build Image

```bash
docker build -t weather-api:latest .
```

---

## 2) Run Container with Env File

Make sure your `.env` exists and has a valid `WEATHER_API_KEY`.

```bash
docker run --name weather-api -p 3000:3000 --env-file .env weather-api:latest
```

---

## 3) Verify APIs

```bash
curl "http://localhost:3000/health"
curl "http://localhost:3000/api/v1/weather?city=London"
```

---

## 4) View Logs

```bash
docker logs -f weather-api
```

---

## 5) Stop and Remove Container

```bash
docker stop weather-api
docker rm weather-api
```

---

## 6) Rebuild After Code Changes

```bash
docker rm -f weather-api
docker build --no-cache -t weather-api:latest .
docker run --name weather-api -p 3000:3000 --env-file .env weather-api:latest
```

---

## Docker Notes

* The app listens on port `3000` inside the container.
* Do not bake secrets into the image; always pass via `--env-file` or `-e`.
* If you get `WEATHER_PROVIDER_AUTH_ERROR`, rotate/replace `WEATHER_API_KEY` and rerun the container.
* If port `3000` is busy locally, map another port:

  ```
  -p 8080:3000
  ```

  Then use `http://localhost:8080`.
* If you get `Cannot find module 'express'`, rebuild with `--no-cache`.

---

# 🏗 Architecture

* `src/routes` → HTTP route definitions
* `src/controllers` → Request/response orchestration
* `src/services` → Business logic
* `src/clients` → External provider integration
* `src/validators` → Input validation schemas
* `src/middlewares` → Reusable middleware
* `src/config` → Environment configuration
* `src/errors` → Centralized error handling
* `src/logger` → Structured logging

---

# 🔐 Security

* Helmet secure headers
* Rate limiting
* Input validation and sanitization via Zod
* Environment-based API key handling
* Sensitive value redaction in logs
* Centralized safe error responses

---

# 🚀 Jenkins + Docker CI/CD Setup (Local)

This project supports a fully local CI/CD setup using:

* Jenkins (running inside Docker)
* Docker Engine
* GitHub Repository

---

# Jenkins Docker Setup — Clean & Clear Steps

---

## 🔍 Step 1 — Check Which Image Jenkins Is Using

Run:

```bash
docker ps
```

Look at the IMAGE column.

If you see:

```
jenkins/jenkins:lts-jdk17
```

❌ That’s the default image (no Docker CLI)

If you see:

```
jenkins-with-docker
```

✅ That’s correct.

---

## 🛑 Step 2 — Stop & Remove Current Jenkins

```bash
docker stop jenkins
docker rm jenkins
```

Confirm it's gone:

```bash
docker ps
```

---

## 🏗 Step 3 — Build Custom Jenkins Image

Create a folder named:

```
jenkins-docker
```

Inside it create a `Dockerfile`:

```Dockerfile
FROM jenkins/jenkins:lts-jdk17

USER root

RUN apt-get update && \
    apt-get install -y docker.io && \
    apt-get clean

RUN usermod -aG docker jenkins

USER jenkins
```

Build image:

```bash
docker build -t jenkins-with-docker .
```

---

## 🚀 Step 4 — Run Jenkins Using Custom Image

```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins-with-docker
```

---

## 🔐 Get Jenkins Initial Password

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Open:

```
http://localhost:8080
```

Install suggested plugins.

---

## 🏗 Create Pipeline Job

1. Click **New Item**
2. Name: `weather-api-pipeline`
3. Select **Pipeline**
4. Choose **Pipeline script from SCM**
5. SCM: Git
6. Repository:

   ```
   https://github.com/HariKrishna-9885699666/docker-node-weather-api.git
   ```
7. Branch:

   ```
   */main
   ```

Save.

---

## 📄 Jenkinsfile

Ensure the repo contains:

```groovy
pipeline {
    agent any

    environment {
        IMAGE_NAME = "weather-api"
        CONTAINER_NAME = "weather-api"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME} ."
            }
        }

        stage('Stop Old Container') {
            steps {
                sh "docker stop ${CONTAINER_NAME} || true"
                sh "docker rm ${CONTAINER_NAME} || true"
            }
        }

        stage('Run Container') {
            steps {
                sh "docker run -d -p 3000:3000 --env-file .env --name ${CONTAINER_NAME} ${IMAGE_NAME}"
            }
        }
    }
}
```

---

## 🔍 Step 5 — Verify Docker Inside Jenkins

```bash
docker exec -it jenkins bash
docker --version
```

You should see:

```
Docker version 24.x.x
```

If yes → ✅ Jenkins is correctly configured.

---

# 🔄 CI/CD Flow

```
GitHub Push
      ↓
Jenkins Checkout
      ↓
Docker Build
      ↓
Stop Old Container
      ↓
Run New Container
```

---

# ✅ Summary

This setup provides:

* Yarn 4 based Node.js application
* Docker containerization
* Jenkins running in Docker
* Automated local CI/CD pipeline
* Fully reproducible local DevOps workflow

```

---
```
