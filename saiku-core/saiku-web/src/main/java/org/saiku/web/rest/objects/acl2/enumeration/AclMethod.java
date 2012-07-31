package org.saiku.web.rest.objects.acl2.enumeration;

import java.util.List;

public enum AclMethod {
	NONE,
	READ,
	WRITE,
	GRANT;
	
	
	public static AclMethod max (AclMethod method1, AclMethod method2 ) {
		if ( method1 == null ) {
			if ( method2 == null ) {
				throw new RuntimeException("cannot compare two null objects");
			}
			return method2;
		}
		if ( toInt(method1) > toInt(method2) ) return method1;
		return method2;
	}

	public static AclMethod min (AclMethod method1, AclMethod method2 ) {
		if ( method1 == null ) {
			if ( method2 == null ) {
				throw new RuntimeException("cannot compare two null objects");
			}
			return method2;
		}
		if ( toInt(method1) < toInt(method2) ) return method1;
		return method2;
	}
	
	public static AclMethod max (List<AclMethod> methods) {
		if ( methods != null && methods.size() > 0 ) {
			AclMethod method = methods.get(0);
			for ( int i = 1; i < methods.size() ; ++ i ) {
				method = AclMethod.max(methods.get(i), method);
			}
	
			return method;
		} 
		return NONE;
	}

	
	private static int toInt(AclMethod method ){
		switch (method) {
			case NONE: return 0;
			case READ: return 1;
			case WRITE: return 2;
			case GRANT: return 3;
		}
		return -1; // this shall never happen
	}
	
}
