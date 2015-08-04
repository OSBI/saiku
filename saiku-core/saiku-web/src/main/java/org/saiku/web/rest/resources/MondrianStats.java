package org.saiku.web.rest.resources;

import java.util.List;

import mondrian.olap.MondrianServer.MondrianVersion;
import mondrian.server.monitor.ConnectionInfo;
import mondrian.server.monitor.ServerInfo;
import mondrian.server.monitor.StatementInfo;

public class MondrianStats {

	private ServerInfo server;
	private MondrianVersion mondrianVersion;
	private int openConnectionCount;
	private int openMdxStatementCount;
	private int openSqlStatementCount;
	private int executingMdxStatementCount;
	private float avgCellDimensionality;
	private List<ConnectionInfo> connections;
	private List<StatementInfo> statements;

	public MondrianStats(
			ServerInfo server, 
			MondrianVersion mv, 
			int statementCurrentlyOpenCount,
			int connectionCurrentlyOpenCount,
			int sqlStatementCurrentlyOpenCount,
			int statementCurrentlyExecutingCount, 
			float avgCellDimensionality,
			List<ConnectionInfo> connections, 
			List<StatementInfo> statements) 
	{
		
		this.server = server;
		this.mondrianVersion = mv;
		this.openConnectionCount = connectionCurrentlyOpenCount;
		this.openMdxStatementCount = statementCurrentlyOpenCount;
		this.openSqlStatementCount = sqlStatementCurrentlyOpenCount;
		this.executingMdxStatementCount = statementCurrentlyExecutingCount;
		this.avgCellDimensionality = avgCellDimensionality;
		this.connections = connections;
		this.statements = statements;
		
		
		
		
	}

	/**
	 * @return the server
	 */
	public ServerInfo getServer() {
		return server;
	}

	/**
	 * @return the openConnectionCount
	 */
	public int getOpenConnectionCount() {
		return openConnectionCount;
	}

	/**
	 * @return the openMdxStatementCount
	 */
	public int getOpenMdxStatementCount() {
		return openMdxStatementCount;
	}

	/**
	 * @return the openSqlStatementCount
	 */
	public int getOpenSqlStatementCount() {
		return openSqlStatementCount;
	}

	/**
	 * @return the executingMdxStatementCount
	 */
	public int getExecutingMdxStatementCount() {
		return executingMdxStatementCount;
	}

	/**
	 * @return the avgCellDimensionality
	 */
	public float getAvgCellDimensionality() {
		return avgCellDimensionality;
	}

	/**
	 * @return the connections
	 */
	public List<ConnectionInfo> getConnections() {
		return connections;
	}

	/**
	 * @return the statements
	 */
	public List<StatementInfo> getStatements() {
		return statements;
	}

  public MondrianVersion getVersion() { return mondrianVersion; }

}
