package org.saiku.web.export;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringWriter;

import org.codehaus.jackson.map.ObjectMapper;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.saiku.web.rest.objects.resultset.QueryResult;

public class JSConverter {
	
	public static String convertToHtml(QueryResult qr) throws IOException {
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
		
		String code = "eval('var cellset = ' + data); \nvar renderer = new SaikuTableRenderer(); \nvar html = renderer.render(cellset, { wrapContent : false }); out.write(html);";
		
		context.evaluateString(globalScope, code, "<mem>", 1, null);
		Context.exit();
		
		String content = sw.toString();
		return content;
	}

}

