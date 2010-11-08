package org.saiku.web.rest.service.impl;

import java.io.IOException;
import java.util.InvalidPropertiesFormatException;
import java.util.Properties;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.FileSystemXmlApplicationContext;

import com.sun.jersey.test.framework.JerseyTest;




public class AbstractTest extends JerseyTest {



	protected static ApplicationContext applicationContext = null;
	

    private static Properties testProps = new Properties();

    
	private final String[] contextFiles = new String[] { 
		    "/src/main/webapp/WEB-INF/saiku-beans.xml" //$NON-NLS-1$
		};

	protected void initTestContext(){
		
		  /*testProps.loadFromXML(AbstractTest.class
		          .getResourceAsStream("test.properties.xml"));
		*/
		  applicationContext = new FileSystemXmlApplicationContext(
		          contextFiles);
		  System.out.println("applicationContext: "+ applicationContext); 	
		  
	}
	
}
