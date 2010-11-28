package org.saiku.web.rest.objects;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;

import org.saiku.olap.dto.SaikuMember;

@XmlRootElement(name="members")
@XmlAccessorType(XmlAccessType.FIELD)
public class MemberRestPojo extends AbstractRestObject {

	@XmlAttribute(name = "member", required = false)
	private String name;
	
	@XmlAttribute(name = "uniqueName", required = false)
	private String uniqueName;
	
	@XmlAttribute(name = "caption", required = false)
	private String caption;
	
	@XmlAttribute(name = "dimension", required = false)
	private String dimensionUniqueName;
	
	public MemberRestPojo(String name, String uniqueName, String caption, String dimensionUniqueName) {
		this.name = name;
		this.uniqueName = uniqueName;
		this.caption = caption;
		this.dimensionUniqueName = dimensionUniqueName;
	}
	
	public MemberRestPojo(){
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	}

	public String getName() {
		return name;
	}
	public String getUniqueName() {
		return uniqueName;
	}
	public String getCaption() {
		return caption;
	}
	public String getDimensionUniqueName() {
		return dimensionUniqueName;
	}
	
	@Override
	public SaikuMember toNativeObject() {
		return new SaikuMember(name,uniqueName,caption,dimensionUniqueName);
	}

	@Override
	public String getCompareValue() {
		return getUniqueName();
	}

	@Override
	public String toString() {
		return getUniqueName();
	}
}
