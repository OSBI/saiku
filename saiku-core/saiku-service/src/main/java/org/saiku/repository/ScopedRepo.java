package org.saiku.repository;

import java.io.Serializable;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import org.springframework.context.ApplicationListener;
import org.springframework.security.web.session.HttpSessionCreatedEvent;

import java.io.Serializable;

import javax.servlet.http.HttpSession;

/**
 * Created by bugg on 06/05/16.
 */
public class ScopedRepo implements ApplicationListener<HttpSessionCreatedEvent>, Serializable {

    static final long serialVersionUID = 1L;

    private transient HttpSession httpSession;

    public ScopedRepo() {

    }
    
    public void onApplicationEvent(HttpSessionCreatedEvent sessionEvent) {
      if (httpSession == null) {
        this.setSession(sessionEvent.getSession());
      }
    }
    
    public void setSession(HttpSession httpSession){
        this.httpSession = httpSession;
    }

    public HttpSession getSession(){
        return this.httpSession;
    }
}
