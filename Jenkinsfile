pipeline {
    agent any

    environment {
        IMAGE_NAME = "weather-api"
        CONTAINER_NAME = "weather-api-container"
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
                sh "docker run -d -p 3000:3000 --name ${CONTAINER_NAME} ${IMAGE_NAME}"
            }
        }
    }
}