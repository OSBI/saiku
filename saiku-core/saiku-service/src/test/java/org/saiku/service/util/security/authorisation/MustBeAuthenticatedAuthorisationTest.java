package org.saiku.service.util.security.authorisation;

import org.junit.Test;
import org.saiku.helper.StubAuthentication;

import java.util.ArrayList;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class MustBeAuthenticatedAuthorisationTest
{
    @Test
    public void shouldBeAuthorisedIfTokenIsPresentAndAuthenticated() throws Exception
    {
        final MustBeAuthenticatedAuthorisation authorisation = new MustBeAuthenticatedAuthorisation();

        assertTrue(authorisation.isAuthorised(new StubAuthentication(new ArrayList<String>(), true)));
    }

    @Test
    public void shouldNotBeAuthorisedIfTokenIsPresentButNotAuthenticated() throws Exception
    {
        final MustBeAuthenticatedAuthorisation authorisation = new MustBeAuthenticatedAuthorisation();

        assertFalse(authorisation.isAuthorised(new StubAuthentication(new ArrayList<String>(), false)));
    }

    @Test
    public void shouldNotBeAuthorisedIfTokenIsNotPresent() throws Exception
    {
        final MustBeAuthenticatedAuthorisation authorisation = new MustBeAuthenticatedAuthorisation();

        assertFalse(authorisation.isAuthorised(null));
    }
}