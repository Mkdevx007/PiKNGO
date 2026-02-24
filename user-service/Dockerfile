# Developer 5: QA & DevOps
# This is a basic Dockerfile to containerize the Spring Boot application.
FROM eclipse-temurin:17-jdk-alpine
VOLUME /tmp
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
