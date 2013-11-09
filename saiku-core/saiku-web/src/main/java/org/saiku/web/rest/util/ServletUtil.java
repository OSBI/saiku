package org.saiku.web.rest.util;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;

public class ServletUtil {
	
	public static Map<String, String> getParameters(HttpServletRequest req, String prefix) {

		Map<String, String> queryParams = new HashMap<String, String>();
		if (req != null) {
			// ... and the query parameters
			// We identify any pathParams starting with "param" as query parameters 

			// FIXME we should probably be able to have array params as well
			Enumeration<String> enumeration = req.getParameterNames();
			while (enumeration.hasMoreElements()) {
				String param = (String) enumeration.nextElement();
				String value = req.getParameter(param);
				if (StringUtils.isNotBlank(prefix)) {
					if(param.toLowerCase().startsWith(prefix))
					{
						param = param.substring(prefix.length());
						queryParams.put(param, value);
					}
				} else {
					queryParams.put(param, value);
				}
			}
		}
		return queryParams;
	}

	public static String replaceParameters(String query, Map<String,String> parameters) {
		if (parameters != null) {
			for (String parameter : parameters.keySet()) {
				String value = parameters.get(parameter);
				query = query.replaceAll("\\$\\{" + parameter + "\\}", value);
			}
		}
		return query;
	}

}
