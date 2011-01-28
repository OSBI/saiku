package org.saiku.olap.util;

import java.util.Comparator;

import org.saiku.olap.dto.ISaikuObject;

public abstract class SaikuComparator<T> implements Comparator<ISaikuObject> {

	public class SaikuNameComparator extends SaikuComparator<ISaikuObject> {

		public int compare(ISaikuObject o1, ISaikuObject o2) {
			return o1.getName().compareTo(o2.getName());
		}
	}
	
	public class SaikuUniqueNameComparator extends SaikuComparator<ISaikuObject> {

		public int compare(ISaikuObject o1, ISaikuObject o2) {
			return o1.getUniqueName().compareTo(o2.getUniqueName());
		}
		
	}

}
