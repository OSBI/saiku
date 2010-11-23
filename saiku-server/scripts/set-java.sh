#!/bin/sh
# -----------------------------------------------------------------------------
# Finds a suitable Java
#

setJava() {
  if [ -n "$_JAVA" ]; then
    __LAUNCHER="$_JAVA"
  else
    __LAUNCHER="java"
  fi
  if [ -n "$JAVA_HOME" ]; then
    echo "DEBUG: Using JAVA_HOME"
    _JAVA_HOME="$JAVA_HOME"
    _JAVA="$JAVA_HOME"/bin/$__LAUNCHER
  elif [ -n "$JRE_HOME" ]; then
    echo "DEBUG: Using JRE_HOME"
    _JAVA_HOME="$JRE_HOME"
    _JAVA="$JRE_HOME"/bin/$__LAUNCHER
  else
    echo "WARNING: Using java from path"
	_JAVA=$__LAUNCHER
  fi
  
  echo "DEBUG: _JAVA=$_JAVA"
}