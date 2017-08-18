FROM openjdk:8
MAINTAINER Meteorite BI <info@meteorite.bi>


ADD target/saiku-server-foodmart-* /


EXPOSE 8080


RUN unzip /saiku-server-foodmart-* && rm /saiku-server-foodmart-*.zip
CMD /saiku-server/start-saiku.sh && tail -f /saiku-server/tomcat/logs/catalina.out

