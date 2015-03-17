package org.saiku.web.export;

import org.saiku.web.rest.objects.resultset.QueryResult;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.commons.io.IOUtils;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

import java.io.*;
import java.util.Properties;

public class JSConverter {
    public static String convertToHtml(QueryResult qr, boolean wrapcontent) throws IOException {
        ObjectMapper om = new ObjectMapper();
        StringWriter sw = new StringWriter();
        Context context = Context.enter();
      context.setOptimizationLevel(-1);
      context.setLanguageVersion(Context.VERSION_1_5);
        Scriptable globalScope = context.initStandardObjects();
      Reader underscoreReader = new InputStreamReader(JSConverter.class.getResourceAsStream("underscore.js"));
        context.evaluateReader(globalScope, underscoreReader, "underscore.js", 1, null);
        Reader srReader = new InputStreamReader(JSConverter.class.getResourceAsStream("SaikuRenderer.js"));
        context.evaluateReader(globalScope, srReader, "SaikuRenderer.js", 1, null);
      String result = IOUtils.toString(JSConverter.class.getResourceAsStream("SaikuTableRenderer.js"));

      context.evaluateString(globalScope, result, "SaikuTableRenderer.js", 1, null);
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
        if(getVersion()!=null && !getVersion().contains("EE")) {
            content =
                content + "<div style='margin-top:10px;'><h5>Export Provided By Saiku Analytics Community Edition(http://meteorite.bi)"
                + "</h5></div>";
        }
        return content;
    }

    public static String convertToHtml(QueryResult qr) throws IOException {
        return convertToHtml(qr, false);
    }

    public static String getVersion() {
        Properties prop = new Properties();
        InputStream input = null;
        String version = "";
        ClassLoader classloader = Thread.currentThread().getContextClassLoader();
        InputStream is = classloader.getResourceAsStream("org/saiku/web/rest/resources/version.properties");
        try {

            //input = new FileInputStream("version.properties");

            // load a properties file
            prop.load(is);

            // get the property value and print it out
            System.out.println(prop.getProperty("VERSION"));
            version = prop.getProperty("VERSION");
        } catch (IOException e) {
            e.printStackTrace();
        }
        return version;
    }
}