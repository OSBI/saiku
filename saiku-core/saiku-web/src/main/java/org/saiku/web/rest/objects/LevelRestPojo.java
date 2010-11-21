package org.saiku.web.rest.objects;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name="levels")
@XmlAccessorType(XmlAccessType.FIELD)
public class LevelRestPojo extends AbstractRestObject {

	@XmlAttribute(name = "level", required = false)
	private String levelName;


	public LevelRestPojo(){
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	}

	public LevelRestPojo(String levelName) {
		this.levelName = levelName;

	}

	public String getLevelName() {
		return levelName;
	}

	@Override
	public String toNativeObject() {
		return new String(levelName);
	}

	@Override
	public String getCompareValue() {
		return getLevelName();
	}

	@Override
	public String toString() {
		return getLevelName();
	}
}
