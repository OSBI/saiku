package org.saiku.service.importer;


import org.saiku.repository.IRepositoryManager;
import org.saiku.service.importer.objects.JujuSource;

import java.util.List;

public interface LegacyImporter {

    public void importUsers();

    public void importSchema();

    public void importDatasources();

    public void importLegacyReports(IRepositoryManager repositoryManager, byte[] bytes);

    public List<JujuSource> importJujuDatasources();

}