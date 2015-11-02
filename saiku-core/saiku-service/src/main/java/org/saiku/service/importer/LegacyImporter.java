package org.saiku.service.importer;


import org.saiku.repository.IRepositoryManager;

public interface LegacyImporter {

    void importUsers();

    void importSchema();

    void importDatasources();

    void importLegacyReports(IRepositoryManager repositoryManager, byte[] bytes);

}