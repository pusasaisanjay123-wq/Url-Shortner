pipeline {
    agent any

    environment {
        IMAGE_NAME = 'urlshortener:latest'
        MONGODB_URL = 'mongodb://127.0.0.1:27017/urlshortener'
        SESSION_SECRET = 'jenkins-test-secret-key'
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo ' Checking out source code...'
                checkout scm
            }
        }

        stage('Install & Test') {
            steps {
                echo ' Running unit tests...'
                bat 'cd Backend && npm ci && npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo ' Building Docker image...'
                bat 'docker build -t %IMAGE_NAME% .'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo ' Deploying to local Kubernetes cluster...'
                bat 'kubectl apply -f k8s/'
                bat 'kubectl rollout restart deployment urlshortener-app'
            }
        }

        stage('Verify Deployment') {
            steps {
                echo ' Verifying Kubernetes Pods...'
                bat 'kubectl get pods'
                bat 'kubectl get services'
            }
        }
    }

    post {
        success {
            echo ' Pipeline finished successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}