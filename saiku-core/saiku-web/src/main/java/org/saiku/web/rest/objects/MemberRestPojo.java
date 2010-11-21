package org.saiku.web.rest.objects;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name="members")
@XmlAccessorType(XmlAccessType.FIELD)
public class MemberRestPojo extends AbstractRestObject {

	@XmlAttribute(name = "member", required = false)
	private String memberName;


	public MemberRestPojo(){
		throw new RuntimeException("Unsupported Constructor. Serialization only");
	}

	public MemberRestPojo(String memberName) {
		this.memberName = memberName;

	}

	public String getMemberName() {
		return memberName;
	}

	@Override
	public String toNativeObject() {
		return new String(memberName);
	}

	@Override
	public String getCompareValue() {
		return getMemberName();
	}

	@Override
	public String toString() {
		return getMemberName();
	}
}
