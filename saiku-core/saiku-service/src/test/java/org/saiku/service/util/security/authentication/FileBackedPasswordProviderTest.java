package org.saiku.service.util.security.authentication;

import org.junit.Test;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Properties;

import static org.junit.Assert.assertEquals;

public class FileBackedPasswordProviderTest
{
    private static final String PASSWORD_KEY = "password";

    @Test
    public void shouldReturnPasswordFromValidPasswordFile() throws Exception
    {
        File passwordFile = createPasswordFile(PASSWORD_KEY, "thePassword");
        PasswordProvider provider = new FileBackedPasswordProvider(passwordFile, PASSWORD_KEY);

        assertEquals(provider.getPassword(), "thePassword");
    }

    @Test
    public void shouldReturnEmptyPasswordFromValidPasswordFile() throws Exception
    {
        File passwordFile = createPasswordFile(PASSWORD_KEY, "");
        PasswordProvider provider = new FileBackedPasswordProvider(passwordFile, PASSWORD_KEY);

        assertEquals(provider.getPassword(), "");
    }

    @Test(expected = RuntimeException.class)
    public void shouldThrowExceptionIfFileCannotBeFound() throws Exception
    {
        File passwordFile = new File("unknownFile");

        new FileBackedPasswordProvider(passwordFile, PASSWORD_KEY);
    }

    @Test(expected = RuntimeException.class)
    public void shouldThrowExceptionIfPasswordKeyCannotBeFoundInFile() throws Exception
    {
        File passwordFile = createPasswordFile("notTheKey", "thePassword");
        PasswordProvider provider = new FileBackedPasswordProvider(passwordFile, PASSWORD_KEY);

        provider.getPassword();
    }

    private File createPasswordFile(String passwordKey, String password) throws IOException
    {
        File passwordFile = File.createTempFile("FileBackedPasswordProviderTest", ".properties");
        passwordFile.deleteOnExit();
        FileOutputStream fileOutputStream = new FileOutputStream(passwordFile);

        try
        {
            Properties properties = new Properties();
            properties.setProperty(passwordKey, password);
            properties.store(fileOutputStream, "test properties");
            return passwordFile;
        }
        finally
        {
            fileOutputStream.close();
        }
    }
}