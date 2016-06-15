package org.saiku.service.olap.totals;

import org.olap4j.Cell;
import org.olap4j.metadata.Measure;
import org.saiku.olap.query2.ThinMeasure;
import org.saiku.olap.query2.util.Fat;
import org.saiku.service.olap.totals.aggregators.TotalAggregator;


public class TotalNode {
  private final String[] captions;
  private final TotalAggregator[][] totals;
  private final boolean showsTotals;
  private final int cellsAdded;
  private int span;
  private int width;

  public TotalNode( String[] captions, Measure[] measures, TotalAggregator aggregatorTemplate, FormatList formatList,
                    int count ) {
    this.captions = captions;
    showsTotals = aggregatorTemplate != null;

    System.out.println("TotalNode - constructor"); // ***
    System.out.println("measures.length = " + measures.length);
    for (Measure m : measures) { // ***
      System.out.println("\t" + m.getName());
      if (m.getAggregator() != null) {
        System.out.println("\t\t" + m.getAggregator().toString());
      } else {
        System.out.println("\t\tNo aggregators");
      }
    }
    System.out.println("captions.length = " + (captions == null ? "null?" : captions.length)); // ***
    System.out.println("count = " + count); //***

    if ( showsTotals ) {
      cellsAdded = captions != null ? captions.length : 1;
      totals = new TotalAggregator[ cellsAdded ][ count ];

      if ( aggregatorTemplate != null ) {
        for ( int i = 0; i < totals.length; i++ ) {
          for ( int j = 0; j < totals[ 0 ].length; j++ ) {
            int k = j % measures.length;
            if (measures[k] instanceof Fat.MeasureAdapter) {
              ThinMeasure tm = ((Fat.MeasureAdapter)measures[k]).getThinMeasure();
              if (tm != null && tm.getAggregators() != null && !tm.getAggregators().isEmpty()) {
                String agg = tm.getAggregators().get(0);
                totals[i][j] = TotalAggregator.newInstanceByFunctionName(agg).newInstance(formatList.getValueFormat(j, i), measures[k]);
                continue;
              }
            }

            totals[i][j] = aggregatorTemplate.newInstance(formatList.getValueFormat(j, i), measures[i]);
          }
        }
      }
    } else {
      totals = new TotalAggregator[ 0 ][ count ];
      cellsAdded = 0;
    }
  }

  public void addData( int member, int index, Cell cell ) {
    totals[ member ][ index ].addData( cell );
  }

  public void setFormattedValue( int member, int index, String value ) {
    totals[ member ][ index ].setFormattedValue( value );
  }

  public int getSpan() {
    return span;
  }

  public void setSpan( int span ) {
    this.span = span;
  }

  private void appendSpan(int append) {
    this.span += append;
  }

  public int getWidth() {
    return width;
  }

  public void setWidth( int width ) {
    this.width = width;
  }

  private void appendWidth(int append) {
    this.width += append;
  }

  public void appendChild( TotalNode child ) {
    appendSpan( child.getRenderedCount() );
    appendWidth( child.width );
  }

  public String[] getMemberCaptions() {
    return captions;
  }

  public TotalAggregator[][] getTotalGroups() {
    return totals;
  }

  private int getRenderedCount() {
    return span + cellsAdded;
  }
}