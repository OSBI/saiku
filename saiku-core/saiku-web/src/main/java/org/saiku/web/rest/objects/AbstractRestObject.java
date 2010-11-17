package org.saiku.web.rest.objects;

public abstract class AbstractRestObject implements Comparable<AbstractRestObject>{
	
	public abstract String getCompareValue();
	
	public abstract Object toNativeObject();
	
	@Override 
	public abstract String toString();
	
	public int compareTo(AbstractRestObject other) {
		return getCompareValue().compareTo(other.getCompareValue());
	}

}
