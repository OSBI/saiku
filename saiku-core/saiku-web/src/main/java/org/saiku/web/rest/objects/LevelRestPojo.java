/*
 * Copyright (C) 2010 Paul Stoellberger
 *
 * This program is free software; you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the Free 
 * Software Foundation; either version 2 of the License, or (at your option) 
 * any later version.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along 
 * with this program; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 *
 */
package org.saiku.web.rest.objects;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;

import org.saiku.olap.dto.SaikuLevel;
import org.saiku.olap.dto.SaikuMember;
import org.saiku.web.rest.util.RestList;

@XmlRootElement(name="levels")
@XmlAccessorType(XmlAccessType.FIELD)
public class LevelRestPojo extends AbstractRestObject {

	@XmlAttribute(name = "level", required = false)
	private String name;
	
	@XmlAttribute(name = "uniqueName", required = false)
	private String uniqueName;
	
	@XmlAttribute(name = "caption", required = false)
	private String caption;
	
	@XmlAttribute(name = "hierarchy", required = false)
	private String hierarchyUniqueName;
	
	private transient RestList<MemberRestPojo> members;
	
	public LevelRestPojo(String name, String uniqueName, String caption, String hierarchyUniqueName, RestList<MemberRestPojo> members) {
		this.name = name;
		this.uniqueName = uniqueName;
		this.caption = caption;
		this.hierarchyUniqueName = hierarchyUniqueName;
		this.members = members;
	}
	
	public LevelRestPojo(){
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
	public String getHierarchyUniqueName() {
		return hierarchyUniqueName;
	}
	public List<MemberRestPojo> getMembers() {
		return members;
	}
	@Override
	public SaikuLevel toNativeObject() {
		return new SaikuLevel(name, uniqueName, caption, hierarchyUniqueName, getSaikuMemberList());
	}

	public List<SaikuMember> getSaikuMemberList() {
		List<SaikuMember> memberList = new ArrayList<SaikuMember>();
		for (MemberRestPojo member : members) {
			memberList.add(member.toNativeObject());
		}
		return memberList;
	}
	
	@Override
	public String getCompareValue() {
		return getName();
	}

	@Override
	public String toString() {
		return getName();
	}
}
