@REM Maven Wrapper startup batch script
@REM Auto-downloads Maven if not available

@echo off
setlocal

set MAVEN_PROJECTBASEDIR=%~dp0
set MAVEN_CMD_LINE_ARGS=%*

@REM Check if Maven is available
where mvn >nul 2>&1
if %ERRORLEVEL% == 0 (
    mvn %MAVEN_CMD_LINE_ARGS%
    goto end
)

@REM Download Maven wrapper jar and run
set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"
set MAVEN_URL="https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip"

if not exist "%MAVEN_PROJECTBASEDIR%.mvn\wrapper" mkdir "%MAVEN_PROJECTBASEDIR%.mvn\wrapper"

@REM Simple fallback: download Maven directly
set MVN_HOME=%USERPROFILE%\.m2\wrapper\apache-maven-3.9.6
if exist "%MVN_HOME%\bin\mvn.cmd" (
    "%MVN_HOME%\bin\mvn.cmd" %MAVEN_CMD_LINE_ARGS%
    goto end
)

echo Maven not found. Downloading Maven 3.9.6...
powershell -Command "& { $ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri '%MAVEN_URL%' -OutFile '%TEMP%\maven.zip'; Expand-Archive -Path '%TEMP%\maven.zip' -DestinationPath '%USERPROFILE%\.m2\wrapper' -Force; Remove-Item '%TEMP%\maven.zip' }"

if exist "%MVN_HOME%\bin\mvn.cmd" (
    "%MVN_HOME%\bin\mvn.cmd" %MAVEN_CMD_LINE_ARGS%
) else (
    echo ERROR: Failed to download Maven. Please install Maven manually.
    exit /b 1
)

:end
