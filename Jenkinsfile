pipeline {
    agent any

    environment {
        IMAGE_NAME = 'urlshortener:latest'
        NODE_ENV = 'test'
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
                bat "docker build -t ${IMAGE_NAME} ."
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying to Kubernetes...'
                bat 'kubectl apply -f kubernetes/'
                bat 'kubectl rollout restart deployment urlshortener-app'
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Verifying deployment status...'
                bat 'kubectl get pods'
                bat 'kubectl get services'
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