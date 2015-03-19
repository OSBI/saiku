package org.saiku.repository;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "@class")
@JsonSubTypes({ @JsonSubTypes.Type(value = RepositoryFolderObject.class, name = "folder"), @JsonSubTypes.Type(value =
    RepositoryFileObject
    .class, name =
    "file") })
public interface IRepositoryObject {
	
	public enum Type {
		FOLDER, FILE
	}
	
	public Type getType();
	public String getName();
	public String getId();

}
