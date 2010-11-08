package org.saiku.web.rest.service.impl;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;
import com.sun.jersey.test.framework.AppDescriptor;
import com.sun.jersey.test.framework.JerseyTest;
import com.sun.jersey.test.framework.WebAppDescriptor;

public class SessionInterfaceImplTest extends JerseyTest{

    protected AppDescriptor configure() {
        ClientConfig cc = new DefaultClientConfig();
        return new WebAppDescriptor.Builder("org.saiku.web.rest.service")
                .contextPath("/")
                .clientConfig(cc)
                .build();
    }
    
    @Test
    public void testCreateSession(){
        
        WebResource webResource = resource();
        String responseMsg = webResource.path("saiku").path("session").get(String.class);
        assertEquals("HELLO", responseMsg);
    }
    
    @Test
    public void testFailedCreateSession(){
        
    }
    
    private void initTest() {
        
    }
    
    
    private void finishTest() {
        
    }
}
