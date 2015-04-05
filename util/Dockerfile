FROM ubuntu:latest
MAINTAINER TOm Barber

RUN sudo apt-get update 
RUN sudo apt-get install -y openjdk-7-jre-headless openjdk-7-jre

WORKDIR /usr/src

ADD saiku-server/target/saiku-server-foodmart-*.tar.gz /usr/src/

EXPOSE 8080

CMD /usr/src/saiku-server/start-saiku.sh && tail -f /usr/src/saiku-server/tomcat/logs/catalina.out
