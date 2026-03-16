pipeline {
	agent any

	environment {
		IMAGE_NAME = 'demo-api'
		VERSION = "${BUILD_NUMBER}"
	}

	stages {
		stage('Checkout') {
			steps {
				checkout scm
			}
		}

		stage('Install') {
			steps {
				sh 'npm install'
			}
		}

		stage('Test') {
			steps {
				sh 'npm test'
			}
		}

		stage('Docker Build') {
			steps {
				sh "docker build -t ${IMAGE_NAME}:${VERSION} ."
				sh "docker tag ${IMAGE_NAME}:${VERSION} ${IMAGE_NAME}:latest"
			}
		}

		stage('Deploy') {
			steps {
				sh """
                    ssh -o StrictHostKeyChecking=no root@172.17.0.1 "
                        docker stop ${IMAGE_NAME} || true
                        docker rm ${IMAGE_NAME} || true
                        docker run -d --name ${IMAGE_NAME} --restart always -p 4000:3000 ${IMAGE_NAME}:latest
                    "
                """
			}
		}
	}

	post {
		success {
			echo 'Demo API deployed!'
		}
		failure {
			echo 'Pipeline fehlgeschlagen!'
		}
	}
}