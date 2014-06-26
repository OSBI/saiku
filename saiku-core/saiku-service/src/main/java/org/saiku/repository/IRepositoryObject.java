package org.saiku.repository;

public interface IRepositoryObject {
	
	public enum Type {
		FOLDER, FILE
	}
	
	public Type getType();
	public String getName();
	public String getId();

}
