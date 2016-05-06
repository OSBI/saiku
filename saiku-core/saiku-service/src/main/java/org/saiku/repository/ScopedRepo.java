package org.saiku.repository;


import javax.servlet.http.HttpSession;

/**
 * Created by bugg on 06/05/16.
 */
public class ScopedRepo {


    private HttpSession httpSession;

    public ScopedRepo() {

    }

    public void setSession(HttpSession httpSession){
        this.httpSession = httpSession;
    }

    public HttpSession getSession(){
        return this.httpSession;
    }
}
