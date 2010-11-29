package org.saiku.web.rest.servlet;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.core.util.MultivaluedMapImpl;
import junit.framework.TestCase;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.NewCookie;
import java.util.List;

public class AuthTest extends AbstractServiceTest{

    /**
     * tests a happy-day flow of the native application profile.
     */
    public void testHappyDay() throws Exception {
      int port = 8080;
      Client client = Client.create();
      client.setFollowRedirects(false);

      MultivaluedMap<String, String> formData = new MultivaluedMapImpl();
      formData.add("grant_type", "password");
      formData.add("client_id", "my-trusted-client");
      formData.add("username", "marissa");
      formData.add("password", "koala");
      ClientResponse response = client.resource("http://localhost:" + port + "/sparklr2/oauth/authorize")
        .type(MediaType.APPLICATION_FORM_URLENCODED_TYPE)
        .post(ClientResponse.class, formData);
      assertEquals(200, response.getClientResponseStatus().getStatusCode());
      assertEquals("no-store", response.getHeaders().getFirst("Cache-Control"));

      //DefaultOAuth2SerializationService serializationService = new DefaultOAuth2SerializationService();
      //OAuth2AccessToken accessToken = null; //serializationService.deserializeJsonAccessToken(response.getEntityInputStream());

      //now try and use the token to access a protected resource.

      //first make sure the resource is actually protected.
      response = client.resource("http://localhost:" + port + "/sparklr2/json/photos").get(ClientResponse.class);
      assertFalse(200 == response.getClientResponseStatus().getStatusCode());

      //now make sure an authorized request is valid.
//      response = client.resource("http://localhost:" + port + "/sparklr2/json/photos")
  //      .header("Authorization", String.format("OAuth %s", accessToken.getValue()))
    //    .get(ClientResponse.class);
      assertEquals(200, response.getClientResponseStatus().getStatusCode());
    }


}
