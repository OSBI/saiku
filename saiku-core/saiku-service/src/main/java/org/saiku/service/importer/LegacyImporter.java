package org.saiku.service.importer;


public interface LegacyImporter {

    public void importUsers();

    public void importSchema();

    public void importDatasources();

}