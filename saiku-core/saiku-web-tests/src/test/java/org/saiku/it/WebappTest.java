package org.saiku.it;

import junit.framework.TestCase;

import java.net.URL;
import java.net.HttpURLConnection;

public class WebappTest extends TestCase
{
    public void testCallIndexPage() throws Exception
    {
        URL url = new URL("http://localhost:9999/saiku-web-tests");
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.connect();
        assertEquals(200, connection.getResponseCode());
    }
}
