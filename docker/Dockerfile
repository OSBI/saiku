FROM openjdk:8-jre

COPY ./saiku-server-foodmart-*.zip /opt/

RUN cd /opt/ && unzip *.zip

CMD /opt/saiku-server/start-saiku.sh && tail -f /opt/saiku-server/tomcat/logs/catalina.out



