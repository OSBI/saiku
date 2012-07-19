/*
 * This program is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License, version 2.1 as published by the Free Software 
 * Foundation.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this 
 * program; if not, you can obtain a copy at http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html 
 * or from the Free Software Foundation, Inc., 
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * Copyright 2005 - 2009 Pentaho Corporation.  All rights reserved.
 *
 *
 * Created Sep 12, 2005 
 * @author wseyler
 */
package org.pentaho.platform.plugin.services.connections.mondrian;

import mondrian.olap.DriverManager;
import mondrian.olap.Role;
import mondrian.olap.Util;
import mondrian.rolap.RolapConnectionProperties;

import org.pentaho.platform.api.engine.ILogger;
import org.pentaho.platform.plugin.services.messages.Messages;
import org.pentaho.platform.util.messages.LocaleHelper;

/**
 * @author wseyler
 * 
 */
public class SharedCacheMDXConnection extends MDXConnection {
	public SharedCacheMDXConnection() {
		super();
	}
	
	private ILogger logger;
	private Role role;
	
	SharedCacheMDXConnection( String connectStr, ILogger logger ) {
		super( connectStr, logger );
		this.logger = logger;
	}

	@Override
	public void setLogger( ILogger logger ) {
		this.logger = logger;
		super.setLogger(logger);
	}

	@Override
	public void setRole( Role role ) {
		this.role = role;
		super.setRole(role);
	}
	
	@Override
	protected void init(Util.PropertyList properties) {
		try {
			if (super.nativeConnection != null) { // Assume we're open
				close();
			}
			// Set a locale for this connection if not hardcoded in
			// datasources.xml
			// This is required if
			// mondrian.i18n.LocalizingDynamicSchemaProcessor is being used
			if (properties.get(RolapConnectionProperties.Locale.name()) == null) {
				properties.put(RolapConnectionProperties.Locale.name(),
						LocaleHelper.getLocale().toString());
			}

			String dataSourceName = properties
					.get(RolapConnectionProperties.DataSource.name());

			mapPlatformRolesToMondrianRoles(properties);

			super.nativeConnection = DriverManager.getConnection(properties,
					null);

			if (super.nativeConnection != null) {
				if (this.role != null) {
					super.nativeConnection.setRole(this.role);
				}
			}

			if (super.nativeConnection == null) {
				this.logger
						.error(Messages
								.getErrorString(
										"MDXConnection.ERROR_0002_INVALID_CONNECTION", properties != null ? properties.toString() : "null")); //$NON-NLS-1$ //$NON-NLS-2$
			}
		} catch (Throwable t) {
			if (this.logger != null) {
				this.logger
						.error(Messages
								.getErrorString(
										"MDXConnection.ERROR_0002_INVALID_CONNECTION", properties != null ? properties.toString() : "null"), t); //$NON-NLS-1$ //$NON-NLS-2$
			} 
			/*else {
				this.logger
						.error(this.getClass().getName(),
								Messages.getErrorString(
										"MDXConnection.ERROR_0002_INVALID_CONNECTION", properties != null ? properties.toString() : "null"), t); //$NON-NLS-1$ //$NON-NLS-2$
			}*/
		}
	}
}