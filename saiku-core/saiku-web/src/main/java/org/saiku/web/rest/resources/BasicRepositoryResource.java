/*
 * Copyright (C) 2011 Paul Stoellberger
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

package org.saiku.web.rest.resources;

import java.io.File;
import java.io.StringReader;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import javax.servlet.ServletException;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response.Status;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;

import org.saiku.olap.dto.SaikuConnection;
import org.saiku.olap.dto.SaikuCube;
import org.saiku.olap.dto.SaikuDimension;
import org.saiku.olap.dto.SaikuHierarchy;
import org.saiku.olap.dto.SaikuLevel;
import org.saiku.olap.dto.SaikuMember;
import org.saiku.olap.dto.resultset.CellDataSet;
import org.saiku.service.olap.OlapQueryService;
import org.saiku.service.util.exception.SaikuServiceException;
import org.saiku.web.rest.objects.AxisRestPojo;
import org.saiku.web.rest.objects.QueryRestPojo;
import org.saiku.web.rest.objects.resultset.Cell;
import org.saiku.web.rest.util.RestUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * QueryServlet contains all the methods required when manipulating an OLAP Query.
 * @author Tom Barber
 *
 */
@Component
@Path("/saiku/{username}/repository")
@Scope("request")
@XmlAccessorType(XmlAccessType.NONE)
public class BasicRepositoryResource {
	
    private static final Logger log = LoggerFactory.getLogger(BasicRepositoryResource.class);

    private OlapQueryService olapQueryService;
    
    private String path;

    public void setPath(String path) {
		this.path = path;
	}
    
	@Autowired
	public void setOlapQueryService(OlapQueryService olapqs) {
		olapQueryService = olapqs;
	}

    @GET
    @Produces({"application/json" })
     public String[] getSavedQueries() {
    	try {
    		   URL dirURL = this.getClass().getClassLoader().getResource(path);
    		   
    		      if (dirURL != null) {
    		    	  log.error("gefunden? : " + dirURL.toURI());
    		    	  if ( dirURL.getProtocol().equals("file")) {
    		    		  return new File(dirURL.toURI()).list();
    		    	  }
    		      } 
		} catch (Exception e) {
			log.error(this.getClass().getName(),e);
		}
		return new String[0];
    }

}
