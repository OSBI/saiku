package org.saiku.olap.dto;

public interface ISaikuObject {
	
	public String getUniqueName();
	
	public String getName();
	
	public int hashCode();
	
	public boolean equals(Object obj);

}
