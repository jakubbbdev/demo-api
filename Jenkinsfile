pipeline {
	agent any

	environment {
		IMAGE_NAME = 'demo-api'
		NEXUS_URL = '5.175.192.225:8085'
	}

	stages {
		stage('Checkout') {
			steps {
				checkout scm
			}
		}

		stage('Version') {
			steps {
				script {
					def version = sh(script: "node -e \"console.log(require('./package.json').version)\"", returnStdout: true).trim()
					def buildVersion = "${version}-${BUILD_NUMBER}"
					env.VERSION = buildVersion
					echo "Version: ${buildVersion}"
				}
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
				sh "docker tag ${IMAGE_NAME}:${VERSION} ${NEXUS_URL}/${IMAGE_NAME}:${VERSION}"
				sh "docker tag ${IMAGE_NAME}:${VERSION} ${NEXUS_URL}/${IMAGE_NAME}:latest"
			}
		}

		stage('Push to Nexus') {
			steps {
				sh "docker push ${NEXUS_URL}/${IMAGE_NAME}:${VERSION}"
				sh "docker push ${NEXUS_URL}/${IMAGE_NAME}:latest"
			}
		}

		stage('Git Tag') {
			steps {
				sh """
                    ssh -o StrictHostKeyChecking=no root@172.17.0.1 "
                        cd /tmp
                        git clone https://jakubbbdev:${GITHUB_TOKEN}@github.com/jakubbbdev/demo-api.git || true
                        cd demo-api
                        git tag v${VERSION}
                        git push origin v${VERSION}
                    "
                """
			}
		}

		stage('Deploy') {
			steps {
				sh """
                    ssh -o StrictHostKeyChecking=no root@172.17.0.1 "
                        docker stop ${IMAGE_NAME} || true
                        docker rm ${IMAGE_NAME} || true
                        docker run -d --name ${IMAGE_NAME} --restart always -p 4000:3000 ${NEXUS_URL}/${IMAGE_NAME}:latest
                    "
                """
			}
		}
	}

	post {
		success {
			echo "Demo API v${VERSION} deployed!"
		}
		failure {
			echo 'Pipeline fehlgeschlagen!'
		}
	}
}