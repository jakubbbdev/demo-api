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

		stage('Nexus Login') {
			steps {
				withCredentials([usernamePassword(credentialsId: 'nexus-credentials', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
					sh "docker login 5.175.192.225:8085 -u ${NEXUS_USER} -p ${NEXUS_PASS}"
				}
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
				withCredentials([string(credentialsId: 'GITHUB_TOKEN', variable: 'GH_TOKEN')]) {
					sh '''
                git config user.email "jenkins@ci"
                git config user.name "Jenkins"

                git tag v$VERSION
                git push https://jakubbbdev:$GH_TOKEN@github.com/jakubbbdev/demo-api.git v$VERSION
            '''
				}
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