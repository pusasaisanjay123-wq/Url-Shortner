pipeline {
    agent any

    environment {
        IMAGE_NAME = 'urlshortener:latest'
        NODE_ENV = 'test'
        MONGODB_URL = 'mongodb://127.0.0.1:27017/urlshortener'
        SESSION_SECRET = 'jenkins-test-secret-key'
    }

    stages {
        stage('Install & Test') {
            steps {
                echo ' Installing dependencies & running unit tests...'
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
                echo ' Verifying Kubernetes Pods and Services...'
                bat 'kubectl get pods'
                bat 'kubectl get services'
            }
        }
    }

    post {
        success {
            echo ' Pipeline finished successfully! App live at http://localhost:30080'
        }
        failure {
            echo ' Pipeline failed! Check logs above.'
        }
    }
}