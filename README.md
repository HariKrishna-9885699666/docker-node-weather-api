# 🌤️ Weather API Service + Jenkins CI/CD

> Minimal stateless Node.js + Express weather API following Clean Architecture and SOLID/DRY/KISS principles, with Dockerized Jenkins pipeline automation.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-✓-2496ED.svg)](https://www.docker.com/)
[![Jenkins](https://img.shields.io/badge/Jenkins-LTS-D24939.svg)](https://www.jenkins.io/)

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [🐳 Docker Setup](#-docker-setup)
- [🔧 Jenkins CI/CD Integration](#-jenkins-cicd-integration)
- [🏗️ Architecture](#️-architecture)
- [🔐 Security](#-security)
- [🧪 Testing](#-testing)
- [📦 Environment Variables](#-environment-variables)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

- ✅ Clean Architecture with separation of concerns
- ✅ RESTful API with Zod validation
- ✅ Docker & Docker-in-Docker support
- ✅ Jenkins Pipeline automation (Declarative)
- ✅ Helmet, rate limiting & input sanitization
- ✅ Structured logging with sensitive data redaction
- ✅ Health check endpoint (`/health`)
- ✅ Environment-based configuration

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (or use Docker)
- Yarn (`corepack enable`)
- Docker & Docker Compose (optional)
- [OpenWeatherMap API Key](https://openweathermap.org/api)

### Local Development

```bash
# 1. Clone & navigate
git clone https://github.com/HariKrishna-9885699666/docker-node-weather-api.git
cd docker-node-weather-api

# 2. Configure environment
cp .env.example .env
# Edit .env and add your WEATHER_API_KEY

# 3. Install dependencies
corepack yarn install

# 4. Run development server
corepack yarn dev

# 5. Test the API
curl "http://localhost:3000/api/v1/weather?city=London"
```

### Production Run

```bash
corepack yarn build
corepack yarn start
```

---

## 🐳 Docker Setup

### Build the Image

```bash
docker build -t weather-api:latest .
```

### Run with Environment File

```bash
docker run --name weather-api -p 3000:3000 --env-file .env weather-api:latest
```

> **Note for Windows users:**
> If you see a multiline command with backslashes (\) in this README, copy and paste it as a single line in PowerShell or CMD. For example:
>
> ```sh
> docker run --name weather-api -p 3000:3000 --env-file .env weather-api:latest
> ```

### Run with Inline Env Vars

```bash
docker run --name weather-api -p 3000:3000 -e WEATHER_API_KEY=your_key_here weather-api:latest
```

> **Note for Windows users:**
> Combine the above into a single line when running in PowerShell or CMD:
>
> ```sh
> docker run --name weather-api -p 3000:3000 -e WEATHER_API_KEY=your_key_here weather-api:latest
> ```

### Verify & Test

```bash
# Health check
curl http://localhost:3000/health

# Weather endpoint
curl "http://localhost:3000/api/v1/weather?city=Berlin"

# View logs
docker logs -f weather-api

# Exec into container
docker exec -it weather-api sh
```

### Stop & Cleanup

```bash
docker stop weather-api
docker rm weather-api
```

### Rebuild After Code Changes

```bash
docker rm -f weather-api
docker build --no-cache -t weather-api:latest .
docker run --name weather-api -p 3000:3000 --env-file .env weather-api:latest
```

> ⚠️ **Docker Notes**
> - App listens on port `3000` inside container
> - Never bake secrets into images — use `--env-file` or `-e`
> - If port `3000` is busy: `-p 8080:3000` → access via `localhost:8080`
> - On `Cannot find module 'express'`: rebuild with `--no-cache`

---

## 🔧 Jenkins CI/CD Integration

### 🛠️ Step 1: Prepare Jenkins with Docker Support

```bash
# Stop & remove existing Jenkins (if any)
docker stop jenkins && docker rm jenkins

# Verify removal
docker ps | grep jenkins
```

### 🏗️ Step 2: Build Custom Jenkins Image

Create `jenkins-docker/Dockerfile`:

```dockerfile
FROM jenkins/jenkins:lts-jdk17

USER root

# Install Docker CLI
RUN apt-get update && \
    apt-get install -y docker.io && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Add jenkins user to docker group
RUN usermod -aG docker jenkins

USER jenkins
```

Build the image:

```bash
cd jenkins-docker
docker build -t jenkins-with-docker .
```

### 🚀 Step 3: Run Jenkins Container

```bash
docker run -d --name jenkins -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home -v /var/run/docker.sock:/var/run/docker.sock jenkins-with-docker
```

> **Note for Windows users:**
> Combine the above into a single line when running in PowerShell or CMD:
>
> ```sh
> docker run -d --name jenkins -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home -v /var/run/docker.sock:/var/run/docker.sock jenkins-with-docker
> ```

### 🔑 Step 4: Get Jenkins Admin Password

After starting Jenkins, you need the initial admin password to unlock the UI:

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Copy the output and paste it into the Jenkins setup wizard at [http://localhost:8080](http://localhost:8080).

---

### 🔍 Step 5: Verify Docker Inside Jenkins

```bash
docker exec -it jenkins bash
# Inside container:
docker --version
# ✅ Should output: Docker version 24.x.x
```

> 🎉 Jenkins now has Docker-in-Docker capability for building/pushing images in pipelines.

---

### 📦 Step 6: Create a Pipeline Job in Jenkins

1. Open Jenkins: [http://localhost:8080](http://localhost:8080)
2. Click **New Item** → Enter name (e.g., `weather-api-pipeline`) → Select **Pipeline** → **OK**
3. Configure:
   - **Description**: `Builds & deploys Weather API via Docker`
   - **Pipeline** → **Definition**: `Pipeline script from SCM`
   - **SCM**: `Git`
   - **Repository URL**: `https://github.com/HariKrishna-9885699666/docker-node-weather-api.git`
   - **Branch**: `*/main`
   - **Script Path**: `Jenkinsfile`
4. Click **Save** → **Build Now**

---

### 📜 Example `Jenkinsfile` (Declarative Pipeline)

```groovy
pipeline {
    agent any

    environment {
        REGISTRY = 'your-registry.io'
        IMAGE = 'weather-api'
        TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'corepack yarn install'
            }
        }

        stage('Lint & Test') {
            steps {
                sh 'corepack yarn lint'
                sh 'corepack yarn test'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${REGISTRY}/${IMAGE}:${TAG}", ".")
                }
            }
        }

        stage('Push Image') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.withRegistry("https://${REGISTRY}", 'docker-credentials-id') {
                        docker.image("${REGISTRY}/${IMAGE}:${TAG}").push()
                        docker.image("${REGISTRY}/${IMAGE}:${TAG}").push('latest')
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    docker stop weather-api || true
                    docker rm weather-api || true
                    docker run -d --name weather-api -p 3000:3000 --env-file .env ${REGISTRY}/${IMAGE}:${TAG}
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        failure {
            echo '❌ Pipeline failed. Check logs.'
        }
        success {
            echo '✅ Deployment successful!'
        }
    }
}
```

> 🔐 Store Docker registry credentials in Jenkins: **Manage Jenkins → Credentials**

---

## 🏗️ Architecture

```
src/
├── clients/        # External API integrations (OpenWeatherMap)
├── config/         # Environment & app configuration
├── controllers/    # Request/response handling
├── errors/         # Custom error classes & handler
├── logger/         # Structured logging setup
├── middlewares/    # Reusable middleware (validation, errorHandler)
├── routes/         # Express route definitions
├── services/       # Business logic layer
├── validators/     # Zod schemas for input validation
└── app.js          # App entry point
```

### Data Flow
```
Request → Route → Validator → Controller → Service → Client → Response
                              ↓
                         Middleware (auth, logging, error handling)
```

---

## 🔐 Security Practices

| Practice | Implementation |
|----------|---------------|
| 🔒 Secure Headers | `helmet()` middleware |
| 🚦 Rate Limiting | `express-rate-limit` (100 req/15min) |
| ✅ Input Validation | Zod schemas with sanitization |
| 🔑 Secret Management | Env vars only — never committed |
| 🧹 Log Redaction | Sensitive fields masked in logs |
| 🛡️ Error Handling | Centralized handler; no stack traces in prod |

---

## 🧪 Testing

```bash
# Run all tests
corepack yarn test

# Run with coverage
corepack yarn test:coverage

# Watch mode (dev)
corepack yarn test:watch
```

### Test Structure
```
tests/
├── unit/           # Service & validator tests
├── integration/    # API endpoint tests (supertest)
└── fixtures/       # Mock data & helpers
```

---

## 📦 Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `WEATHER_API_KEY` | ✅ | OpenWeatherMap API key | `abc123xyz` |
| `PORT` | ❌ | Server port (default: `3000`) | `3000` |
| `NODE_ENV` | ❌ | Environment (`development`/`production`) | `production` |
| `LOG_LEVEL` | ❌ | Logging verbosity (`info`/`debug`/`error`) | `info` |

> 📄 Copy `.env.example` to `.env` and configure before running.

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feat/amazing-feature`
5. Open a Pull Request

### Guidelines
- Follow existing code style (ESLint + Prettier)
- Add tests for new features
- Update docs for user-facing changes
- Keep PRs focused and small

---

## 📄 License

MIT © [Hari Krishna Anem](https://github.com/HariKrishna-9885699666)

---

> 💡 **Pro Tips**
> - Use `docker scan weather-api:latest` to check for image vulnerabilities
> - Add `.dockerignore` to reduce image size & improve build speed
> - Use Jenkins Blue Ocean UI for visual pipeline debugging
> - Rotate `WEATHER_API_KEY` periodically and store in Jenkins Credentials