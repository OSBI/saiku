package org.saiku.datasources.connection;

import org.apache.commons.vfs.FileName;
import org.apache.commons.vfs.FileType;
import org.apache.commons.vfs.provider.AbstractFileName;

public class RepositoryFileName
        extends AbstractFileName
{
    public RepositoryFileName(String fileRef, FileType fileType)
    {
        super("repo", fileRef, fileType);
    }

    public FileName createName(String s, FileType fileType)
    {
        FileName name = new RepositoryFileName(s, fileType);
        return name;
    }

    protected void appendRootUri(StringBuffer stringBuffer, boolean b) {}
}