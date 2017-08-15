FROM openjdk:8
MAINTAINER Meteorite BI <info@meteorite.bi>


ADD target/saiku-server-foodmart-* /


RUN unzip /saiku-server-foodmart-*
CMD /saiku-server/start-saiku.sh && tail -f /saiku-server/tomcat/logs/catalina.out

