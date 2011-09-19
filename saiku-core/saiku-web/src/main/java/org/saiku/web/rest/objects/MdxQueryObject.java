package org.saiku.web.rest.objects;

public class MdxQueryObject {

	private String mdx;

	public MdxQueryObject(String mdx) {
		this.mdx = mdx;
	}
	
	public String getMdx() {
		return mdx;
	}

	public void setMdx(String mdx) {
		this.mdx = mdx;
	}
	
}
