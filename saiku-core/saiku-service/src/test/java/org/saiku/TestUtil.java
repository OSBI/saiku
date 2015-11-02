package org.saiku;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.regex.Pattern;

import junit.framework.ComparisonFailure;

import org.olap4j.CellSet;
import org.olap4j.impl.Olap4jUtil;
import org.olap4j.layout.TraditionalCellSetFormatter;
import org.olap4j.mdx.ParseTreeNode;
import org.olap4j.mdx.ParseTreeWriter;

public class TestUtil {

	private static final String NL = System.getProperty("line.separator");
	private static final String indent = "                ";
    private static final String lineBreak2 = "\\\\n\"" + NL + indent + "+ \"";
    private static final String lineBreak3 = "\\n\"" + NL + indent + "+ \"";
    private static final Pattern LineBreakPattern =
        Pattern.compile("\r\n|\r|\n");
    private static final Pattern TabPattern = Pattern.compile("\t");

    /**
     * Converts a string constant into platform-specific line endings.
     *
     * @param string String where line endings are represented as linefeed "\n"
     * @return String where all linefeeds have been converted to
     * platform-specific (CR+LF on Windows, LF on Unix/Linux)
     */
    private static SafeString fold(String string) {
        if (!NL.equals("\n")) {
            string = Olap4jUtil.replace(string, "\n", NL);
        }
        if (string == null) {
            return null;
        } else {
            return new SafeString(string);
        }
    }

    /**
     * Reverses the effect of {@link #fold}; converts platform-specific line
     * endings in a string info linefeeds.
     *
     * @param string String where all linefeeds have been converted to
     * platform-specific (CR+LF on Windows, LF on Unix/Linux)
     * @return String where line endings are represented as linefeed "\n"
     */
    public static String unfold(String string) {
        if (!NL.equals("\n")) {
            string = Olap4jUtil.replace(string, NL, "\n");
        }
        if (string == null) {
            return null;
        } else {
            return string;
        }
    }

    /**
     * Converts an MDX parse tree to an MDX string
     *
     * @param node Parse tree
     * @return MDX string
     */
    public static String toString(ParseTreeNode node) {
        StringWriter sw = new StringWriter();
        ParseTreeWriter parseTreeWriter = new ParseTreeWriter(sw);
        node.unparse(parseTreeWriter);
        return sw.toString();
    }

    /**
     * Formats a {@link org.olap4j.CellSet}.
     *
     * @param cellSet Cell set
     * @return String representation of cell set
     */
    public static String toString(CellSet cellSet) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        new TraditionalCellSetFormatter().format(cellSet, pw);
        pw.flush();
        return sw.toString();
    }


    /**
     * Checks that an actual string matches an expected string. If they do not,
     * throws a {@link junit.framework.ComparisonFailure} and prints the
     * difference, including the actual string as an easily pasted Java string
     * literal.
     *
     * @param expected Expected string
     * @param actual Actual string returned by test case
     */
    public static void assertEqualsVerbose(
        String expected,
        String actual)
    {
        assertEqualsVerbose(expected, actual, true, null);
    }

    /**
     * Checks that an actual string matches an expected string.
     *
     * <p>If they do not, throws a {@link ComparisonFailure} and prints the
     * difference, including the actual string as an easily pasted Java string
     * literal.
     *
     * @param expected Expected string
     * @param actual Actual string
     * @param java Whether to generate actual string as a Java string literal
     * if the values are not equal
     * @param message Message to display, optional
     */
    private static void assertEqualsVerbose(
        String expected,
        String actual,
        boolean java,
        String message)
    {
        assertEqualsVerbose(
            fold(expected), actual, java, message);
    }

    /**
     * Checks that an actual string matches an expected string. If they do not,
     * throws a {@link junit.framework.ComparisonFailure} and prints the
     * difference, including the actual string as an easily pasted Java string
     * literal.
     *
     * @param safeExpected Expected string, where all line endings have been
     * converted into platform-specific line endings
     * @param actual Actual string returned by test case
     * @param java Whether to print the actual value as a Java string literal
     * if the strings differ
     * @param message Message to print if the strings differ
     */
    private static void assertEqualsVerbose(
        SafeString safeExpected,
        String actual,
        boolean java,
        String message)
    {
        String expected = safeExpected == null ? null : safeExpected.s;
        if ((expected == null) && (actual == null)) {
            return;
        }
        if ((expected != null) && expected.equals(actual)) {
            return;
        }
        if (message == null) {
            message = "";
        } else {
            message += NL;
        }
        message +=
            "Expected:" + NL + expected + NL
            + "Actual:" + NL + actual + NL;
        if (java) {
            message += "Actual java:" + NL + toJavaString(actual) + NL;
        }
        throw new ComparisonFailure(message, expected, actual);
    }

    /**
     * Converts a string (which may contain quotes and newlines) into a java
     * literal.
     *
     * <p>For example, <code>
     * <pre>string with "quotes" split
     * across lines</pre>
     * </code> becomes <code>
     * <pre>"string with \"quotes\" split" + NL +
     *  "across lines"</pre>
     * </code>
     */
    private static String toJavaString(String s) {
        // Convert [string with "quotes" split
        // across lines]
        // into ["string with \"quotes\" split\n"
        //                 + "across lines
        //
        s = Olap4jUtil.replace(s, "\\", "\\\\");
        s = Olap4jUtil.replace(s, "\"", "\\\"");
        s = LineBreakPattern.matcher(s).replaceAll(lineBreak2);
        s = TabPattern.matcher(s).replaceAll("\\\\t");
        s = "\"" + s + "\"";
        String spurious = NL + indent + "+ \"\"";
        if (s.endsWith(spurious)) {
            s = s.substring(0, s.length() - spurious.length());
        }
        if (s.contains(lineBreak3)) {
            s = "fold(" + NL + indent + s + ")";
        }
        return s;
    }

    /**
     * Quotes a pattern.
     */
    public static String quotePattern(String s)
    {
        s = s.replaceAll("\\\\", "\\\\");
        s = s.replaceAll("\\.", "\\\\.");
        s = s.replaceAll("\\+", "\\\\+");
        s = s.replaceAll("\\{", "\\\\{");
        s = s.replaceAll("\\}", "\\\\}");
        s = s.replaceAll("\\|", "\\\\||");
        s = s.replaceAll("[$]", "\\\\\\$");
        s = s.replaceAll("\\?", "\\\\?");
        s = s.replaceAll("\\*", "\\\\*");
        s = s.replaceAll("\\(", "\\\\(");
        s = s.replaceAll("\\)", "\\\\)");
        s = s.replaceAll("\\[", "\\\\[");
        s = s.replaceAll("\\]", "\\\\]");
        return s;
    }
    
    /**
     * Wrapper around a string that indicates that all line endings have been
     * converted to platform-specific line endings.
     *
     */
    public static class SafeString {

        public final String s;

        /**
         * Creates a SafeString.
         * @param s String
         */
        private SafeString(String s) {
            this.s = s;
        }
    }
	
}
