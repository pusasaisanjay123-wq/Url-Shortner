pipeline {
    agent any

    environment {
        IMAGE_NAME = 'urlshortener:latest'
        NODE_ENV = 'test'
        DOCKER_BIN = 'C:\\Users\\Sai\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin'
    }

    stages {
        stage('Install & Test') {
            steps {
                echo 'Installing dependencies and running tests...'
                bat 'cd Backend && npm ci && npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                bat '"%DOCKER_BIN%\\docker.exe" build -t %IMAGE_NAME% .'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying to Kubernetes...'
                bat '"%DOCKER_BIN%\\kubectl.exe" apply -f k8s/'
                bat '"%DOCKER_BIN%\\kubectl.exe" rollout restart deployment urlshortener-app'
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Verifying deployment status...'
                bat '"%DOCKER_BIN%\\kubectl.exe" get pods'
                bat '"%DOCKER_BIN%\\kubectl.exe" get services'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully. Application live at http://localhost:30080'
        }
        failure {
            echo 'Pipeline execution failed. Review stage logs above.'
        }
    }
}