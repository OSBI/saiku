package org.saiku.database;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureException;
import org.springframework.expression.ParseException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.security.Key;
import java.util.*;

public class JwtToken implements Authentication
{

    private static final long serialVersionUID = 1L;

    private final Collection<GrantedAuthority> authorities;
    private boolean authenticated;
    private Jws<Claims> claims;

    public JwtToken(String token, Key key) throws ParseException
    {
        authorities = new ArrayList<>();
        try
        {
            this.claims = Jwts.parser().setSigningKey(key).parseClaimsJws(token);
            List<String> roles;
            try {
                roles = Arrays.asList(claims.getBody().get("roles").toString().split(";"));
            } catch (ParseException e) {
                roles = new ArrayList<>();
            }
            List<GrantedAuthority> tmp = new ArrayList<>();
            if (roles != null) {
                for (String role : roles) {
                    tmp.add(new SimpleGrantedAuthority(role));
                }
            }
            this.authorities.addAll(tmp);
            authenticated = true;
        }
        catch (SignatureException e)
        {
            authenticated = false;
        }
    }

    @Override
    public Object getCredentials() {
        return "";
    }

    @Override
    public Object getPrincipal() {
        return claims.getBody().getSubject();
    }

    @Override
    public String getName() {
        return claims.getBody().getSubject();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public Claims getDetails() {
        return claims.getBody();
    }

    @Override
    public boolean isAuthenticated() {
        return authenticated;
    }

    @Override
    public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
        this.authenticated = isAuthenticated;
    }

}
