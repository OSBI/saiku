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

package org.saiku.plugin;

import java.io.OutputStream;
import java.security.InvalidParameterException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pentaho.platform.api.engine.IParameterProvider;
import org.pentaho.platform.api.engine.IServiceManager;
import org.pentaho.platform.api.repository.IContentItem;
import org.pentaho.platform.api.repository.ISolutionRepository;
import org.pentaho.platform.engine.core.solution.ActionInfo;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.engine.services.solution.SimpleContentGenerator;
import org.pentaho.platform.util.messages.LocaleHelper;

/**
 * A simple content generator that redirects .xpav content to PAT 
 *
 * @author Paul Stoellberger
 *
 */
public class SaikuContentGenerator extends SimpleContentGenerator {


    private static final long serialVersionUID = -9180003935693305152L;
    private static final Log LOG = LogFactory.getLog(SaikuContentGenerator.class);

    private String document;
    
    @Override
    public void createContent() throws Exception {

        if( outputHandler == null ) {
            LOG.error("Outputhandler is null");
            throw new InvalidParameterException("Outputhandler is null");
        }

        IParameterProvider requestParams = parameterProviders.get( IParameterProvider.SCOPE_REQUEST );
        if( requestParams == null ) {
            LOG.error("Parameter provider is null");
            throw new NullPointerException("Parameter provider is null");
        }
        String solution = requestParams.getStringParameter("solution", null); //$NON-NLS-1$
        String path = requestParams.getStringParameter("path", null); //$NON-NLS-1$
        String action = requestParams.getStringParameter("action", null); //$NON-NLS-1$
        String fullPath = ActionInfo.buildSolutionPath(solution, path, action);
        ISolutionRepository repository = PentahoSystem.get(ISolutionRepository.class, userSession);
        if( repository == null ) {
            LOG.error("Access to Repository has failed");
            throw new NullPointerException("Access to Repository has failed");
        }
        if (repository.resourceExists(fullPath)) {
            String doc = repository.getResourceAsString(fullPath);
            LOG.error("#### DOCUMENT: " + doc);
            
            if (doc == null) {
                LOG.error("Error retrieving saiku document from solution repository"); 
                throw new NullPointerException("Error retrieving saiku document from solution repository"); 
            }
            try {
                IServiceManager serviceManager = (IServiceManager) PentahoSystem.get(IServiceManager.class, PentahoSessionHolder.getSession());
                document = doc;
                IContentItem contentItem = outputHandler.getOutputContentItem("response", "content", "", instanceId, getMimeType()); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$

                if (contentItem == null) {
                    LOG.error("content item is null"); //$NON-NLS-1$
                    throw new NullPointerException("content item is null"); //$NON-NLS-1$
                }

                OutputStream out = contentItem.getOutputStream(null);
                createContent(out);

            }
            catch (Exception e) {
                LOG.error("Error loading solution file",e);
                throw new Exception("Error loading solution file",e);
            }

        }
        else if(requestParams.getStringParameter("query", null) != null) {
            OutputStream out = null;

            IContentItem contentItem = outputHandler.getOutputContentItem("response", "content", "", instanceId, getMimeType()); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$

            if (contentItem == null) {
                LOG.error("content item is null"); //$NON-NLS-1$
                throw new NullPointerException("content item is null"); //$NON-NLS-1$
            }

            out = contentItem.getOutputStream(null);
            contentItem.setMimeType("text/html");
            out.write("HALLO".getBytes());

            out.flush();
            out.close();
        }
        else {
            super.createContent();
        }

    }

    @Override
    public void createContent(OutputStream out) throws Exception {
        try {
            StringBuilder html = new StringBuilder();
            html.append("<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01//EN\"    \"http://www.w3.org/TR/html4/strict.dtd\"><html>    <head>        <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">        <title>Saiku - Next Generation Open Source Analytics</title>        <!-- Blueprint CSS -->        <link rel=\"stylesheet\" href=\"css/blueprint/src/reset.css\" type=\"text/css\" media=\"screen, projection\">        <link rel=\"stylesheet\" href=\"css/blueprint/src/typography.css\" type=\"text/css\" media=\"screen, projection\">        <link rel=\"stylesheet\" href=\"css/blueprint/src/forms.css\" type=\"text/css\" media=\"screen, projection\">        <!--[if lt IE 8]><link rel=\"stylesheet\" href=\"css/blueprint/src/ie.css\" type=\"text/css\" media=\"screen, projection\"><![endif]-->        <!-- Saiku CSS -->        <link rel=\"stylesheet\" href=\"css/saiku/src/styles.css\" type=\"text/css\" media=\"screen, projection\">        <link rel=\"shortcut icon\" href=\"favicon.ico\">        <!-- jQuery -->        <script src=\"js/jquery/src/jquery-1.4.4.min.js\" type=\"text/javascript\"></script>        <!-- jQuery Plugins -->        <script src=\"js/jquery/src/jquery-ui-1.8.9.custom.min.js\" type=\"text/javascript\"></script>        <script src=\"js/jquery/src/jquery.simplemodal.1.4.1.js\" type=\"text/javascript\"></script>        <script src=\"js/jquery/src/jquery.blockUI.2.3.7.js\" type=\"text/javascript\"></script>        <!-- Saiku -->        <script src=\"js/saiku/src/controller.js\" type=\"text/javascript\"></script>    </head>    <body>        <div id=\"header\" class=\"hide\">            <!-- toolbar -->            <div id=\"toolbar\" class=\"hide\">                <ul>                    <li><a id=\"add_tab\" href=\"#add_tab\" title=\"New query\" class=\"new_tab i18n\"></a></li>                    <li class=\"separator\">&nbsp;</li>                    <li><a id=\"open_query\" href=\"#open_query\" title=\"Open query\" class=\"open_query i18n\"></a></li>                    <li class=\"separator\">&nbsp;</li>                    <li><a id=\"logout\" href=\"#logout\" title=\"Logout\" class=\"logout i18n\"></a></li>                    <li><a id=\"about\" href=\"#about\" title=\"About\" class=\"about i18n\"></a></li>                    <li class=\"separator\">&nbsp;</li>                    <li><a id=\"issue_tracker\" href=\"#issue_tracker\" title=\"Issue Tracker\" class=\"bug i18n\"></a></li>                    <!--                    <li>                    	<select id=\"language-selector\">                    		<option value=\"en\">English</option>                    		<option value=\"it\">Italiano</option>                    		<option value=\"es\">Espa–ol</option>                    		<option value=\"cn\">Chinese (Mandarin)</option>                    	</select>                    </li> -->                </ul>                <h1 id=\"logo\"><a href=\"http://www.analytical-labs.com/\" title=\"Saiku - Next Generation Open Source Analytics\">Saiku</a></h1>            </div>            <!-- eof toolbar -->            <!-- tabs -->            <div id=\"tabs\" class=\"hide\"></div>        </div>        <!-- eof tabs -->        <!-- tab_panel -->        <div id=\"tab_panel\" class=\"hide\"></div>        <!-- eof tab_panel -->   DOCUMENT:" + document + "</body></html>");
            out.write(html.toString().getBytes(LocaleHelper.getSystemEncoding()));

        } catch (Exception e) {
            throw new Exception("Error creating content",e);
        }


    }

    public String getMimeType() {
        return "text/html";
    }

    public Log getLogger() {
        return LogFactory.getLog(SaikuContentGenerator.class);
    }

}
