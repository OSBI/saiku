set _LAUNCHER=java.exe
goto checkJavaHome

:gotJava
goto checkJavaHome

:checkJavaHome
if not "%JAVA_HOME%" == "" goto gotJdkHome
if not "%JRE_HOME%" == "" goto gotJreHome
goto end

:gotJdkHome
echo DEBUG: Using JAVA_HOME
set _JAVA_HOME=%JAVA_HOME%
set _JAVA=%JAVA_HOME%\bin\%_LAUNCHER%
goto end

:gotJreHome
echo DEBUG: Using JRE_HOME
set _JAVA_HOME=%JRE_HOME%
set _JAVA=%JRE_HOME%\bin\%_LAUNCHER%
goto end

:end

echo DEBUG: JAVA EXECUTABLE=%_JAVA%