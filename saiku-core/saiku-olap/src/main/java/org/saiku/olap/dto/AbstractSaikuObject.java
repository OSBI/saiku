package org.saiku.olap.dto;

public  class AbstractSaikuObject implements ISaikuObject  {

	private String uniqueName;
	private String name;
	
	public AbstractSaikuObject() {	}
	
	public AbstractSaikuObject(String uniqueName, String name) {
		this.uniqueName = uniqueName;
		this.name = name;
	}
	public String getUniqueName() {
		return uniqueName;
	}
	
	public String getName() {
		return name;
	}
	
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((uniqueName == null) ? 0 : uniqueName.hashCode());
		return result;
	}
	
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		AbstractSaikuObject other = (AbstractSaikuObject) obj;
		if (uniqueName == null) {
			if (other.uniqueName != null)
				return false;
		} else if (!uniqueName.equals(other.uniqueName))
			return false;
		return true;
	}
	

}
