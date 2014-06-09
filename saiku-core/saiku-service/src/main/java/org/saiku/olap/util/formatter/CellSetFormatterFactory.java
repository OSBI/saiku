package org.saiku.olap.util.formatter;

import java.lang.reflect.Constructor;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.saiku.service.olap.ThinQueryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CellSetFormatterFactory {

	private static final Logger log = LoggerFactory.getLogger(ThinQueryService.class);

	private Map<String, String> formatters = new HashMap<String, String>();

	private String defaultFormatter = FlattenedCellSetFormatter.class.getName();

	public void setFormatters(Map<String, String> formatters) {
		this.formatters = formatters;
	}

	public void setDefaultFormatter(String clazz) {
		this.defaultFormatter = clazz;
	}

	public CellSetFormatterFactory() {
		formatters.put("flattened", FlattenedCellSetFormatter.class.getName());
		formatters.put("hierarchical", HierarchicalCellSetFormatter.class.getName());
		formatters.put("flat", CellSetFormatter.class.getName());
	}

	public ICellSetFormatter forName(String name) {
		ICellSetFormatter cf = create(name);
		if (cf == null) {
			cf = create(defaultFormatter);
		}
		return cf;
	}
	
	private ICellSetFormatter create(String name) {

		if (StringUtils.isNotBlank(name)) {
			String clazzName = formatters.get(name);
			try {
				@SuppressWarnings("unchecked")
				final Class<ICellSetFormatter> clazz = (Class<ICellSetFormatter>)
				Class.forName(clazzName);
				final Constructor<ICellSetFormatter> ctor = clazz.getConstructor();
				final ICellSetFormatter cellSetFormatter = ctor.newInstance();
				return cellSetFormatter;
			}
			catch (Exception e) {
				log.error("Error creating CellSetFormatter \"" + clazzName + "\"", e);
			}
		}
		
		return null;
	}



}
