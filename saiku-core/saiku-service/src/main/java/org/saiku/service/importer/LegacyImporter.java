package org.saiku.service.importer;


import org.saiku.repository.IRepositoryManager;

import java.io.FileInputStream;

public interface LegacyImporter {

    public void importUsers();

    public void importSchema();

    public void importDatasources();

    public void importLegacyReports(IRepositoryManager repositoryManager, byte[] bytes);

}