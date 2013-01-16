package org.saiku;

import java.util.Properties;

public class TestSaikuContext {
    
	public static final String testPropertiesFile = "connection.properties";
	private static Properties testProperties;

	private static TestSaikuContext instance;
	public static boolean DEBUG = false;

	public TestSaikuContext() {
		setup();
	}

	private void setup() {
		// TODO Auto-generated method stub
		
	}

	public static TestSaikuContext instance() {
		if (instance == null) {
			instance = new TestSaikuContext();
		}
		return instance;
	}

}
