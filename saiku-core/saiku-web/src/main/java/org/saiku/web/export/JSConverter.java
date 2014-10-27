/*
 * Copyright 2014 OSBI Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.saiku.web.export;

import org.saiku.web.rest.objects.resultset.QueryResult;

import org.codehaus.jackson.map.ObjectMapper;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringWriter;

/**
 * JSConverter
 */
public class JSConverter {
  private JSConverter() {

  }

  public static String convertToHtml(QueryResult qr, boolean wrapcontent) throws IOException {
    ObjectMapper om = new ObjectMapper();
    StringWriter sw = new StringWriter();
    Context context = Context.enter();
    Scriptable globalScope = context.initStandardObjects();
    Reader underscoreReader = new InputStreamReader(JSConverter.class.getResourceAsStream("underscore.js"));
    context.evaluateReader(globalScope, underscoreReader, "underscore.js", 1, null);
    Reader srReader = new InputStreamReader(JSConverter.class.getResourceAsStream("SaikuRenderer.js"));
    context.evaluateReader(globalScope, srReader, "SaikuRenderer.js", 1, null);
    Reader strReader = new InputStreamReader(JSConverter.class.getResourceAsStream("SaikuTableRenderer.js"));
    context.evaluateReader(globalScope, strReader, "SaikuTableRenderer.js", 1, null);
    String data = om.writeValueAsString(qr);
    Object wrappedQr = Context.javaToJS(data, globalScope);
    ScriptableObject.putProperty(globalScope, "data", wrappedQr);
    Object wrappedOut = Context.javaToJS(sw, globalScope);
    ScriptableObject.putProperty(globalScope, "out", wrappedOut);
    String code =
        "eval('var cellset = ' + data); \nvar renderer = new SaikuTableRenderer(); \nvar html = renderer.render(cellset, { wrapContent : "
        + wrapcontent + " }); out.write(html);";
    context.evaluateString(globalScope, code, "<mem>", 1, null);
    Context.exit();
    String content = sw.toString();
    return content;
  }

  public static String convertToHtml(QueryResult qr) throws IOException {
    return convertToHtml(qr, false);
  }
}
