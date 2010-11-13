package org.saiku.web.rest.servlet.impl;

import org.saiku.service.olap.OlapDiscoverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.FileSystemXmlApplicationContext;

import com.sun.jersey.test.framework.JerseyTest;




public class AbstractTest extends JerseyTest {

    @Autowired
    protected OlapDiscoverService olapDiscoverService = null;
    
	protected static ApplicationContext applicationContext = null;
	
	private final String[] contextFiles = new String[] { 
	        "/src/test/resources/org/saiku/web/rest/service/impl/saiku-beans.xml" //$NON-NLS-1$
	    };
	protected void initTestContext(){
		
	
    	    applicationContext = new FileSystemXmlApplicationContext(
    		          contextFiles);
    	    System.out.println("applicationContext: "+ applicationContext);   
		  olapDiscoverService = (OlapDiscoverService)applicationContext.getBean("olapDiscoverService");
		 
		  
	}
	
}
