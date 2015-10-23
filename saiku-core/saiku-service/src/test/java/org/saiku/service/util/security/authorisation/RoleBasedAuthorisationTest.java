package org.saiku.service.util.security.authorisation;

import clover.com.google.common.collect.Lists;
import org.junit.Test;
import org.saiku.helper.StubAuthentication;
import org.springframework.security.core.Authentication;

import java.util.ArrayList;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class RoleBasedAuthorisationTest
{
    private static final String MANDATORY_ROLE = "SUPER_IMPORTANT";

    private final AuthorisationPredicate authorisation = new RoleBasedAuthorisation(MANDATORY_ROLE);

    @Test
    public void shouldAuthoriseUserIfTheyHaveTheAppropriateRole() throws Exception
    {
        Authentication authenticatedUser = new StubAuthentication(Lists.newArrayList(MANDATORY_ROLE), true);

        assertTrue(authorisation.isAuthorised(authenticatedUser));
    }

    @Test
    public void shouldAuthoriseUserIfTheyHaveTheAppropriateRoleAmongOthers() throws Exception
    {
        Authentication authenticatedUser = new StubAuthentication(Lists.newArrayList("RoleA", MANDATORY_ROLE, "RoleB"), true);

        assertTrue(authorisation.isAuthorised(authenticatedUser));
    }

    @Test
    public void shouldNotAuthoriseUserIfTheyHaveRolesButNotTheRequiredOne() throws Exception
    {
        Authentication authenticatedUser = new StubAuthentication(Lists.newArrayList("RoleA", "RoleB"), true);

        assertFalse(authorisation.isAuthorised(authenticatedUser));
    }

    @Test
    public void shouldNotAuthoriseUserIfTheyHaveNoRoles() throws Exception
    {
        Authentication authenticatedUser = new StubAuthentication(new ArrayList<String>(), true);

        assertFalse(authorisation.isAuthorised(authenticatedUser));
    }

    @Test
    public void shouldNotAuthoriseUserIfTheyWereNotAuthenticated() throws Exception
    {
        assertFalse(authorisation.isAuthorised(null));
    }

    @Test
    public void shouldNotAuthoriseUserIfTheyHaveTheRoleButWereNotAuthenticated() throws Exception
    {
        Authentication unauthenticatedUser = new StubAuthentication(Lists.newArrayList(MANDATORY_ROLE), false);

        assertFalse(authorisation.isAuthorised(unauthenticatedUser));
    }
}