package org.saiku.helper;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class StubAuthentication implements Authentication
{
    private final boolean isAuthenticated;
    private final List<GrantedAuthority> grantedAuthorities = new ArrayList<>();

    public StubAuthentication(List<String> authorities, boolean isAuthenticated)
    {
        this.isAuthenticated = isAuthenticated;
        for (String authority : authorities)
        {
            grantedAuthorities.add(new SimpleGrantedAuthority(authority));
        }
    }

    public Collection<? extends GrantedAuthority> getAuthorities()
    {
        return grantedAuthorities;
    }

    public Object getCredentials()
    {
        return null;
    }

    public Object getDetails()
    {
        return null;
    }

    public Object getPrincipal()
    {
        return null;
    }

    public boolean isAuthenticated()
    {
        return isAuthenticated;
    }

    public void setAuthenticated(boolean b) throws IllegalArgumentException
    {

    }

    public String getName()
    {
        return null;
    }
}
