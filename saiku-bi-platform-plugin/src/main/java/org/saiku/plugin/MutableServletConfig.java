/*
 * The MIT License
 * 
 * Copyright (c) 2011, Aaron Phillips
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
package org.saiku.plugin;

import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Map;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;

public class MutableServletConfig implements ServletConfig {
  
  private String servletName;
  private Hashtable initParams;
  
  public MutableServletConfig(String servletName) {
    this.servletName = servletName;
  }
  
  public void setInitParameters(Map<String, String> params) {
    initParams = new Hashtable(params);
  }
  
  public String getInitParameter(String name) {
    String value = (String)initParams.get(name);
    //System.err.println("getting ["+name+"] value = ["+value+"]");
    return value;
  }

  public Enumeration getInitParameterNames() {
    //for (Object paramName : EnumerationUtils.toList(initParams.keys())) {
    //  System.err.println(paramName);
    //}
    return initParams.keys();
  }

  public ServletContext getServletContext() {
    return null;
  }

  public String getServletName() {
    return servletName;
  }
}
