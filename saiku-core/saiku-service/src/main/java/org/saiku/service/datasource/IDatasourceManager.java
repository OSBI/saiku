package org.saiku.service.datasource;

import java.util.List;
import java.util.Map;

import org.saiku.datasources.datasource.SaikuDatasource;

public interface IDatasourceManager {
	
	public void load();
	
	public SaikuDatasource addDatasource(SaikuDatasource datasource);
	
	public SaikuDatasource setDatasource(SaikuDatasource datasource);
	
	public List<SaikuDatasource> addDatasources(List<SaikuDatasource> datasources);
	
	public boolean removeDatasource(String datasourceName);
	
	public Map<String, SaikuDatasource> getDatasources();

	public SaikuDatasource getDatasource(String datasourceName);

}
