/*
 * Copyright (C) 2010 Paul Stoellberger
 *
 * This program is free software; you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the Free 
 * Software Foundation; either version 2 of the License, or (at your option) 
 * any later version.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with this program; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 *
 */
package org.saiku.web.rest.servlet.impl;

import org.saiku.service.olap.OlapDiscoverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.FileSystemXmlApplicationContext;

import com.sun.jersey.test.framework.JerseyTest;




public abstract class AbstractTest extends JerseyTest {

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
